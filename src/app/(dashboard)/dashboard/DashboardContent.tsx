'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/ui';
import type { DashboardStats } from '@/types';

interface DashboardContentProps {
  stats: DashboardStats;
}

export function DashboardContent({ stats }: DashboardContentProps) {
  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Your vendor management overview at a glance.</p>
        </div>
        <Link href="/vendors/new" className="btn btn-coral">
          + Add Vendor
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid stagger-children">
        <StatsCard
          label="Total Vendors"
          value={stats.total_vendors}
          icon={<span>📊</span>}
          trend="All registered vendors"
        />
        <StatsCard
          label="Pending Approval"
          value={stats.pending_approval}
          icon={<span>⏳</span>}
          trend="Awaiting review"
        />
        <StatsCard
          label="Approved"
          value={stats.approved}
          icon={<span>✅</span>}
          trend="Active vendors"
        />
        <StatsCard
          label="Compliance Issues"
          value={stats.non_compliant}
          icon={<span>⚠️</span>}
          trend="Needs attention"
        />
      </div>

      {/* Status Breakdown & Compliance Card */}
      <div className="card animate-slide-up" style={{ maxWidth: '700px' }}>
        <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Status Breakdown</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <StatusBar label="Approved" count={stats.approved} total={stats.total_vendors} color="var(--green)" />
          <StatusBar label="Pending" count={stats.pending_approval} total={stats.total_vendors} color="var(--amber)" />
          <StatusBar label="Rejected" count={stats.rejected} total={stats.total_vendors} color="var(--red)" />
          <StatusBar label="Suspended" count={stats.suspended} total={stats.total_vendors} color="var(--ink-faint)" />
        </div>

        <div className="divider" />

        <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>Compliance Overview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <StatusBar label="Compliant" count={stats.compliant} total={stats.total_vendors} color="var(--green)" />
          <StatusBar label="Non-Compliant" count={stats.non_compliant} total={stats.total_vendors} color="var(--red)" />
          <StatusBar label="Pending Review" count={stats.pending_review} total={stats.total_vendors} color="var(--blue)" />
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/vendors" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            View All Vendors
          </Link>
          <Link href="/vendors/new" className="btn btn-coral btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            Register New
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>{label}</span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{count}</span>
      </div>
      <div style={{
        height: '6px',
        background: 'var(--paper-warm)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '3px',
          transition: 'width 0.8s ease-out',
        }} />
      </div>
    </div>
  );
}
