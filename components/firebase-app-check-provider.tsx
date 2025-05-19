"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { initializeFirebase } from "@/lib/firebase"

interface FirebaseAppCheckProviderProps {
  children: React.ReactNode
}

export function FirebaseAppCheckProvider({ children }: FirebaseAppCheckProviderProps) {
  const [isAppCheckInitialized, setIsAppCheckInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const initializeAppCheck = async () => {
        try {
          // Initialize Firebase first
          const { app } = await initializeFirebase()

          if (!app) {
            throw new Error("Firebase app initialization failed")
          }

          // Enable debug mode in development BEFORE any other App Check code
          if (process.env.NODE_ENV === "development") {
            // @ts-ignore - This is a valid property but TypeScript doesn't know about it
            window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
            console.log("Firebase App Check debug mode enabled for development")
          }

          // Fetch the reCAPTCHA site key from our API
          const response = await fetch("/api/config/recaptcha")
          const data = await response.json()
          const siteKey = data.siteKey
          const isConfigured = data.isConfigured
          const isDevelopment = data.isDevelopment

          // Check if site key is available
          if (!siteKey) {
            console.warn(
              "Firebase App Check: No reCAPTCHA site key found. App Check will not be initialized. Authentication may still work without App Check in development.",
            )
            return
          }

          // Import the necessary modules dynamically
          const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check")

          // Initialize App Check only if we have a valid site key
          const appCheck = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(siteKey),
            isTokenAutoRefreshEnabled: true,
          })

          setIsAppCheckInitialized(true)
          console.log("Firebase App Check initialized successfully")
        } catch (error) {
          console.error("Error initializing Firebase App Check:", error)
          setError(`Failed to initialize App Check: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      initializeAppCheck()
    }
  }, [])

  // If there was an error initializing App Check, show it
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
        <h3 className="text-red-800 font-medium">App Check Error</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <p className="text-red-600 text-sm mt-1">
          This may cause authentication to fail. Try refreshing the page or contact support.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
