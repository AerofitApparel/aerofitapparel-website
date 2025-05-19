"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmail, signInWithGoogle, signInWithFacebook, resetPassword } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Mail, Lock, Loader2, Facebook } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AppCheckStatus } from "@/components/app-check-status"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetError, setResetError] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/dashboard"

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
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
      const userData = await signInWithEmail(formData.email, formData.password)

      if (!userData) {
        throw new Error("Failed to get user data after login")
      }

      // Check if user has the required role to access the requested page
      if (redirectPath.includes("/admin") && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/unauthorized")
      } else {
        router.push(redirectPath)
      }
    } catch (error: any) {
      console.error("Login error:", error)

      if (error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password") {
        setGeneralError("Invalid email or password")
      } else if (error?.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else {
        setGeneralError(error?.message || "An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setGeneralError("")

    try {
      const userData = await signInWithGoogle()

      if (!userData) {
        throw new Error("Failed to get user data after Google login")
      }

      // Check if user has the required role to access the requested page
      if (redirectPath.includes("/admin") && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/unauthorized")
      } else {
        router.push(redirectPath)
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error)

      if (error?.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else if (error?.code === "auth/popup-closed-by-user") {
        setGeneralError("Sign-in popup was closed. Please try again.")
      } else {
        setGeneralError(error?.message || "An error occurred with Google sign-in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setIsLoading(true)
    setGeneralError("")

    try {
      const userData = await signInWithFacebook()

      if (!userData) {
        throw new Error("Failed to get user data after Facebook login")
      }

      // Check if user has the required role to access the requested page
      if (redirectPath.includes("/admin") && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/unauthorized")
      } else {
        router.push(redirectPath)
      }
    } catch (error: any) {
      console.error("Facebook sign-in error:", error)

      if (error?.code === "auth/firebase-app-check-token-is-invalid") {
        setGeneralError("App Check verification failed. Please try again or contact support.")
      } else if (error?.code === "auth/popup-closed-by-user") {
        setGeneralError("Sign-in popup was closed. Please try again.")
      } else {
        setGeneralError(error?.message || "An error occurred with Facebook sign-in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetEmailSent(false)

    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError("Please enter a valid email address")
      return
    }

    setIsResetLoading(true)

    try {
      await resetPassword(resetEmail)
      setResetEmailSent(true)
    } catch (error: any) {
      console.error("Password reset error:", error)

      if (error?.code === "auth/user-not-found") {
        setResetError("No account found with this email address")
      } else {
        setResetError(error?.message || "An error occurred during password reset. Please try again.")
      }
    } finally {
      setIsResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 text-sm font-normal">
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset your password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="name@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={isResetLoading}
                        />
                      </div>

                      {resetError && <p className="text-sm text-red-500">{resetError}</p>}

                      {resetEmailSent && (
                        <Alert className="bg-green-50 border-green-200">
                          <AlertDescription className="text-green-800">
                            Password reset email sent. Please check your inbox.
                          </AlertDescription>
                        </Alert>
                      )}

                      <DialogFooter>
                        <Button type="submit" disabled={isResetLoading}>
                          {isResetLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send reset link"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
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
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
