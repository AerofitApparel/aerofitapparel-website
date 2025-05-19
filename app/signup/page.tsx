"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUpWithEmail, signInWithGoogle, signInWithFacebook } from "@/lib/auth-service-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Mail, Lock, User, Facebook, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppCheckStatus } from "@/components/app-check-status"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await signUpWithEmail(formData.email, formData.password, formData.displayName)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup error:", error)

      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "Email is already in use" }))
      } else if (error.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else {
        setGeneralError(error.message || "An error occurred during signup")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setGeneralError("")

    try {
      await signInWithGoogle()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google sign-in error:", error)

      if (error.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else {
        setGeneralError(error.message || "An error occurred with Google sign-in")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setIsLoading(true)
    setGeneralError("")

    try {
      await signInWithFacebook()
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Facebook sign-in error:", error)

      if (error.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else {
        setGeneralError(error.message || "An error occurred with Facebook sign-in")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <AppCheckStatus />

          {generalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  name="displayName"
                  placeholder="John Doe"
                  className={`pl-10 ${errors.displayName ? "border-red-500" : ""}`}
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.displayName && <p className="text-sm text-red-500">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </Button>

              <Button variant="outline" type="button" onClick={handleFacebookSignIn} disabled={isLoading}>
                <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                Facebook
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
