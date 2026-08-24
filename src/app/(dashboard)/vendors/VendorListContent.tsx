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

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1>Vendors</h1>
          <p>{vendors.length} vendors registered</p>
        </div>
        <Link href="/vendors/new" className="btn btn-coral">
          + Add Vendor
        </Link>
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
