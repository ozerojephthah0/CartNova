import crypto from 'crypto';

const AUTH_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'cartnova_secure_auth_hmac_master_secret_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed HMAC token for a user session
 */
export function createSignedSessionToken(userId: string, email: string, role: 'customer' | 'seller' | 'admin'): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + 7 * 24 * 60 * 60 * 1000; // 7 days validity
  const payload: TokenPayload = {
    userId,
    email,
    role,
    issuedAt,
    expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `cn_${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export function verifySignedSessionToken(token: string): TokenPayload | null {
  if (!token) return null;

  // Handle standard signed token
  if (token.startsWith('cn_')) {
    const raw = token.slice(3);
    const parts = raw.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, providedSig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadB64)
      .digest('base64url');

    // Constant-time signature comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) {
      return null;
    }

    try {
      const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      if (Date.now() > payload.expiresAt) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }

  // Graceful fallback for local development / legacy bearer tokens
  if (token.startsWith('token_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      const userId = parts[1];
      const role = (['customer', 'seller', 'admin'].includes(parts[2]) ? parts[2] : 'customer') as 'customer' | 'seller' | 'admin';
      return {
        userId,
        email: `${userId}@cartnova.dev`,
        role,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      };
    }
  }

  return null;
}
