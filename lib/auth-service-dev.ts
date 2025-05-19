// DEVELOPMENT ONLY AUTHENTICATION SERVICE
// This file provides authentication methods that completely bypass App Check for development

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, collection, query, getDocs } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { UserData, UserRole } from "./auth-service"

// Create a new user with email and password - DEV MODE
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<UserData> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
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
    console.error("DEV AUTH - Error in signUpWithEmail:", error)
    throw error
  }
}

// Sign in with email and password - DEV MODE
export const signInWithEmail = async (email: string, password: string): Promise<UserData> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    } else {
      // If user document doesn't exist, create it with default role
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
    console.error("DEV AUTH - Error in signInWithEmail:", error)
    throw error
  }
}

// Sign in with Google - DEV MODE
export const signInWithGoogle = async (): Promise<UserData> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
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
    console.error("DEV AUTH - Error in signInWithGoogle:", error)
    throw error
  }
}

// Sign in with Facebook - DEV MODE
export const signInWithFacebook = async (): Promise<UserData> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
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
    console.error("DEV AUTH - Error in signInWithFacebook:", error)
    throw error
  }
}

// Reset password - DEV MODE
export const resetPassword = async (email: string): Promise<void> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("DEV AUTH - Error in resetPassword:", error)
    throw error
  }
}

// Sign out - DEV MODE
export const signOutUser = async (): Promise<void> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
    await signOut(auth)
  } catch (error) {
    console.error("DEV AUTH - Error in signOutUser:", error)
    throw error
  }
}

// Get current user data - DEV MODE
export const getCurrentUserData = async (user: User | null): Promise<UserData | null> => {
  if (!user) return null

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("DEV AUTH - Error in getCurrentUserData:", error)
    throw error
  }
}

// Update user role - DEV MODE
export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
    await updateDoc(doc(db, "users", userId), {
      role,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error("DEV AUTH - Error in updateUserRole:", error)
    throw error
  }
}

// Get all users - DEV MODE
export const getUsers = async (limit = 50): Promise<UserData[]> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

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
    console.error("DEV AUTH - Error in getUsers:", error)
    throw error
  }
}

// Disable/enable user - DEV MODE
export const setUserDisabled = async (userId: string, disabled: boolean): Promise<boolean> => {
  console.warn("⚠️ USING DEVELOPMENT AUTH SERVICE - App Check is bypassed")

  try {
    await updateDoc(doc(db, "users", userId), {
      disabled,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error("DEV AUTH - Error in setUserDisabled:", error)
    throw error
  }
}
