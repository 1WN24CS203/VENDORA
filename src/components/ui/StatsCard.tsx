'use client';

import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, trend, icon }: StatsCardProps) {
  return (
    <div className="stats-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stats-card-label">{label}</span>
        {icon && <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>{icon}</span>}
      </div>
      <span className="stats-card-value">{value}</span>
      {trend && <span className="stats-card-trend">{trend}</span>}
    </div>
  );
}
