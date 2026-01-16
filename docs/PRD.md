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

### Phase 1: Authentication & Onboarding (Current)

#### Landing Page
- [x] Hero section with value proposition
- [x] Feature highlights grid
- [x] Login and Sign Up CTAs
- [x] Professional footer
- [x] Orange/charcoal brand theming

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

### Phase 2: Application Submission & Document Management

#### Deal Creation
- [ ] Multi-step application form
- [ ] Business information capture
- [ ] Owner/guarantor details
- [ ] Equipment/financing specifics
- [ ] Auto-save draft functionality

#### Document Management
- [ ] Drag-and-drop file upload
- [ ] Document type categorization
- [ ] File preview capabilities
- [ ] Version history tracking
- [ ] Secure storage (Supabase Storage)

### Phase 3: Kanban Pipeline & Deal Management

#### Pipeline View
- [ ] Customizable kanban stages
- [ ] Drag-and-drop deal movement
- [ ] Stage-based filtering
- [ ] Quick deal preview cards

#### Deal Details
- [ ] Comprehensive deal view
- [ ] Status history timeline
- [ ] Document attachment list
- [ ] Activity log

### Phase 4: Document Review & Broker Tools

#### Broker Dashboard
- [ ] Deal queue management
- [ ] Document review interface
- [ ] Approval/rejection workflows
- [ ] Notes and annotations

#### Vendor Management
- [ ] Vendor directory
- [ ] Performance metrics
- [ ] Invitation management
- [ ] Status tracking

### Phase 5: Messaging System

- [ ] In-app messaging
- [ ] Deal-specific threads
- [ ] File sharing in messages
- [ ] Email notifications
- [ ] Read receipts

### Phase 6: Resources & Content Management

- [ ] Broker resource library
- [ ] Document templates
- [ ] Training materials
- [ ] Vendor-facing resources

### Phase 7: Dashboards & Analytics

#### Broker Analytics
- [ ] Deal volume charts
- [ ] Conversion metrics
- [ ] Funding amounts
- [ ] Vendor performance
- [ ] Pipeline health

#### Vendor Analytics
- [ ] Submission history
- [ ] Approval rates
- [ ] Average funding time
- [ ] Monthly trends

### Phase 8: Polish, Testing & Launch

- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Production deployment

---

## Database Schema

### Core Tables

```
profiles          - User profiles (extends Supabase auth)
brokers           - Broker company information
vendors           - Vendor companies (linked to brokers)
vendor_invitations - Invitation tokens for vendors
```

### Deal Management

```
kanban_stages     - Customizable deal pipeline stages
deals             - Financing applications
deal_documents    - Uploaded documents for deals
```

### Communication

```
messages          - In-app messaging threads
notifications     - System notifications
```

### Content

```
resources         - Broker-managed resource library
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
