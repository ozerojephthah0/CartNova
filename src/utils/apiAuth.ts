import { UserProfile, UserRole } from '../types';

let cachedSignedToken: string | null = null;
let cachedTokenUserId: string | null = null;

export function getAuthHeaders(user?: UserProfile | null, role?: UserRole): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (user && user.id) {
    const effectiveRole = role || user.role || 'customer';
    headers['x-user-id'] = user.id;
    headers['x-user-email'] = user.email || '';
    headers['x-user-role'] = effectiveRole;

    // Use cached signed token if matching, or standard bearer token
    const token = (cachedTokenUserId === user.id && cachedSignedToken)
      ? cachedSignedToken
      : `token_${user.id}_${effectiveRole}`;

    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function refreshSignedToken(user: UserProfile, role?: UserRole): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        role: role || user.role || 'customer',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        cachedSignedToken = data.token;
        cachedTokenUserId = user.id;
        return data.token;
      }
    }
  } catch (err) {
    console.warn('Could not refresh signed session token:', err);
  }
  return null;
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  user?: UserProfile | null,
  role?: UserRole
): Promise<Response> {
  const authHeaders = getAuthHeaders(user, role);
  const mergedHeaders = {
    ...authHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
}
