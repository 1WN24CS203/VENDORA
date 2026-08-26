'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('__Host-csrf='));
    if (match) setCsrfToken(match.split('=')[1]);
  }, []);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  return (
    <div className="auth-form-container">
      <h1>Reset your password</h1>
      <p>
        Enter the email address linked to your account and we&apos;ll send you a reset link.
      </p>

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

      {success ? (
        <div
          role="status"
          style={{
            padding: 'var(--space-4)',
            background: 'var(--green-bg)',
            color: 'var(--green)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
            lineHeight: '1.6',
          }}
        >
          <strong>Check your inbox</strong>
          <br />
          {success}
        </div>
      ) : (
        <form
          onSubmit={handleReset}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {/* CSRF anti-forgery token */}
          <input type="hidden" name="_csrf" value={csrfToken} />

          <div className="input-group">
            <label htmlFor="reset-email" className="input-label">
              Email Address
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              required
              autoComplete="email"
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
                <span className="spinner" /> Sending link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}

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
