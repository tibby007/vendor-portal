# VendorBuddy - Product Requirements Document

**Version:** 1.0
**Last Updated:** January 2026
**Status:** In Development

---

## Executive Summary

VendorBuddy is a comprehensive vendor management portal designed for equipment financing and working capital applications. The platform connects Vendors and Brokers, providing a centralized hub for application submission, document management, deal tracking, and communication.

---

## Product Vision

To streamline the equipment financing process by creating an intuitive, modern platform that simplifies vendor-broker relationships, reduces friction in deal management, and accelerates funding timelines.

---

## Target Users

### Primary Users

1. **Brokers** - Equipment financing professionals who manage vendor relationships and process financing applications
2. **Vendors** - Businesses that refer customers for equipment financing

### User Personas

**Broker Brian**
- Manages 20+ vendor relationships
- Processes 50+ applications monthly
- Needs visibility into pipeline status
- Values efficiency and organization

**Vendor Vanessa**
- Submits 5-10 applications monthly
- Needs simple submission process
- Wants real-time status updates
- Values communication with broker

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Custom Design System |
| UI Components | Radix UI, shadcn/ui |
| Backend/Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| Icons | Lucide React |

### Design System

#### Brand Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| Orange Primary | `#F97316` | CTAs, primary actions, brand accent |
| Orange Light | `#FB923C` | Hover states, secondary accents |
| Orange Dark | `#EA580C` | Emphasis, active states |
| Orange Subtle | `#FED7AA` | Backgrounds, highlights |
| Charcoal Deep | `#111827` | Headers, footers, dark backgrounds |
| Charcoal Primary | `#1F2937` | Primary text |
| Charcoal Medium | `#374151` | Secondary text |
| Charcoal Light | `#4B5563` | Muted text, descriptions |

#### Typography

- **Font Family:** System font stack (Inter, sans-serif)
- **Headings:** Bold, 2xl to 7xl scale
- **Body:** Regular, base to lg scale
- **Line Height:** Relaxed for readability

#### Design Principles

1. **Clean & Modern** - Minimal visual clutter, generous whitespace
2. **Professional** - Business-appropriate aesthetics
3. **Accessible** - WCAG AA compliant color contrast
4. **Responsive** - Mobile-first, works on all devices
5. **Consistent** - Unified spacing, border radius, and shadow systems

---

## Features & Functionality

### Phase 1: Authentication & Onboarding (Complete)

#### Landing Page
- [x] Hero section with value proposition
- [x] Feature highlights grid
- [x] Login and Sign Up CTAs
- [x] Professional footer
- [x] Orange/charcoal brand theming
- [x] Animated hero with floating orbs and gradient effects
- [x] VendorBuddy mascot logo integrated

#### Static Pages
Content pages linked from footer:
- [x] `/security` - Security practices & compliance info
- [x] `/roadmap` - Product roadmap & upcoming features
- [x] `/about` - About VendorBuddy / company story
- [x] `/privacy` - Privacy Policy
- [x] `/terms` - Terms of Service
- [x] `/cookies` - Cookie Policy

Footer cleanup:
- [x] Remove Blog link
- [x] Remove Careers link
- [x] Remove GDPR link

#### Authentication
- [x] Broker registration flow
- [x] Vendor invitation system (email-based)
- [x] Secure login with Supabase Auth
- [x] Password reset functionality
- [x] Session management

#### Onboarding
- [x] Broker profile setup wizard
- [x] Vendor registration via invite links
- [x] Role-based dashboard routing

### Phase 2: Application Submission & Document Management (Complete)

#### Deal Creation
- [x] Multi-step application form (5-step wizard with progress tracking)
- [x] Business information capture (legal name, DBA, address, EIN, entity type, industry, revenue)
- [x] Owner/guarantor details (name, title, ownership %, phone, DOB)
- [x] Equipment/financing specifics (amount, type, equipment details, preferred terms)
- [x] Auto-save draft functionality (every 30 seconds)
- [x] Draft vs submitted deal tracking
- [x] Edit existing deals while in draft status

#### Document Management
- [x] Drag-and-drop file upload with preview
- [x] Document type categorization (invoice, bank statements, tax returns, driver's license, voided check, financial statements, other)
- [x] File type validation (PDF, JPG, PNG, DOC, DOCX, XLS, XLSX)
- [x] File size validation (max 25MB)
- [x] Document status tracking (pending, reviewed, accepted, needs_revision)
- [x] Secure storage (Supabase Storage)
- [x] Document checklist showing required vs optional documents

### Phase 3: Kanban Pipeline & Deal Management (Complete)

#### Pipeline View
- [x] Customizable kanban stages (9 default stages, configurable per broker)
- [x] Drag-and-drop deal movement between stages
- [x] Real-time updates via Supabase subscriptions
- [x] Deal count badges per stage
- [x] Quick deal preview cards with business name, vendor, amount, date
- [x] Stage color coding for visual status

#### Deal Details
- [x] Comprehensive deal view with all business/owner/financing info
- [x] Document attachment list with status badges
- [x] Role-based visibility (vendor sees limited info, broker sees all)
- [x] Vendor information card (for broker view)
- [x] Activity log (backend implemented)

### Phase 4: Document Review & Broker Tools (Complete)

#### Broker Dashboard
- [x] Deal queue management (recent deals, quick actions)
- [x] Pipeline value and metrics overview
- [x] Document review interface with accept/reject actions
- [x] Approval/rejection workflows with notes
- [x] Deal notes UI (view, add, delete internal notes)

#### Vendor Management
- [x] Vendor directory with status badges
- [x] Invitation management (create, track pending)
- [x] Status tracking (active, pending)
- [x] Vendor performance metrics (deals, funded, volume, conversion rate)

### Phase 5: Messaging System (Complete)

- [x] In-app messaging with real-time updates
- [x] Deal-specific message threads
- [x] Read receipts with timestamps
- [x] Unread message counters
- [x] User avatars with role-based coloring
- [x] Message composition (Enter to send, Shift+Enter for newline)
- [x] File attachments in messages (upload, display, download)
- [x] Email notifications infrastructure (queue table, Edge Function, notification preferences)

### Phase 6: Resources & Content Management (Complete)

- [x] Broker resource library with categories
- [x] Resource creation and editing
- [x] Publishing workflow (draft vs published)
- [x] View count tracking
- [x] Category filtering
- [x] Vendor-facing resources (published only)
- [x] Resource detail pages

### Phase 7: Dashboards & Analytics (Complete)

#### Broker Analytics
- [x] Date range filtering (7d, 30d, 90d, 12m, all-time)
- [x] Deal volume charts (monthly submissions, funded, declined)
- [x] Conversion metrics and funnel
- [x] Funding amounts tracking
- [x] Vendor activity table (top 10 by volume)
- [x] Pipeline distribution chart
- [x] Recent activity log
- [x] Key metrics (total deals, funded deals, volume, average deal size)

#### Vendor Analytics
- [x] Vendor-specific analytics dashboard
- [x] Submission history charts
- [x] Approval rates
- [x] Average funding time

### Phase 8: Polish, Testing & Launch

#### Settings & Configuration
- [x] Profile settings (personal info editing)
- [x] Company settings (broker-only)
- [x] Notification preferences (with database persistence)

#### Launch Preparation
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Production deployment

---

## Database Schema

### Core Tables

```
profiles            - User profiles (extends Supabase auth)
brokers             - Broker company information
vendors             - Vendor companies (linked to brokers)
vendor_invitations  - Invitation tokens for vendors
```

### Deal Management

```
kanban_stages       - Customizable deal pipeline stages
deals               - Financing applications
deal_documents      - Uploaded documents for deals
deal_notes          - Internal notes on deals
activity_log        - Activity tracking for analytics
```

### Communication

```
messages                  - In-app messaging threads
message_attachments       - File attachments for messages
notification_preferences  - User email notification settings
email_notifications_queue - Pending email notifications
```

### Content

```
resources           - Broker-managed resource library
resource_categories - Category management
```

---

## User Flows

### Broker Registration
1. Visit landing page (`/`)
2. Click "Sign Up"
3. Complete registration form (`/register`)
4. Verify email (if enabled)
5. Complete onboarding wizard
6. Access broker dashboard

### Vendor Invitation
1. Broker logs in
2. Navigate to Vendors > Invite
3. Enter vendor email and company name
4. Generate secure invitation link
5. Share link with vendor

### Vendor Registration
1. Receive invitation link
2. Click link (`/invite/[token]`)
3. Complete registration form
4. Automatically linked to inviting broker
5. Access vendor dashboard

### Deal Submission (Vendor)
1. Log in to vendor dashboard
2. Click "New Application"
3. Complete multi-step form
4. Upload required documents
5. Submit for review
6. Track status in dashboard

### Deal Processing (Broker)
1. Receive notification of new deal
2. Review application details
3. Review uploaded documents
4. Move through pipeline stages
5. Communicate with vendor as needed
6. Process to funding or decline

---

## Security Requirements

1. **Authentication** - Supabase Auth with secure session handling
2. **Authorization** - Row Level Security (RLS) policies on all tables
3. **Data Encryption** - TLS in transit, encrypted at rest
4. **Input Validation** - Server-side validation with Zod schemas
5. **File Security** - Secure signed URLs for document access
6. **CORS** - Properly configured allowed origins

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Initial Load | < 3 seconds |
| Time to Interactive | < 5 seconds |
| API Response Time | < 500ms |
| Lighthouse Score | > 90 |
| Uptime | 99.9% |

---

## Success Metrics

### Launch Metrics
- Successful broker registrations
- Vendor invitations sent/accepted
- Deals submitted
- Documents uploaded

### Growth Metrics
- Monthly active users
- Deal volume
- Funding amount processed
- Vendor-broker connections

### Quality Metrics
- Average deal processing time
- User satisfaction score
- Support ticket volume
- Error rate

---

## Appendix

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Repository

**GitHub:** https://github.com/tibby007/vendor-portal

### Deployment

**Platform:** Vercel
**Production URL:** TBD

---

*Document maintained by the VendorBuddy development team.*
