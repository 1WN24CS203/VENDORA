import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const CSRF_COOKIE = '__Host-csrf';
const TOKEN_BYTES = 32;

function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Plant the CSRF cookie if it isn't already present
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  if (!existing) {
    const token = generateToken();
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // JS must read it to embed in forms
      sameSite: 'strict',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
