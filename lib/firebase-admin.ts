// This file should only be imported in server components or API routes
import * as admin from "firebase-admin"
import { validateServiceAccountKey, createServiceAccountFromEnv, formatPrivateKey } from "./service-account-helper"

// Function to get Firebase Admin app instance
function getFirebaseAdminApp() {
  // Check if we're on the server side
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin SDK can only be used on the server side")
  }

  try {
    // Try to get the initialized app
    return admin.app()
  } catch (error) {
    // App hasn't been initialized yet
    let serviceAccount

    // First try: Use the full service account key JSON
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccountStr && validateServiceAccountKey(serviceAccountStr)) {
      try {
        serviceAccount = JSON.parse(serviceAccountStr)
      } catch (parseError) {
        console.error("Error parsing service account key:", parseError)
      }
    }

    // Second try: Use individual environment variables
    if (!serviceAccount) {
      serviceAccount = createServiceAccountFromEnv()
    }

    // If we still don't have a valid service account, throw an error
    if (!serviceAccount) {
      throw new Error("Could not initialize Firebase Admin SDK: No valid service account credentials")
    }

    // Initialize the app with the service account
    try {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    } catch (initError: any) {
      console.error("Error initializing Firebase Admin app:", initError)

      // If the error is about the private key format, try to fix it
      if (initError.message && initError.message.includes("private_key")) {
        if (typeof serviceAccount.private_key === "string") {
          serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key)

          // Try again with the formatted private key
          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          })
        }
      }

      throw initError
    }
  }
}

// Export functions that safely get admin services
export function getAdminAuth() {
  try {
    const app = getFirebaseAdminApp()
    return admin.auth(app)
  } catch (error) {
    console.error("Failed to initialize Firebase Admin Auth:", error)
    return null
  }
}

export function getAdminFirestore() {
  try {
    const app = getFirebaseAdminApp()
    return admin.firestore(app)
  } catch (error) {
    console.error("Failed to initialize Firebase Admin Firestore:", error)
    return null
  }
}

// Export the raw admin for advanced usage
export { admin }
