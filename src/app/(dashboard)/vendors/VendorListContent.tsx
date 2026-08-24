'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SearchBar, StatusBadge } from '@/components/ui';
import type { Vendor, VendorStatus } from '@/types';

interface VendorListContentProps {
  vendors: Vendor[];
}

export function VendorListContent({ vendors }: VendorListContentProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        v.company_name.toLowerCase().includes(search.toLowerCase()) ||
        v.contact_person.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const statusCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    approved: vendors.filter((v) => v.status === 'approved').length,
    rejected: vendors.filter((v) => v.status === 'rejected').length,
    suspended: vendors.filter((v) => v.status === 'suspended').length,
  };

  function exportToCSV() {
    const headers = [
      'Company Name', 'Contact Person', 'Email', 'Phone', 'GST Number', 'PAN Number',
      'Tax Registration Type', 'Business Category', 'Address Line 1', 'Address Line 2',
      'City', 'State', 'Pincode', 'Bank Name', 'Bank Account', 'IFSC Code', 'Status',
      'Compliance Status', 'Notes', 'Created At'
    ];
    
    const rows = filtered.map(v => [
      v.company_name || '',
      v.contact_person || '',
      v.email || '',
      v.phone || '',
      v.gst_number || '',
      v.pan_number || '',
      v.tax_registration_type || '',
      v.business_category || '',
      v.address_line1 || '',
      v.address_line2 || '',
      v.city || '',
      v.state || '',
      v.pincode || '',
      v.bank_name || '',
      v.bank_account || '',
      v.ifsc_code || '',
      v.status || '',
      v.compliance_status || '',
      v.notes || '',
      v.created_at || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vendora_vendors_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1>Vendors</h1>
          <p>{vendors.length} vendors registered</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-outline" onClick={exportToCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <Link href="/vendors/new" className="btn btn-coral">
            + Add Vendor
          </Link>
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search vendors..."
        />
        <div className="filter-pills">
          {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map((status) => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No vendors found</h3>
          <p>Try adjusting your search or filter criteria.</p>
          <Link href="/vendors/new" className="btn btn-coral">
            + Add Your First Vendor
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Status</th>
                <th>Compliance</th>
                <th>Registered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((vendor) => (
                <tr key={vendor.id}>
                  <td>
                    <div className="table-cell-primary">{vendor.company_name}</div>
                    <div className="table-cell-secondary">{vendor.email}</div>
                  </td>
                  <td>
                    <div>{vendor.contact_person}</div>
                    <div className="table-cell-secondary">{vendor.phone}</div>
                  </td>
                  <td style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
                    {vendor.business_category}
                  </td>
                  <td><StatusBadge status={vendor.status} /></td>
                  <td><StatusBadge status={vendor.compliance_status} /></td>
                  <td style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-xs)' }}>
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/vendors/${vendor.id}`} className="btn btn-ghost btn-sm">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <span>
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="pagination-buttons">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
