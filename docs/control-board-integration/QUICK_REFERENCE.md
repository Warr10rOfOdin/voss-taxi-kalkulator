# Control Board Integration - Quick Reference

> Fast lookup guide for developers implementing the control board

**Last Updated:** 2026-03-08

---

## 🎯 Project Goal

Build a web-based **Control Board** to manage the Drivas Fleet taxi calculator platform with:

- 📊 **Statistics & Analytics** - Track usage, routes, pricing trends
- 👥 **User Management** - Role-based admin access control
- 🎨 **Theme Control** - Live theme editor with color pickers
- 🏷️ **Branding** - Logo upload, company info, feature flags

---

## 📁 Documentation Structure

```
docs/control-board-integration/
├── CONTROL_BOARD_INTEGRATION.md    ← Firebase schema, API spec (841 lines)
├── INTEGRATION_PLAN.md             ← Full implementation plan (900+ lines)
└── QUICK_REFERENCE.md              ← This file (quick lookup)
```

**Read First:** `CONTROL_BOARD_INTEGRATION.md` sections 1-3 (overview, schema, examples)

---

## 🔥 Firebase Paths (Quick Lookup)

### Existing (Already Working)

| Path | Purpose | Access |
|------|---------|--------|
| `/tenantRegistry/{id}/config` | Tenant configuration | Read: All, Write: Admins |
| `/tenants/{id}/tariffs/base14` | Active tariff rates | Read: All, Write: Admins |
| `/domainMap/{encoded-domain}` | Domain → tenant ID mapping | Read: All, Write: Admins |

### New (Need to Implement)

| Path | Purpose | Size Estimate |
|------|---------|---------------|
| `/analytics/{tenantId}/calculations/{id}` | Every price calculation | 100-1000/day |
| `/analytics/{tenantId}/sessions/{id}` | User sessions | 50-500/day |
| `/analytics/{tenantId}/aggregated/daily/{date}` | Pre-rolled stats | 1/day |
| `/users/{userId}` | Admin user profiles | 5-50 total |
| `/roles/{roleId}` | Role definitions | 4 (fixed) |
| `/auditLog/{logId}` | Admin action history | 10-100/day |

---

## 🚀 Implementation Priority

### Phase 1: MVP (Weeks 1-4) ⭐ START HERE

1. **Authentication (Week 1)**
   ```javascript
   // Set up Firebase Auth
   - Email/password login
   - Protected routes
   - AuthContext with user role
   ```

2. **Tenant CRUD (Weeks 2-3)**
   ```javascript
   // Basic tenant management
   - List all tenants (table view)
   - Create new tenant (form)
   - Edit tenant branding (form)
   - Activate/deactivate toggle
   ```

3. **Theme Editor (Week 4)**
   ```javascript
   // Visual theme customization
   - Color picker for 10 key variables
   - Live preview iframe
   - Save to Firebase
   ```

   **Deliverable:** Working control board where admins can create tenants and customize themes

### Phase 2: Analytics (Weeks 5-6)

4. **Data Collection (Week 5)**
   ```javascript
   // Add to calculator App.jsx
   import { trackCalculation } from './utils/analytics';

   // After calculation
   await trackCalculation(tenantId, tripData, pricingData);
   ```

5. **Analytics Dashboard (Week 6)**
   ```javascript
   // Basic charts
   - KPI cards (calculations today, avg price)
   - Line chart (calculations over time)
   - Pie chart (vehicle groups)
   ```

   **Deliverable:** See usage statistics in real-time

### Phase 3: Advanced Features (Weeks 7-10)

6. **User Management** (Week 7-8)
7. **Advanced Analytics** (Week 9-10)

---

## 💻 Code Examples

### 1. Add Analytics Tracking to Calculator

**File:** `src/utils/analytics.js` (NEW)

```javascript
import { ref, push } from 'firebase/database';
import { db } from '../firebase';

export async function trackCalculation(tenantId, tripData, pricingData) {
  const analyticsData = {
    calculationId: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    timestamp: Date.now(),
    sessionId: getOrCreateSessionId(),
    trip: {
      startAddress: tripData.startAddress,
      destAddress: tripData.destAddress,
      distanceKm: tripData.distanceKm,
      durationMin: tripData.durationMin,
      vehicleGroup: tripData.vehicleGroup
    },
    pricing: {
      estimatedPrice: pricingData.total,
      tariffPeriod: pricingData.dominantPeriod
    }
  };

  try {
    await push(ref(db, `analytics/${tenantId}/calculations`), analyticsData);
  } catch (error) {
    console.error('[Analytics] Failed to track:', error);
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
```

**File:** `src/App.jsx` (MODIFY)

```javascript
// Add at top
import { trackCalculation } from './utils/analytics';

// Inside App component, after price calculation
useEffect(() => {
  if (estimatedPrice && tenant?.id) {
    trackCalculation(
      tenant.id,
      {
        startAddress,
        destAddress,
        viaAddresses,
        distanceKm,
        durationMin,
        vehicleGroup,
        tripDate,
        tripTime
      },
      {
        total: estimatedPrice.total,
        dominantPeriod: estimatedPrice.periods[0] // Adjust based on your structure
      }
    );
  }
}, [estimatedPrice, tenant?.id]);
```

### 2. Control Board Authentication

**File:** `control-board/src/auth/AuthContext.jsx` (NEW)

```javascript
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
    // TODO: Check userProfile.permissions array
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, login, logout, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

**File:** `control-board/src/components/ProtectedRoute.jsx` (NEW)

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute({ children, permission }) {
  const { userProfile, hasPermission } = useAuth();

  if (!userProfile) {
    return <Navigate to="/login" />;
  }

  if (permission && !hasPermission(permission)) {
    return <div className="error">Access Denied: Missing permission {permission}</div>;
  }

  return children;
}
```

### 3. Tenant List Component

**File:** `control-board/src/components/TenantList.jsx` (NEW)

```javascript
import { ref, query, orderByChild } from 'firebase/database';
import { useListVals } from 'react-firebase-hooks/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export function TenantList() {
  const [tenants, loading, error] = useListVals(
    query(ref(db, 'tenantRegistry'), orderByChild('name'))
  );

  if (loading) return <div>Loading tenants...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="tenant-list">
      <h1>Tenants</h1>
      <Link to="/tenants/new" className="btn-primary">
        + New Tenant
      </Link>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td>{tenant.id}</td>
              <td>{tenant.name}</td>
              <td>
                <span className={tenant.active ? 'badge-success' : 'badge-inactive'}>
                  {tenant.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/tenants/${tenant.id}/edit`}>Edit</Link>
                {' | '}
                <Link to={`/tenants/${tenant.id}/theme`}>Theme</Link>
                {' | '}
                <Link to={`/tenants/${tenant.id}/analytics`}>Analytics</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Theme Editor Component (Simplified)

**File:** `control-board/src/components/ThemeEditor.jsx` (NEW)

```javascript
import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import { HexColorPicker } from 'react-colorful'; // npm install react-colorful

export function ThemeEditor({ tenantId, initialTheme = {} }) {
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);

  const handleColorChange = (variable, color) => {
    setTheme(prev => ({ ...prev, [variable]: color }));
  };

  const saveTheme = async () => {
    setSaving(true);
    try {
      const themeRef = ref(db, `tenantRegistry/${tenantId}/config/theme`);
      await update(themeRef, theme);
      alert('Theme saved successfully!');
    } catch (error) {
      alert('Failed to save theme: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-editor">
      <h2>Theme Editor</h2>

      <div className="color-controls">
        <ColorInput
          label="Primary Color"
          variable="--brand-primary"
          value={theme['--brand-primary'] || '#6366f1'}
          onChange={(color) => handleColorChange('--brand-primary', color)}
        />

        <ColorInput
          label="Secondary Color"
          variable="--brand-secondary"
          value={theme['--brand-secondary'] || '#8b5cf6'}
          onChange={(color) => handleColorChange('--brand-secondary', color)}
        />

        {/* Add more color inputs for other variables */}
      </div>

      <div className="actions">
        <button onClick={saveTheme} disabled={saving}>
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
        <button onClick={() => setTheme({})}>Reset to Default</button>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="color-input">
      <label>{label}</label>
      <div className="color-control">
        <div
          className="color-swatch"
          style={{ backgroundColor: value, width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {showPicker && (
        <div className="color-picker-popover">
          <HexColorPicker color={value} onChange={onChange} />
          <button onClick={() => setShowPicker(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 Firebase Security Rules (Essential)

**File:** Firebase Console → Realtime Database → Rules

```json
{
  "rules": {
    "tenantRegistry": {
      ".read": "auth != null",
      "$tenantId": {
        "config": {
          ".write": "auth != null && (
            root.child('users').child(auth.uid).child('role').val() === 'super-admin' ||
            root.child('users').child(auth.uid).child('tenantScope').hasChild($tenantId)
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
        }
      }
    },

    "users": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'super-admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'super-admin'"
    }
  }
}
```

**Key Points:**
- ✅ Tenant configs: Authenticated read, role-based write
- ✅ Analytics: Authenticated read, public write (from calculator)
- ✅ Users: Super-admin only

---

## 📊 Key Metrics to Track

### Calculator Analytics

**Automatically tracked:**
- ✅ Every price calculation (start, dest, distance, duration, price)
- ✅ Session duration
- ✅ Device type (mobile, tablet, desktop)
- ✅ Language preference
- ✅ Popular routes (aggregated daily)

**KPIs for Dashboard:**
- Calculations per day/week/month
- Average trip distance/duration/price
- Most popular routes (top 10)
- Vehicle group distribution
- Tariff period distribution (day vs evening vs weekend)
- Bounce rate (sessions without calculation)

### Admin Dashboard

**Tenant-level metrics:**
- Total calculations (lifetime, this month, this week)
- Active vs inactive tenants
- Top performing tenants (most calculations)
- Growth trends (week-over-week, month-over-month)

---

## 🎨 Theme Variables (Top 10 Most Important)

| Variable | Purpose | Default (Dark) |
|----------|---------|----------------|
| `--brand-primary` | Primary brand color (buttons, links) | `#6366f1` |
| `--brand-secondary` | Secondary brand color (accents) | `#8b5cf6` |
| `--bg-body-1` | Main page background | `#0f172a` |
| `--bg-card` | Card background (glassmorphism) | `rgba(255,255,255,0.05)` |
| `--text-primary` | Main text color | `#f1f5f9` |
| `--text-secondary` | Secondary text (labels) | `#cbd5e1` |
| `--border-card` | Card borders | `rgba(255,255,255,0.1)` |
| `--shadow-card` | Card shadows | `0 8px 32px rgba(0,0,0,0.3)` |
| `--border-radius-card` | Card corner radius | `24px` |
| `--font-size-base` | Base font size | `16px` |

**See:** `CONTROL_BOARD_INTEGRATION.md` section "Complete CSS Variables Reference" for all 60+ variables

---

## 🧪 Testing Checklist

### Before Launch

- [ ] **Auth:** Admin can log in and log out
- [ ] **Tenants:** Create, edit, deactivate tenant
- [ ] **Theme:** Change color → calculator updates in real-time
- [ ] **Logo:** Upload logo → appears in calculator
- [ ] **Analytics:** Calculate trip → appears in dashboard within 5 seconds
- [ ] **Permissions:** Non-admin cannot access control board
- [ ] **Real-time:** Update tenant config → calculator updates without refresh
- [ ] **Mobile:** Control board works on phone/tablet

### Security

- [ ] **Firebase Rules:** Non-authenticated users cannot read sensitive data
- [ ] **Role checks:** Tenant Admin cannot access other tenants
- [ ] **Audit log:** All admin actions logged with timestamp, user, changes
- [ ] **Input validation:** Logo upload limited to 2MB, images only
- [ ] **XSS prevention:** Text inputs sanitized

---

## 📦 NPM Packages Needed

### Control Board

```bash
npm install react react-dom react-router-dom
npm install firebase
npm install react-firebase-hooks
npm install react-colorful  # Color pickers
npm install chart.js react-chartjs-2  # Charts
npm install date-fns  # Date formatting
```

### Optional but Recommended

```bash
npm install @headlessui/react  # Accessible modals, dropdowns
npm install tailwindcss  # Rapid UI development
npm install react-hot-toast  # Notification toasts
npm install react-hook-form  # Form validation
```

---

## 🚀 Getting Started (Developer Onboarding)

### Day 1: Environment Setup

```bash
# 1. Clone repo
git clone https://github.com/your-org/control-board.git
cd control-board

# 2. Install dependencies
npm install

# 3. Set up Firebase credentials
cp .env.example .env
# Add Firebase config to .env

# 4. Run dev server
npm run dev
```

### Day 2-3: Read Documentation

1. Read `CONTROL_BOARD_INTEGRATION.md` (sections 1-5)
2. Review existing calculator codebase
   - `src/context/TenantContext.jsx` (how tenants are loaded)
   - `src/firebase.js` (Firebase SDK setup)
   - `src/config/tenantSchema.js` (tenant config structure)

### Day 4-5: Build Login Page

1. Create `control-board/src/pages/Login.jsx`
2. Implement email/password login
3. Redirect to dashboard on success

### Week 2: Tenant Management

1. List tenants from Firebase
2. Create new tenant form
3. Edit tenant branding form

---

## 🆘 Common Issues & Solutions

### Issue: Calculator doesn't update when I change theme in control board

**Solution:** Check that:
1. Tenant config has real-time subscription in `TenantContext.jsx`
2. Theme variables are applied to `<html>` element in `App.jsx`
3. Firebase Security Rules allow reading tenant config

### Issue: Analytics data not appearing in dashboard

**Solution:** Check that:
1. Calculator is calling `trackCalculation()` after each calculation
2. Firebase Security Rules allow writing to `/analytics/{tenantId}/calculations`
3. Dashboard is reading from correct Firebase path

### Issue: Permission denied when admin tries to edit tenant

**Solution:** Check that:
1. User profile exists in `/users/{userId}` with correct role
2. Firebase Security Rules check user role correctly
3. User is authenticated (check `currentUser` in AuthContext)

---

## 📞 Support & Questions

**Documentation:**
- Full integration spec: `CONTROL_BOARD_INTEGRATION.md`
- Implementation plan: `INTEGRATION_PLAN.md`
- This quick reference: `QUICK_REFERENCE.md`

**Codebase Reference:**
- Calculator app: `/src` (existing React app)
- Tenant schema: `/src/config/tenantSchema.js`
- Firebase setup: `/src/firebase.js`

**External Resources:**
- Firebase Realtime Database: https://firebase.google.com/docs/database
- Firebase Auth: https://firebase.google.com/docs/auth
- React Firebase Hooks: https://github.com/CSFrequency/react-firebase-hooks

---

**Last Updated:** 2026-03-08
**Status:** Ready for Development
**Estimated Timeline:** 8-14 weeks (depending on team size)
