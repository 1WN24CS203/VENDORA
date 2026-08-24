import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <DashboardShell
      userName={profile?.full_name || user?.email || 'User'}
      userRole={profile?.role || 'viewer'}
    >
      {children}
    </DashboardShell>
  );
}
