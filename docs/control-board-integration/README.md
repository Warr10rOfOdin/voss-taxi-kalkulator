# Control Board Integration Documentation

> Complete specification and implementation plan for the Drivas Fleet Control Board

**Status:** 📋 Planning Complete, Ready for Development
**Last Updated:** 2026-03-08

---

## 🎯 What is the Control Board?

The **Drivas Fleet Control Board** is a web-based administration dashboard that provides centralized management of multiple taxi calculator instances. It enables:

- **Multi-tenant management** - Create and configure taxi companies from one interface
- **Statistics & analytics** - Track usage patterns, popular routes, and revenue metrics
- **User & permissions** - Role-based access control for admin users
- **Theme customization** - Live visual theme editor with color pickers
- **Branding control** - Logo upload, company info, feature toggles

## 📚 Documentation Overview

### 1. **CONTROL_BOARD_INTEGRATION.md** (841 lines)

**Purpose:** Technical specification for Firebase database schema and API

**Read this if you want to know:**
- Firebase database paths and structure
- Complete tenant config schema (JSON format)
- Tariff data schema
- All 60+ CSS theme variables
- Firebase operations (create, update, delete)
- Firebase Security Rules
- Asset management (logo upload to Firebase Storage)

**Best for:** Backend developers, database architects, Firebase setup

---

### 2. **INTEGRATION_PLAN.md** (900+ lines)

**Purpose:** Comprehensive implementation roadmap with architecture, features, and code examples

**Read this if you want to know:**
- System architecture diagrams
- Statistics & analytics system design
- User management & permissions design
- Theme control system design
- Branding management design
- Database schema extensions (analytics, users, audit log)
- API endpoints (optional Cloud Functions)
- Security considerations
- Testing strategy
- Implementation phases (14-week timeline)

**Best for:** Project managers, architects, full-stack developers

---

### 3. **QUICK_REFERENCE.md** (400+ lines)

**Purpose:** Fast lookup guide with code examples and common solutions

**Read this if you want to know:**
- How to get started quickly (developer onboarding)
- Code examples (copy-paste ready):
  - Add analytics tracking to calculator
  - Set up authentication
  - Create tenant list component
  - Build theme editor
- Firebase Security Rules (essential rules only)
- Top 10 most important CSS variables
- Common issues & solutions
- NPM packages needed

**Best for:** Developers actively coding, troubleshooting issues

---

### 4. **IMPLEMENTATION_CHECKLIST.md** (500+ lines)

**Purpose:** Step-by-step prioritized task list for building the control board

**Read this if you want to know:**
- Exactly what tasks to complete in what order
- Estimated time for each task
- Dependencies between tasks
- Priority levels (critical, important, nice-to-have)
- Phase-by-phase breakdown (7 phases)
- MVP scope (minimum viable product)

**Best for:** Developers planning sprints, project tracking

---

## 🚀 Quick Start

### For Project Managers

**Want to understand scope and timeline?**

1. Read: `INTEGRATION_PLAN.md` → [Executive Summary](#executive-summary)
2. Read: `INTEGRATION_PLAN.md` → [Implementation Phases](#implementation-phases)
3. Read: `IMPLEMENTATION_CHECKLIST.md` → [Summary](#summary) (total time estimate)

**Key Takeaway:** 10-11 weeks for 1 developer, 5-6 weeks for 2 developers

### For Backend/Firebase Developers

**Want to set up Firebase database?**

1. Read: `CONTROL_BOARD_INTEGRATION.md` → [Firebase Database Schema](#firebase-database-schema)
2. Read: `CONTROL_BOARD_INTEGRATION.md` → [Firebase Security Rules](#firebase-security-rules)
3. Read: `QUICK_REFERENCE.md` → [Firebase Security Rules](#firebase-security-rules-essential)

**Key Takeaway:** Copy schema and rules, deploy to Firebase Console

### For Frontend/React Developers

**Want to start coding?**

1. Read: `QUICK_REFERENCE.md` → [Getting Started](#getting-started-developer-onboarding)
2. Read: `QUICK_REFERENCE.md` → [Code Examples](#code-examples)
3. Read: `IMPLEMENTATION_CHECKLIST.md` → [Phase 1](#phase-1-foundation--authentication-week-1-2)

**Key Takeaway:** Set up React app, add Firebase Auth, build login page

### For Full-Stack Developers

**Want complete understanding?**

1. Skim: `CONTROL_BOARD_INTEGRATION.md` (understand Firebase schema)
2. Read: `INTEGRATION_PLAN.md` (understand architecture and features)
3. Use: `QUICK_REFERENCE.md` (while coding, for examples)
4. Follow: `IMPLEMENTATION_CHECKLIST.md` (task-by-task execution)

---

## 📊 Feature Breakdown

### ✅ Already Implemented (Calculator App)

- Multi-tenant architecture (TenantContext)
- Firebase Realtime Database integration
- Real-time tariff sync
- Domain-based tenant resolution
- Theme system (60+ CSS variables)
- Branding system (logo, company name, etc.)

### 🚧 Need to Implement (Control Board)

#### Statistics & Analytics

- [ ] Calculator logs every price calculation to Firebase
- [ ] Analytics dashboard with KPI cards, charts
- [ ] Popular routes analysis
- [ ] Time series trends (hourly, daily, monthly)
- [ ] Tenant comparison (Super Admin only)
- [ ] Export reports as CSV/PDF

**Estimated Time:** 3-4 weeks

#### User Management & Permissions

- [ ] Admin user authentication (Firebase Auth)
- [ ] Role-based access control (4 roles: Super Admin, Tenant Admin, Analyst, Support)
- [ ] User CRUD (create, edit, delete admin users)
- [ ] Permission checks (UI and Firebase Rules)
- [ ] Audit log of all admin actions

**Estimated Time:** 2 weeks

#### Theme Control System

- [ ] Visual theme editor with color pickers
- [ ] Live preview in iframe
- [ ] Theme presets (Light, Dark, High Contrast)
- [ ] Export/import theme JSON
- [ ] Copy theme from another tenant

**Estimated Time:** 1.5 weeks

#### Branding Management

- [ ] Tenant CRUD (create, edit, delete, list)
- [ ] Logo upload to Firebase Storage
- [ ] Favicon upload
- [ ] Company info editor (name, contact, address)
- [ ] Feature flag toggles
- [ ] Domain management (allowed domains, custom domain mapping)

**Estimated Time:** 2 weeks

---

## 🗺️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  CONTROL BOARD WEB APP                      │
│                   (React 18 + Firebase)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Tenants  │  │Analytics │  │  Users   │   │
│  │ Overview │  │   CRUD   │  │ & Charts │  │  & Roles │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Theme   │  │ Branding │  │  Logo    │  │  Audit   │   │
│  │  Editor  │  │  Editor  │  │  Upload  │  │   Log    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Firebase SDK
                         │ (Real-time sync)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              FIREBASE REALTIME DATABASE                     │
│                                                             │
│  /tenantRegistry/     ← Tenant configs (branding, theme)   │
│  /tenants/            ← Tariff rates                        │
│  /domainMap/          ← Domain → tenant mapping            │
│  /analytics/          ← Usage statistics                    │
│  /users/              ← Admin users                         │
│  /roles/              ← Permission definitions              │
│  /auditLog/           ← Admin action history                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Firebase SDK
                         │ (Read configs, write analytics)
                         │
┌────────────────────────▼────────────────────────────────────┐
│          TAXI CALCULATOR APPS (N instances)                 │
│                                                             │
│  Instance 1 (Drivas Fleet) │ Instance 2 (Voss Taxi) │ ...  │
│                                                             │
│  - Loads tenant config from Firebase on page load           │
│  - Subscribes to real-time config updates                   │
│  - Reports analytics (calculations, sessions) to Firebase   │
│  - Applies theme from tenant config                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Firebase Database Schema (High-Level)

```
/
├── tenantRegistry/              ← Tenant configurations
│   ├── drivas-fleet/
│   │   └── config/              (branding, theme, features, defaults)
│   ├── voss-taxi/
│   │   └── config/
│   └── _index/                  (list of all tenant IDs)
│
├── tenants/                     ← Tariff rates (separate for real-time sync)
│   ├── drivas-fleet/
│   │   └── tariffs/
│   │       └── base14/          (start, km0_10, kmOver10, min)
│   └── voss-taxi/
│       └── tariffs/
│           └── base14/
│
├── domainMap/                   ← Custom domain → tenant ID mapping
│   ├── drivas-fleet_dot_no: "drivas-fleet"
│   └── vosstaksi_dot_no: "voss-taxi"
│
├── analytics/                   ← Usage statistics (NEW)
│   ├── drivas-fleet/
│   │   ├── calculations/        (every price calculation logged)
│   │   ├── sessions/            (user session tracking)
│   │   └── aggregated/
│   │       └── daily/           (pre-rolled daily stats)
│   └── voss-taxi/
│       └── ...
│
├── users/                       ← Admin users (NEW)
│   ├── user_abc123/             (email, role, tenantScope, permissions)
│   └── user_def456/
│
├── roles/                       ← Role definitions (NEW)
│   ├── super-admin/             (permissions: ["*"])
│   ├── tenant-admin/            (permissions: ["tenant.*", "analytics.*"])
│   ├── analyst/                 (permissions: ["analytics.read"])
│   └── support/                 (permissions: ["tenant.read"])
│
└── auditLog/                    ← Admin action history (NEW)
    ├── log_1234567890_xyz/      (timestamp, userId, action, tenantId, changes)
    └── log_1234567891_abc/
```

---

## 🛠️ Technology Stack

### Control Board

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | UI framework (matches calculator) |
| **Routing** | React Router | Multi-page navigation |
| **Database** | Firebase Realtime Database | Real-time data sync |
| **Auth** | Firebase Auth | Admin authentication |
| **Storage** | Firebase Storage | Logo/asset uploads |
| **Charts** | Chart.js or Recharts | Analytics visualizations |
| **Colors** | react-colorful | Color picker inputs |
| **Styling** | TailwindCSS (optional) | Rapid UI development |
| **Hosting** | Vercel or Firebase Hosting | Production deployment |

### Calculator (existing)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3 + Vite |
| **Database** | Firebase Realtime Database (read-only) |
| **Maps** | Google Maps JavaScript API |
| **Styling** | Pure CSS (App.css) |
| **Hosting** | Vercel |

---

## 📈 Implementation Timeline

### MVP (Minimum Viable Product) - 8 Weeks

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | **Foundation** | Authentication, protected routes, dashboard layout |
| 3-4 | **Tenant Management** | Create, edit, delete tenants |
| 5-6 | **Theme & Branding** | Theme editor, logo upload |
| 7-8 | **Basic Analytics** | Data collection, KPI dashboard |

**MVP Output:** Working control board where admins can manage tenants, customize themes, and view usage statistics

### Full Feature Set - 14 Weeks

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Foundation | (same as MVP) |
| 3-4 | Tenant Management | (same as MVP) |
| 5-6 | Theme & Branding | (same as MVP) |
| 7-8 | Analytics Infrastructure | (same as MVP) |
| 9-10 | **Advanced Analytics** | Route analysis, trends, tenant comparison |
| 11-12 | **User Management** | Role-based access, permissions, audit log |
| 13-14 | **Polish & Production** | Mobile responsive, error handling, deployment |

**Full Output:** Production-ready control board with comprehensive analytics, multi-user support, and professional UX

---

## 🔐 Security Overview

### Authentication

- **Firebase Auth** (email/password) for admin login
- **Protected routes** - redirect to login if not authenticated
- **Session management** - Firebase handles token refresh automatically

### Authorization

- **Role-based access control** (4 roles: Super Admin, Tenant Admin, Analyst, Support)
- **Permission checks** in UI (hide buttons user can't access)
- **Firebase Security Rules** enforce permissions at database level
- **Tenant scope** - Tenant Admins can only access assigned tenants

### Data Protection

- **Firebase Security Rules** prevent unauthorized read/write
- **Input validation** - sanitize all text inputs (XSS prevention)
- **File upload validation** - limit file size (2MB), allow only images
- **Audit log** - track all admin actions (who, what, when, changes)
- **HTTPS only** - Vercel/Firebase Hosting enforce SSL

### Privacy

- **Analytics anonymization** - last octet of IP addresses replaced with .xxx
- **No PII in analytics** - no names, emails, or phone numbers logged
- **Session IDs** instead of user identifiers

---

## 📋 Development Checklist

### Before Starting Development

- [ ] Read `CONTROL_BOARD_INTEGRATION.md` sections 1-3
- [ ] Read `INTEGRATION_PLAN.md` Executive Summary
- [ ] Review calculator codebase (how tenant system currently works)
- [ ] Set up Firebase project (enable Auth, Database, Storage)
- [ ] Create first super-admin user manually in Firebase
- [ ] Deploy Firebase Security Rules

### Development Environment

- [ ] Clone/create control board repository
- [ ] `npm install` dependencies
- [ ] Create `.env` file with Firebase credentials
- [ ] Run `npm run dev` - app loads without errors
- [ ] Test Firebase connection (read from database)

### MVP Completion Criteria

- [ ] Admin can log in with email/password
- [ ] Admin can create new tenant
- [ ] Admin can edit tenant branding
- [ ] Admin can upload logo - appears in calculator
- [ ] Admin can change theme colors - calculator updates in real-time
- [ ] Calculator logs analytics after each calculation
- [ ] Admin can view analytics dashboard with charts
- [ ] All changes sync to calculator without refresh

### Production Ready Criteria

- [ ] All features from checklist implemented
- [ ] Mobile responsive (tested on phone/tablet)
- [ ] Accessibility audit passed (ARIA labels, keyboard nav)
- [ ] Security audit passed (Firebase Rules, input validation)
- [ ] Error handling (toasts, loading states, validation)
- [ ] Documentation complete (user guide)
- [ ] Deployed to production (Vercel/Firebase Hosting)
- [ ] Monitoring set up (error tracking, uptime)

---

## 📞 Support & Resources

### Internal Documentation

- **Tenant config schema:** See `CONTROL_BOARD_INTEGRATION.md` → Complete Tenant Config Schema
- **Firebase paths:** See `CONTROL_BOARD_INTEGRATION.md` → Firebase Database Schema
- **Code examples:** See `QUICK_REFERENCE.md` → Code Examples
- **Task list:** See `IMPLEMENTATION_CHECKLIST.md`

### External Resources

- **Firebase Realtime Database Docs:** https://firebase.google.com/docs/database
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth
- **Firebase Security Rules Guide:** https://firebase.google.com/docs/database/security
- **React Firebase Hooks:** https://github.com/CSFrequency/react-firebase-hooks
- **Chart.js:** https://www.chartjs.org/docs/latest/
- **react-colorful:** https://github.com/omgovich/react-colorful

### Calculator Codebase Reference

Key files to understand how tenant system currently works:

- `/src/context/TenantContext.jsx` - Loads tenant config from Firebase
- `/src/config/tenantResolver.js` - Resolves tenant from domain/query param
- `/src/config/tenantSchema.js` - Default tenant config structure
- `/src/firebase.js` - Firebase SDK initialization
- `/src/hooks/useTariffData.js` - Loads tariffs from Firebase with real-time sync

---

## 🎯 Next Steps

### For Project Kick-Off

1. **Review this README** with entire team
2. **Assign roles:**
   - Project Manager → Track progress with `IMPLEMENTATION_CHECKLIST.md`
   - Backend Developer → Set up Firebase (use `CONTROL_BOARD_INTEGRATION.md`)
   - Frontend Developer → Build React app (use `QUICK_REFERENCE.md` examples)
3. **Set up development environment** (Firebase project, repo, dependencies)
4. **Start Phase 1** - Authentication and basic dashboard (Week 1-2)

### For Solo Developer

1. **Read** `INTEGRATION_PLAN.md` sections: Executive Summary, Architecture, Phase 1
2. **Read** `QUICK_REFERENCE.md` section: Getting Started
3. **Follow** `IMPLEMENTATION_CHECKLIST.md` from top to bottom
4. **Start coding** - Create React app, add Firebase Auth, build login page

---

## 📝 Document Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-08 | 1.0.0 | Initial release - complete integration documentation |

---

**Questions?** Review the specific documents above or consult the calculator codebase for existing tenant system implementation.

**Ready to start?** Jump to `QUICK_REFERENCE.md` → Getting Started section.
