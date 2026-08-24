import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { VendorDetailContent } from '@/app/(dashboard)/vendors/[id]/VendorDetailContent';
import type { VendorDocument, VendorProduct } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (!vendor) notFound();

  const { data: products } = await supabase
    .from('vendor_products')
    .select('*')
    .eq('vendor_id', id)
    .order('created_at', { ascending: false });

  const { data: documents } = await supabase
    .from('vendor_documents')
    .select('*')
    .eq('vendor_id', id)
    .order('uploaded_at', { ascending: false });

  return (
    <VendorDetailContent
      vendor={vendor}
      products={(products as unknown as VendorProduct[]) || []}
      documents={(documents as unknown as VendorDocument[]) || []}
    />
  );
}
