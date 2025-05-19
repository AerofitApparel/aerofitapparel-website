// This file automatically selects between production and development auth services
import * as prodAuth from "./auth-service"
import * as devAuth from "./auth-service-dev"
import type { UserData, UserRole } from "./auth-service"
import type { User } from "firebase/auth"

// Determine if we should use the development auth service
const useDevAuth = () => {
  // Always use dev auth in development environment
  if (process.env.NODE_ENV === "development") {
    return true
  }

  // Check for specific override flag (useful for testing in production environments)
  if (typeof window !== "undefined" && window.localStorage.getItem("use-dev-auth") === "true") {
    return true
  }

  return false
}

// Export all auth methods, automatically selecting between prod and dev implementations
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<UserData> => {
  return useDevAuth()
    ? devAuth.signUpWithEmail(email, password, displayName)
    : prodAuth.signUpWithEmail(email, password, displayName)
}

export const signInWithEmail = async (email: string, password: string): Promise<UserData> => {
  return useDevAuth() ? devAuth.signInWithEmail(email, password) : prodAuth.signInWithEmail(email, password)
}

export const signInWithGoogle = async (): Promise<UserData> => {
  return useDevAuth() ? devAuth.signInWithGoogle() : prodAuth.signInWithGoogle()
}

export const signInWithFacebook = async (): Promise<UserData> => {
  return useDevAuth() ? devAuth.signInWithFacebook() : prodAuth.signInWithFacebook()
}

export const resetPassword = async (email: string): Promise<void> => {
  return useDevAuth() ? devAuth.resetPassword(email) : prodAuth.resetPassword(email)
}

export const signOutUser = async (): Promise<void> => {
  return useDevAuth() ? devAuth.signOutUser() : prodAuth.signOutUser()
}

export const getCurrentUserData = async (user: User | null): Promise<UserData | null> => {
  return useDevAuth() ? devAuth.getCurrentUserData(user) : prodAuth.getCurrentUserData(user)
}

export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  return useDevAuth() ? devAuth.updateUserRole(userId, role) : prodAuth.updateUserRole(userId, role)
}

export const getUsers = async (limit = 50): Promise<UserData[]> => {
  return useDevAuth() ? devAuth.getUsers(limit) : prodAuth.getUsers(limit)
}

export const setUserDisabled = async (userId: string, disabled: boolean): Promise<boolean> => {
  return useDevAuth() ? devAuth.setUserDisabled(userId, disabled) : prodAuth.setUserDisabled(userId, disabled)
}

// Re-export types
export type { UserData, UserRole } from "./auth-service"
