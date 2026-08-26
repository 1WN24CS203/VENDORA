import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          try {
            request.cookies.set(name, value);
          } catch {
            // Ignored — cookie set from read-only context
          }
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            supabaseResponse.cookies.set(name, value, options);
          } catch {
            // Ignored
          }
        });
      },
    },
  });

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Auth check failed — treat as unauthenticated
  }

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/vendors') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/settings');

  const copyAndRedirect = (destination: string) => {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    const redirectResponse = NextResponse.redirect(url);
    try {
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          domain: cookie.domain,
          maxAge: cookie.maxAge,
          expires: cookie.expires,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
        });
      });
    } catch {
      // Best-effort cookie copy
    }
    return redirectResponse;
  };

  if (!user && isDashboardRoute) return copyAndRedirect('/login');
  if (user && isAuthRoute) return copyAndRedirect('/dashboard');

  return supabaseResponse;
}
