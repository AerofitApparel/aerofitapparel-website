"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, RefreshCw } from "lucide-react"
import { isFirebaseConfigured } from "@/lib/app-check-utils"
import { AdminSdkStatus } from "@/components/admin-sdk-status"

export default function DebugPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<"loading" | "success" | "error">("loading")
  const [appCheckStatus, setAppCheckStatus] = useState<"loading" | "success" | "error" | "not-configured">("loading")
  const [authStatus, setAuthStatus] = useState<"loading" | "success" | "error">("loading")
  const [issues, setIssues] = useState<string[]>([])
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  const runDiagnostics = async () => {
    setFirebaseStatus("loading")
    setAppCheckStatus("loading")
    setAuthStatus("loading")

    try {
      // Fetch reCAPTCHA configuration
      const recaptchaResponse = await fetch("/api/config/recaptcha")
      const recaptchaData = await recaptchaResponse.json()
      const appCheckConfigured = recaptchaData.isConfigured

      // Check Firebase configuration
      const firebaseConfigured = isFirebaseConfigured()
      setFirebaseStatus(firebaseConfigured ? "success" : "error")

      // Set App Check status
      setAppCheckStatus(appCheckConfigured ? "success" : "not-configured")

      // Check Firebase Auth
      try {
        const { auth } = require("@/lib/firebase")
        if (auth) {
          setAuthStatus("success")
        } else {
          setAuthStatus("error")
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setAuthStatus("error")
      }

      // Get environment variables (masked)
      const vars: Record<string, string | undefined> = {}
      const envVarNames = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      envVarNames.forEach((name) => {
        const value = process.env[name]
        if (value) {
          vars[name] = value.substring(0, 3) + "..." + value.substring(value.length - 3)
        } else {
          vars[name] = undefined
        }
      })

      // Add reCAPTCHA status
      vars["RECAPTCHA_SITE_KEY"] = recaptchaData.isConfigured ? "********** (set)" : undefined

      // Add Firebase Admin SDK variables
      vars["FIREBASE_SERVICE_ACCOUNT_KEY"] = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? "********** (set)" : undefined
      vars["FIREBASE_PROJECT_ID"] = process.env.FIREBASE_PROJECT_ID ? "********** (set)" : undefined
      vars["FIREBASE_CLIENT_EMAIL"] = process.env.FIREBASE_CLIENT_EMAIL ? "********** (set)" : undefined
      vars["FIREBASE_PRIVATE_KEY"] = process.env.FIREBASE_PRIVATE_KEY ? "********** (set)" : undefined
      vars["FIREBASE_PRIVATE_KEY_ID"] = process.env.FIREBASE_PRIVATE_KEY_ID ? "********** (set)" : undefined
      vars["FIREBASE_CLIENT_ID"] = process.env.FIREBASE_CLIENT_ID ? "********** (set)" : undefined

      setEnvVars(vars)
    } catch (error) {
      console.error("Error running diagnostics:", error)
      setFirebaseStatus("error")
      setAppCheckStatus("error")
      setAuthStatus("error")
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: "loading" | "success" | "error" | "not-configured") => {
    switch (status) {
      case "loading":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "not-configured":
        return <Info className="h-4 w-4 text-amber-600" />
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase Diagnostics</h1>

      <div className="mb-6">
        <Button onClick={runDiagnostics}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Run Diagnostics
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Status</CardTitle>
            <CardDescription>Check if Firebase is properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Firebase Configuration</span>
                <span>{getStatusIcon(firebaseStatus)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>App Check Configuration</span>
                <span>{getStatusIcon(appCheckStatus)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Authentication Service</span>
                <span>{getStatusIcon(authStatus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if all required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm font-mono">{name}</span>
                  <span className="text-sm">
                    {value ? (
                      <span className="text-green-600 font-mono">{value}</span>
                    ) : (
                      <span className="text-red-600">Not set</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <AdminSdkStatus />
      </div>

      {issues.length > 0 && (
        <Alert className="mt-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Issues Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
          <CardDescription>Follow these steps if you're experiencing issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Verify all environment variables are correctly set in your Vercel project</li>
            <li>
              Make sure your Firebase project has Authentication enabled and the correct sign-in methods are configured
            </li>
            <li>Ensure your FIREBASE_SERVICE_ACCOUNT_KEY is a valid JSON string containing all required fields</li>
            <li>
              If using App Check, ensure your reCAPTCHA site key is valid and the domain is registered in the reCAPTCHA
              admin console
            </li>
            <li>Check browser console and server logs for any specific error messages</li>
            <li>
              In development, you can use the fallback authentication methods which don't require App Check to be
              configured
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
