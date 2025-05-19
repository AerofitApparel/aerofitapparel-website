"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import type { UserRole } from "@/lib/auth-service"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          // User is not authenticated, redirect to login
          router.push(`/login?redirect=${pathname}`)
        } else if (userData) {
          // Check if user has the required role
          const hasRole = allowedRoles.includes(userData.role)
          setIsAuthorized(hasRole)

          if (!hasRole) {
            // User doesn't have the required role, redirect to unauthorized page
            router.push("/unauthorized")
          }
        }
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [user, userData, loading, router, pathname, allowedRoles])

  if (loading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
