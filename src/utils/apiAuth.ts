import { UserProfile, UserRole } from '../types';

export function getAuthHeaders(user?: UserProfile | null, role?: UserRole): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (user && user.id) {
    headers['x-user-id'] = user.id;
    headers['x-user-email'] = user.email || '';
    headers['x-user-role'] = role || user.role || 'customer';
    headers['Authorization'] = `Bearer token_${user.id}_${role || user.role}`;
  }

  return headers;
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
    ...(options.headers as Record<string, string> || {}),
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
}
