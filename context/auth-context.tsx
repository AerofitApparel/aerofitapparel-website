"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { type UserData, getCurrentUserData } from "@/lib/auth-service-wrapper"

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          setUser(user)

          if (user) {
            try {
              const userData = await getCurrentUserData(user)
              setUserData(userData)
            } catch (err) {
              console.error("Error getting user data in auth context:", err)
              setError(err instanceof Error ? err : new Error("Failed to get user data"))
            }
          } else {
            setUserData(null)
          }

          setLoading(false)
        },
        (err) => {
          console.error("Auth state change error:", err)
          setError(err)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up auth state listener:", err)
      setError(err instanceof Error ? err : new Error("Failed to set up authentication"))
      setLoading(false)
    }
  }, [])

  return <AuthContext.Provider value={{ user, userData, loading, error }}>{children}</AuthContext.Provider>
}
