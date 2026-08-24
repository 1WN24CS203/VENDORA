'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signInWithPassword } from '@/lib/auth/actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--red-bg)',
          color: 'var(--red)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-4)',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="input-group">
          <label htmlFor="login-email" className="input-label">Email Address</label>
          <input id="login-email" name="email" type="email" className="input" placeholder="you@company.com" required />
        </div>
        <div className="input-group">
          <label htmlFor="login-password" className="input-label">Password</label>
          <input id="login-password" name="password" type="password" className="input" placeholder="••••••••" required />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
          {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
        </button>
      </form>

      <div className="divider-text" style={{ marginTop: 'var(--space-8)' }}>
        <span>New to Vendora?</span>
      </div>
      <Link href="/register" style={{
        display: 'block',
        textAlign: 'center',
        marginTop: 'var(--space-4)',
        color: 'var(--ink-muted)',
        fontSize: 'var(--text-sm)',
      }}>
        Create an account →
      </Link>
    </div>
  );
}
