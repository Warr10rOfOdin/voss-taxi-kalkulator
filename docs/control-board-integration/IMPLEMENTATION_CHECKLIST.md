# Control Board Implementation Checklist

> Step-by-step prioritized task list for building the control board

**Last Updated:** 2026-03-08
**Status:** Planning Complete, Ready to Start

---

## 📋 How to Use This Checklist

- **Priority Levels:** 🔴 Critical, 🟡 Important, 🟢 Nice to Have
- **Estimated Time:** Person-days for single developer
- **Dependencies:** Must complete before starting this task
- **Check off** tasks as you complete them

---

## Phase 1: Foundation & Authentication (Week 1-2)

### Setup & Infrastructure

- [ ] 🔴 **Create control board React app** (1 day)
  - Dependencies: None
  - Use Vite + React 18 (matches calculator)
  - Install Firebase SDK, React Router
  - Set up basic folder structure

- [ ] 🔴 **Configure Firebase project** (0.5 days)
  - Dependencies: None
  - Enable Firebase Auth (Email/Password provider)
  - Get Firebase config credentials
  - Add to `.env` file

- [ ] 🔴 **Set up Firebase Security Rules** (0.5 days)
  - Dependencies: Firebase project configured
  - Copy rules from `CONTROL_BOARD_INTEGRATION.md`
  - Test rules in Firebase Console simulator
  - Deploy rules to production

### Authentication

- [ ] 🔴 **Create AuthContext** (1 day)
  - Dependencies: Firebase configured
  - Implement `signInWithEmailAndPassword`
  - Implement `signOut`
  - Listen to `onAuthStateChanged`
  - Load user profile from `/users/{userId}`
  - See code example in `QUICK_REFERENCE.md`

- [ ] 🔴 **Build Login page** (1 day)
  - Dependencies: AuthContext created
  - Email + password form
  - Error handling (invalid credentials)
  - Redirect to dashboard on success
  - "Forgot password" link (optional)

- [ ] 🔴 **Create ProtectedRoute component** (0.5 days)
  - Dependencies: AuthContext created
  - Check if user is authenticated
  - Redirect to login if not
  - Check permissions (optional for Phase 1)

- [ ] 🔴 **Build basic dashboard layout** (1 day)
  - Dependencies: Login page working
  - Sidebar navigation (Tenants, Analytics, Users, Settings)
  - Header with user dropdown (profile, logout)
  - Main content area
  - Responsive mobile layout

### Initial User Setup

- [ ] 🔴 **Manually create first super-admin user** (0.5 days)
  - Dependencies: Firebase Auth enabled
  - Use Firebase Console to create user
  - Manually add user profile to `/users/{userId}` in database:
    ```json
    {
      "userId": "...",
      "email": "admin@drivas.no",
      "displayName": "Super Admin",
      "role": "super-admin",
      "tenantScope": [],
      "createdAt": 1234567890,
      "active": true
    }
    ```
  - Test login with this user

**✅ Phase 1 Deliverable:** Working control board with authentication, protected routes, basic dashboard layout

---

## Phase 2: Tenant Management (Week 3-4)

### Tenant List View

- [ ] 🔴 **Build TenantList component** (1 day)
  - Dependencies: Dashboard layout
  - Fetch all tenants from `/tenantRegistry`
  - Display in table (ID, name, status, created date)
  - "New Tenant" button
  - Edit/View/Delete actions per tenant
  - See code example in `QUICK_REFERENCE.md`

- [ ] 🔴 **Add tenant filtering/sorting** (0.5 days)
  - Dependencies: TenantList component
  - Filter by active/inactive
  - Sort by name, created date
  - Search by name or ID

### Create Tenant

- [ ] 🔴 **Build TenantCreate form** (2 days)
  - Dependencies: TenantList component
  - Form fields:
    - Tenant ID (kebab-case validation)
    - Company name
    - Default address
    - Map center (lat/lng)
    - Contact info (phone, email, website)
  - Form validation (required fields, format checks)
  - Save to `/tenantRegistry/{id}/config`
  - Save initial tariffs to `/tenants/{id}/tariffs/base14`
  - Add to tenant index `/tenantRegistry/_index/{id}`
  - Redirect to tenant list on success

- [ ] 🟡 **Add domain mapping during tenant creation** (0.5 days)
  - Dependencies: TenantCreate form
  - Allow adding custom domains
  - Encode domain (replace `.` with `_dot_`)
  - Save to `/domainMap/{encoded-domain}`

### Edit Tenant

- [ ] 🔴 **Build TenantEdit form** (2 days)
  - Dependencies: TenantCreate form
  - Load existing tenant config
  - Same form fields as create
  - Update `/tenantRegistry/{id}/config`
  - Show success/error toast notifications

- [ ] 🟡 **Add tenant activation toggle** (0.5 days)
  - Dependencies: TenantEdit form
  - Toggle `active: true/false`
  - Confirmation modal for deactivation
  - Update in real-time

- [ ] 🟡 **Add feature flags toggles** (1 day)
  - Dependencies: TenantEdit form
  - Checkboxes for each feature:
    - Show language switcher
    - Show print button
    - Show tariff editor
    - Show map
    - Show tariff table
    - Show powered by footer
  - Update `features` object in tenant config

### Delete Tenant

- [ ] 🟡 **Implement tenant deletion** (0.5 days)
  - Dependencies: TenantList component
  - Confirmation modal (require typing tenant ID)
  - Delete from `/tenantRegistry/{id}`
  - Delete from `/tenants/{id}`
  - Delete from domain maps
  - Delete from tenant index
  - Show success message

**✅ Phase 2 Deliverable:** Full tenant CRUD operations, changes sync to calculator apps in real-time

---

## Phase 3: Branding & Theme Control (Week 5-6)

### Logo & Asset Management

- [ ] 🔴 **Build LogoUpload component** (1.5 days)
  - Dependencies: Firebase Storage enabled
  - File input (accept images only)
  - Preview uploaded image
  - Upload to Firebase Storage `/tenants/{id}/logo.png`
  - Get download URL
  - Update tenant config with logo URL
  - Validate file size (max 2MB)
  - Show upload progress
  - See code example in `INTEGRATION_PLAN.md`

- [ ] 🟡 **Add favicon upload** (0.5 days)
  - Dependencies: LogoUpload component
  - Same as logo but upload to `/tenants/{id}/favicon.png`
  - Support .ico and .png formats

### Theme Editor

- [ ] 🔴 **Build basic ThemeEditor component** (2 days)
  - Dependencies: None
  - Color picker for 10 key CSS variables:
    - `--brand-primary`
    - `--brand-secondary`
    - `--bg-body-1`
    - `--bg-card`
    - `--text-primary`
    - `--text-secondary`
    - `--border-card`
    - `--shadow-card`
    - `--border-radius-card`
    - `--font-size-base`
  - Use `react-colorful` for color pickers
  - Save button → update `/tenantRegistry/{id}/config/theme`
  - Reset button → clear theme (use defaults)
  - See code example in `QUICK_REFERENCE.md`

- [ ] 🟡 **Add live preview iframe** (1 day)
  - Dependencies: ThemeEditor component
  - iframe loads calculator with `?tenant={id}&preview=true`
  - PostMessage API to send theme updates
  - Preview updates in real-time as colors change
  - See implementation in `INTEGRATION_PLAN.md`

- [ ] 🟡 **Add theme presets** (0.5 days)
  - Dependencies: ThemeEditor component
  - Buttons: Light Theme, Dark Theme, High Contrast
  - Click button → apply preset colors
  - Save preset to database

- [ ] 🟢 **Add full theme editor (all 60+ variables)** (2 days)
  - Dependencies: Basic ThemeEditor component
  - Categorized sections (Brand, Background, Text, Borders, Typography, Shadows)
  - Collapsible accordion for each category
  - See full variable list in `CONTROL_BOARD_INTEGRATION.md`

- [ ] 🟢 **Add export/import theme JSON** (0.5 days)
  - Dependencies: ThemeEditor component
  - Export button → download theme as JSON file
  - Import button → upload JSON file, apply theme
  - Copy theme from another tenant

### Calculator Preview Mode

- [ ] 🟡 **Update calculator to support preview mode** (0.5 days)
  - Dependencies: None
  - Detect `?preview=true` query param
  - Listen for PostMessage events from control board
  - Apply theme updates to `document.documentElement.style`
  - See code in `INTEGRATION_PLAN.md`

**✅ Phase 3 Deliverable:** Visual theme editor with live preview, logo upload working

---

## Phase 4: Analytics Infrastructure (Week 7-8)

### Data Collection (Calculator Side)

- [ ] 🔴 **Create analytics utility** (1 day)
  - Dependencies: None
  - File: `calculator/src/utils/analytics.js`
  - Function: `trackCalculation(tenantId, tripData, pricingData)`
  - Generate unique calculation ID and session ID
  - Write to `/analytics/{tenantId}/calculations/{id}`
  - See full code in `QUICK_REFERENCE.md`

- [ ] 🔴 **Integrate analytics into calculator App.jsx** (0.5 days)
  - Dependencies: Analytics utility created
  - Import `trackCalculation`
  - Call after every price calculation
  - Don't block user flow on analytics failure (try-catch)

- [ ] 🟡 **Add session tracking** (1 day)
  - Dependencies: Analytics utility created
  - Generate session ID on page load (store in sessionStorage)
  - Track session start time
  - Track session end time (on beforeunload)
  - Count interactions (calculations, language changes, etc.)
  - Write to `/analytics/{tenantId}/sessions/{id}`

- [ ] 🟢 **Add device detection** (0.5 days)
  - Dependencies: Analytics utility
  - Detect mobile/tablet/desktop from screen width
  - Detect browser from user agent
  - Include in analytics data

### Analytics Dashboard (Control Board Side)

- [ ] 🔴 **Build AnalyticsDashboard component** (2 days)
  - Dependencies: Data collection working in calculator
  - KPI cards:
    - Calculations today
    - Average trip price
    - Total distance today
    - Active sessions
  - Line chart: Calculations over time (24h view)
  - Pie chart: Vehicle group distribution
  - Bar chart: Tariff period usage
  - Use Chart.js or Recharts for visualizations

- [ ] 🟡 **Add date range selector** (0.5 days)
  - Dependencies: AnalyticsDashboard component
  - Buttons: Today, 7 days, 30 days, Custom
  - Update charts based on selected range
  - Fetch data from Firebase for date range

- [ ] 🟡 **Add export CSV button** (0.5 days)
  - Dependencies: AnalyticsDashboard component
  - Export calculations data as CSV
  - Include: timestamp, start, dest, distance, duration, price
  - Download file with filename `{tenantId}-calculations-{date}.csv`

### Data Aggregation (Optional but Recommended)

- [ ] 🟢 **Create Cloud Function for daily aggregation** (2 days)
  - Dependencies: Firebase Cloud Functions enabled
  - Runs daily at midnight
  - Reads all calculations from previous day
  - Aggregates:
    - Total calculations
    - Calculations by hour
    - Calculations by vehicle group
    - Calculations by tariff period
    - Popular routes (top 10)
    - Average distance/duration/price
  - Writes to `/analytics/{tenantId}/aggregated/daily/{date}`
  - See schema in `INTEGRATION_PLAN.md`

**✅ Phase 4 Deliverable:** Calculator logs analytics, control board displays real-time usage statistics

---

## Phase 5: Advanced Analytics (Week 9-10)

### Route Analysis

- [ ] 🟡 **Build PopularRoutes component** (1 day)
  - Dependencies: Analytics data collection
  - Table with columns: Start, Destination, Count, Avg Price
  - Sort by count (most popular first)
  - Paginate (show top 50)
  - Export CSV button

- [ ] 🟢 **Add geographic heat map** (2 days)
  - Dependencies: Google Maps API, geocoding
  - Display start/destination locations on map
  - Color intensity by frequency
  - Cluster markers for performance
  - Requires geocoding addresses to lat/lng

### Trend Analysis

- [ ] 🟡 **Build TrendsChart component** (1.5 days)
  - Dependencies: Aggregated daily data
  - Line chart: Calculations by hour of day (average across selected date range)
  - Bar chart: Calculations by day of week (Mon-Sun)
  - Line chart: Monthly trends (Jan-Dec)

- [ ] 🟡 **Add vehicle group trends** (0.5 days)
  - Dependencies: TrendsChart component
  - Stacked area chart: Vehicle groups over time
  - Shows if certain vehicle types trending up/down

### Tenant Comparison (Super Admin Only)

- [ ] 🟡 **Build TenantComparison component** (1.5 days)
  - Dependencies: Super admin permissions
  - Table: All tenants with metrics (calculations, avg price, total revenue)
  - Bar chart: Calculations per tenant
  - Sort by various metrics
  - Growth indicators (week-over-week, month-over-month)

### Reports

- [ ] 🟢 **Add PDF export for reports** (2 days)
  - Dependencies: Analytics dashboard
  - Use library like `jsPDF` or `react-pdf`
  - Generate PDF with:
    - Cover page (tenant logo, date range)
    - KPI summary
    - Charts (calculations over time, vehicle groups, etc.)
    - Popular routes table
  - Download as `{tenantId}-report-{date}.pdf`

**✅ Phase 5 Deliverable:** Comprehensive analytics with route analysis, trends, tenant comparison, PDF reports

---

## Phase 6: User Management & Permissions (Week 11-12)

### User Management

- [ ] 🔴 **Build UserList component** (1 day)
  - Dependencies: Super admin permissions
  - Table: Email, Name, Role, Last Login, Status
  - Filter by role, active/inactive
  - Search by email
  - "Add User" button

- [ ] 🔴 **Build UserCreate form** (1.5 days)
  - Dependencies: UserList component
  - Form fields:
    - Email (required, validated)
    - Display name
    - Role (dropdown: super-admin, tenant-admin, analyst, support)
    - Tenant scope (multi-select, only if not super-admin)
  - Create user in Firebase Auth
  - Create user profile in `/users/{userId}`
  - Send email invitation (optional, requires Cloud Functions)

- [ ] 🔴 **Build UserEdit modal** (1 day)
  - Dependencies: UserList component
  - Edit existing user
  - Change role, tenant scope
  - Activate/deactivate toggle
  - Delete user button (with confirmation)

### Permissions System

- [ ] 🔴 **Define roles in database** (0.5 days)
  - Dependencies: None
  - Create `/roles/{roleId}` for each role
  - Store permissions array per role
  - See schema in `INTEGRATION_PLAN.md`

- [ ] 🔴 **Implement permission checks in AuthContext** (1 day)
  - Dependencies: Roles defined
  - Function: `hasPermission(permission)` → boolean
  - Check if user's role has permission
  - Super-admin has all permissions

- [ ] 🟡 **Add permission checks to UI** (1 day)
  - Dependencies: Permission checks in AuthContext
  - Hide buttons/links user doesn't have permission for
  - Examples:
    - Hide "Delete Tenant" if no `tenant.delete` permission
    - Hide "Add User" if no `user.create` permission
  - Use `hasPermission()` in components

- [ ] 🟡 **Enforce permissions in Firebase Security Rules** (1 day)
  - Dependencies: Permissions system implemented
  - Update rules to check user role and permissions
  - Test in Firebase Console simulator
  - See rules in `QUICK_REFERENCE.md`

### Audit Log

- [ ] 🟡 **Implement audit logging** (1.5 days)
  - Dependencies: None
  - Function: `logAction(action, tenantId, changes)`
  - Write to `/auditLog/{logId}`
  - Include: timestamp, userId, action, tenantId, changes object, IP, userAgent
  - Call after every create/update/delete operation

- [ ] 🟡 **Build AuditLog component** (1 day)
  - Dependencies: Audit logging implemented
  - Table: Timestamp, User, Action, Tenant, Changes
  - Filter by user, action, tenant
  - Date range filter
  - Paginate (100 per page)
  - Export CSV

**✅ Phase 6 Deliverable:** Multi-user support with role-based access control, full audit trail

---

## Phase 7: Polish & Production (Week 13-14)

### Error Handling & UX

- [ ] 🔴 **Add toast notifications** (0.5 days)
  - Dependencies: None
  - Use `react-hot-toast` or similar
  - Show success toasts after save operations
  - Show error toasts on failures
  - Auto-dismiss after 5 seconds

- [ ] 🔴 **Add loading states** (1 day)
  - Dependencies: None
  - Skeleton loaders for tenant list, analytics dashboard
  - Spinners for buttons during save operations
  - Loading bar for page navigation

- [ ] 🟡 **Add form validation** (1 day)
  - Dependencies: None
  - Use `react-hook-form` for validation
  - Show inline errors below inputs
  - Disable submit until form is valid
  - Validate:
    - Email format
    - URL format (website, logo)
    - Required fields
    - Tenant ID format (kebab-case, unique)

- [ ] 🟡 **Add confirmation modals** (0.5 days)
  - Dependencies: None
  - Confirm before delete tenant
  - Confirm before delete user
  - Confirm before deactivate tenant
  - Require typing tenant ID to confirm deletion

### Responsive Design

- [ ] 🔴 **Mobile responsive layout** (2 days)
  - Dependencies: None
  - Hamburger menu for mobile
  - Collapsible sidebar
  - Tables scroll horizontally on mobile
  - Forms stack vertically on mobile
  - Touch-friendly buttons (44px min)

### Accessibility

- [ ] 🟡 **Accessibility audit** (1 day)
  - Dependencies: None
  - ARIA labels on all inputs
  - Keyboard navigation (tab order)
  - Focus states visible
  - Color contrast meets WCAG AA
  - Screen reader testing

### Performance

- [ ] 🟡 **Code splitting** (0.5 days)
  - Dependencies: None
  - Lazy load heavy components (ThemeEditor, AnalyticsDashboard)
  - Use `React.lazy()` and `Suspense`
  - Reduce initial bundle size

- [ ] 🟡 **Optimize Firebase queries** (0.5 days)
  - Dependencies: None
  - Add indexes for common queries
  - Limit query results (pagination)
  - Use `limitToLast()` for recent data

### Security

- [ ] 🔴 **Security audit** (1 day)
  - Dependencies: All features implemented
  - Review Firebase Security Rules
  - Test unauthorized access attempts
  - Sanitize all text inputs (prevent XSS)
  - Validate file uploads (type, size)
  - Rate limiting on sensitive operations

### Documentation

- [ ] 🟡 **Write user guide** (1 day)
  - Dependencies: All features implemented
  - How to create a tenant
  - How to customize theme
  - How to upload logo
  - How to add users
  - How to view analytics
  - Screenshots for each feature

- [ ] 🟢 **Record demo video** (0.5 days)
  - Dependencies: User guide written
  - 5-10 minute screencast
  - Walkthrough of main features
  - Upload to YouTube/Vimeo

### Deployment

- [ ] 🔴 **Deploy to production** (0.5 days)
  - Dependencies: All features tested
  - Deploy to Vercel or Firebase Hosting
  - Set up environment variables
  - Point custom domain (e.g., `admin.drivas-fleet.no`)
  - SSL certificate (auto with Vercel/Firebase)

- [ ] 🟡 **Set up monitoring** (0.5 days)
  - Dependencies: Deployed to production
  - Error tracking (Sentry, Rollbar, or Firebase Crashlytics)
  - Analytics (Google Analytics, Plausible)
  - Uptime monitoring (UptimeRobot, Pingdom)

**✅ Phase 7 Deliverable:** Production-ready control board, mobile responsive, comprehensive error handling, deployed and monitored

---

## Summary

### Total Estimated Time

- **Phase 1 (Foundation):** 5.5 days
- **Phase 2 (Tenants):** 7 days
- **Phase 3 (Branding/Theme):** 7.5 days
- **Phase 4 (Analytics):** 7 days
- **Phase 5 (Advanced Analytics):** 7 days
- **Phase 6 (Users/Permissions):** 8 days
- **Phase 7 (Polish/Production):** 8.5 days

**TOTAL:** ~50.5 person-days (~10-11 weeks for 1 developer, ~5-6 weeks for 2 developers)

### Critical Path (Minimum Viable Product)

To launch a working MVP quickly, focus on:

1. ✅ **Phase 1** - Authentication (Week 1-2)
2. ✅ **Phase 2** - Tenant CRUD (Week 3-4)
3. ✅ **Phase 3** - Theme Editor + Logo Upload (Week 5-6)
4. ✅ **Phase 4** - Basic Analytics (Week 7-8)

**MVP Delivery:** 8 weeks (~40 person-days)

After MVP, add Phase 5, 6, 7 incrementally based on user feedback.

---

## Current Status

- [x] Planning complete
- [x] Documentation written
- [ ] Development environment set up
- [ ] First commit

---

**Next Action:** Set up development environment and create control board React app (Phase 1, Task 1)

**Questions?** Review `INTEGRATION_PLAN.md` for detailed implementation guidance, or `QUICK_REFERENCE.md` for code examples.
