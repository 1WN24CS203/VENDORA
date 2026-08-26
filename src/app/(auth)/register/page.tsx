'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signUpWithPassword } from '@/lib/auth/actions';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('__Host-csrf='));
    if (match) setCsrfToken(match.split('=')[1]);
  }, []);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const result = await signUpWithPassword(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }
    setLoading(false);
  }

  return (
    <div className="auth-form-container">
      <h1>Create your account</h1>
      <p>Get started with Vendora — manage vendors effortlessly.</p>

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

      {success && (
        <div
          role="status"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--green-bg)',
            color: 'var(--green)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSignup}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {/* CSRF anti-forgery token */}
        <input type="hidden" name="_csrf" value={csrfToken} />

        <div className="input-group">
          <label htmlFor="reg-name" className="input-label">
            Full Name
          </label>
          <input
            id="reg-name"
            name="full_name"
            type="text"
            className="input"
            placeholder="Your full name"
            required
            autoComplete="name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="reg-email" className="input-label">
            Email Address
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            className="input"
            placeholder="you@company.com"
            required
            autoComplete="email"
          />
        </div>
        <input
          type="hidden"
          name="phone"
          value={rawPhone ? `${phoneCode} ${rawPhone}` : ''}
        />
        <div className="input-group">
          <label className="input-label">Phone Number (optional)</label>
          <div
            style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 'var(--space-2)' }}
          >
            <select
              className="select"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              style={{ height: '42px', marginTop: '0' }}
            >
              <option value="+91">IN +91</option>
              <option value="+1">US +1</option>
              <option value="+44">GB +44</option>
              <option value="+971">AE +971</option>
              <option value="+65">SG +65</option>
              <option value="+61">AU +61</option>
              <option value="+81">JP +81</option>
              <option value="+49">DE +49</option>
            </select>
            <input
              id="reg-phone"
              type="tel"
              className="input"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              placeholder="98765 43210"
              style={{ height: '42px', marginTop: '0' }}
              autoComplete="tel"
            />
          </div>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}
        >
          <div className="input-group">
            <label htmlFor="reg-password" className="input-label">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="input"
              placeholder="Min 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="input-group">
            <label htmlFor="reg-confirm" className="input-label">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              name="confirm_password"
              type="password"
              className="input"
              placeholder="Repeat password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {loading ? (
            <>
              <span className="spinner" /> Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="divider-text" style={{ marginTop: 'var(--space-8)' }}>
        <span>Already have an account?</span>
      </div>
      <Link
        href="/login"
        style={{
          display: 'block',
          textAlign: 'center',
          marginTop: 'var(--space-4)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Sign in instead →
      </Link>
    </div>
  );
}
