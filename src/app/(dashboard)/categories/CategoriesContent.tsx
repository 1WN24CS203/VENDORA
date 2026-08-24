'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Modal } from '@/components/ui';
import type { VendorCategory } from '@/types';

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
                <td className="table-cell-primary">{cat.name}</td>
                <td style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
                  {cat.description || '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
                    <div className="empty-state-icon">📁</div>
                    <h3>No categories</h3>
                    <p>Add categories to organize your vendors.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
