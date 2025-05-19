import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { FirebaseAppCheckProvider } from "@/components/firebase-app-check-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Firebase Auth with Role-Based Access",
  description: "A comprehensive authentication system with Firebase",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseAppCheckProvider>
            <AuthProvider>{children}</AuthProvider>
          </FirebaseAppCheckProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
