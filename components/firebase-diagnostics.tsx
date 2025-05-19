"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function FirebaseDiagnostics() {
  const [firebaseConfig, setFirebaseConfig] = useState<Record<string, any> | null>(null)
  const [recaptchaConfig, setRecaptchaConfig] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch Firebase config
      const firebaseResponse = await fetch("/api/config/firebase")
      const firebaseData = await firebaseResponse.json()
      setFirebaseConfig(firebaseData)

      // Fetch reCAPTCHA config
      const recaptchaResponse = await fetch("/api/config/recaptcha")
      const recaptchaData = await recaptchaResponse.json()
      setRecaptchaConfig(recaptchaData)
    } catch (err) {
      setError(`Error fetching configuration: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey
  const isRecaptchaConfigured = recaptchaConfig && recaptchaConfig.isConfigured

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Firebase Diagnostics</h2>
        <Button onClick={runDiagnostics} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Firebase Configuration</CardTitle>
          <CardDescription>Status of your Firebase configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Firebase API Key</span>
              <span>
                {isFirebaseConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>reCAPTCHA Site Key</span>
              <span>
                {isRecaptchaConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </span>
            </div>

            {isFirebaseConfigured ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Firebase configuration is available through the API
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                  Firebase configuration is not available. Check that your environment variables are set and the API is
                  working.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Details</CardTitle>
          <CardDescription>Details of your Firebase configuration (masked for security)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {firebaseConfig &&
              Object.entries(firebaseConfig).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-sm">
                    {typeof value === "string" && value ? (
                      <span className="text-green-600 font-mono">
                        {value.substring(0, 3)}...{value.substring(value.length - 3)}
                      </span>
                    ) : typeof value === "boolean" ? (
                      <span className="text-blue-600 font-mono">{String(value)}</span>
                    ) : (
                      <span className="text-red-600">Not set</span>
                    )}
                  </span>
                </div>
              ))}

            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">RECAPTCHA_SITE_KEY</span>
              <span className="text-sm">
                {isRecaptchaConfigured ? (
                  <span className="text-green-600 font-mono">********** (set)</span>
                ) : (
                  <span className="text-red-600">Not set</span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
