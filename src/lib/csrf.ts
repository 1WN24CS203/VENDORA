import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const CSRF_COOKIE = '__Host-csrf';
const CSRF_HEADER = 'x-csrf-token';
const TOKEN_BYTES = 32;

/**
 * Returns the current CSRF token for the session, generating one if absent.
 * Call from a Server Component or Server Action to embed in forms.
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CSRF_COOKIE)?.value;
  if (existing) return existing;

  const token = randomBytes(TOKEN_BYTES).toString('hex');
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,   // JS must read it to place in hidden input
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return token;
}

/**
 * Validates the CSRF token submitted with a form against the cookie value.
 * Returns true if valid, false otherwise.
 */
export async function validateCsrfToken(submittedToken: string | null): Promise<boolean> {
  if (!submittedToken) return false;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(submittedToken);
  const b = Buffer.from(cookieToken);
  if (a.length !== b.length) return false;
  return a.equals(b);
}

export { CSRF_COOKIE, CSRF_HEADER };
