import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs } from "firebase/firestore"
import { auth, db } from "./firebase"

export type UserRole = "user" | "customer" | "admin" | "super_admin"

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt: number
  disabled?: boolean
}

// This will help us handle App Check errors
const handleAuthError = (error: any) => {
  if (error.code === "auth/firebase-app-check-token-is-invalid") {
    console.error("App Check error:", error)

    // Check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      console.warn("App Check debug mode should be enabled. If you're still seeing this error, try the following:")
      console.warn("1. Clear your browser cache and cookies")
      console.warn("2. Restart your development server")
      console.warn("3. Check if your reCAPTCHA site key is valid")
      console.warn("4. Ensure your domain is registered in the reCAPTCHA admin console")
    }

    throw new Error(
      "Firebase App Check validation failed. This usually means App Check is enabled in your Firebase project but not properly configured in your application. See console for details.",
    )
  }

  throw error
}

// Create a new user with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<UserData> => {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    if (!user) {
      throw new Error("Failed to create user")
    }

    // Update profile with display name
    await updateProfile(user, { displayName: displayName || "" })

    // Create user document in Firestore with default role 'user'
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: "user",
      createdAt: Date.now(),
    }

    await setDoc(doc(db, "users", user.uid), userData)

    return userData
  } catch (error) {
    console.error("Error in signUpWithEmail:", error)
    return handleAuthError(error)
  }
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserData> => {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    if (!user) {
      throw new Error("Failed to sign in")
    }

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      // If user document doesn't exist (rare case), create it with default role
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "user",
        createdAt: Date.now(),
      }

      await setDoc(doc(db, "users", user.uid), userData)
      return userData
    }
  } catch (error) {
    console.error("Error in signInWithEmail:", error)
    return handleAuthError(error)
  }
}

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserData> => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    if (!user) {
      throw new Error("Failed to sign in with Google")
    }

    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      // If new user, create document with default role 'user'
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "user",
        createdAt: Date.now(),
      }

      await setDoc(doc(db, "users", user.uid), userData)
      return userData
    }
  } catch (error) {
    console.error("Error in signInWithGoogle:", error)
    return handleAuthError(error)
  }
}

// Sign in with Facebook
export const signInWithFacebook = async (): Promise<UserData> => {
  try {
    const provider = new FacebookAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    if (!user) {
      throw new Error("Failed to sign in with Facebook")
    }

    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      // If new user, create document with default role 'user'
      const userData: UserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "user",
        createdAt: Date.now(),
      }

      await setDoc(doc(db, "users", user.uid), userData)
      return userData
    }
  } catch (error) {
    console.error("Error in signInWithFacebook:", error)
    return handleAuthError(error)
  }
}

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    return handleAuthError(error)
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  if (!email) {
    throw new Error("Email is required")
  }

  try {
    return await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error sending password reset:", error)
    return handleAuthError(error)
  }
}

// Get current user data
export const getCurrentUserData = async (user: User | null): Promise<UserData | null> => {
  if (!user) {
    return null
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error getting current user data:", error)
    return handleAuthError(error)
  }
}

// Update user role (client-side implementation)
export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    // Update the user document in Firestore
    await updateDoc(doc(db, "users", userId), {
      role,
      updatedAt: Date.now(),
    })

    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return handleAuthError(error)
  }
}

// Get all users (client-side implementation)
export const getUsers = async (limit = 50): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, limit)
    const querySnapshot = await getDocs(q)

    const users: UserData[] = []
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData)
    })

    return users
  } catch (error) {
    console.error("Error getting users:", error)
    return handleAuthError(error)
  }
}

// Disable/enable user (client-side implementation)
export const setUserDisabled = async (userId: string, disabled: boolean): Promise<boolean> => {
  try {
    // Update the user document in Firestore
    await updateDoc(doc(db, "users", userId), {
      disabled,
      updatedAt: Date.now(),
    })

    return true
  } catch (error) {
    console.error("Error updating user disabled status:", error)
    return handleAuthError(error)
  }
}
