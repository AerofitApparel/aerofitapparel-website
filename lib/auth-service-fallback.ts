import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { UserData } from "./auth-service"

// This file provides fallback authentication methods that work without App Check
// It's used automatically when App Check is not configured

// Create a new user with email and password
export const signUpWithEmailFallback = async (
  email: string,
  password: string,
  displayName: string,
): Promise<UserData> => {
  try {
    console.warn("Using fallback authentication without App Check. This should only be used in development.")

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, { displayName })

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
    throw error
  }
}

// Sign in with email and password
export const signInWithEmailFallback = async (email: string, password: string): Promise<UserData> => {
  try {
    console.warn("Using fallback authentication without App Check. This should only be used in development.")

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

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
    throw error
  }
}

// Sign in with Google
export const signInWithGoogleFallback = async (): Promise<UserData> => {
  try {
    console.warn("Using fallback authentication without App Check. This should only be used in development.")

    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

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
    throw error
  }
}

// Sign in with Facebook
export const signInWithFacebookFallback = async (): Promise<UserData> => {
  try {
    console.warn("Using fallback authentication without App Check. This should only be used in development.")

    const provider = new FacebookAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

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
    throw error
  }
}
