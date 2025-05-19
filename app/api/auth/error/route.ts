import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reason = searchParams.get("reason") || "unknown"

  let errorMessage = "An authentication error occurred"

  switch (reason) {
    case "admin-sdk-not-initialized":
      errorMessage =
        "Firebase Admin SDK is not properly initialized. Please check server logs and environment variables."
      break
    case "session-expired":
      errorMessage = "Your session has expired. Please log in again."
      break
    default:
      errorMessage = "An unknown authentication error occurred."
  }

  return NextResponse.json({ error: errorMessage }, { status: 500 })
}
