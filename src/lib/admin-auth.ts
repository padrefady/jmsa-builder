// Admin authentication helper
// Verifies a base64-encoded JSON token containing { role, exp }

interface AdminTokenPayload {
  role: string
  exp: number
}

/**
 * Generate an admin token (base64-encoded JSON with role + expiry)
 */
export function generateAdminToken(): string {
  const payload: AdminTokenPayload = {
    role: 'admin',
    exp: Date.now() + 86400000, // 24 hours
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Verify an admin token
 * Returns true if token is valid, role is 'admin', and not expired
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const payload: AdminTokenPayload = JSON.parse(decoded)
    return payload.role === 'admin' && payload.exp > Date.now()
  } catch {
    return false
  }
}

/**
 * Extract and verify the admin token from the Authorization header
 * Returns the token string if valid, or null if invalid/missing
 */
export function getAdminToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  const token = parts[1]
  if (!verifyAdminToken(token)) return null
  return token
}
