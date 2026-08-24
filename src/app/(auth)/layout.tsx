import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-form-side">
        {children}
      </div>
      <div className="auth-brand-side">
        <span className="auth-brand-decoration auth-brand-decoration-1">V</span>
        <span className="auth-brand-decoration auth-brand-decoration-2">&amp;</span>
        <div className="auth-brand-content">
          <h2>Streamline your vendor relationships.</h2>
          <p>
            Vendora helps you onboard, track, and manage all your vendors
            in one place. From registration to compliance — everything you
            need, beautifully organized.
          </p>
          <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--paper)' }}>500+</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Vendors Managed</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--paper)' }}>98%</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Compliance Rate</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', color: 'var(--paper)' }}>24h</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Avg. Onboarding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
