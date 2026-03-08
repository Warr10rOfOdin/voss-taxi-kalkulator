# Control Board Integration Plan

> Comprehensive implementation roadmap for the Drivas Fleet Control Board - managing tenants, statistics, users, themes, and branding.

**Created:** 2026-03-08
**Status:** Planning Phase
**Target Completion:** Q2 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Feature Categories](#feature-categories)
4. [Statistics & Analytics](#statistics--analytics)
5. [User Management & Permissions](#user-management--permissions)
6. [Theme Control System](#theme-control-system)
7. [Branding Management](#branding-management)
8. [Implementation Phases](#implementation-phases)
9. [Database Schema Extensions](#database-schema-extensions)
10. [API Endpoints](#api-endpoints)
11. [Security Considerations](#security-considerations)
12. [Testing Strategy](#testing-strategy)

---

## Executive Summary

### Project Overview

The Drivas Fleet Control Board is a web-based administration dashboard that enables centralized management of multiple taxi calculator instances. It provides real-time control over:

- **Multi-tenant management** - Create, configure, and monitor taxi companies
- **Statistics & analytics** - Track usage, popular routes, calculation patterns
- **User & permissions** - Admin access control, role-based permissions
- **Theme customization** - White-label theming with live preview
- **Branding control** - Logo, colors, contact info, feature flags

### Current State

✅ **Completed:**
- Taxi calculator with multi-tenant architecture
- Firebase Realtime Database integration
- Tenant config schema (branding, theme, features)
- Real-time tariff sync
- Domain-based tenant resolution

🚧 **In Progress:**
- Control board integration specification (CONTROL_BOARD_INTEGRATION.md)

❌ **Not Started:**
- Statistics tracking infrastructure
- User management system
- Admin dashboard UI
- Analytics data collection
- Permissions system

### Goals

1. **Centralized Control** - Manage all tenant instances from one dashboard
2. **Real-Time Updates** - Changes propagate instantly to calculator apps
3. **Data-Driven Decisions** - Analytics for usage patterns and optimization
4. **Security** - Role-based access control with audit logging
5. **Scalability** - Support 100+ taxi companies on single infrastructure

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  CONTROL BOARD WEB APP                      │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard  │  │   Tenants    │  │  Statistics  │      │
│  │  Overview   │  │  Management  │  │  & Analytics │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Theme     │  │   Branding   │  │    Users     │      │
│  │   Editor    │  │   Manager    │  │  & Roles     │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Firebase SDK (read/write)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              FIREBASE REALTIME DATABASE                     │
│                                                             │
│  /tenantRegistry/    /analytics/    /users/    /auditLog/  │
│  /tariffs/           /sessions/     /roles/                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Firebase SDK (read, real-time sync)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               TAXI CALCULATOR APPS (N instances)            │
│                                                             │
│  drivas-fleet.no  │  vosstaksi.no  │  bergentaxi.no  │ ... │
│                                                             │
│  - Loads tenant config from Firebase                        │
│  - Subscribes to real-time updates                          │
│  - Reports usage analytics back to Firebase                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Control Board Frontend:**
- React 18+ (matches calculator tech stack)
- React Router for multi-page navigation
- Firebase SDK for database operations
- Chart.js or Recharts for analytics visualizations
- TailwindCSS or similar for rapid UI development

**Backend/Database:**
- Firebase Realtime Database (existing)
- Firebase Auth for admin authentication
- Firebase Storage for logo/asset uploads
- Firebase Cloud Functions (optional, for complex analytics aggregation)

**Calculator App (existing):**
- React 18.3 + Vite
- Firebase SDK (read-only for tenant config)
- Google Maps API

---

## Feature Categories

### 1. Statistics & Analytics

**Priority:** HIGH
**Complexity:** Medium
**Dependencies:** None (new infrastructure)

**Features:**
- Real-time usage dashboard
- Calculator usage metrics (calculations per day/week/month)
- Popular routes analysis (most calculated trips)
- Tenant comparison metrics
- Geographic heat maps (where users calculate from/to)
- Tariff period distribution (day vs evening vs weekend)
- Vehicle group preferences (1-4 seats vs larger)
- Average trip distance and duration
- Peak usage times (hourly, daily, monthly)

**Data Collection Points:**
- Every price calculation triggers analytics event
- Route selections tracked (start, destination, via points)
- User interactions (language changes, feature usage)
- Error events (API failures, validation errors)
- Session duration and bounce rates

### 2. User Management & Permissions

**Priority:** HIGH
**Complexity:** Medium
**Dependencies:** Firebase Auth

**Features:**
- Admin user authentication (email/password, Google SSO)
- Role-based access control (Super Admin, Tenant Admin, Viewer)
- Per-tenant permission scoping
- Audit log of all admin actions
- User invitation system
- Password reset and account recovery
- Two-factor authentication (optional)
- Session management and logout

**Roles:**
- **Super Admin** - Full access to all tenants, users, and system settings
- **Tenant Admin** - Manage specific tenants, view analytics, edit themes/branding
- **Analyst** - Read-only access to statistics and reports
- **Support** - View tenant configs, no edit permissions

### 3. Theme Control System

**Priority:** MEDIUM
**Complexity:** Low-Medium
**Dependencies:** Tenant management

**Features:**
- Visual theme editor with color pickers
- 60+ CSS variable controls (see CONTROL_BOARD_INTEGRATION.md)
- Theme presets (light, dark, custom)
- Live preview in iframe
- Theme templates (copy theme from another tenant)
- Import/export theme JSON
- Dark mode toggle
- Accessibility contrast checker
- Reset to default theme

**UI Components:**
- Color picker inputs for all CSS variables
- Categorized sections (Brand, Background, Text, Borders, etc.)
- Live preview panel showing calculator with current theme
- Quick preset buttons (Light, Dark, High Contrast)

### 4. Branding Management

**Priority:** MEDIUM
**Complexity:** Low
**Dependencies:** Firebase Storage for logo uploads

**Features:**
- Company name editor
- Logo upload (with preview and resize)
- Favicon upload
- Page title and description (NO/EN)
- Contact information (phone, email, website)
- Copyright holder
- "Made by" attribution
- Feature flag toggles (map, tariff table, print, etc.)
- Default address and map center picker
- Allowed domains management
- Regional settings (language, country, map region)

---

## Statistics & Analytics

### Analytics Data Schema

#### Path: `/analytics/{tenantId}/calculations/{calculationId}`

Every calculation generates an analytics event:

```json
{
  "calculationId": "calc_1709876543210_abc123",
  "tenantId": "bergen-taxi",
  "timestamp": 1709876543210,
  "sessionId": "session_1709876000000_xyz",

  "trip": {
    "startAddress": "Torgallmenningen, Bergen",
    "destAddress": "Bergen Airport, Flesland",
    "viaPoints": ["Sentrum Stasjon"],
    "distanceKm": 18.5,
    "durationMin": 25,
    "vehicleGroup": "1-4"
  },

  "pricing": {
    "estimatedPrice": 485,
    "tariffPeriod": "dag",
    "breakdown": {
      "dag": 485
    }
  },

  "context": {
    "date": "2024-03-08",
    "time": "10:30",
    "dayOfWeek": 5, // Friday
    "isHoliday": false,
    "language": "no"
  },

  "meta": {
    "calculatorVersion": "2.1.0",
    "userAgent": "Mozilla/5.0...",
    "ip": "185.93.xxx.xxx", // anonymized
    "referrer": "https://google.com/search?q=taxi+bergen",
    "device": "desktop" // desktop, mobile, tablet
  }
}
```

#### Path: `/analytics/{tenantId}/sessions/{sessionId}`

Session tracking for user engagement metrics:

```json
{
  "sessionId": "session_1709876000000_xyz",
  "tenantId": "bergen-taxi",
  "startTime": 1709876000000,
  "endTime": 1709876543210,
  "duration": 543210, // milliseconds

  "interactions": {
    "calculations": 3,
    "languageChanges": 1,
    "addressSearches": 5,
    "viaPointsAdded": 2,
    "printClicks": 0,
    "tariffTableViews": 1
  },

  "device": {
    "type": "mobile",
    "browser": "Chrome",
    "os": "Android",
    "screenWidth": 1920,
    "screenHeight": 1080
  },

  "location": {
    "country": "NO",
    "city": "Bergen", // from IP lookup
    "timezone": "Europe/Oslo"
  }
}
```

#### Path: `/analytics/{tenantId}/aggregated/daily/{date}`

Pre-aggregated daily statistics (updated via Cloud Function or scheduled task):

```json
{
  "date": "2024-03-08",
  "tenantId": "bergen-taxi",

  "calculations": {
    "total": 127,
    "byHour": { "00": 2, "01": 0, ..., "23": 5 },
    "byVehicleGroup": { "1-4": 85, "5-6": 28, "7-8": 10, "9-16": 4 },
    "byTariffPeriod": { "dag": 75, "kveld": 35, "helgNatt": 17 }
  },

  "trips": {
    "avgDistance": 12.3,
    "avgDuration": 18.5,
    "avgPrice": 325,
    "totalDistance": 1563.1,
    "totalPrice": 41275
  },

  "popularRoutes": [
    {
      "start": "Torgallmenningen",
      "dest": "Bergen Airport",
      "count": 23,
      "avgPrice": 485
    },
    {
      "start": "Sentrum Stasjon",
      "dest": "Askøy",
      "count": 18,
      "avgPrice": 410
    }
  ],

  "sessions": {
    "total": 95,
    "avgDuration": 456000, // milliseconds
    "bounceRate": 0.23 // 23% left without calculating
  },

  "devices": {
    "desktop": 45,
    "mobile": 42,
    "tablet": 8
  }
}
```

### Analytics Dashboard UI

**Overview Tab:**
- KPI cards: Total calculations today, Active sessions, Avg price, Popular route
- Line chart: Calculations over time (24h, 7d, 30d, 1y)
- Pie chart: Vehicle group distribution
- Bar chart: Tariff period usage

**Routes Tab:**
- Table: Top 50 routes with start, dest, count, avg price
- Map visualization: Heat map of start/dest locations
- Export CSV button

**Trends Tab:**
- Time series: Calculations by hour of day
- Day of week comparison (Mon-Sun)
- Monthly comparison (Jan-Dec)
- Vehicle group trends over time

**Tenants Tab** (Super Admin only):
- Comparison table: All tenants with usage metrics
- Bar chart: Calculations per tenant
- Growth metrics: Week-over-week, month-over-month

### Analytics Implementation

**Calculator Changes (Data Collection):**

Add analytics tracking to `App.jsx`:

```javascript
// src/utils/analytics.js
import { ref, push } from 'firebase/database';
import { db } from '../firebase';

export async function trackCalculation(tenantId, tripData, pricingData) {
  const sessionId = getOrCreateSessionId(); // from localStorage

  const analyticsData = {
    calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    timestamp: Date.now(),
    sessionId,
    trip: {
      startAddress: tripData.startAddress,
      destAddress: tripData.destAddress,
      viaPoints: tripData.viaAddresses,
      distanceKm: tripData.distanceKm,
      durationMin: tripData.durationMin,
      vehicleGroup: tripData.vehicleGroup
    },
    pricing: {
      estimatedPrice: pricingData.total,
      tariffPeriod: pricingData.dominantPeriod,
      breakdown: pricingData.breakdown
    },
    context: {
      date: tripData.tripDate,
      time: tripData.tripTime,
      dayOfWeek: new Date(tripData.tripDate).getDay(),
      isHoliday: pricingData.isHoliday,
      language: tripData.lang
    },
    meta: {
      calculatorVersion: '2.1.0',
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      device: getDeviceType()
    }
  };

  try {
    await push(ref(db, `analytics/${tenantId}/calculations`), analyticsData);
  } catch (error) {
    console.error('[Analytics] Failed to track calculation:', error);
    // Don't block user flow on analytics failure
  }
}

function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('drivaskalk_sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('drivaskalk_sessionId', sessionId);
  }
  return sessionId;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
```

**Control Board Implementation:**

```javascript
// Dashboard component
import { ref, query, orderByChild, limitToLast } from 'firebase/database';
import { useObjectVal } from 'react-firebase-hooks/database';

function AnalyticsDashboard({ tenantId }) {
  const today = new Date().toISOString().split('T')[0];
  const [dailyStats] = useObjectVal(
    ref(db, `analytics/${tenantId}/aggregated/daily/${today}`)
  );

  return (
    <div>
      <h1>Analytics Dashboard - {tenantId}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Calculations Today"
          value={dailyStats?.calculations?.total || 0}
          trend="+12%"
        />
        <KpiCard
          title="Avg Trip Price"
          value={`${dailyStats?.trips?.avgPrice || 0} NOK`}
          trend="+5%"
        />
        <KpiCard
          title="Total Distance"
          value={`${dailyStats?.trips?.totalDistance || 0} km`}
        />
        <KpiCard
          title="Active Sessions"
          value={dailyStats?.sessions?.total || 0}
        />
      </div>

      {/* Charts */}
      <CalculationsChart data={dailyStats?.calculations?.byHour} />
      <VehicleGroupPieChart data={dailyStats?.calculations?.byVehicleGroup} />
      <PopularRoutesTable routes={dailyStats?.popularRoutes} />
    </div>
  );
}
```

---

## User Management & Permissions

### User Data Schema

#### Path: `/users/{userId}`

Admin user profile and permissions:

```json
{
  "userId": "user_abc123",
  "email": "admin@bergentaxi.no",
  "displayName": "Bergen Taxi Admin",
  "photoURL": "https://...",
  "role": "tenant-admin",
  "tenantScope": ["bergen-taxi"], // which tenants they can access
  "createdAt": 1709876543210,
  "lastLogin": 1709876543210,
  "active": true,
  "twoFactorEnabled": false
}
```

#### Path: `/roles/{roleId}`

Role definitions with permissions:

```json
{
  "roleId": "tenant-admin",
  "name": "Tenant Administrator",
  "description": "Full control over assigned tenants",
  "permissions": [
    "tenant.read",
    "tenant.update",
    "tenant.branding.update",
    "tenant.theme.update",
    "tenant.tariffs.update",
    "tenant.features.update",
    "analytics.read",
    "analytics.export"
  ]
}
```

**Pre-defined Roles:**

| Role | Permissions | Description |
|------|------------|-------------|
| `super-admin` | `*` (all) | Platform administrators, full access to all tenants and users |
| `tenant-admin` | `tenant.*`, `analytics.*` | Manage specific tenants, view analytics, edit all settings |
| `analyst` | `analytics.read`, `tenant.read` | Read-only access to statistics and tenant configs |
| `support` | `tenant.read` | View tenant configurations, no edit permissions |

#### Path: `/auditLog/{logId}`

Audit trail of all admin actions:

```json
{
  "logId": "log_1709876543210_xyz",
  "timestamp": 1709876543210,
  "userId": "user_abc123",
  "userEmail": "admin@bergentaxi.no",
  "action": "tenant.update",
  "tenantId": "bergen-taxi",
  "changes": {
    "branding.companyName": {
      "from": "Bergen Taksi",
      "to": "Bergen Taxi"
    },
    "theme.--brand-primary": {
      "from": "#0055cc",
      "to": "#0066cc"
    }
  },
  "ip": "185.93.xxx.xxx",
  "userAgent": "Mozilla/5.0..."
}
```

### User Management UI

**Users Tab:**
- User list table (email, name, role, last login, status)
- Add user button (email invitation)
- Edit user (change role, tenant scope)
- Deactivate/reactivate user
- Delete user (with confirmation)
- Filter by role, tenant, active status

**User Edit Modal:**
- Email (read-only)
- Display name
- Role dropdown (super-admin, tenant-admin, analyst, support)
- Tenant scope multi-select (for non-super-admins)
- Active/inactive toggle
- 2FA status and reset
- Last login timestamp
- Save/cancel buttons

**Audit Log Tab:**
- Filterable table: timestamp, user, action, tenant, changes
- Export CSV
- Search by user, action, tenant
- Date range filter

### Authentication Implementation

**Firebase Auth Setup:**

```javascript
// Control board: src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Load user profile from database
        const profileRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(profileRef);
        setUserProfile(snapshot.val());
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const hasPermission = (permission) => {
    if (!userProfile) return false;
    if (userProfile.role === 'super-admin') return true;

    // Load role permissions
    // Check if permission is in role.permissions array
    return false; // Simplified
  };

  const canAccessTenant = (tenantId) => {
    if (!userProfile) return false;
    if (userProfile.role === 'super-admin') return true;
    return userProfile.tenantScope?.includes(tenantId);
  };

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    hasPermission,
    canAccessTenant
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

**Protected Route Component:**

```javascript
function ProtectedRoute({ children, permission, tenantId }) {
  const { userProfile, hasPermission, canAccessTenant } = useAuth();

  if (!userProfile) {
    return <Navigate to="/login" />;
  }

  if (permission && !hasPermission(permission)) {
    return <div>Access Denied: Missing permission {permission}</div>;
  }

  if (tenantId && !canAccessTenant(tenantId)) {
    return <div>Access Denied: Cannot access tenant {tenantId}</div>;
  }

  return children;
}

// Usage
<Route path="/tenants/:tenantId/edit" element={
  <ProtectedRoute permission="tenant.update">
    <TenantEditor />
  </ProtectedRoute>
} />
```

---

## Theme Control System

### Theme Editor UI

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Theme Editor - bergen-taxi                                 │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│  Sidebar (Controls)     │   Live Preview (iframe)           │
│                         │                                   │
│  ┌──────────────────┐   │   ┌──────────────────────────┐    │
│  │ Brand Colors     │   │   │  [Calculator Preview]    │    │
│  │ - Primary        │   │   │                          │    │
│  │ - Secondary      │   │   │  Shows live theme as you │    │
│  │ - Accent         │   │   │  adjust color pickers    │    │
│  └──────────────────┘   │   │                          │    │
│                         │   └──────────────────────────┘    │
│  ┌──────────────────┐   │                                   │
│  │ Backgrounds      │   │   [Reset] [Save] [Export JSON]    │
│  │ - Body           │   │                                   │
│  │ - Card           │   │                                   │
│  └──────────────────┘   │                                   │
│                         │                                   │
│  [More sections...]     │                                   │
│                         │                                   │
└─────────────────────────┴───────────────────────────────────┘
```

**Features:**

1. **Color Picker Inputs:**
   - Visual color picker for each CSS variable
   - Hex, RGB, HSL input modes
   - Opacity slider for rgba variables
   - Copy color value button

2. **Categorized Sections:**
   - Brand Colors (primary, secondary, accent)
   - Backgrounds (body, card, overlay)
   - Text Colors (primary, secondary, muted)
   - Borders (card, input, divider)
   - Shadows & Effects

3. **Live Preview:**
   - iframe loads calculator with `?tenant=bergen-taxi&preview=true`
   - PostMessage API sends theme updates to iframe
   - Preview applies theme without saving to database

4. **Quick Actions:**
   - Preset buttons: Light Theme, Dark Theme, High Contrast
   - Reset to defaults
   - Copy theme from another tenant
   - Export theme as JSON
   - Import theme from JSON

### Implementation

**Theme Editor Component:**

```javascript
// Control board: src/components/ThemeEditor.jsx
import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { HexColorPicker } from 'react-colorful';

function ThemeEditor({ tenantId, initialTheme }) {
  const [theme, setTheme] = useState(initialTheme || {});
  const [previewWindow, setPreviewWindow] = useState(null);

  useEffect(() => {
    // Send theme updates to preview iframe
    if (previewWindow) {
      previewWindow.postMessage(
        { type: 'UPDATE_THEME', theme },
        '*'
      );
    }
  }, [theme, previewWindow]);

  const handleColorChange = (variable, color) => {
    setTheme(prev => ({ ...prev, [variable]: color }));
  };

  const saveTheme = async () => {
    const themeRef = ref(db, `tenantRegistry/${tenantId}/config/theme`);
    await update(themeRef, theme);
    alert('Theme saved successfully!');
  };

  const resetTheme = () => {
    if (confirm('Reset to default theme?')) {
      setTheme({}); // Empty object means use defaults
    }
  };

  const exportTheme = () => {
    const json = JSON.stringify(theme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenantId}-theme.json`;
    a.click();
  };

  return (
    <div className="theme-editor">
      <div className="sidebar">
        <h2>Theme Editor</h2>

        <section>
          <h3>Brand Colors</h3>
          <ColorControl
            label="Primary"
            variable="--brand-primary"
            value={theme['--brand-primary'] || '#6366f1'}
            onChange={(color) => handleColorChange('--brand-primary', color)}
          />
          <ColorControl
            label="Secondary"
            variable="--brand-secondary"
            value={theme['--brand-secondary'] || '#8b5cf6'}
            onChange={(color) => handleColorChange('--brand-secondary', color)}
          />
        </section>

        {/* More sections... */}

        <div className="actions">
          <button onClick={saveTheme}>Save Theme</button>
          <button onClick={resetTheme}>Reset to Default</button>
          <button onClick={exportTheme}>Export JSON</button>
        </div>
      </div>

      <div className="preview">
        <iframe
          ref={(el) => setPreviewWindow(el?.contentWindow)}
          src={`https://drivas-fleet.vercel.app?tenant=${tenantId}&preview=true`}
          title="Theme Preview"
        />
      </div>
    </div>
  );
}

function ColorControl({ label, variable, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="color-control">
      <label>{label}</label>
      <div
        className="color-swatch"
        style={{ backgroundColor: value }}
        onClick={() => setShowPicker(!showPicker)}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showPicker && (
        <div className="color-picker-popover">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
```

**Calculator Preview Mode:**

Update calculator `App.jsx` to receive theme updates:

```javascript
useEffect(() => {
  // Listen for theme updates from control board
  const handleMessage = (event) => {
    if (event.data.type === 'UPDATE_THEME') {
      const themeVars = event.data.theme;
      Object.entries(themeVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## Branding Management

### Branding Editor UI

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  Branding - bergen-taxi                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Company Information                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Company Name:   [Bergen Taxi____________]             │  │
│  │ Logo:           [Current Logo]  [Upload New]          │  │
│  │ Favicon:        [Current Favicon] [Upload New]        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Page Metadata                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Page Title (NO): [Bergen Taxi Kalkulator_______]      │  │
│  │ Page Title (EN): [Bergen Taxi Calculator_______]      │  │
│  │ Description (NO): [Prisestimat for...]              │  │
│  │ Description (EN): [Price estimate for...]           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Contact Information                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Phone:    [+47 55 99 70 00___]                        │  │
│  │ Email:    [post@bergentaxi.no_]                       │  │
│  │ Website:  [https://bergentaxi.no]                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Regional Settings                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Default Address: [Torgallmenningen, Bergen_]          │  │
│  │ Map Center:      [Lat: 60.3913] [Lng: 5.3221]        │  │
│  │ Country Code:    [NO ▼]                               │  │
│  │ Default Language: [Norwegian ▼]                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Cancel] [Save Changes]                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Logo Upload Implementation

**Firebase Storage Structure:**

```
/tenants/
├── bergen-taxi/
│   ├── logo.png         (main logo)
│   ├── logo@2x.png      (high-DPI version)
│   ├── logo-dark.png    (dark mode variant)
│   ├── favicon.ico
│   └── favicon.png
└── voss-taxi/
    └── ...
```

**Upload Component:**

```javascript
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, update } from 'firebase/database';
import { storage, db } from '../firebase';

async function uploadLogo(tenantId, file) {
  // 1. Upload to Firebase Storage
  const logoRef = storageRef(storage, `tenants/${tenantId}/logo.png`);
  await uploadBytes(logoRef, file);

  // 2. Get download URL
  const logoURL = await getDownloadURL(logoRef);

  // 3. Update tenant config
  const configRef = ref(db, `tenantRegistry/${tenantId}/config/branding`);
  await update(configRef, {
    logo: logoURL,
    logoAlt: `${tenantId} logo`
  });

  return logoURL;
}

function LogoUpload({ tenantId, currentLogo }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogo);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await uploadLogo(tenantId, file);
      setPreview(url);
      alert('Logo uploaded successfully!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="logo-upload">
      <label>Logo</label>
      {preview && (
        <img
          src={preview}
          alt="Logo preview"
          className="logo-preview"
          style={{ maxWidth: 200, maxHeight: 100 }}
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up control board infrastructure and authentication

**Tasks:**
- [ ] Create control board React app (Vite + React 18)
- [ ] Set up Firebase Auth (email/password)
- [ ] Implement AuthContext and protected routes
- [ ] Create login page
- [ ] Set up Firebase Security Rules for control board access
- [ ] Create basic dashboard layout (sidebar, header, main content)
- [ ] Add user profile dropdown (logout, settings)

**Deliverables:**
- Working control board app with authentication
- Authenticated users can log in and see dashboard
- Firebase Security Rules prevent unauthorized access

### Phase 2: Tenant Management (Weeks 3-4)

**Goal:** CRUD operations for tenant configs

**Tasks:**
- [ ] Tenant list view (table with all tenants)
- [ ] Tenant detail view (read-only display of config)
- [ ] Tenant create form
- [ ] Tenant edit form (branding, contact, defaults)
- [ ] Tenant delete with confirmation
- [ ] Tenant activation toggle
- [ ] Domain management (allowed domains list)
- [ ] Domain map editor (custom domain → tenant ID mapping)

**Deliverables:**
- Full tenant CRUD functionality
- Control board can create, edit, deactivate tenants
- Changes sync instantly to calculator apps

### Phase 3: Theme & Branding (Weeks 5-6)

**Goal:** Visual customization tools

**Tasks:**
- [ ] Theme editor with color pickers (all 60+ CSS variables)
- [ ] Theme preset buttons (Light, Dark, High Contrast)
- [ ] Live preview iframe with PostMessage sync
- [ ] Logo upload to Firebase Storage
- [ ] Favicon upload
- [ ] Export/import theme JSON
- [ ] Copy theme from another tenant
- [ ] Accessibility contrast checker

**Deliverables:**
- Theme editor with real-time preview
- Logo/favicon upload working
- Themes save to Firebase and apply to calculator

### Phase 4: Analytics Infrastructure (Weeks 7-8)

**Goal:** Data collection and basic dashboard

**Tasks:**
- [ ] Add analytics tracking to calculator app
- [ ] Implement calculation event logging
- [ ] Implement session tracking
- [ ] Create daily aggregation Cloud Function
- [ ] Build analytics dashboard (overview KPIs)
- [ ] Line chart: Calculations over time
- [ ] Pie chart: Vehicle group distribution
- [ ] Bar chart: Tariff period usage

**Deliverables:**
- Calculator logs all calculations to Firebase
- Analytics dashboard shows basic metrics
- Daily statistics pre-aggregated

### Phase 5: Advanced Analytics (Weeks 9-10)

**Goal:** Deep insights and reporting

**Tasks:**
- [ ] Popular routes table with export CSV
- [ ] Geographic heat map (start/dest locations)
- [ ] Time series charts (hourly, daily, monthly trends)
- [ ] Tenant comparison view (Super Admin only)
- [ ] Device and browser breakdowns
- [ ] Referrer tracking and analysis
- [ ] Custom date range filters
- [ ] Export reports as PDF

**Deliverables:**
- Comprehensive analytics with multiple visualizations
- Route analysis and geographic insights
- Exportable reports

### Phase 6: User Management & Permissions (Weeks 11-12)

**Goal:** Role-based access control

**Tasks:**
- [ ] User list view (all admin users)
- [ ] Add user form (invite via email)
- [ ] User edit modal (role, tenant scope)
- [ ] Role definitions in database
- [ ] Permission checking in UI (hide buttons, routes)
- [ ] Permission checking in Firebase Security Rules
- [ ] Audit log implementation (track all admin actions)
- [ ] Audit log viewer with filters

**Deliverables:**
- Multi-user support with role-based permissions
- Super Admin, Tenant Admin, Analyst, Support roles
- Full audit trail of admin actions

### Phase 7: Polish & Production (Weeks 13-14)

**Goal:** Production readiness and deployment

**Tasks:**
- [ ] Error handling and user feedback (toasts, modals)
- [ ] Loading states and skeletons
- [ ] Form validation (all inputs)
- [ ] Responsive mobile layout (mobile-first)
- [ ] Accessibility audit (ARIA labels, keyboard nav)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Security audit (Firebase Rules, input sanitization)
- [ ] Write comprehensive documentation
- [ ] Deploy to production (Vercel)
- [ ] Set up monitoring (errors, performance)

**Deliverables:**
- Production-ready control board
- Mobile responsive
- Comprehensive error handling
- Deployed and accessible

---

## Database Schema Extensions

### New Firebase Paths

```
/
├── tenantRegistry/              (existing, enhanced)
│   ├── {tenantId}/
│   │   └── config/              (existing tenant config)
│   └── _index/                  (NEW: list of all tenant IDs)
│       ├── voss-taxi: true
│       └── bergen-taxi: true
│
├── tenants/                     (existing)
│   └── {tenantId}/
│       └── tariffs/
│           └── base14/
│
├── domainMap/                   (existing)
│   └── {encoded-domain}/        (maps to tenantId)
│
├── analytics/                   (NEW: all analytics data)
│   └── {tenantId}/
│       ├── calculations/
│       │   └── {calculationId}/
│       ├── sessions/
│       │   └── {sessionId}/
│       └── aggregated/
│           └── daily/
│               └── {date}/
│
├── users/                       (NEW: admin users)
│   └── {userId}/
│       ├── email
│       ├── displayName
│       ├── role
│       ├── tenantScope[]
│       └── ...
│
├── roles/                       (NEW: role definitions)
│   └── {roleId}/
│       ├── name
│       ├── description
│       └── permissions[]
│
└── auditLog/                    (NEW: admin action log)
    └── {logId}/
        ├── timestamp
        ├── userId
        ├── action
        ├── tenantId
        └── changes
```

---

## API Endpoints

### REST API (Firebase Cloud Functions - Optional)

For complex operations that can't be done directly from client:

**Endpoints:**

```
POST   /api/tenants                    Create tenant
GET    /api/tenants                    List all tenants
GET    /api/tenants/:id                Get tenant by ID
PATCH  /api/tenants/:id                Update tenant
DELETE /api/tenants/:id                Delete tenant

POST   /api/tenants/:id/clone          Clone tenant config
POST   /api/tenants/:id/logo           Upload logo
POST   /api/tenants/:id/favicon        Upload favicon

GET    /api/analytics/:tenantId/summary          Get aggregated stats
GET    /api/analytics/:tenantId/calculations     List calculations
GET    /api/analytics/:tenantId/routes           Popular routes
GET    /api/analytics/:tenantId/export           Export CSV

POST   /api/users                      Create user (invite)
GET    /api/users                      List users
PATCH  /api/users/:id                  Update user
DELETE /api/users/:id                  Delete user

GET    /api/audit                      List audit log entries
```

**Note:** Most operations can be done directly via Firebase SDK. Cloud Functions only needed for:
- Complex aggregations (daily stats rollup)
- Email invitations for new users
- Bulk operations (import tenants from CSV)
- Scheduled tasks (cleanup old analytics data)

---

## Security Considerations

### Firebase Security Rules

**Realtime Database Rules:**

```json
{
  "rules": {
    "tenantRegistry": {
      ".read": "auth != null",
      "$tenantId": {
        "config": {
          ".write": "auth != null && (
            root.child('users').child(auth.uid).child('role').val() === 'super-admin' ||
            (root.child('users').child(auth.uid).child('tenantScope').hasChild($tenantId) &&
             root.child('users').child(auth.uid).child('permissions').hasChild('tenant.update'))
          )"
        }
      }
    },

    "analytics": {
      ".read": "auth != null",
      "$tenantId": {
        "calculations": {
          ".write": "true"
        },
        "sessions": {
          ".write": "true"
        },
        "aggregated": {
          ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'super-admin'"
        }
      }
    },

    "users": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'super-admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'super-admin'"
    },

    "auditLog": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

**Key Points:**
- All control board operations require authentication
- Tenant updates check user role and tenant scope
- Analytics calculations/sessions are publicly writable (from calculator)
- Aggregated analytics only writable by super-admin (via Cloud Function)
- User management only accessible to super-admins
- Audit log readable by all admins, writable by all (for logging)

### Input Validation

**Control Board:**
- Validate all user inputs (email format, URL format, hex colors)
- Sanitize text inputs (prevent XSS)
- Limit file uploads (2MB max, image types only)
- Rate limiting on sensitive operations (user creation)

**Calculator:**
- Validate analytics data before sending (prevent spam)
- Anonymize IP addresses (last octet to .xxx)
- Don't send PII (no names, emails, phone numbers)
- Use session IDs instead of user identifiers

---

## Testing Strategy

### Unit Tests

**Control Board:**
- Auth context and permission checks
- Theme color validation
- Logo upload validation
- Analytics data aggregation logic

**Calculator:**
- Analytics data formatting
- Session ID generation
- Device type detection

### Integration Tests

- Create tenant → verify calculator loads config
- Update theme → verify calculator applies theme in real-time
- Track calculation → verify appears in analytics dashboard
- Add user → verify can log in with correct permissions

### E2E Tests (Playwright/Cypress)

**Critical Flows:**
1. Admin logs in → creates new tenant → tenant appears in list
2. Admin edits tenant branding → calculator updates in real-time
3. Admin uploads logo → logo appears in calculator
4. User calculates trip in calculator → appears in analytics dashboard
5. Admin changes theme → preview updates in real-time

### Performance Tests

- Analytics dashboard with 10,000+ calculations
- Theme editor with real-time preview updates
- Concurrent admin users editing different tenants
- Calculator with high traffic (100+ calculations/min)

---

## Summary

This integration plan provides a comprehensive roadmap for building the Drivas Fleet Control Board with:

✅ **Statistics & Analytics** - Usage tracking, popular routes, tenant comparisons
✅ **User Management** - Role-based access, permissions, audit logging
✅ **Theme Control** - Visual editor with live preview, presets, import/export
✅ **Branding Management** - Logo upload, contact info, regional settings
✅ **Phased Implementation** - 14-week rollout plan with clear milestones
✅ **Security** - Firebase Auth, role-based permissions, Security Rules
✅ **Scalability** - Handles 100+ tenants, pre-aggregated analytics

**Next Steps:**
1. Review and approve this plan
2. Set up development environment for control board
3. Begin Phase 1: Foundation (authentication, basic dashboard)
4. Iterate and gather feedback

**Estimated Timeline:** 14 weeks (3.5 months)
**Team Size:** 1-2 developers
**Tech Stack:** React 18, Firebase (Auth, Database, Storage, Functions), Chart.js, TailwindCSS

---

**Questions or clarifications?** Review the detailed sections above or consult `CONTROL_BOARD_INTEGRATION.md` for Firebase schema specifics.
