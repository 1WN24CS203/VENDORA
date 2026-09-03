'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { validateCsrfToken } from '@/lib/csrf';

export interface AuthActionResult {
  error?: string;
  success?: string;
}

export async function signUpWithPassword(formData: FormData): Promise<AuthActionResult> {
  const csrfToken = formData.get('_csrf') as string | null;
  if (!(await validateCsrfToken(csrfToken))) {
    return { error: 'Invalid request. Please refresh and try again.' };
  }

  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (signUpData.session) {
    redirect('/dashboard');
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    redirect('/dashboard');
  }

  return { success: 'Account created! You can now sign in.' };
}

export async function signInWithPassword(formData: FormData): Promise<AuthActionResult> {
  const csrfToken = formData.get('_csrf') as string | null;
  if (!(await validateCsrfToken(csrfToken))) {
    return { error: 'Invalid request. Please refresh and try again.' };
  }

  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const csrfToken = formData.get('_csrf') as string | null;
  if (!(await validateCsrfToken(csrfToken))) {
    return { error: 'Invalid request. Please refresh and try again.' };
  }

  const supabase = await createClient();
  const email = formData.get('email') as string;
  const clientOrigin = formData.get('origin') as string | null;

  const siteUrl =
    clientOrigin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://vendora-two-tau.vercel.app');

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  // Always return the same message to prevent user enumeration
  return {
    success: 'If that email is registered, a password reset link has been sent. Check your inbox.',
  };
}

export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const csrfToken = formData.get('_csrf') as string | null;
  if (!(await validateCsrfToken(csrfToken))) {
    return { error: 'Invalid request. Please refresh and try again.' };
  }

  const supabase = await createClient();

  const code = formData.get('code') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return { error: 'Reset link is invalid or has expired. Please request a new one.' };
    }
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  redirect('/login');
}
