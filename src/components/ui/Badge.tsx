'use client';

import React from 'react';

interface BadgeProps {
  status: string;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ status, children, className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${status} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
    compliant: 'Compliant',
    non_compliant: 'Non-Compliant',
    pending_review: 'Pending Review',
  };

  return (
    <Badge status={status}>
      {labels[status] || status}
    </Badge>
  );
}
