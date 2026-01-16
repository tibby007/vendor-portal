# Vendor Portal Platform

A comprehensive deal management system for equipment financing and working capital applications. This platform connects Vendors and Brokers, providing a centralized hub for application submission, document management, and deal tracking.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel (recommended)

## Features (Phase 1)

- Broker registration and authentication
- Broker profile setup and onboarding flow
- Vendor invitation system (email-based, invitation-only)
- Vendor registration via secure invitation links
- Role-based access control (RBAC)
- Dashboard views for both brokers and vendors
- Protected routes and middleware

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
cd vendor-portal
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration

1. Go to the Supabase SQL Editor
2. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
3. Run the SQL to create all tables, types, and policies

### 4. Configure Supabase Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. (Optional) Disable email confirmation for development

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
vendor-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx    # Main dashboard
│   │   │       └── vendors/    # Vendor management
│   │   ├── login/              # Login page
│   │   ├── register/           # Broker registration
│   │   ├── invite/             # Vendor invitation acceptance
│   │   └── auth/               # Auth callbacks
│   ├── components/
│   │   ├── auth/               # Auth-related components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components
│   │   ├── onboarding/         # Onboarding flows
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   └── supabase/           # Supabase client config
│   └── types/                  # TypeScript types
├── supabase/
│   └── migrations/             # Database migrations
└── public/                     # Static assets
```

## Database Schema

The platform uses the following main tables:

- **profiles** - User profiles (extends Supabase auth)
- **brokers** - Broker company information
- **vendors** - Vendor companies (linked to brokers)
- **vendor_invitations** - Invitation tokens for vendors
- **kanban_stages** - Customizable deal pipeline stages
- **deals** - Financing applications
- **deal_documents** - Uploaded documents for deals
- **messages** - In-app messaging
- **resources** - Broker-managed resource library

## User Flows

### Broker Registration
1. Visit `/register`
2. Fill in company and personal details
3. Complete onboarding profile setup
4. Access dashboard

### Vendor Invitation
1. Broker visits `/dashboard/vendors/invite`
2. Enter vendor email and optional company name
3. Copy generated invitation link
4. Send to vendor via email

### Vendor Registration
1. Vendor clicks invitation link (`/invite/[token]`)
2. Complete registration form
3. Automatically linked to inviting broker
4. Access vendor dashboard

## Development Roadmap

- **Phase 1** (Current): Authentication & Onboarding
- **Phase 2**: Application Submission & Document Management
- **Phase 3**: Kanban Pipeline & Deal Management
- **Phase 4**: Document Review & Broker Tools
- **Phase 5**: Messaging System
- **Phase 6**: Resources & Content Management
- **Phase 7**: Dashboards & Analytics
- **Phase 8**: Polish, Testing & Launch

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - Commercial Capital Connect
