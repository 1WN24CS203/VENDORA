'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [canReset, setCanReset] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function verifyRecovery() {
      // 1. Check for error parameters in query string
      const qError = searchParams.get('error_description') || searchParams.get('error');
      if (qError) {
        if (isMounted) {
          setError(qError);
          setVerifying(false);
          setCanReset(false);
        }
        return;
      }

      // 2. Check for error in URL hash fragment
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          if (isMounted) {
            setError(decodeURIComponent(hashError.replace(/\+/g, ' ')));
            setVerifying(false);
            setCanReset(false);
          }
          return;
        }

        // If access_token or recovery type is in hash, it is a valid recovery link
        if (hashParams.get('type') === 'recovery' || hashParams.get('access_token')) {
          if (isMounted) {
            setCanReset(true);
            setVerifying(false);
          }
          return;
        }
      }

      // 3. Check for PKCE code in query string
      const code = searchParams.get('code');
      if (code) {
        try {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.error('Code exchange error:', exchangeErr);
            if (isMounted) {
              setError(exchangeErr.message || 'Reset link is invalid or has expired.');
              setCanReset(false);
              setVerifying(false);
            }
            return;
          }
          if (isMounted) {
            setCanReset(true);
            setVerifying(false);
          }
          return;
        } catch (err: unknown) {
          console.error('Exchange exception:', err);
        }
      }

      // 4. Check active session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) {
            setCanReset(true);
            setVerifying(false);
          }
          return;
        }
      } catch (err) {
        console.error('Get session error:', err);
      }

      // 5. Allow brief grace period for onAuthStateChange to fire
      const timer = setTimeout(() => {
        if (isMounted) {
          setVerifying(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        if (isMounted) {
          setCanReset(true);
          setVerifying(false);
          setError('');
        }
      }
    });

    verifyRecovery();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase]);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--ink-muted)' }}>
        <span className="spinner" style={{ display: 'inline-block', marginBottom: 'var(--space-3)' }} />
        <p style={{ fontSize: 'var(--text-sm)' }}>Verifying your reset link...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div
        role="status"
        style={{
          padding: 'var(--space-5)',
          background: 'var(--green-bg)',
          color: 'var(--green)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
        }}
      >
        <strong style={{ fontSize: 'var(--text-base)', display: 'block', marginBottom: 'var(--space-2)' }}>
          Password updated successfully!
        </strong>
        Your new password has been saved. You can now sign in with your updated credentials.
        <br />
        <Link
          href="/login"
          className="btn btn-primary"
          style={{ marginTop: 'var(--space-4)', display: 'inline-block', textDecoration: 'none' }}
        >
          Proceed to Sign In →
        </Link>
      </div>
    );
  }

  if (!canReset) {
    return (
      <div
        role="alert"
        style={{
          padding: 'var(--space-4)',
          background: 'var(--red-bg)',
          color: 'var(--red)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
          lineHeight: '1.6',
        }}
      >
        <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
          {error ? 'Unable to reset password' : 'This reset link is invalid or has expired'}
        </strong>
        {error || 'The password reset link may have already been used or expired. Please request a new one.'}
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Link href="/forgot-password" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Request a new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--red-bg)',
            color: 'var(--red)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleUpdatePassword}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        <div className="input-group">
          <label htmlFor="new-password" className="input-label">
            New Password
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            className="input"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirm-password" className="input-label">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            name="confirm_password"
            type="password"
            className="input"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {loading ? (
            <>
              <span className="spinner" /> Updating password...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-form-container">
      <h1>Set new password</h1>
      <p>Choose a strong password for your Vendora account.</p>

      <Suspense fallback={<div style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>

      <Link
        href="/login"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        ← Back to Sign In
      </Link>
    </div>
  );
}
