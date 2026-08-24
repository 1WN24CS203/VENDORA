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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  async function handleSaveProfile() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile?.id || '');
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
              value={profile?.role || 'viewer'}
              disabled
            />
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <Button variant="coral" onClick={handleSaveProfile} loading={saving}>
                Save Changes
              </Button>
              {saved && (
                <span style={{ color: 'var(--green)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  ✓ Saved successfully
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
              style={{ width: 'auto', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--border-radius)' }}
            >
              {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
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
