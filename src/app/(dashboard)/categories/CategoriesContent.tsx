'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Modal } from '@/components/ui';
import type { VendorCategory, VendorProduct } from '@/types';

type BrowseProduct = VendorProduct & { vendors: { company_name: string } | null };

interface CategoriesContentProps {
  categories: VendorCategory[];
}

export function CategoriesContent({ categories }: CategoriesContentProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<VendorCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Browse category state
  const [browseCategory, setBrowseCategory] = useState<VendorCategory | null>(null);
  const [browseProducts, setBrowseProducts] = useState<BrowseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [browseModalOpen, setBrowseModalOpen] = useState(false);

  async function openBrowse(cat: VendorCategory) {
    setBrowseCategory(cat);
    setBrowseProducts([]);
    setLoadingProducts(true);
    setBrowseModalOpen(true);

    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from('vendor_products')
      .select('*, vendors(company_name)')
      .eq('category', cat.name);

    if (!fetchError && data) {
      setBrowseProducts(data as any);
    }
    setLoadingProducts(false);
  }

  function openAdd() {
    setEditCategory(null);
    setName('');
    setDescription('');
    setError('');
    setModalOpen(true);
  }

  function openEdit(cat: VendorCategory) {
    setEditCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();

    if (editCategory) {
      const { error: updateError } = await supabase
        .from('vendor_categories')
        .update({ name: name.trim(), description: description.trim() || null })
        .eq('id', editCategory.id);
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('vendor_categories')
        .insert({ name: name.trim(), description: description.trim() || null });
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    const supabase = createClient();
    await supabase.from('vendor_categories').delete().eq('id', id);
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1>Categories</h1>
          <p>Organize vendors into business categories.</p>
        </div>
        <Button variant="coral" onClick={openAdd}>+ Add Category</Button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th style={{ width: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="table-cell-primary">
                  <button
                    onClick={() => openBrowse(cat)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'var(--coral)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 500,
                      textDecoration: 'underline',
                    }}
                    title="Click to browse products"
                  >
                    {cat.name}
                  </button>
                </td>
                <td style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
                  {cat.description || '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button variant="outline" size="sm" onClick={() => openBrowse(cat)}>Browse</Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--red)' }}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)', margin: '0 auto var(--space-3)' }}>
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                    </svg>
                    <h3>No categories</h3>
                    <p>Add categories to organize your vendors.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCategory ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleSave} loading={loading}>
              {editCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </>
        }
      >
        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--red-bg)',
            color: 'var(--red)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. IT Services"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this category"
          />
        </div>
      </Modal>

      {/* Browse Category Products Modal */}
      <Modal
        open={browseModalOpen}
        onClose={() => setBrowseModalOpen(false)}
        title={`Products under "${browseCategory?.name}"`}
        description={`Items supplied by registered vendors under the ${browseCategory?.name} category`}
        footer={
          <Button variant="outline" onClick={() => setBrowseModalOpen(false)}>Close</Button>
        }
      >
        {loadingProducts ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
            <span className="spinner spinner-lg" />
          </div>
        ) : browseProducts.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)', margin: '0 auto var(--space-2)' }}>
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <h3 style={{ fontSize: 'var(--text-lg)' }}>No products found</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>There are no products cataloged under this category yet.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Vendor</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {browseProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td className="table-cell-primary">
                      {prod.product_name}
                      {prod.sku && <div className="table-cell-secondary" style={{ fontFamily: 'monospace' }}>{prod.sku}</div>}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>
                      {prod.vendors?.company_name || 'Unknown'}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--green)' }}>
                      ₹{prod.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
