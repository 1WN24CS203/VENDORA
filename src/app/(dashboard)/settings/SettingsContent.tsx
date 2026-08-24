'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input } from '@/components/ui';
import type { Profile } from '@/types';

interface SettingsContentProps {
  email: string;
  profile: Profile | null;
}

export function SettingsContent({ email, profile }: SettingsContentProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  async function handleSaveProfile() {
    setSaving(true);
    setError('');
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to update your profile.');
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        role: profile?.role || 'admin',
      });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    // Also update auth user metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences.</p>
      </div>

      <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Profile Section */}
        <div className="card">
          <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Profile</h3>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              value={email}
              disabled
            />
            <Input
              label="Role"
              value={profile?.role || 'admin'}
              disabled
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Button variant="coral" onClick={handleSaveProfile} loading={saving}>
                Save Changes
              </Button>
              {saved && (
                <span style={{ color: 'var(--green)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  Saved successfully
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>Appearance</h3>
          <p className="text-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Toggle between light and dark mode.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              style={{ width: 'auto', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {theme === 'light' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Switch to Light Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="card">
          <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>Account</h3>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-field-label">Account ID</span>
              <span className="detail-field-value" style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                {profile?.id || '—'}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Member Since</span>
              <span className="detail-field-value">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
