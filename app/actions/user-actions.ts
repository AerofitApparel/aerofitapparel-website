"use server"

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin"
import type { UserRole } from "@/lib/auth-service"
import { revalidatePath } from "next/cache"

/**
 * Create a new user with email and password
 */
export async function createUser(email: string, password: string, displayName: string) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminFirestore()

    if (!adminAuth || !adminDb) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    // Create the user with Firebase Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    })

    // Set custom claims for role-based access
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "user" })

    // Store additional user data in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: "user",
      createdAt: Date.now(),
    })

    return { success: true, user: userRecord }
  } catch (error: any) {
    console.error("Error creating user:", error)
    return {
      success: false,
      error: error.message || "Failed to create user",
    }
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminFirestore()

    if (!adminAuth || !adminDb) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    // Update custom claims with the new role
    await adminAuth.setCustomUserClaims(userId, { role })

    // Update the user document in Firestore
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: Date.now(),
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return {
      success: false,
      error: error.message || "Failed to update user role",
    }
  }
}

/**
 * Get all users with pagination
 */
export async function getUsers(limit = 50, startAfter?: string) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminFirestore()

    if (!adminAuth || !adminDb) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    // Get users from Firebase Auth
    const listUsersResult = startAfter ? await adminAuth.listUsers(limit, startAfter) : await adminAuth.listUsers(limit)

    // Get user data from Firestore to merge with Auth data
    const userDocs = await Promise.all(
      listUsersResult.users.map(async (user) => {
        const userDoc = await adminDb.collection("users").doc(user.uid).get()
        return {
          ...user,
          customClaims: user.customClaims || {},
          userData: userDoc.exists ? userDoc.data() : null,
        }
      }),
    )

    return {
      success: true,
      users: userDocs,
      pageToken: listUsersResult.pageToken,
    }
  } catch (error: any) {
    console.error("Error getting users:", error)
    return {
      success: false,
      error: error.message || "Failed to get users",
    }
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminFirestore()

    if (!adminAuth || !adminDb) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    // Delete the user from Firebase Auth
    await adminAuth.deleteUser(userId)

    // Delete the user document from Firestore
    await adminDb.collection("users").doc(userId).delete()

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      error: error.message || "Failed to delete user",
    }
  }
}

/**
 * Disable or enable a user account
 */
export async function setUserDisabled(userId: string, disabled: boolean) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminFirestore()

    if (!adminAuth || !adminDb) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    // Update the user in Firebase Auth
    await adminAuth.updateUser(userId, { disabled })

    // Update the user document in Firestore
    await adminDb.collection("users").doc(userId).update({
      disabled,
      updatedAt: Date.now(),
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating user disabled status:", error)
    return {
      success: false,
      error: error.message || "Failed to update user status",
    }
  }
}

/**
 * Verify a Firebase ID token and get the user data
 */
export async function verifyIdToken(token: string) {
  try {
    const adminAuth = getAdminAuth()

    if (!adminAuth) {
      return {
        success: false,
        error: "Firebase Admin SDK is not initialized. Check server logs and environment variables.",
      }
    }

    const decodedToken = await adminAuth.verifyIdToken(token)
    return { success: true, user: decodedToken }
  } catch (error: any) {
    console.error("Error verifying ID token:", error)
    return {
      success: false,
      error: error.message || "Failed to verify token",
    }
  }
}
