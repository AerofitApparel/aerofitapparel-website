import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminAuth } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const adminAuth = getAdminAuth()

    if (!adminAuth) {
      return NextResponse.json({ error: "Firebase Admin SDK is not initialized" }, { status: 500 })
    }

    const session = cookies().get("session")?.value

    if (!session) {
      return NextResponse.json({ error: "No session cookie found" }, { status: 401 })
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(session, true)

    // Return user information including role
    return NextResponse.json({
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: decodedClaims.role || "user",
      emailVerified: decodedClaims.email_verified || false,
    })
  } catch (error: any) {
    console.error("Error verifying session:", error)

    return NextResponse.json({ error: error.message || "Invalid session" }, { status: 401 })
  }
}
