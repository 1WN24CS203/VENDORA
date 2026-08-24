import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DashboardContent } from '@/app/(dashboard)/dashboard/DashboardContent';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch vendor counts by status
  const { data: vendors } = await supabase.from('vendors').select('id, status, compliance_status, created_at');

  const allVendors = vendors || [];
  const stats = {
    total_vendors: allVendors.length,
    pending_approval: allVendors.filter((v) => v.status === 'pending').length,
    approved: allVendors.filter((v) => v.status === 'approved').length,
    rejected: allVendors.filter((v) => v.status === 'rejected').length,
    suspended: allVendors.filter((v) => v.status === 'suspended').length,
    compliant: allVendors.filter((v) => v.compliance_status === 'compliant').length,
    non_compliant: allVendors.filter((v) => v.compliance_status === 'non_compliant').length,
    pending_review: allVendors.filter((v) => v.compliance_status === 'pending_review').length,
  };

  return <DashboardContent stats={stats} />;
}
