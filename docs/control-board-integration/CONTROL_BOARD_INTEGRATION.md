# Control Board Integration Guide

> Technical specification for managing the Voss Taxi Kalkulator from an external control board application.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  CONTROL BOARD                       │
│                                                     │
│  Manage Tenants  │  Set Themes  │  Edit Tariffs     │
│  Feature Flags   │  Branding    │  Domain Config    │
└────────┬─────────┴──────┬───────┴──────┬────────────┘
         │                │              │
         │   Firebase Realtime Database  │
         │                │              │
         ▼                ▼              ▼
┌──────────────────────────────────────────────────────┐
│  /tenantRegistry/{tenantId}/config    ← tenant config│
│  /tenants/{tenantId}/tariffs/base14   ← tariff rates │
│  /domainMap/{encoded-domain}          ← domain lookup│
└────────┬─────────┴──────┬───────┴──────┬─────────────┘
         │                │              │
         │     reads on page load        │
         │     subscribes to changes     │
         │                │              │
         ▼                ▼              ▼
┌──────────────────────────────────────────────────────┐
│              TAXI CALCULATOR APP                     │
│                                                     │
│  TenantContext  │  useTariffData  │  applyTheme     │
│  Resolves tenant, loads config, renders calculator   │
└──────────────────────────────────────────────────────┘
```

### How it works today

The calculator currently loads tenant configs from a **hardcoded JavaScript registry** (`src/config/tenantResolver.js`). To make it controllable from your dashboard, the calculator needs to load configs from **Firebase** instead. The tariff system already reads from Firebase with real-time sync, so we extend that pattern to the full tenant config.

### What changes are needed

The calculator needs one code change: modify `tenantResolver.js` to fetch from Firebase instead of the local registry. After that, your control board only needs to write JSON to Firebase paths.

---

## Firebase Database Schema

Your control board writes to these paths. The calculator reads them.

### Path: `/tenantRegistry/{tenantId}/config`

The full tenant configuration object. This is the single source of truth for everything about a tenant.

```
/tenantRegistry/
├── voss-taxi/
│   └── config/               ← Full tenant config (see schema below)
├── bergen-taxi/
│   └── config/
├── oslo-taxi/
│   └── config/
└── _index/                   ← Optional: list of all tenant IDs
    ├── voss-taxi: true
    ├── bergen-taxi: true
    └── oslo-taxi: true
```

### Path: `/tenants/{tenantId}/tariffs/base14`

The active tariff rates for a tenant. Stored separately from config because it changes more frequently and the calculator already has real-time subscription on this path.

```
/tenants/
├── voss-taxi/
│   └── tariffs/
│       └── base14/
│           ├── start: 97
│           ├── km0_10: 11.14
│           ├── kmOver10: 21.23
│           ├── min: 8.42
│           ├── lastUpdated: 1708617600000
│           └── version: 1
├── bergen-taxi/
│   └── tariffs/
│       └── base14/
│           ├── start: 105
│           ├── km0_10: 12.50
│           ├── kmOver10: 23.00
│           ├── min: 9.10
│           ├── lastUpdated: 1708617600000
│           └── version: 1
```

**Note:** The default tenant (`voss-taxi`) uses the legacy path `/tariffs/base14` for backward compatibility. All other tenants use `/tenants/{tenantId}/tariffs/base14`.

### Path: `/domainMap/{encoded-domain}`

Maps custom domains to tenant IDs. The domain key must be encoded (replace `.` with `_dot_` for Firebase key compatibility).

```
/domainMap/
├── vosstaksi_dot_no: "voss-taxi"
├── www_dot_vosstaksi_dot_no: "voss-taxi"
├── bergentaxi_dot_no: "bergen-taxi"
└── www_dot_bergentaxi_dot_no: "bergen-taxi"
```

---

## Complete Tenant Config Schema

This is the full JSON object your control board writes to `/tenantRegistry/{tenantId}/config`.

Every field is optional except `id`. The calculator deep-merges with defaults, so you only need to send fields you want to override.

```json
{
  "id": "bergen-taxi",
  "name": "Bergen Taxi",
  "slug": "bergen-taxi",
  "active": true,
  "createdAt": 1708617600000,
  "updatedAt": 1708617600000,

  "branding": {
    "companyName": "Bergen Taxi",
    "logo": "https://firebasestorage.googleapis.com/.../logo.png",
    "logoAlt": "Bergen Taxi",
    "favicon": "https://firebasestorage.googleapis.com/.../favicon.png",
    "pageTitle": {
      "no": "Bergen Taxi Kalkulator",
      "en": "Bergen Taxi Calculator"
    },
    "pageDescription": {
      "no": "Prisestimat for taxiturer i Bergen.",
      "en": "Price estimate for taxi trips in Bergen."
    },
    "copyrightHolder": "Bergen Taxi AS",
    "madeBy": {
      "no": "Laget av Toni Kolve.",
      "en": "Made by Toni Kolve."
    }
  },

  "theme": {
    "--brand-primary": "#0066cc",
    "--brand-secondary": "#004999",
    "--bg-body-1": "#f0f4f8",
    "--bg-card": "rgba(255, 255, 255, 0.95)",
    "--text-primary": "#1e293b"
  },

  "defaults": {
    "startAddress": "Torgallmenningen, Bergen",
    "lang": "no",
    "mapsCountry": "no",
    "mapsRegion": "NO",
    "mapCenter": { "lat": 60.3913, "lng": 5.3221 }
  },

  "contact": {
    "phone": "+47 55 99 70 00",
    "email": "post@bergentaxi.no",
    "website": "https://bergentaxi.no"
  },

  "allowedDomains": [
    "bergentaxi.no",
    "www.bergentaxi.no",
    "*.vercel.app"
  ],

  "features": {
    "showLanguageSwitcher": true,
    "showPrintButton": true,
    "showTariffEditor": false,
    "showMap": true,
    "showTariffTable": true
  }
}
```

### Field Reference

#### Root

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique tenant identifier. Kebab-case. Used as Firebase path key. |
| `name` | string | No | Human-readable name for your dashboard. |
| `slug` | string | No | URL-safe identifier (usually same as `id`). |
| `active` | boolean | No | Set `false` to disable a tenant without deleting it. |
| `createdAt` | number | No | Unix timestamp (ms). Set by your dashboard on creation. |
| `updatedAt` | number | No | Unix timestamp (ms). Set by your dashboard on every save. |

#### `branding`

Controls what the end user sees — company name, logo, page title, etc.

| Field | Type | Default | What it controls |
|---|---|---|---|
| `companyName` | string | `"Taxi"` | Header title, PDF header, footer, translations (replaces `{{companyName}}`) |
| `logo` | string | Voss Taxi logo | Logo image URL in the header and PDF |
| `logoAlt` | string | `"Taxi"` | Alt text on the logo `<img>` |
| `favicon` | string | Voss Taxi favicon | Browser tab icon |
| `pageTitle.no` | string | `"Taxi Kalkulator"` | `<title>` tag (Norwegian) |
| `pageTitle.en` | string | `"Taxi Calculator"` | `<title>` tag (English) |
| `pageDescription.no` | string | Generic | `<meta name="description">` (Norwegian) |
| `pageDescription.en` | string | Generic | `<meta name="description">` (English) |
| `copyrightHolder` | string | `companyName` | PDF footer: `© 2026 {copyrightHolder}` |
| `madeBy.no` | string | `"Laget av Toni Kolve."` | PDF footer credit line (Norwegian) |
| `madeBy.en` | string | `"Made by Toni Kolve."` | PDF footer credit line (English) |

**Logo hosting:** Upload logos to Firebase Storage and use the download URL, or use any public URL. Recommended dimensions: logo 200x50px, favicon 64x64px.

#### `theme`

CSS variable overrides. Only include variables you want to change from the default dark theme. The calculator merges your overrides on top of 60+ defaults.

See the [Complete CSS Variables Reference](#complete-css-variables-reference) section below.

#### `defaults`

Regional settings that adapt the calculator to the tenant's location.

| Field | Type | Default | What it controls |
|---|---|---|---|
| `startAddress` | string | `"Hestavangen 11, Voss"` | Pre-filled start address and placeholder text |
| `lang` | string | `"no"` | Default language (`"no"` or `"en"`) |
| `mapsCountry` | string | `"no"` | Google Places autocomplete country restriction (ISO 3166-1 alpha-2, lowercase) |
| `mapsRegion` | string | `"NO"` | Google Maps region bias (ISO 3166-1 alpha-2, uppercase) |
| `mapCenter.lat` | number | `60.6280` | Default map center latitude |
| `mapCenter.lng` | number | `6.4118` | Default map center longitude |

#### `contact`

| Field | Type | Default | What it controls |
|---|---|---|---|
| `phone` | string | `""` | Available for PDF/footer display |
| `email` | string | `""` | Available for PDF/footer display |
| `website` | string | `""` | Available for PDF/footer display |

#### `allowedDomains`

Array of strings. Controls which domains can serve this tenant's calculator.

- Empty array `[]` = no restriction, any domain works
- `"bergentaxi.no"` = exact domain match
- `"*.vercel.app"` = wildcard subdomain match
- `"localhost"` is always allowed for development regardless

Also controls iframe embedding: if `allowedDomains` is empty and the calculator is loaded in an iframe, it blocks rendering.

#### `features`

Boolean flags that show/hide UI components.

| Flag | Default | What it controls |
|---|---|---|
| `showLanguageSwitcher` | `true` | NO/EN toggle buttons in the header |
| `showPrintButton` | `true` | "Print/PDF" button in the estimate card |
| `showTariffEditor` | `true` | Hamburger menu button that opens the tariff editor modal |
| `showMap` | `true` | Google Maps panel (right column). Disabling saves API costs. |
| `showTariffTable` | `true` | Tariff price matrix table below the estimate card |

---

## Tariff Data Schema

Written to `/tenants/{tenantId}/tariffs/base14` (or `/tariffs/base14` for the default tenant).

```json
{
  "start": 97,
  "km0_10": 11.14,
  "kmOver10": 21.23,
  "min": 8.42,
  "lastUpdated": 1708617600000,
  "version": 1
}
```

| Field | Type | Unit | Description |
|---|---|---|---|
| `start` | number | NOK | Start price (base fare when meter starts) |
| `km0_10` | number | NOK/km | Per-kilometer rate for the first 10 km |
| `kmOver10` | number | NOK/km | Per-kilometer rate after 10 km |
| `min` | number | NOK/min | Per-minute rate (waiting time / slow traffic) |
| `lastUpdated` | number | ms | Unix timestamp. Set by whatever writes the data. |
| `version` | number | - | Schema version. Currently `1`. |

### How tariffs are calculated

The base tariff above is for **vehicle group 1-4 seats, day period**. The calculator derives all other rates automatically:

**Vehicle group multipliers** (applied to `start`, `km0_10`, `kmOver10` — NOT to `min`):

| Group | Multiplier |
|---|---|
| 1-4 seats | 1.0x |
| 5-6 seats | 1.3x |
| 7-8 seats | 1.6x |
| 9-16 seats | 2.0x |

**Period multipliers** (applied to ALL rates including `min`):

| Period | Multiplier | When |
|---|---|---|
| Dag (Day) | 1.0x | Mon-Fri 06:00-18:00 |
| Kveld (Evening) | 1.21x | Mon-Fri 18:00-24:00 |
| Laurdag (Saturday) | 1.3x | Sat 06:00-15:00 |
| Helg/Natt (Weekend/Night) | 1.35x | Sat 15:00-Mon 06:00 |
| Hoytid (Holiday) | 1.45x | 12 Norwegian public holidays |

### Real-time sync

The calculator uses Firebase `onValue` subscription on the tariff path. When your control board writes new tariff data, every open calculator instance for that tenant updates **immediately** without page reload.

---

## Complete CSS Variables Reference

Your control board can set any of these in the `theme` object. Only include variables you want to override — everything else uses the default dark theme.

### Brand Colors

```json
{
  "--brand-primary": "#6366f1",
  "--brand-secondary": "#8b5cf6",
  "--brand-tertiary": "#3b82f6",
  "--brand-success": "#10b981",
  "--brand-success-light": "#6ee7b7",
  "--brand-danger": "#e74c3c",
  "--brand-danger-hover": "#c0392b",
  "--brand-warning": "#f59e0b",
  "--brand-via-green": "#27ae60",
  "--brand-via-green-hover": "#229954"
}
```

### Backgrounds

```json
{
  "--bg-body-1": "#0f1419",
  "--bg-body-2": "#1a1f2e",
  "--bg-body-3": "#0d1b2a",
  "--bg-body-4": "#162032",
  "--bg-body-5": "#0a1628",

  "--bg-card": "rgba(20, 25, 40, 0.95)",
  "--bg-card-end": "rgba(15, 20, 35, 0.92)",
  "--bg-card-top": "rgba(24, 30, 45, 0.97)",
  "--bg-card-top-end": "rgba(18, 24, 38, 0.95)",

  "--bg-input": "rgba(15, 20, 35, 0.7)",
  "--bg-input-focus": "rgba(20, 30, 50, 0.8)",
  "--bg-input-option": "#0d1117",

  "--bg-lang-switcher": "rgba(15, 20, 35, 0.8)",
  "--bg-btn-secondary": "rgba(30, 40, 55, 0.7)",
  "--bg-btn-secondary-hover": "rgba(40, 50, 65, 0.8)",
  "--bg-btn-outline": "rgba(20, 30, 45, 0.5)",
  "--bg-btn-outline-hover": "rgba(30, 45, 65, 0.6)",

  "--bg-breakdown-row": "rgba(20, 25, 40, 0.6)",
  "--bg-breakdown-row-end": "rgba(15, 20, 35, 0.5)",
  "--bg-breakdown-row-hover": "rgba(30, 40, 60, 0.7)",
  "--bg-breakdown-row-hover-end": "rgba(25, 35, 50, 0.6)",

  "--bg-modal": "#16213e",
  "--bg-modal-backdrop": "rgba(0, 0, 0, 0.7)",
  "--bg-map": "#1a1a2e",
  "--bg-tooltip": "#2a2a4a",
  "--bg-help-icon": "rgba(255, 255, 255, 0.2)",
  "--bg-help-icon-hover": "#4a90e2",

  "--bg-tariff-header": "#0f3460",
  "--bg-tariff-header-first": "#16213e",
  "--bg-tariff-row-label": "#1a2744",
  "--bg-tariff-cell": "#1e2d4a"
}
```

### Text Colors

```json
{
  "--text-primary": "#e8eaed",
  "--text-secondary": "#c9d1d9",
  "--text-muted": "rgba(200, 210, 220, 0.95)",
  "--text-label": "rgba(200, 210, 220, 0.95)",
  "--text-faint": "rgba(180, 190, 200, 0.95)",
  "--text-very-faint": "rgba(170, 180, 190, 0.85)",
  "--text-placeholder": "rgba(150, 160, 170, 0.6)",
  "--text-footer": "rgba(150, 160, 170, 0.8)",
  "--text-tariff-notes": "rgba(255, 255, 255, 0.75)",
  "--text-lang-btn": "rgba(200, 200, 200, 0.7)",
  "--text-tooltip": "#e0e0e0",
  "--text-map-placeholder": "rgba(255, 255, 255, 0.6)"
}
```

### Borders

```json
{
  "--border-card": "rgba(99, 102, 241, 0.15)",
  "--border-card-hover": "rgba(99, 102, 241, 0.25)",
  "--border-card-top": "rgba(99, 102, 241, 0.2)",
  "--border-input": "rgba(99, 102, 241, 0.15)",
  "--border-input-focus": "rgba(99, 102, 241, 0.4)",
  "--border-row": "rgba(255, 255, 255, 0.1)",
  "--border-row-faint": "rgba(255, 255, 255, 0.05)",
  "--border-tariff": "#2a2a4a",
  "--border-map-dashed": "rgba(255, 255, 255, 0.2)",
  "--border-map-loading": "#3a3a5c"
}
```

### Typography

```json
{
  "--font-family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  "--font-size-h1": "1.75rem",
  "--font-size-card-title": "1.2rem",
  "--font-size-body": "1rem",
  "--font-size-small": "0.9rem",
  "--font-size-tiny": "0.85rem",
  "--font-size-price": "2.5rem"
}
```

### Border Radius

```json
{
  "--radius-card": "16px",
  "--radius-btn": "14px",
  "--radius-input": "10px",
  "--radius-lang-switcher": "12px",
  "--radius-modal": "12px",
  "--radius-price-box": "12px",
  "--radius-map": "8px"
}
```

### Shadows & Glassmorphism

```json
{
  "--shadow-card": "0 8px 32px rgba(0, 0, 0, 0.5)",
  "--shadow-card-hover": "0 12px 48px rgba(0, 0, 0, 0.6)",
  "--shadow-input": "0 4px 15px rgba(0, 0, 0, 0.3)",
  "--shadow-btn": "0 4px 15px rgba(0, 0, 0, 0.2)",
  "--shadow-btn-hover": "0 8px 25px rgba(0, 0, 0, 0.3)",
  "--blur-card": "20px",
  "--blur-card-top": "25px",
  "--blur-input": "10px"
}
```

### Animations

```json
{
  "--animation-gradient-duration": "15s",
  "--animation-fade-duration": "0.6s",
  "--transition-speed": "0.3s"
}
```

### Quick theme presets

**Light theme** — override these for a clean light look:

```json
{
  "--bg-body-1": "#f0f4f8",
  "--bg-body-2": "#e2e8f0",
  "--bg-body-3": "#cbd5e1",
  "--bg-card": "rgba(255, 255, 255, 0.95)",
  "--bg-card-end": "rgba(248, 250, 252, 0.9)",
  "--bg-input": "rgba(241, 245, 249, 0.8)",
  "--text-primary": "#1e293b",
  "--text-secondary": "#475569",
  "--text-muted": "#64748b",
  "--border-card": "rgba(203, 213, 225, 0.5)",
  "--border-input": "rgba(203, 213, 225, 0.8)",
  "--shadow-card": "0 4px 16px rgba(0, 0, 0, 0.08)",
  "--blur-card": "10px"
}
```

**Minimal overrides** — just change the brand color:

```json
{
  "--brand-primary": "#dc2626",
  "--brand-secondary": "#b91c1c"
}
```

---

## Control Board Operations

### Create a new tenant

**Firebase writes your control board performs:**

```
1. SET /tenantRegistry/{tenantId}/config  →  full tenant config JSON
2. SET /tenants/{tenantId}/tariffs/base14 →  initial tariff rates
3. SET /domainMap/{encoded-domain}        →  tenantId string
4. SET /tenantRegistry/_index/{tenantId}  →  true
```

**Example (pseudo-code):**

```javascript
const tenantId = 'bergen-taxi';

// 1. Save tenant config
await set(ref(db, `tenantRegistry/${tenantId}/config`), {
  id: tenantId,
  name: 'Bergen Taxi',
  slug: 'bergen-taxi',
  active: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  branding: {
    companyName: 'Bergen Taxi',
    logo: 'https://storage.googleapis.com/.../bergen-taxi-logo.png',
    // ... other branding fields
  },
  defaults: {
    startAddress: 'Torgallmenningen, Bergen',
    mapCenter: { lat: 60.3913, lng: 5.3221 }
  },
  features: {
    showTariffEditor: false
  },
  theme: {
    '--brand-primary': '#0066cc'
  }
});

// 2. Set initial tariffs (or copy from template)
await set(ref(db, `tenants/${tenantId}/tariffs/base14`), {
  start: 97,
  km0_10: 11.14,
  kmOver10: 21.23,
  min: 8.42,
  lastUpdated: Date.now(),
  version: 1
});

// 3. Map custom domain (encode dots for Firebase keys)
await set(ref(db, 'domainMap/bergentaxi_dot_no'), tenantId);
await set(ref(db, 'domainMap/www_dot_bergentaxi_dot_no'), tenantId);

// 4. Add to index
await set(ref(db, `tenantRegistry/_index/${tenantId}`), true);
```

### Update branding

Write only the changed fields. Firebase `update()` merges without overwriting other fields.

```javascript
await update(ref(db, `tenantRegistry/${tenantId}/config/branding`), {
  companyName: 'Bergen Taxi AS',
  logo: 'https://storage.googleapis.com/.../new-logo.png'
});

await update(ref(db, `tenantRegistry/${tenantId}/config`), {
  updatedAt: Date.now()
});
```

### Update theme

```javascript
await set(ref(db, `tenantRegistry/${tenantId}/config/theme`), {
  '--brand-primary': '#dc2626',
  '--brand-secondary': '#b91c1c',
  '--bg-body-1': '#fef2f2'
});
```

### Update tariffs

This triggers a **real-time update** on all open calculator instances for this tenant.

```javascript
await set(ref(db, `tenants/${tenantId}/tariffs/base14`), {
  start: 105,
  km0_10: 12.50,
  kmOver10: 23.00,
  min: 9.10,
  lastUpdated: Date.now(),
  version: 1
});
```

### Toggle feature flags

```javascript
await update(ref(db, `tenantRegistry/${tenantId}/config/features`), {
  showMap: false,
  showTariffEditor: false
});
```

### Deactivate a tenant

```javascript
await update(ref(db, `tenantRegistry/${tenantId}/config`), {
  active: false,
  updatedAt: Date.now()
});
```

The calculator should check `active === false` and show a "service unavailable" page.

### Delete a tenant

```javascript
// Remove config
await remove(ref(db, `tenantRegistry/${tenantId}`));

// Remove tariff data
await remove(ref(db, `tenants/${tenantId}`));

// Remove domain mappings
await remove(ref(db, 'domainMap/bergentaxi_dot_no'));

// Remove from index
await remove(ref(db, `tenantRegistry/_index/${tenantId}`));
```

### List all tenants

```javascript
const snapshot = await get(ref(db, 'tenantRegistry/_index'));
const tenantIds = Object.keys(snapshot.val() || {});
// → ['voss-taxi', 'bergen-taxi', 'oslo-taxi']

// Load full configs
for (const id of tenantIds) {
  const config = await get(ref(db, `tenantRegistry/${id}/config`));
  // ...
}
```

### Update allowed domains

```javascript
await set(ref(db, `tenantRegistry/${tenantId}/config/allowedDomains`), [
  'bergentaxi.no',
  'www.bergentaxi.no',
  '*.vercel.app'
]);

// Also update domain map for the resolver
await set(ref(db, 'domainMap/bergentaxi_dot_no'), tenantId);
```

---

## Logo & Asset Management

### Option A: Firebase Storage (recommended)

Upload logos through your control board to Firebase Storage, then store the download URL in the tenant config.

```
Firebase Storage path: /tenants/{tenantId}/logo.png
Firebase Storage path: /tenants/{tenantId}/favicon.png
```

```javascript
// Upload to Firebase Storage
const logoRef = storageRef(storage, `tenants/${tenantId}/logo.png`);
await uploadBytes(logoRef, file);
const logoUrl = await getDownloadURL(logoRef);

// Save URL to tenant config
await update(ref(db, `tenantRegistry/${tenantId}/config/branding`), {
  logo: logoUrl,
  favicon: faviconUrl
});
```

### Option B: Static assets

Place files in `public/tenants/{tenantId}/` in the calculator repo. Works for tenants you manage directly but requires a redeploy.

```
public/tenants/bergen-taxi/logo.png
public/tenants/bergen-taxi/favicon.png
```

Config reference:
```json
{
  "logo": "/tenants/bergen-taxi/logo.png",
  "favicon": "/tenants/bergen-taxi/favicon.png"
}
```

---

## What Needs to Change in the Calculator

The calculator currently uses a hardcoded registry. To make it fully controllable from your dashboard, one file needs modification: `src/config/tenantResolver.js`.

### Current flow

```
Page loads → resolveTenant() → reads LOCAL_TENANT_REGISTRY (hardcoded) → returns config
```

### Target flow

```
Page loads → resolveTenant() → fetches /tenantRegistry/{id}/config from Firebase → returns config
```

### Changes required

1. **`tenantResolver.js`** — Replace `LOCAL_TENANT_REGISTRY` lookup with a Firebase read. Fetch `/domainMap` to resolve custom domains, then fetch `/tenantRegistry/{tenantId}/config` for the full config.

2. **`TenantContext.jsx`** — Make the provider async (it already handles loading state). Subscribe to config changes for real-time updates if desired.

3. **No changes needed** for tariffs — the `useTariffData` hook already reads from Firebase with real-time sync.

---

## Firebase Security Rules

Recommended rules for your setup:

```json
{
  "rules": {
    "tenantRegistry": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    },
    "tenants": {
      "$tenantId": {
        "tariffs": {
          ".read": true,
          ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
        }
      }
    },
    "domainMap": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    },
    "tariffs": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    },
    "admins": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

This setup:
- Calculator (unauthenticated) can **read** all configs and tariffs
- Control board (authenticated admin) can **write** configs, tariffs, and domain maps
- Admin list is managed manually in Firebase Console

### Setting up admin users

In Firebase Console, add your admin UIDs:

```
/admins/
├── {your-firebase-uid}: true
└── {another-admin-uid}: true
```

Your control board authenticates via Firebase Auth, and the security rules check membership in `/admins/`.

---

## Real-Time Update Behavior

| Data | Real-time? | How |
|---|---|---|
| Tariff rates | Yes | `onValue` subscription on `/tenants/{id}/tariffs/base14`. Calculator updates instantly when you change rates. |
| Tenant config | Page reload | Currently loaded once on mount in `TenantContext`. Could be made real-time by adding `onValue` subscription. |
| Theme changes | Page reload | Applied via `applyTheme()` on mount. Could be made real-time with a config subscription. |
| Feature flags | Page reload | Read from tenant config on mount. Same — could be made real-time. |

**To make everything real-time:** Add a Firebase `onValue` subscription on `/tenantRegistry/{tenantId}/config` in `TenantContext.jsx`. When config changes, re-apply the theme and re-render with new feature flags. This is straightforward — the pattern already exists in `useTariffData.js`.

---

## Summary of Firebase Paths

| Path | Written by | Read by | Purpose |
|---|---|---|---|
| `/tenantRegistry/{tenantId}/config` | Control board | Calculator | Full tenant configuration |
| `/tenantRegistry/_index` | Control board | Control board | List of all tenant IDs |
| `/tenants/{tenantId}/tariffs/base14` | Control board + Calculator editor | Calculator | Active tariff rates (real-time sync) |
| `/tariffs/base14` | Legacy (default tenant only) | Calculator | Backward-compatible path for voss-taxi |
| `/domainMap/{encoded-domain}` | Control board | Calculator | Custom domain → tenant ID lookup |
| `/admins/{uid}` | Firebase Console | Security rules | Admin user whitelist |

---

## Checklist for Control Board Development

- [ ] Firebase Auth integration (admin login)
- [ ] Tenant CRUD (create, read, update, delete)
- [ ] Branding editor (company name, logo upload, page titles)
- [ ] Theme editor (color pickers mapped to CSS variables)
- [ ] Feature flag toggles
- [ ] Tariff rate editor (with preview)
- [ ] Domain management (add/remove allowed domains)
- [ ] Regional settings editor (map center picker, country, language)
- [ ] Tenant list view with active/inactive status
- [ ] Logo upload to Firebase Storage
- [ ] Domain map management

---

**Last Updated:** 2026-02-22
