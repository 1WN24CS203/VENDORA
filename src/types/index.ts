// ─── User & Auth Types ───────────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

// ─── Vendor Types ────────────────────────────────────────────────────

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review';

export interface Vendor {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  gst_number: string | null;
  pan_number: string | null;
  tax_registration_type: string | null;
  hsn_sac_code: string | null;
  msme_number: string | null;
  tax_exemption_notes: string | null;
  business_category: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  bank_name: string | null;
  bank_account: string | null;
  ifsc_code: string | null;
  status: VendorStatus;
  compliance_status: ComplianceStatus;
  notes: string | null;
  registered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  gst_number: string;
  pan_number?: string;
  tax_registration_type?: string;
  hsn_sac_code?: string;
  msme_number?: string;
  business_category: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  bank_name: string;
  bank_account: string;
  ifsc_code: string;
  notes: string;
}

// ─── Vendor Product Types ────────────────────────────────────────────

export interface VendorProduct {
  id: string;
  vendor_id: string;
  product_name: string;
  sku: string | null;
  unit_price: number;
  tax_rate: number;
  category: string | null;
  description: string | null;
  tags?: string[] | null;
  created_at: string;
}

export interface VendorProductFormData {
  product_name: string;
  sku: string;
  unit_price: number;
  tax_rate: number;
  category: string;
  description: string;
  tags: string;
}

// ─── Document Types ──────────────────────────────────────────────────

export type DocumentType = 'gst_certificate' | 'pan_card' | 'bank_proof' | 'contract' | 'other';

export interface VendorDocument {
  id: string;
  vendor_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

// ─── Activity Log Types ──────────────────────────────────────────────

export type ActivityAction = 'created' | 'status_changed' | 'updated' | 'document_uploaded' | 'note_added';

export interface VendorActivity {
  id: string;
  vendor_id: string;
  action: ActivityAction;
  description: string;
  performed_by: string | null;
  created_at: string;
  profiles?: Profile;
}

// ─── Category Types ──────────────────────────────────────────────────

export interface VendorCategory {
  id: string;
  name: string;
  description: string | null;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────

export interface DashboardStats {
  total_vendors: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  suspended: number;
  compliant: number;
  non_compliant: number;
  pending_review: number;
}
