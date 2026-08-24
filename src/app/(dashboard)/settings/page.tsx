import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { SettingsContent } from '@/app/(dashboard)/settings/SettingsContent';

export default async function SettingsPage() {
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
    <SettingsContent
      email={user?.email || ''}
      profile={profile}
    />
  );
}
