'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Stepper, Input, Select, Textarea, Button, FileUpload } from '@/components/ui';
import type { VendorFormData } from '@/types';

const STEPS = ['Basic Info', 'Business Details', 'Bank Details', 'Documents', 'Review'];

const CATEGORIES = [
  { value: 'IT Services', label: 'IT Services' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Facilities', label: 'Facilities' },
  { value: 'Food & Catering', label: 'Food & Catering' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Other', label: 'Other' },
];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Other',
].map((s) => ({ value: s, label: s }));

export default function AddVendorPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<VendorFormData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    gst_number: '',
    business_category: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    bank_name: '',
    bank_account: '',
    ifsc_code: '',
    notes: '',
  });

  const [phoneCode, setPhoneCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('');

  function updateField(field: keyof VendorFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from('vendors').insert({
      ...form,
      registered_by: user?.id || null,
      status: 'pending',
      compliance_status: 'pending_review',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/vendors');
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Register New Vendor</h1>
        <p>Add a new vendor to your management system.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <Stepper steps={STEPS} currentStep={step} />

        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--red-bg)',
            color: 'var(--red)',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-6)',
          }}>
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 0 && (
          <div className="form-step">
            <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Basic Information</h3>
            <div className="form-grid">
              <Input
                label="Company Name"
                value={form.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                placeholder="Acme Corporation"
                required
              />
              <Input
                label="Contact Person"
                value={form.contact_person}
                onChange={(e) => updateField('contact_person', e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="vendor@company.com"
                required
              />
              <div className="input-group">
                <label className="input-label">Phone Number (optional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 'var(--space-2)' }}>
                  <select
                    className="select"
                    value={phoneCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setPhoneCode(code);
                      updateField('phone', rawPhone ? `${code} ${rawPhone}` : '');
                    }}
                    style={{ height: '42px', marginTop: '0' }}
                  >
                    <option value="+91">IN +91</option>
                    <option value="+1">US +1</option>
                    <option value="+44">GB +44</option>
                    <option value="+971">AE +971</option>
                    <option value="+65">SG +65</option>
                    <option value="+61">AU +61</option>
                    <option value="+81">JP +81</option>
                    <option value="+49">DE +49</option>
                  </select>
                  <input
                    type="tel"
                    className="input"
                    value={rawPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRawPhone(val);
                      updateField('phone', val ? `${phoneCode} ${val}` : '');
                    }}
                    placeholder="98765 43210"
                    style={{ height: '42px', marginTop: '0' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 1 && (
          <div className="form-step">
            <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Business Details</h3>
            <div className="form-grid">
              <Select
                label="Business Category"
                options={CATEGORIES}
                value={form.business_category}
                onChange={(e) => updateField('business_category', e.target.value)}
              />
              <Input
                label="GST Number"
                value={form.gst_number}
                onChange={(e) => updateField('gst_number', e.target.value)}
                placeholder="22ABCDE1234F1Z5"
              />
              <div className="form-grid-full">
                <Input
                  label="Address Line 1"
                  value={form.address_line1}
                  onChange={(e) => updateField('address_line1', e.target.value)}
                  placeholder="123 Business Street"
                />
              </div>
              <div className="form-grid-full">
                <Input
                  label="Address Line 2"
                  value={form.address_line2}
                  onChange={(e) => updateField('address_line2', e.target.value)}
                  placeholder="Suite 456 (optional)"
                />
              </div>
              <Input
                label="City"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Bangalore"
              />
              <Select
                label="State"
                options={STATES}
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
              />
              <Input
                label="Pincode"
                value={form.pincode}
                onChange={(e) => updateField('pincode', e.target.value)}
                placeholder="560001"
              />
            </div>
          </div>
        )}

        {/* Step 3: Bank Details */}
        {step === 2 && (
          <div className="form-step">
            <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Bank Details</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
              Bank details are optional and can be added later.
            </p>
            <div className="form-grid">
              <Input
                label="Bank Name"
                value={form.bank_name}
                onChange={(e) => updateField('bank_name', e.target.value)}
                placeholder="State Bank of India"
              />
              <Input
                label="Account Number"
                value={form.bank_account}
                onChange={(e) => updateField('bank_account', e.target.value)}
                placeholder="1234567890"
              />
              <Input
                label="IFSC Code"
                value={form.ifsc_code}
                onChange={(e) => updateField('ifsc_code', e.target.value)}
                placeholder="SBIN0001234"
              />
            </div>
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Textarea
                label="Notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any additional notes about this vendor..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 3 && (
          <div className="form-step">
            <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Upload Documents</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
              Upload relevant documents like GST certificate, PAN card, or contracts. You can also upload documents later.
            </p>
            <FileUpload
              onFilesSelected={(files) => {
                console.log('Files selected:', files);
                // TODO: Upload to Supabase Storage
              }}
            />
          </div>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <div className="form-step">
            <h3 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>Review &amp; Submit</h3>
            <p className="text-muted" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
              Please review the vendor details before submitting.
            </p>

            <div className="detail-grid">
              <ReviewField label="Company Name" value={form.company_name} />
              <ReviewField label="Contact Person" value={form.contact_person} />
              <ReviewField label="Email" value={form.email} />
              <ReviewField label="Phone" value={form.phone} />
              <ReviewField label="Category" value={form.business_category} />
              <ReviewField label="GST Number" value={form.gst_number || '—'} />
              <ReviewField label="Address" value={`${form.address_line1}${form.address_line2 ? ', ' + form.address_line2 : ''}`} />
              <ReviewField label="City / State" value={`${form.city}, ${form.state} ${form.pincode}`} />
              <ReviewField label="Bank" value={form.bank_name || '—'} />
              <ReviewField label="Account" value={form.bank_account || '—'} />
              <ReviewField label="IFSC" value={form.ifsc_code || '—'} />
              <ReviewField label="Notes" value={form.notes || '—'} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="form-actions">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 0}
          >
            ← Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={nextStep}>
              Next →
            </Button>
          ) : (
            <Button variant="coral" onClick={handleSubmit} loading={loading}>
              Submit Vendor
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{value || '—'}</span>
    </div>
  );
}
