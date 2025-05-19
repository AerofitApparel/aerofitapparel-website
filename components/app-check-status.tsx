"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

export function AppCheckStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not-configured">("loading")
  const [message, setMessage] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const checkAppCheck = async () => {
      try {
        // Fetch the reCAPTCHA configuration
        const response = await fetch("/api/config/recaptcha")
        const data = await response.json()

        if (data.isConfigured) {
          setStatus("success")
          setMessage("App Check is properly configured")
        } else if (data.isDevelopment) {
          setStatus("not-configured")
          setMessage("App Check is not configured. Using debug mode for development.")
        } else {
          setStatus("error")
          setMessage("App Check is not configured. Authentication may fail in production.")
        }
      } catch (error) {
        setStatus("error")
        setMessage(`Failed to check App Check status: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    checkAppCheck()

    // Hide the status after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  if (status === "loading") {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>Checking App Check status...</AlertDescription>
      </Alert>
    )
  }

  if (status === "success") {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">{message}</AlertDescription>
      </Alert>
    )
  }

  if (status === "not-configured") {
    return (
      <Alert className="mb-4 bg-yellow-50 border-yellow-200">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">App Check Not Configured</AlertTitle>
        <AlertDescription className="text-yellow-700">{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>App Check Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
