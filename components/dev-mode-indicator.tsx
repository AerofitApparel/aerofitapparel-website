"use client"

import { useEffect, useState } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DevModeIndicator() {
  const [isDev, setIsDev] = useState(false)

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development")
  }, [])

  if (!isDev) return null

  return (
    <Alert className="fixed bottom-4 right-4 max-w-xs z-50 bg-yellow-50 border-yellow-300 shadow-lg">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Development Mode</AlertTitle>
      <AlertDescription className="text-yellow-700">
        App Check is bypassed. Authentication uses development service.
      </AlertDescription>
    </Alert>
  )
}
