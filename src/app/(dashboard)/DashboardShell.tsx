'use client';

import React from 'react';
import { Sidebar, ToastProvider } from '@/components/ui';

interface DashboardShellProps {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export function DashboardShell({ userName, userRole, children }: DashboardShellProps) {
  return (
    <ToastProvider>
      <div className="dashboard-layout">
        <Sidebar userName={userName} userRole={userRole} />
        <main className="dashboard-main">
          <div className="mobile-header">
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', letterSpacing: 'var(--tracking-tight)' }}>Vendora</span>
          </div>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
