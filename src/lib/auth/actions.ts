'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  error?: string;
  success?: string;
}

// ─── Sign Up (Admin / Staff) ────────────────────────────────────────

export async function signUpWithPassword(formData: FormData): Promise<AuthActionResult> {
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

  // Auto-sign in immediately after sign up
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

// ─── Sign In (Password) ─────────────────────────────────────────────

export async function signInWithPassword(formData: FormData): Promise<AuthActionResult> {
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

// ─── Sign Out ────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
