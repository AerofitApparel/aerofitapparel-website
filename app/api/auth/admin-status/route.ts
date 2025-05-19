import { NextResponse } from "next/server"
import { getAdminAuth } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const adminAuth = getAdminAuth()

    if (!adminAuth) {
      return NextResponse.json(
        {
          status: "error",
          error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
        },
        { status: 500 },
      )
    }

    // Try to use the Admin SDK
    await adminAuth.listUsers(1)

    return NextResponse.json({ status: "success" })
  } catch (error: any) {
    console.error("Error checking Admin SDK status:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to use Firebase Admin SDK",
      },
      { status: 500 },
    )
  }
}
