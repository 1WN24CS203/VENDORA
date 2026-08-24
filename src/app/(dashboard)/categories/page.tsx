import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CategoriesContent } from '@/app/(dashboard)/categories/CategoriesContent';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('vendor_categories')
    .select('*')
    .order('name');

  return <CategoriesContent categories={categories || []} />;
}
