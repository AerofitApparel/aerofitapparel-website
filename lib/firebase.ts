import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Initialize Firebase with error handling
let app
let auth
let db

// This function will initialize Firebase asynchronously
export async function initializeFirebase() {
  if (typeof window === "undefined") {
    // Server-side initialization
    return { app: null, auth: null, db: null }
  }

  if (app) {
    // Return existing instances if already initialized
    return { app, auth, db }
  }

  try {
    // Set debug token for development BEFORE any Firebase initialization
    if (process.env.NODE_ENV === "development") {
      // @ts-ignore
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true
      console.log("Firebase App Check debug mode enabled in initializeFirebase")
    }

    // Fetch Firebase config from our API
    const response = await fetch("/api/config/firebase")
    const firebaseConfig = await response.json()

    if (!firebaseConfig.apiKey) {
      throw new Error("Firebase configuration is incomplete")
    }

    // Initialize Firebase
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    // Use emulators in development if needed
    if (firebaseConfig.useEmulators) {
      const { connectAuthEmulator } = await import("firebase/auth")
      const { connectFirestoreEmulator } = await import("firebase/firestore")

      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      connectFirestoreEmulator(db, "localhost", 8080)
      console.log("Using Firebase emulators")
    }

    return { app, auth, db }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
    throw error
  }
}

// For backward compatibility - these will be initialized on first access
try {
  if (typeof window !== "undefined") {
    // Only initialize on client side
    initializeFirebase().then(({ app: _app, auth: _auth, db: _db }) => {
      app = _app
      auth = _auth
      db = _db
    })
  }
} catch (error) {
  console.error("Error in initial Firebase setup:", error)
}

export { app, auth, db }
