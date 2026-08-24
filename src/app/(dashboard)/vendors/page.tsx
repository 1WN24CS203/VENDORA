import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { VendorListContent } from '@/app/(dashboard)/vendors/VendorListContent';

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  return <VendorListContent vendors={vendors || []} />;
}
