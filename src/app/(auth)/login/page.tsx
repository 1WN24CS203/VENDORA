'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithPassword } from '@/lib/auth/actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Read the CSRF token that the server planted in the __Host-csrf cookie
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('__Host-csrf='));
    if (match) setCsrfToken(match.split('=')[1]);
  }, []);

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await signInWithPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-container">
      <h1>Welcome back</h1>
      <p>Sign in to your Vendora account to continue.</p>

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
        onSubmit={handlePasswordLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {/* CSRF anti-forgery token */}
        <input type="hidden" name="_csrf" value={csrfToken} />

        <div className="input-group">
          <label htmlFor="login-email" className="input-label">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            className="input"
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="login-password" className="input-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-muted)',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            className="input"
            placeholder="••••••••"
            required
            autoComplete="current-password"
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
              <span className="spinner" /> Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="divider-text" style={{ marginTop: 'var(--space-8)' }}>
        <span>New to Vendora?</span>
      </div>
      <Link
        href="/register"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 'var(--space-4)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Create an account →
      </Link>
    </div>
  );
}
