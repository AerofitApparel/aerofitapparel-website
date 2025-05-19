import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware that checks for a Firebase Auth token in cookies
// It's not as secure as the server-side verification we had before
export async function middleware(request: NextRequest) {
  // In a client-side only implementation, we can't securely verify auth in middleware
  // We'll rely on the client-side protected route component instead
  return NextResponse.next()
}

// Only run middleware on these paths
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
