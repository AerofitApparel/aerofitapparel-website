import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth()

    if (!adminAuth) {
      return NextResponse.json(
        { error: "Firebase Admin SDK is not initialized. Check server logs and environment variables." },
        { status: 500 },
      )
    }

    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // Only process if the user is verified
    if (decodedToken.email && !decodedToken.email_verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 })
    }

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    // Set the cookie
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error creating session:", error)
    return NextResponse.json(
      { error: error.message || "Unauthorized" },
      { status: error.code === "auth/argument-error" ? 400 : 401 },
    )
  }
}
