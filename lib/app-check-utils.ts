/**
 * Checks if the required environment variables for Firebase App Check are available
 */
export function isAppCheckConfigured(): boolean {
  // This function now runs on the server side only
  return typeof process.env.RECAPTCHA_SITE_KEY === "string" && process.env.RECAPTCHA_SITE_KEY.length > 0
}

/**
 * Checks if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ]

  return requiredVars.every((varName) => typeof process.env[varName] === "string" && process.env[varName]!.length > 0)
}

/**
 * Gets the current App Check configuration status
 */
export function getAppCheckStatus(): {
  isConfigured: boolean
  message: string
} {
  const isFirebaseReady = isFirebaseConfigured()
  const isAppCheckReady = isAppCheckConfigured()

  if (!isFirebaseReady) {
    return {
      isConfigured: false,
      message: "Firebase is not properly configured. Check your environment variables.",
    }
  }

  if (isAppCheckReady) {
    return {
      isConfigured: true,
      message: "App Check is properly configured",
    }
  }

  return {
    isConfigured: false,
    message:
      process.env.NODE_ENV === "development"
        ? "App Check is not configured. Using fallback authentication for development."
        : "App Check is not configured. Authentication may fail in production.",
  }
}

/**
 * Diagnoses potential Firebase configuration issues
 */
export function diagnoseFirebaseIssues(): {
  hasIssues: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check Firebase config
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      issues.push(`Missing ${varName} environment variable`)
    }
  })

  // Check App Check config
  if (!process.env.RECAPTCHA_SITE_KEY) {
    issues.push("Missing RECAPTCHA_SITE_KEY environment variable")
  }

  return {
    hasIssues: issues.length > 0,
    issues,
  }
}
