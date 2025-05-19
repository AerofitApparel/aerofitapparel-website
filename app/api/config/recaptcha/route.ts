import { NextResponse } from "next/server"

export async function GET() {
  // Get the reCAPTCHA site key from environment variables
  const siteKey = process.env.RECAPTCHA_SITE_KEY || ""

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development"

  return NextResponse.json({
    siteKey,
    isConfigured: !!siteKey,
    isDevelopment,
  })
}
