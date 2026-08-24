-- ═══════════════════════════════════════════════════════════════════════
-- Vendor Registration & Management — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. Profiles Table ───────────────────────────────────────────────
-- Extends auth.users with application-specific data

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (needed for activity feed display names)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. Vendor Categories ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by all authenticated"
  ON public.vendor_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.vendor_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default categories
INSERT INTO public.vendor_categories (name, description) VALUES
  ('IT Services', 'Software, hardware, cloud services, and IT consulting'),
  ('Office Supplies', 'Stationery, furniture, and office equipment'),
  ('Manufacturing', 'Raw materials, components, and manufacturing services'),
  ('Logistics', 'Shipping, warehousing, and transportation'),
  ('Professional Services', 'Legal, accounting, and consulting services'),
  ('Marketing', 'Advertising, PR, and digital marketing'),
  ('Facilities', 'Cleaning, maintenance, and security services'),
  ('Food & Catering', 'Catering services and food supplies'),
  ('Construction', 'Building materials and construction services'),
  ('Other', 'Miscellaneous vendor categories')
ON CONFLICT (name) DO NOTHING;


-- ─── 3. Vendors Table ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gst_number TEXT,
  pan_number TEXT,
  tax_registration_type TEXT DEFAULT 'Regular',
  hsn_sac_code TEXT,
  msme_number TEXT,
  tax_exemption_notes TEXT,
  business_category TEXT NOT NULL DEFAULT 'Other',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  bank_name TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  compliance_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review')),
  notes TEXT,
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view vendors
CREATE POLICY "Vendors viewable by authenticated users"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create vendors
CREATE POLICY "Authenticated users can create vendors"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins and managers can update vendors
CREATE POLICY "Admins and managers can update vendors"
  ON public.vendors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Only admins can delete vendors
CREATE POLICY "Only admins can delete vendors"
  ON public.vendors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );



-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ─── 4. Vendor Documents ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'other' CHECK (document_type IN ('gst_certificate', 'pan_card', 'bank_proof', 'contract', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documents viewable by authenticated users"
  ON public.vendor_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload documents"
  ON public.vendor_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete documents"
  ON public.vendor_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── 5. Vendor Products Table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vendor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sku TEXT,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by authenticated users"
  ON public.vendor_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON public.vendor_products FOR ALL
  TO authenticated
  USING (true);


-- ─── 6. Indexes for Performance ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(business_category);
CREATE INDEX IF NOT EXISTS idx_vendors_created ON public.vendors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_docs_vendor ON public.vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor ON public.vendor_products(vendor_id);


-- ─── 7. Storage Bucket ─────────────────────────────────────────────
-- Run this separately or create via Dashboard → Storage → New Bucket
-- Name: "vendor-documents", Public: false

-- INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-documents', 'vendor-documents', false);


-- ═══════════════════════════════════════════════════════════════════════
-- RESET / CLEANUP SCRIPT — DROP ALL TABLES, TRIGGERS & FUNCTIONS
-- Copy and run this section if you want to completely remove all tables
-- ═══════════════════════════════════════════════════════════════════════
/*

*/
