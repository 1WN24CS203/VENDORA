'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { updatePassword } from '@/lib/auth/actions';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('__Host-csrf='));
    if (match) setCsrfToken(match.split('=')[1]);
  }, []);

  // If there's no code at all (user navigated here directly without the email link)
  if (!code) {
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
        }}
      >
        This reset link is invalid or has already been used.{' '}
        <Link href="/forgot-password" style={{ color: 'inherit', fontWeight: 600 }}>
          Request a new one →
        </Link>
      </div>
    );
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    // If code is 'exchanged', the session was already established by /auth/callback
    // so we don't need to pass the code again — just update the password directly
    if (code === 'exchanged') {
      formData.delete('code');
      formData.set('code', '');
    }

    const result = await updatePassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div
        role="status"
        style={{
          padding: 'var(--space-4)',
          background: 'var(--green-bg)',
          color: 'var(--green)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--text-sm)',
          lineHeight: '1.6',
        }}
      >
        <strong>Password updated!</strong>
        <br />
        You can now sign in with your new password.
        <br />
        <Link href="/login" style={{ color: 'inherit', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
          Go to Sign In →
        </Link>
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
        {/* CSRF anti-forgery token */}
        <input type="hidden" name="_csrf" value={csrfToken} />
        {/* Pass the Supabase OTP code for session exchange */}
        <input type="hidden" name="code" value={code === 'exchanged' ? '' : code} />

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
            required
            minLength={8}
            autoComplete="new-password"
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
