'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Tabs, StatusBadge, Button, Modal, Input, Select, Textarea } from '@/components/ui';
import type { Vendor, VendorDocument, VendorStatus, VendorProduct, VendorProductFormData } from '@/types';

interface VendorDetailContentProps {
  vendor: Vendor;
  products: VendorProduct[];
  documents: VendorDocument[];
}

const TAX_REGISTRATION_TYPES = [
  { value: 'Regular', label: 'Regular GST' },
  { value: 'Composition', label: 'Composition Scheme' },
  { value: 'SEZ', label: 'SEZ Unit / Developer' },
  { value: 'Overseas / Import', label: 'Overseas Supplier / Import' },
  { value: 'Exempt', label: 'Exempt / Non-GST' },
];

export function VendorDetailContent({ vendor, products, documents }: VendorDetailContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<VendorStatus>(vendor.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit Taxation Modal
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [taxForm, setTaxForm] = useState({
    gst_number: vendor.gst_number || '',
    pan_number: vendor.pan_number || '',
    tax_registration_type: vendor.tax_registration_type || 'Regular',
    hsn_sac_code: vendor.hsn_sac_code || '',
    msme_number: vendor.msme_number || '',
    tax_exemption_notes: vendor.tax_exemption_notes || '',
  });
  const [savingTax, setSavingTax] = useState(false);

  // Product Modal (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null);
  const [productForm, setProductForm] = useState<VendorProductFormData>({
    product_name: '',
    sku: '',
    unit_price: 0,
    tax_rate: 18,
    category: '',
    description: '',
    tags: '',
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState('');

  const tabs = [
    { id: 'details', label: 'Details & Tax' },
    { id: 'products', label: `Products & Catalog (${products.length})` },
    { id: 'documents', label: `Documents (${documents.length})` },
  ];

  // ─── Handlers ────────────────────────────────────────────────────────

  async function handleStatusChange() {
    setUpdatingStatus(true);
    const supabase = createClient();

    await supabase
      .from('vendors')
      .update({ status: newStatus })
      .eq('id', vendor.id);

    setUpdatingStatus(false);
    setStatusModalOpen(false);
    router.refresh();
  }

  async function handleSaveTax() {
    setSavingTax(true);
    const supabase = createClient();

    await supabase
      .from('vendors')
      .update({ ...taxForm })
      .eq('id', vendor.id);

    setSavingTax(false);
    setTaxModalOpen(false);
    router.refresh();
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm({
      product_name: '',
      sku: '',
      unit_price: 0,
      tax_rate: 18,
      category: vendor.business_category || 'General',
      description: '',
      tags: '',
    });
    setProductError('');
    setProductModalOpen(true);
  }

  function openEditProduct(prod: VendorProduct) {
    setEditingProduct(prod);
    setProductForm({
      product_name: prod.product_name,
      sku: prod.sku || '',
      unit_price: prod.unit_price,
      tax_rate: prod.tax_rate,
      category: prod.category || '',
      description: prod.description || '',
      tags: prod.tags ? prod.tags.join(', ') : '',
    });
    setProductError('');
    setProductModalOpen(true);
  }

  async function handleSaveProduct() {
    if (!productForm.product_name.trim()) {
      setProductError('Product name is required.');
      return;
    }
    if (productForm.unit_price < 0) {
      setProductError('Unit price cannot be negative.');
      return;
    }

    setSavingProduct(true);
    setProductError('');
    const supabase = createClient();

    const productData = {
      product_name: productForm.product_name,
      sku: productForm.sku || null,
      unit_price: productForm.unit_price,
      tax_rate: productForm.tax_rate,
      category: productForm.category || null,
      description: productForm.description || null,
      tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (editingProduct) {
      const { error: updateErr } = await supabase
        .from('vendor_products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (updateErr) {
        setProductError(updateErr.message);
        setSavingProduct(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase
        .from('vendor_products')
        .insert({
          ...productData,
          vendor_id: vendor.id,
        });

      if (insertErr) {
        setProductError(insertErr.message);
        setSavingProduct(false);
        return;
      }
    }

    setSavingProduct(false);
    setProductModalOpen(false);
    router.refresh();
  }

  async function handleDeleteProduct(prodId: string, name: string) {
    if (!confirm(`Delete product "${name}"?`)) return;
    const supabase = createClient();
    await supabase.from('vendor_products').delete().eq('id', prodId);
    router.refresh();
  }

  async function handleDeleteVendor() {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) return;
    const supabase = createClient();
    const { error } = await supabase.from('vendors').delete().eq('id', vendor.id);
    if (error) {
      alert(`Failed to delete vendor: ${error.message}`);
      return;
    }
    router.push('/vendors');
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link href="/vendors" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginBottom: 'var(--space-3)', display: 'inline-block' }}>
          ← Back to Vendors
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="heading-1" style={{ marginBottom: 'var(--space-2)' }}>{vendor.company_name}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <StatusBadge status={vendor.status} />
              <StatusBadge status={vendor.compliance_status} />
              <span className="text-faint" style={{ fontSize: 'var(--text-xs)' }}>
                Registered {new Date(vendor.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(true)}>
              Change Status
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteVendor}>
              Delete Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab 1: Details & Tax */}
      {activeTab === 'details' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 className="heading-3">Contact Information</h3>
          </div>
          <div className="detail-grid">
            <DetailField label="Contact Person" value={vendor.contact_person} />
            <DetailField label="Email" value={vendor.email} />
            <DetailField label="Phone" value={vendor.phone} />
            <DetailField label="Category" value={vendor.business_category} />
          </div>

          <div className="divider" />

          {/* Taxation Details Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 className="heading-3">Taxation &amp; Compliance Details</h3>
            <Button variant="outline" size="sm" onClick={() => setTaxModalOpen(true)}>
              ✏️ Edit Tax Details
            </Button>
          </div>
          <div className="detail-grid">
            <DetailField label="GST Number" value={vendor.gst_number || '—'} />
            <DetailField label="PAN Number" value={vendor.pan_number || '—'} />
            <DetailField label="Tax Registration Type" value={vendor.tax_registration_type || 'Regular'} />
            <DetailField label="HSN / SAC Code" value={vendor.hsn_sac_code || '—'} />
            <DetailField label="MSME Reg. Number" value={vendor.msme_number || '—'} />
            <DetailField label="Tax Exemption Notes" value={vendor.tax_exemption_notes || 'None'} />
          </div>

          <div className="divider" />

          <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Business &amp; Address Details</h3>
          <div className="detail-grid">
            <DetailField label="Address" value={`${vendor.address_line1}${vendor.address_line2 ? ', ' + vendor.address_line2 : ''}`} />
            <DetailField label="City" value={vendor.city} />
            <DetailField label="State" value={vendor.state} />
            <DetailField label="Pincode" value={vendor.pincode} />
          </div>

          <div className="divider" />

          <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Bank Details</h3>
          <div className="detail-grid">
            <DetailField label="Bank Name" value={vendor.bank_name || '—'} />
            <DetailField label="Account Number" value={vendor.bank_account || '—'} />
            <DetailField label="IFSC Code" value={vendor.ifsc_code || '—'} />
          </div>

          {vendor.notes && (
            <>
              <div className="divider" />
              <h3 className="heading-3" style={{ marginBottom: 'var(--space-4)' }}>Notes</h3>
              <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
                {vendor.notes}
              </p>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Products & Catalog */}
      {activeTab === 'products' && (
        <div className="card animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div>
              <h3 className="heading-3">Vendor Products &amp; Catalog</h3>
              <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                Manage items, pricing, and tax rates supplied by {vendor.company_name}.
              </p>
            </div>
            <Button variant="coral" size="sm" onClick={openAddProduct}>
              + Add Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)', margin: '0 auto var(--space-3)' }}>
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
              <h3>No products registered</h3>
              <p>Add products or items supplied by this vendor to track pricing and tax rates.</p>
              <Button variant="coral" onClick={openAddProduct}>
                + Add Product Now
              </Button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price (₹)</th>
                    <th>Tax Rate (%)</th>
                    <th>Price Incl. Tax (₹)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const priceInclTax = prod.unit_price * (1 + (prod.tax_rate || 0) / 100);
                    return (
                      <tr key={prod.id}>
                        <td>
                          <div className="table-cell-primary">{prod.product_name}</div>
                          {prod.description && <div className="table-cell-secondary">{prod.description}</div>}
                          {prod.tags && prod.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                              {prod.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    background: 'var(--coral-bg)',
                                    color: 'var(--coral)',
                                    borderRadius: '10px',
                                    fontWeight: 500,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                          {prod.sku || '—'}
                        </td>
                        <td style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-sm)' }}>
                          {prod.category || '—'}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ₹{prod.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <span className="badge badge-compliant" style={{ fontSize: '11px' }}>
                            {prod.tax_rate}% GST
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--green)' }}>
                          ₹{priceInclTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <Button variant="ghost" size="sm" onClick={() => openEditProduct(prod)}>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(prod.id, prod.product_name)} style={{ color: 'var(--red)' }}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'documents' && (
        <div className="card animate-fade-in">
          {documents.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-faint)', margin: '0 auto var(--space-3)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3>No documents</h3>
              <p>No documents have been uploaded for this vendor yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {documents.map((doc) => (
                <div key={doc.id} className="file-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-muted)', flexShrink: 0 }}>
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span className="file-item-name">{doc.file_name}</span>
                  <span className="badge badge-approved" style={{ fontSize: '11px' }}>{doc.document_type.replace('_', ' ')}</span>
                  <span className="file-item-size">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Change Modal */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Change Vendor Status"
        description={`Update the status for ${vendor.company_name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleStatusChange} loading={updatingStatus}>
              Update Status
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {(['pending', 'approved', 'rejected', 'suspended'] as VendorStatus[]).map((status) => (
            <label
              key={status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--border-radius)',
                border: newStatus === status ? '2px solid var(--coral)' : 'var(--border)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                background: newStatus === status ? 'var(--coral-bg)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={newStatus === status}
                onChange={() => setNewStatus(status)}
                style={{ accentColor: 'var(--coral)' }}
              />
              <StatusBadge status={status} />
            </label>
          ))}
        </div>
      </Modal>

      {/* Edit Taxation Details Modal */}
      <Modal
        open={taxModalOpen}
        onClose={() => setTaxModalOpen(false)}
        title="Edit Taxation &amp; Compliance Details"
        description={`Update tax registration for ${vendor.company_name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setTaxModalOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleSaveTax} loading={savingTax}>
              Save Tax Details
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="GST Number"
            value={taxForm.gst_number}
            onChange={(e) => setTaxForm({ ...taxForm, gst_number: e.target.value })}
            placeholder="22ABCDE1234F1Z5"
          />
          <Input
            label="PAN Number"
            value={taxForm.pan_number}
            onChange={(e) => setTaxForm({ ...taxForm, pan_number: e.target.value })}
            placeholder="ABCDE1234F"
          />
          <Select
            label="Tax Registration Type"
            options={TAX_REGISTRATION_TYPES}
            value={taxForm.tax_registration_type}
            onChange={(e) => setTaxForm({ ...taxForm, tax_registration_type: e.target.value })}
          />
          <Input
            label="HSN / SAC Code"
            value={taxForm.hsn_sac_code}
            onChange={(e) => setTaxForm({ ...taxForm, hsn_sac_code: e.target.value })}
            placeholder="e.g. 8471 or 9983"
          />
          <Input
            label="MSME Reg. Number (Udyam)"
            value={taxForm.msme_number}
            onChange={(e) => setTaxForm({ ...taxForm, msme_number: e.target.value })}
            placeholder="UDYAM-KR-00-0000000"
          />
          <Textarea
            label="Tax Exemption / Special Notes"
            value={taxForm.tax_exemption_notes}
            onChange={(e) => setTaxForm({ ...taxForm, tax_exemption_notes: e.target.value })}
            placeholder="Any special tax exemption clauses or terms..."
          />
        </div>
      </Modal>

      {/* Add / Edit Product Modal */}
      <Modal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product to Catalog'}
        description={`Add catalog items supplied by ${vendor.company_name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleSaveProduct} loading={savingProduct}>
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </>
        }
      >
        {productError && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--red-bg)',
            color: 'var(--red)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
          }}>
            {productError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Product Name"
            value={productForm.product_name}
            onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
            placeholder="e.g. Dell XPS 15 Laptop"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="SKU Code"
              value={productForm.sku}
              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
              placeholder="SKU-10045"
            />
            <Input
              label="Category"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              placeholder="e.g. Hardware"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              label="Unit Price (₹)"
              type="number"
              step="0.01"
              value={productForm.unit_price}
              onChange={(e) => setProductForm({ ...productForm, unit_price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.1"
              value={productForm.tax_rate}
              onChange={(e) => setProductForm({ ...productForm, tax_rate: parseFloat(e.target.value) || 0 })}
              placeholder="18"
              required
            />
          </div>
          <Textarea
            label="Description (optional)"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            placeholder="Item specifications, warranty info..."
          />
          <Input
            label="Tags (comma-separated, optional)"
            value={productForm.tags}
            onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
            placeholder="e.g. laptop, hardware, office"
          />
        </div>
      </Modal>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{value || '—'}</span>
    </div>
  );
}
