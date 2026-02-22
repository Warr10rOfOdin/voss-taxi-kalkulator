# Multi-Tenant Configuration Guide

This document explains how to add and configure new tenants for the white-label taxi calculator SaaS platform.

## Table of Contents

1. [Overview](#overview)
2. [Adding a New Tenant](#adding-a-new-tenant)
3. [Tenant Configuration Schema](#tenant-configuration-schema)
4. [Domain Mapping](#domain-mapping)
5. [Theme Customization](#theme-customization)
6. [Feature Flags](#feature-flags)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Overview

The application supports multiple taxi companies through a tenant configuration system. Each tenant gets:

- **Custom branding** (logo, company name, colors)
- **Custom theming** (CSS variables for complete visual customization)
- **Regional defaults** (start address, language, map center)
- **Feature flags** (enable/disable specific features)
- **Domain mapping** (custom domains and subdomains)
- **Data isolation** (tenant-scoped Firebase paths and localStorage)

---

## Adding a New Tenant

### Step 1: Create Tenant Configuration

Add your tenant to the registry in `src/config/tenantResolver.js`:

```javascript
const LOCAL_TENANT_REGISTRY = {
  'voss-taxi': DEFAULT_TENANT,

  // Add your new tenant:
  'bergen-taxi': createTenantConfig({
    id: 'bergen-taxi',
    name: 'Bergen Taxi',
    slug: 'bergen-taxi',

    branding: {
      companyName: 'Bergen Taxi',
      logo: '/tenants/bergen-taxi/logo.png',
      logoAlt: 'Bergen Taxi',
      favicon: '/tenants/bergen-taxi/favicon.png',
      pageTitle: {
        no: 'Bergen Taxi Kalkulator',
        en: 'Bergen Taxi Calculator'
      },
      pageDescription: {
        no: 'Prisestimat for taxiturer i Bergen-regionen.',
        en: 'Price estimate for taxi trips in the Bergen region.'
      },
      copyrightHolder: 'Bergen Taxi AS',
      madeBy: {
        no: 'Laget av Toni Kolve.',
        en: 'Made by Toni Kolve.'
      }
    },

    defaults: {
      startAddress: 'Torgallmenningen, Bergen',
      lang: 'no',
      mapsCountry: 'no',
      mapsRegion: 'NO',
      mapCenter: { lat: 60.3913, lng: 5.3221 } // Bergen coordinates
    },

    contact: {
      phone: '+47 12 34 56 78',
      email: 'post@bergentaxi.no',
      website: 'https://bergentaxi.no'
    },

    allowedDomains: [
      'bergentaxi.no',
      'www.bergentaxi.no',
      '*.vercel.app',  // For preview deployments
      'localhost'      // For local development
    ],

    features: {
      showLanguageSwitcher: true,
      showPrintButton: true,
      showTariffEditor: false,  // Disable tariff editing for this tenant
      showMap: true,
      showTariffTable: true
    },

    // Custom theme (optional - see Theme Customization section)
    theme: {
      '--brand-primary': '#0066cc',
      '--brand-secondary': '#004999'
    }
  })
};
```

### Step 2: Add Logo Assets

Create a directory for your tenant's assets:

```bash
mkdir -p public/tenants/bergen-taxi
```

Add the following files:
- `public/tenants/bergen-taxi/logo.png` - Company logo (recommended: 200x50px)
- `public/tenants/bergen-taxi/favicon.png` - Favicon (recommended: 32x32px or 64x64px)

### Step 3: Configure Domain Mapping

Add domain-to-tenant mapping in `src/config/tenantResolver.js`:

```javascript
const DOMAIN_TO_TENANT = {
  'vosstaksi.no': 'voss-taxi',
  'www.vosstaksi.no': 'voss-taxi',

  // Add your custom domains:
  'bergentaxi.no': 'bergen-taxi',
  'www.bergentaxi.no': 'bergen-taxi'
};
```

### Step 4: Test Locally

Access your tenant using query parameters:
```
http://localhost:3000/?tenant=bergen-taxi
```

Or configure a subdomain (requires DNS/hosts file setup):
```
http://bergen-taxi.localhost:3000
```

---

## Tenant Configuration Schema

### Core Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier (kebab-case, e.g., 'bergen-taxi') |
| `name` | string | ✓ | Display name (e.g., 'Bergen Taxi') |
| `slug` | string | ✓ | URL-safe identifier (usually same as `id`) |

### Branding

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `companyName` | string | - | Company name shown in UI |
| `logo` | string | - | Path to logo image |
| `logoAlt` | string | - | Alt text for logo |
| `favicon` | string | - | Path to favicon |
| `pageTitle.no` | string | - | Norwegian page title |
| `pageTitle.en` | string | - | English page title |
| `pageDescription.no` | string | - | Norwegian meta description |
| `pageDescription.en` | string | - | English meta description |
| `copyrightHolder` | string | - | Copyright holder name |
| `madeBy.no` | string | 'Laget av Toni Kolve.' | Norwegian credits |
| `madeBy.en` | string | 'Made by Toni Kolve.' | English credits |

### Defaults

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `startAddress` | string | 'Hestavangen 11, Voss' | Default start address placeholder |
| `lang` | string | 'no' | Default language ('no' or 'en') |
| `mapsCountry` | string | 'no' | Google Maps country code (lowercase) |
| `mapsRegion` | string | 'NO' | Google Maps region code (uppercase) |
| `mapCenter.lat` | number | 60.6280 | Default map center latitude |
| `mapCenter.lng` | number | 6.4118 | Default map center longitude |

### Contact Info

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `phone` | string | '' | Contact phone number |
| `email` | string | '' | Contact email |
| `website` | string | '' | Company website URL |

### Security

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `allowedDomains` | string[] | [] | Allowed domains for embed protection (empty = allow all) |

**Wildcard Support:**
- `*.vercel.app` - Matches all Vercel preview deployments
- `localhost` - Local development
- Exact domain match: `bergentaxi.no`

### Feature Flags

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `showLanguageSwitcher` | boolean | true | Show NO/EN language toggle |
| `showPrintButton` | boolean | true | Show print/PDF button |
| `showTariffEditor` | boolean | true | Show tariff editing (password-protected) |
| `showMap` | boolean | true | Show Google Maps integration |
| `showTariffTable` | boolean | true | Show tariff price matrix table |

---

## Domain Mapping

### Subdomain Access

Subdomains automatically map to tenant IDs:

```
https://bergen-taxi.taxikalkulator.no  →  tenant: 'bergen-taxi'
https://voss-taxi.taxikalkulator.no    →  tenant: 'voss-taxi'
```

No additional configuration needed if subdomain matches tenant ID.

### Custom Domains

For custom domains, add mapping in `DOMAIN_TO_TENANT`:

```javascript
const DOMAIN_TO_TENANT = {
  'bergentaxi.no': 'bergen-taxi'
};
```

**Vercel Configuration:**
1. Go to Vercel dashboard → Project Settings → Domains
2. Add custom domain: `bergentaxi.no`
3. Configure DNS: Add CNAME record pointing to Vercel
4. Wait for SSL certificate provisioning

### Query Parameter Override

For testing, you can override tenant detection:

```
https://yourdomain.com/?tenant=bergen-taxi
```

**Resolution Priority:**
1. Query parameter (`?tenant=...`)
2. Custom domain mapping
3. Subdomain mapping
4. Fallback to default tenant (voss-taxi)

---

## Theme Customization

### Available CSS Variables

You can override any of these 60+ CSS variables in `tenant.theme`:

**Brand Colors:**
```javascript
{
  '--brand-primary': '#6366f1',      // Primary brand color
  '--brand-secondary': '#8b5cf6',    // Secondary brand color
  '--brand-accent': '#ec4899',       // Accent color
  '--brand-warning': '#f59e0b',      // Warning/highlight color
  '--brand-success': '#10b981',      // Success color
  '--brand-danger': '#ef4444'        // Danger/error color
}
```

**Background Colors:**
```javascript
{
  '--bg-body-1': '#0f1419',             // Body gradient start
  '--bg-body-2': '#1a1f2e',             // Body gradient middle
  '--bg-body-3': '#0f1419',             // Body gradient end
  '--bg-card': 'rgba(20, 25, 40, 0.95)', // Card background
  '--bg-card-end': 'rgba(30, 35, 50, 0.85)', // Card gradient end
  '--bg-input': 'rgba(30, 35, 50, 0.6)', // Input background
  '--bg-button-primary': 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
  '--bg-button-secondary': 'rgba(59, 130, 246, 0.15)'
}
```

**Text Colors:**
```javascript
{
  '--text-primary': '#e8eaed',          // Primary text
  '--text-secondary': 'rgba(255, 255, 255, 0.7)',  // Secondary text
  '--text-muted': 'rgba(255, 255, 255, 0.5)',      // Muted text
  '--text-link': '#60a5fa',             // Links
  '--text-link-hover': '#93c5fd'        // Link hover
}
```

**Border Colors:**
```javascript
{
  '--border-card': 'rgba(99, 102, 241, 0.15)',
  '--border-input': 'rgba(203, 213, 225, 0.2)',
  '--border-input-focus': 'var(--brand-primary)'
}
```

**Shadows & Effects:**
```javascript
{
  '--shadow-card': '0 8px 32px rgba(0, 0, 0, 0.5)',
  '--shadow-button': '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
  '--blur-card': '20px',
  '--blur-strong': '40px'
}
```

**Typography:**
```javascript
{
  '--font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
  '--font-size-base': '1rem',
  '--font-size-small': '0.875rem',
  '--font-size-large': '1.125rem'
}
```

**Layout:**
```javascript
{
  '--radius-card': '16px',
  '--radius-input': '8px',
  '--radius-button': '8px',
  '--transition-speed': '0.3s'
}
```

### Creating a Custom Theme

**Example: Light Theme for Bergen Taxi**

```javascript
theme: {
  // Brand colors
  '--brand-primary': '#0066cc',
  '--brand-secondary': '#004999',
  '--brand-accent': '#00aaff',
  '--brand-warning': '#ff9900',

  // Light background
  '--bg-body-1': '#f0f4f8',
  '--bg-body-2': '#e0e8f0',
  '--bg-body-3': '#d0dce8',
  '--bg-card': 'rgba(255, 255, 255, 0.95)',
  '--bg-card-end': 'rgba(248, 250, 252, 0.9)',
  '--bg-input': 'rgba(248, 250, 252, 0.8)',

  // Dark text for light background
  '--text-primary': '#1e293b',
  '--text-secondary': 'rgba(30, 41, 59, 0.7)',
  '--text-muted': 'rgba(30, 41, 59, 0.5)',

  // Light borders
  '--border-card': 'rgba(203, 213, 225, 0.5)',
  '--border-input': 'rgba(203, 213, 225, 0.8)',

  // Subtle shadows
  '--shadow-card': '0 4px 16px rgba(0, 0, 0, 0.1)',
  '--blur-card': '10px'
}
```

### Creating a Theme File

For reusable themes, create a theme file in `src/themes/`:

```javascript
// src/themes/bergenLight.js
const bergenLightTheme = {
  id: 'bergen-light',
  name: 'Bergen Light',
  description: 'Light professional theme for Bergen Taxi',
  variables: {
    '--brand-primary': '#0066cc',
    '--brand-secondary': '#004999',
    // ... rest of variables
  }
};

export default bergenLightTheme;
```

Then reference it in your tenant config:

```javascript
import bergenLightTheme from '../themes/bergenLight';

createTenantConfig({
  // ...
  theme: bergenLightTheme.variables
})
```

---

## Feature Flags

### showLanguageSwitcher

**Default:** `true`

Controls the NO/EN language toggle button in the header.

```javascript
features: {
  showLanguageSwitcher: false  // Hide language switcher
}
```

**Use Case:** Hide for tenants serving only Norwegian or only English customers.

### showPrintButton

**Default:** `true`

Controls the print/PDF button in the estimated price card.

```javascript
features: {
  showPrintButton: false  // Hide print button
}
```

**Use Case:** Remove print functionality for web-only integrations.

### showTariffEditor

**Default:** `true`

Controls the hamburger menu button that opens the password-protected tariff editor.

```javascript
features: {
  showTariffEditor: false  // Hide tariff editor
}
```

**Use Case:**
- Disable for tenants who shouldn't modify tariffs
- Central management scenario (admin updates all tenants)
- Fixed pricing contracts

**Security Note:** Even when hidden, tariffs are still modifiable via Firebase by admins.

### showMap

**Default:** `true`

Controls the Google Maps integration in the right column.

```javascript
features: {
  showMap: false  // Hide map entirely
}
```

**Use Case:**
- Reduce Google Maps API costs
- Simplified UI for internal tools
- Manual distance entry workflows

### showTariffTable

**Default:** `true`

Controls the tariff price matrix table below the estimate card.

```javascript
features: {
  showTariffTable: false  // Hide tariff table
}
```

**Use Case:**
- Simplified UI focusing only on the estimate
- Mobile-first design with limited screen space
- Hide pricing details from public view

---

## Testing

### Local Testing

**1. Query Parameter Method:**
```bash
npm run dev
# Open: http://localhost:3000/?tenant=bergen-taxi
```

**2. Hosts File Method (for subdomain testing):**

Edit `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
```
127.0.0.1  bergen-taxi.localhost
```

Then access:
```
http://bergen-taxi.localhost:3000
```

### Vercel Preview Deployments

Every PR gets a preview deployment. Test tenants on preview URLs:

```bash
# Query parameter
https://your-app-git-branch-name.vercel.app/?tenant=bergen-taxi

# Subdomain (requires DNS)
https://bergen-taxi.your-app.vercel.app
```

### Testing Checklist

- [ ] Logo displays correctly
- [ ] Company name appears in all locations (header, PDF, footer)
- [ ] Page title and meta description are correct
- [ ] Theme colors apply correctly
- [ ] Map centers on correct location
- [ ] Address autocomplete suggests correct region
- [ ] Language switcher works (if enabled)
- [ ] Print button works (if enabled)
- [ ] Tariff editor shows/hides correctly
- [ ] Feature flags apply correctly
- [ ] Domain validation works (if `allowedDomains` set)
- [ ] Firebase saves to tenant-scoped path (`tenants/{tenantId}/tariffs/`)
- [ ] localStorage uses tenant-scoped key (`taxiTariffs_{tenantId}`)

---

## Deployment

### Environment Variables (Vercel)

1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add required variables:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_TARIFF_PASSWORD=your_secure_password  # Optional
```

3. Apply to all environments (Production, Preview, Development)

### Custom Domain Setup

**For each tenant with a custom domain:**

1. **Add Domain in Vercel:**
   - Project → Settings → Domains
   - Add domain: `bergentaxi.no`

2. **Configure DNS:**
   - **Option A (Recommended):** CNAME to Vercel
     ```
     Type: CNAME
     Name: @  (or www)
     Value: cname.vercel-dns.com
     ```

   - **Option B:** A Record to Vercel IP
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```

3. **Wait for SSL:** Vercel auto-provisions SSL certificates (usually <5 minutes)

4. **Update Tenant Config:** Add domain to `DOMAIN_TO_TENANT` mapping

### Firebase Security Rules

Update Firebase rules to enforce tenant isolation:

```javascript
{
  "rules": {
    "tenants": {
      "$tenantId": {
        ".read": true,  // Allow reads for calculator functionality
        ".write": "auth != null"  // Only authenticated admins can write
      }
    }
  }
}
```

For stricter security:

```javascript
{
  "rules": {
    "tenants": {
      "$tenantId": {
        "tariffs": {
          ".read": true,
          ".write": "auth != null && auth.token.tenantId == $tenantId"
        }
      }
    }
  }
}
```

### Production Deployment Checklist

- [ ] All tenant configurations added to registry
- [ ] Logo assets uploaded to `public/tenants/{tenant-id}/`
- [ ] Domain mappings configured in `tenantResolver.js`
- [ ] Custom domains added in Vercel (if applicable)
- [ ] DNS records configured and verified
- [ ] SSL certificates provisioned
- [ ] Environment variables set in Vercel
- [ ] Firebase rules updated for tenant isolation
- [ ] Test all tenants on production URL
- [ ] Verify embed protection (if `allowedDomains` set)
- [ ] Verify analytics/monitoring setup

---

## Troubleshooting

### Tenant Not Found

**Symptom:** Fallback to default tenant (voss-taxi)

**Causes:**
- Tenant ID not in `LOCAL_TENANT_REGISTRY`
- Domain not in `DOMAIN_TO_TENANT`
- Typo in tenant ID

**Solution:** Check `tenantResolver.js` and verify exact ID match.

### Logo Not Displaying

**Causes:**
- File path incorrect
- File not in `public/tenants/{tenant-id}/`
- Build didn't include assets

**Solution:**
```bash
# Verify file exists
ls -la public/tenants/bergen-taxi/

# Rebuild
npm run build

# Check dist output
ls -la dist/tenants/bergen-taxi/
```

### Theme Not Applying

**Causes:**
- CSS variable names misspelled (must include `--` prefix)
- Theme object structure incorrect
- Browser caching old styles

**Solution:**
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser DevTools → Elements → Computed styles
- Verify CSS variables are set on `<html>` element

### Domain Validation Failing

**Symptom:** "Unauthorized" error page

**Causes:**
- Domain not in `allowedDomains` array
- Wildcard pattern incorrect
- Localhost not allowed

**Solution:**
```javascript
allowedDomains: [
  'bergentaxi.no',
  '*.vercel.app',  // Wildcard for previews
  'localhost'      // Local development
]
```

### Firebase Data Not Saving

**Causes:**
- Incorrect tenant ID
- Firebase rules blocking writes
- Network/permissions issue

**Solution:**
- Check browser DevTools → Console for errors
- Verify Firebase rules allow writes
- Check `tenants/{tenantId}/tariffs/base14` path exists

---

## Example: Complete Tenant Setup

Here's a complete example for adding "Oslo Taxi":

```javascript
// 1. Add to LOCAL_TENANT_REGISTRY (src/config/tenantResolver.js)
'oslo-taxi': createTenantConfig({
  id: 'oslo-taxi',
  name: 'Oslo Taxi',
  slug: 'oslo-taxi',

  branding: {
    companyName: 'Oslo Taxi',
    logo: '/tenants/oslo-taxi/logo.png',
    logoAlt: 'Oslo Taxi',
    favicon: '/tenants/oslo-taxi/favicon.png',
    pageTitle: {
      no: 'Oslo Taxi Kalkulator',
      en: 'Oslo Taxi Calculator'
    },
    pageDescription: {
      no: 'Beregn taxipris i Oslo og Akershus.',
      en: 'Calculate taxi fare in Oslo and Akershus.'
    },
    copyrightHolder: 'Oslo Taxi AS',
    madeBy: {
      no: 'Laget av Toni Kolve.',
      en: 'Made by Toni Kolve.'
    }
  },

  defaults: {
    startAddress: 'Oslo S, Oslo',
    lang: 'no',
    mapsCountry: 'no',
    mapsRegion: 'NO',
    mapCenter: { lat: 59.9139, lng: 10.7522 } // Oslo Central Station
  },

  contact: {
    phone: '+47 02323',
    email: 'kundeservice@oslotaxi.no',
    website: 'https://oslotaxi.no'
  },

  allowedDomains: [
    'oslotaxi.no',
    'www.oslotaxi.no',
    '*.vercel.app',
    'localhost'
  ],

  features: {
    showLanguageSwitcher: true,
    showPrintButton: true,
    showTariffEditor: false,  // Centrally managed
    showMap: true,
    showTariffTable: true
  },

  theme: {
    '--brand-primary': '#d32f2f',
    '--brand-secondary': '#c62828',
    '--brand-accent': '#ff5252'
  }
})

// 2. Add domain mapping
const DOMAIN_TO_TENANT = {
  'vosstaksi.no': 'voss-taxi',
  'www.vosstaksi.no': 'voss-taxi',
  'oslotaxi.no': 'oslo-taxi',
  'www.oslotaxi.no': 'oslo-taxi'
};

// 3. Create assets directory
// mkdir -p public/tenants/oslo-taxi
// Add: logo.png and favicon.png

// 4. Test locally
// http://localhost:3000/?tenant=oslo-taxi

// 5. Deploy and configure custom domain in Vercel
```

---

## Future Enhancements

Planned features for the multi-tenant system:

- [ ] **Admin Dashboard** - Web UI for managing tenants without code changes
- [ ] **Database-Backed Tenants** - Load tenant configs from Firebase instead of code
- [ ] **Tenant Analytics** - Usage metrics per tenant
- [ ] **Billing Integration** - Stripe/payment integration per tenant
- [ ] **Email Notifications** - Send price quotes via email
- [ ] **API Access** - REST API for tenant configuration
- [ ] **Tenant Onboarding Flow** - Self-service tenant setup
- [ ] **A/B Testing** - Per-tenant feature experiments

---

## Support

For questions or issues:

- **Documentation:** This file (TENANTS.md)
- **Architecture:** See CLAUDE.md for codebase overview
- **Issues:** GitHub Issues (for bugs/features)
- **Creator:** Toni Kolve

---

**Last Updated:** 2026-02-22
**Version:** 1.0.0
