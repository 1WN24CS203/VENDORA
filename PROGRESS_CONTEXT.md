# Vendora — Vendor Registration & Management System
## Progress Context & Build Reference Document

> **Last Updated**: August 24, 2026  
> **Repository Subdirectory**: `vendor-app/`  
> **Status**: Full Baseline Implementation Complete (Auth, Dashboard, Multi-step Vendor Onboarding, Tax & Compliance, Product Catalog, Supabase SSR Integration).

---

## 1. Project Overview & Mission

**Vendora** is an enterprise B2B Vendor Management System built for streamlined onboarding, Indian tax compliance tracking (GST, PAN, HSN/SAC, MSME Udyam), product catalog management, and document storage.

### Key Objectives
- **Centralized Vendor Repository**: Manage vendor details, contacts, addresses, and banking information.
- **Taxation & Compliance Engine**: Track GST numbers, PAN, tax registration types (Regular, Composition, SEZ, Overseas, Exempt), HSN/SAC codes, and MSME Udyam registration.
- **Product Catalog & Pricing**: Maintain vendor item catalogs with custom unit pricing and automated GST inclusive calculations.
- **Workflow & Lifecycle Controls**: Vendor status approval pipeline (`pending` ➔ `approved` / `rejected` / `suspended`) and compliance tracking (`compliant`, `non_compliant`, `pending_review`).
- **Role-Based Access Control (RBAC)**: Support for `admin`, `manager`, and `viewer` roles.

---

## 2. Tech Stack & Architecture

| Layer | Technology / Library | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.2 (App Router) | React Server Components (RSC) + Client Components |
| **UI Library** | React 19.2.8 | Latest React features, hooks, state management |
| **Styling** | Vanilla CSS (`src/app/globals.css`) | Modern CSS design tokens, HSL colors, smooth transitions, glassmorphism, micro-animations |
| **Backend & DB** | Supabase PostgreSQL | Managed Postgres DB with Row Level Security (RLS) |
| **Auth & SSR** | `@supabase/ssr` & `@supabase/supabase-js` | Server & Client Supabase integration, cookie-based session tracking |
| **TypeScript** | TypeScript 5+ | Full strict typing across models, API responses, and UI props |

---

## 3. Core Features Implemented

### 🔐 1. Authentication & Route Guarding
- **Supabase Auth Integration**: Email/Password authentication.
- **Protected Dashboard Routes**: Middleware protection (`src/lib/supabase/middleware.ts`) automatically redirects unauthenticated users to `/login` and authenticated users away from auth pages to `/dashboard`. This includes safety guards for missing env variables in Vercel to prevent `MIDDLEWARE_INVOCATION_FAILED` crashes, and cookie propagation during redirects to avoid session desync.
- **Auto Profile Creation**: DB Trigger (`on_auth_user_created`) inserts a `public.profiles` row upon new user sign-up with default `admin` role.

### 📊 2. Dashboard Analytics (`/dashboard`)
- **Key Performance Counters**: Real-time counts for Total Vendors, Pending Approvals, Approved, Rejected, Suspended, and Compliance Status breakdown.
- **Quick Action Bar**: Fast navigation to add new vendors or view categories.

### 📝 3. 5-Step Vendor Onboarding Stepper (`/vendors/new`)
- **Step 1: Basic Information**: Company name, contact person, email, phone number.
- **Step 2: Business & Address**: Category selection, GST number, full address, city, state dropdown, pincode.
- **Step 3: Bank Details & Notes**: Bank name, account number, IFSC code, internal notes.
- **Step 4: Document Upload**: Drag-and-drop file uploader component (`FileUpload.tsx`).
- **Step 5: Review & Submit**: Comprehensive review screen before inserting into Supabase.

### 🏢 4. Vendor Detail Page (`/vendors/[id]`)
- **Header Actions**: Quick status transition modal and Vendor Deletion with cascading cleanup.
- **Tabbed Interface**:
  1. **Details & Tax**: Displays contact, address, bank info, and full **Taxation & Compliance Details** (GST, PAN, Tax Registration Type, HSN/SAC, MSME, Exemption notes) with an **Inline Edit Tax Modal**.
  2. **Products & Catalog**: Interactive vendor product catalog table showing SKU, Unit Price, GST Rate %, and automated **Price Incl. Tax** calculation. Features modal dialogs for **Adding New Products**, **Editing Existing Products**, and **Deleting Products**.
  3. **Documents**: Document listing with file type badges and upload dates.

### 🗂️ 5. Category & Settings Management (`/categories`, `/settings`)
- **Categories Directory**: Pre-seeded categories (IT Services, Office Supplies, Manufacturing, Logistics, Professional Services, Marketing, Facilities, Food & Catering, Construction, Other).
- **Settings Screen**: User profile info, email display, and password/account settings placeholders.

---

## 4. Database Schema Structure (`supabase/schema.sql`)

### 1. `public.profiles`
- `id` (UUID, FK ➔ `auth.users.id`)
- `full_name` (TEXT)
- `role` (TEXT: `admin`, `manager`, `viewer`)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 2. `public.vendor_categories`
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE)
- `description` (TEXT)

### 3. `public.vendors`
- `id` (UUID, PK)
- `company_name` (TEXT)
- `contact_person` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `gst_number` (TEXT)
- `pan_number` (TEXT)
- `tax_registration_type` (TEXT: Regular, Composition, SEZ, Overseas, Exempt)
- `hsn_sac_code` (TEXT)
- `msme_number` (TEXT)
- `tax_exemption_notes` (TEXT)
- `business_category` (TEXT)
- `address_line1`, `address_line2`, `city`, `state`, `pincode` (TEXT)
- `bank_name`, `bank_account`, `ifsc_code` (TEXT)
- `status` (TEXT: `pending`, `approved`, `rejected`, `suspended`)
- `compliance_status` (TEXT: `compliant`, `non_compliant`, `pending_review`)
- `notes` (TEXT)
- `registered_by` (UUID, FK ➔ `auth.users.id`)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 4. `public.vendor_documents`
- `id` (UUID, PK)
- `vendor_id` (UUID, FK ➔ `public.vendors.id` ON DELETE CASCADE)
- `document_type` (TEXT: `gst_certificate`, `pan_card`, `bank_proof`, `contract`, `other`)
- `file_name` (TEXT)
- `file_url` (TEXT)
- `uploaded_at` (TIMESTAMPTZ)

### 5. `public.vendor_products`
- `id` (UUID, PK)
- `vendor_id` (UUID, FK ➔ `public.vendors.id` ON DELETE CASCADE)
- `product_name` (TEXT)
- `sku` (TEXT)
- `unit_price` (NUMERIC 12,2)
- `tax_rate` (NUMERIC 5,2, default 18.00)
- `category` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMPTZ)

---

## 5. File & Directory Map (`vendor-app/`)

```
vendor-app/
├── package.json                   # Dependencies (Next 16, React 19, Supabase SSR)
├── next.config.ts                 # Next.js configuration
├── supabase/
│   └── schema.sql                 # SQL schema script with RLS & seed data
├── src/
│   ├── middleware.ts              # Global Next.js middleware entrypoint
│   ├── types/
│   │   └── index.ts               # Shared TypeScript interfaces & types
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts          # Browser Supabase client creator
│   │       ├── server.ts          # Server Supabase client creator (cookies)
│   │       └── middleware.ts      # Auth & route protection middleware
│   ├── components/
│   │   └── ui/                    # Design System Component Library
│   │       ├── Button.tsx
│   │       ├── Input.tsx          # Text input & Select input wrappers
│   │       ├── Modal.tsx          # Reusable modal overlay dialog
│   │       ├── SearchBar.tsx
│   │       ├── Sidebar.tsx        # Navigation sidebar with path active states
│   │       ├── StatsCard.tsx      # Dashboard stats widget
│   │       ├── Stepper.tsx        # Multi-step progress bar
│   │       ├── Tabs.tsx           # Tabbed navigation component
│   │       ├── Toast.tsx          # Toast notification popups
│   │       └── FileUpload.tsx     # File drag & drop component
│   └── app/
│       ├── globals.css            # Design system CSS variables & utilities
│       ├── (auth)/                # Auth route group
│       │   ├── layout.tsx         # Auth pages branding wrapper
│       │   ├── login/page.tsx     # Login form
│       │   └── register/page.tsx  # Registration form
│       └── (dashboard)/           # Dashboard route group
│           ├── layout.tsx         # App layout with Sidebar
│           ├── DashboardShell.tsx # Client shell for responsive sidebar toggling
│           ├── dashboard/
│           │   ├── page.tsx       # Server component fetching stats
│           │   └── DashboardContent.tsx
│           ├── vendors/
│           │   ├── page.tsx       # Vendors list page
│           │   ├── VendorListContent.tsx # Client list with search & filter
│           │   ├── new/
│           │   │   └── page.tsx   # Multi-step onboarding form
│           │   └── [id]/
│           │       ├── page.tsx   # Server component fetching vendor & items
│           │       └── VendorDetailContent.tsx # Vendor detail & catalog management
│           ├── categories/
│           │   ├── page.tsx
│           │   └── CategoriesContent.tsx
│           └── settings/
│               ├── page.tsx
│               └── SettingsContent.tsx
```

---

## 6. Environment Setup Guide

1. **Environment File (`vendor-app/.env`)**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Database Setup**:
   - Open your Supabase Project Dashboard.
   - Go to **SQL Editor** ➔ **New Query**.
   - Copy the contents of `vendor-app/supabase/schema.sql` and run the script.
   - Create a Storage Bucket named `vendor-documents` (private bucket) in **Supabase Storage**.

3. **Running the Application**:
   ```bash
   cd vendor-app
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 7. Roadmap & Recommendations for Future Builds

1. **Supabase Storage Uploads**:
   - Wire `FileUpload.tsx` to directly upload documents into Supabase Storage (`vendor-documents` bucket) and insert records into `public.vendor_documents`.

2. **Role-Based UI Enforcement**:
   - Hide/Disable "Delete Vendor" and "Edit Tax" buttons for users with role `'viewer'`.

3. **Vendor Activity Feed**:
   - Record activity logs (e.g. status changed, tax details updated, product added) into an activity table and display on the vendor detail page.

4. **Export & Reporting**:
   - Add CSV export functionality on `/vendors` page for vendor records and tax reports.

---

*This document serves as the complete technical context for future development, maintenance, and expansion of the Vendora application.*
