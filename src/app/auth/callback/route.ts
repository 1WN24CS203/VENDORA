import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback route handler.
 * Supabase sends users here after they click email links (password reset,
 * email verification, magic link, etc.) with either:
 *   - `?code=xxx` (PKCE flow) — exchange for a session
 *   - `?token_hash=xxx&type=xxx` (legacy flow)
 *
 * After exchanging the code, redirect the user to the intended destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For password recovery, redirect to the reset-password page
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password?code=exchanged', origin));
      }
      // For other flows (signup confirmation, etc.), go to next destination
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // If code exchange failed or no code present, redirect to login with error
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_failed', origin)
  );
}
