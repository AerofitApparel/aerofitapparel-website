/**
 * Helper functions for working with Firebase service account
 */

/**
 * Checks if the service account key is properly formatted
 */
export function validateServiceAccountKey(key: string): boolean {
  try {
    const parsed = JSON.parse(key)

    // Check for required fields
    return !!(
      parsed.type === "service_account" &&
      parsed.project_id &&
      parsed.private_key_id &&
      parsed.private_key &&
      parsed.client_email &&
      parsed.client_id
    )
  } catch (error) {
    return false
  }
}

/**
 * Formats the private key by replacing escaped newlines
 */
export function formatPrivateKey(privateKey: string): string {
  // Replace escaped newlines with actual newlines
  return privateKey.replace(/\\n/g, "\n")
}

/**
 * Creates a service account object from individual environment variables
 */
export function createServiceAccountFromEnv(): Record<string, string> | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  return {
    type: "service_account",
    project_id: projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "private-key-id",
    private_key: formatPrivateKey(privateKey),
    client_email: clientEmail,
    client_id: process.env.FIREBASE_CLIENT_ID || "client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
  }
}
