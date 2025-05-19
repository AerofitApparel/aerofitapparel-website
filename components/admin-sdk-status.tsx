"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function AdminSdkStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const checkAdminSdk = async () => {
    setStatus("loading")

    try {
      // Call an API endpoint that uses the Admin SDK
      const response = await fetch("/api/auth/admin-status")

      if (!response.ok) {
        const data = await response.json()
        setStatus("error")
        setErrorDetails(data.error || "Unknown error")
        return
      }

      setStatus("success")
      setErrorDetails(null)
    } catch (error) {
      console.error("Error checking Admin SDK status:", error)
      setStatus("error")
      setErrorDetails("Failed to check Admin SDK status")
    }
  }

  useEffect(() => {
    checkAdminSdk()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Admin SDK Status</CardTitle>
        <CardDescription>Check if the Firebase Admin SDK is properly initialized</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>Checking Admin SDK status...</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Admin SDK is working properly</AlertTitle>
            <AlertDescription className="text-green-800">
              The Firebase Admin SDK is correctly initialized and functioning.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin SDK Error</AlertTitle>
            <AlertDescription>
              {errorDetails || "There was an error initializing the Firebase Admin SDK."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkAdminSdk} disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Again"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
