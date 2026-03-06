# Architecture Documentation

> Technical architecture and design decisions for the Voss Taxi Kalkulator

**Last Updated**: 2026-03-06
**Version**: 2.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architectural Patterns](#architectural-patterns)
3. [Directory Structure](#directory-structure)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Performance Optimizations](#performance-optimizations)
7. [Error Handling](#error-handling)
8. [Utilities Layer](#utilities-layer)
9. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
10. [Firebase Integration](#firebase-integration)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

---

## Overview

The Voss Taxi Kalkulator is a **multi-tenant SaaS** React application for calculating taxi fares in Norway. It features:

- **Multi-tenant white-label system** — Single codebase serves multiple taxi companies with full customization
- **Real-time Firebase integration** — Tenant configs and tariffs sync instantly from Firebase
- **Google Maps integration** — Route calculation, distance/duration, address autocomplete
- **Complex business logic** — Norwegian tariff calculations with 12 public holidays, 5 tariff periods, 4 vehicle groups
- **Production-ready** — Error boundaries, retry logic, offline detection, logging, code splitting

---

## Architectural Patterns

### 1. **Component-Based Architecture**

```
App (root orchestrator)
├── Common Components (error boundaries, toasts, spinners)
├── Feature Components (address inputs, map, price card, tariff table)
├── Layout Components (sections that group features)
└── Modal Components (lazy-loaded for code splitting)
```

**Principles:**
- Single Responsibility: Each component does one thing well
- Composition over Inheritance: Build complex UIs from simple components
- Props Down, Events Up: Unidirectional data flow

### 2. **Custom Hooks for Logic Separation**

Business logic lives in hooks, not components:

- `useTariffData` — Load and sync tariff rates from Firebase
- `useAddressInputs` — Manage start/via/destination addresses
- `useTripParameters` — Manage distance, duration, date, time, vehicle group
- `useRouteCalculation` — Trigger Google Maps route calculations
- `useOnlineStatus` — Detect network connectivity

**Benefits:**
- Reusability across components
- Easier testing (pure logic)
- Separation of concerns

### 3. **Context API for Global State**

Two main contexts:

1. **TenantContext** — Provides tenant config to entire app
   - Resolves tenant from URL (query param, custom domain, subdomain)
   - Loads config from Firebase with fallback to local defaults
   - Validates domains and embedding permissions
   - Subscribes to real-time config updates

2. **ToastContext** — Global toast notifications
   - Success, error, warning, info messages
   - Auto-dismiss with configurable duration
   - Stack management

### 4. **Layered Architecture**

```
┌─────────────────────────────────────────┐
│  Presentation Layer (Components)        │
│  ├─ App.jsx (orchestrator)             │
│  ├─ Feature components                  │
│  └─ Common/UI primitives                │
├─────────────────────────────────────────┤
│  Business Logic Layer (Hooks/Utils)     │
│  ├─ Custom hooks (state management)     │
│  ├─ Utils (calculations, validation)    │
│  └─ Constants                            │
├─────────────────────────────────────────┤
│  Data Layer (Firebase/API)              │
│  ├─ firebase.js (CRUD operations)       │
│  ├─ Tenant resolver                     │
│  └─ Real-time subscriptions             │
├─────────────────────────────────────────┤
│  Infrastructure Layer                   │
│  ├─ Error boundaries                    │
│  ├─ Logger                               │
│  ├─ Retry logic                          │
│  └─ Network monitoring                   │
└─────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── components/
│   ├── common/              # Reusable UI primitives
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Toast.jsx
│   │   └── index.js
│   ├── AddressAutocomplete.jsx
│   ├── AddressInputSection.jsx
│   ├── EstimatedPriceCard.jsx
│   ├── MapDisplay.jsx
│   ├── PrintOffer.jsx
│   ├── TariffEditorModal.jsx
│   ├── TariffTable.jsx
│   ├── TripParametersSection.jsx
│   └── HelpTooltip.jsx
├── config/
│   ├── firebase.config.js   # Firebase credentials & paths
│   ├── tenantResolver.js    # Tenant resolution logic
│   └── tenantSchema.js      # Tenant config schema & defaults
├── context/
│   └── TenantContext.jsx    # Tenant provider & consumer
├── hooks/
│   ├── useAddressInputs.js
│   ├── useOnlineStatus.js
│   ├── useRouteCalculation.js
│   ├── useTariffData.js
│   ├── useTripParameters.js
│   └── index.js
├── locales/
│   └── translations.js      # Norwegian/English translations
├── themes/
│   ├── themeDefaults.js     # 60+ CSS variables
│   ├── vossTaxi.js          # Dark theme (default)
│   ├── lightClean.js        # Light theme
│   └── index.js
├── utils/
│   ├── constants.js         # All magic numbers/strings
│   ├── errors.js            # Error classes & retry logic
│   ├── helligdager.js       # Norwegian holiday calculator
│   ├── logger.js            # Centralized logging
│   ├── tariffCalculator.js  # Pricing engine
│   ├── validators.js        # Input validation & sanitization
│   └── index.js             # Barrel export
├── App.jsx                  # Root component
├── App.css                  # All styles (1,322 lines)
├── firebase.js              # Firebase operations
└── main.jsx                 # React entry point
```

---

## Data Flow

### 1. **Tenant Resolution Flow**

```
Page Load
    ↓
TenantProvider mounts
    ↓
resolveTenantAsync()
    ├─ Check query param (?tenant=xyz)
    ├─ OR check subdomain (xyz.taxikalkulator.no)
    ├─ OR check custom domain → Firebase /domainMap/
    └─ Fallback to 'voss-taxi'
    ↓
getTenantConfig(tenantId)
    ├─ Fetch /tenantRegistry/{id}/config from Firebase
    └─ Fallback to local DEFAULT_TENANT if Firebase fails
    ↓
Validate domain & embedding permissions
    ├─ If unauthorized → Show error screen
    └─ If inactive → Show "Service Unavailable"
    ↓
Apply theme (60+ CSS variables to <html>)
Update page meta (title, favicon, description)
    ↓
Subscribe to real-time config updates
    ↓
Render <App />
```

### 2. **Tariff Calculation Flow**

```
User inputs distance, duration, date, time, vehicle group
    ↓
App.jsx passes to EstimatedPriceCard
    ↓
EstimatedPriceCard calls:
  calculateTimelineEstimate(start, distance, duration, group, baseTariff, holidays)
    ↓
tariffCalculator.js:
  1. Determine tariff period for each minute of trip
     - dag (day), kveld (evening), laurdag (Saturday),
       helgNatt (weekend/night), hoytid (holiday)
  2. Apply vehicle group factor (1.0x, 1.3x, 1.6x, 2.0x)
  3. Apply period factor (1.0x - 1.45x)
  4. Calculate: start + (distance * rate) + (time * rate)
  5. Return total + breakdown by period
    ↓
EstimatedPriceCard displays:
  - Total price
  - Period-by-period breakdown
  - Expandable details
```

### 3. **Google Maps Integration Flow**

```
User enters addresses
    ↓
AddressAutocomplete (Google Places API)
    ↓
User clicks "Beregn rute"
    ↓
MapDisplay.jsx:
  DirectionsService.route(origin, destination, waypoints)
    ↓
Google returns:
  - Route geometry
  - Total distance (meters)
  - Total duration (seconds)
    ↓
Convert to km/minutes
    ↓
onRouteCalculated(distanceKm, durationMin)
    ↓
TripParametersSection updates fields
    ↓
EstimatedPriceCard recalculates price
```

### 4. **Real-Time Config Sync Flow**

```
Control Board writes to Firebase:
  /tenantRegistry/{id}/config
    ↓
Firebase triggers onValue callback
    ↓
TenantContext.jsx:
  subscribeTenantConfig(tenantId, (updatedConfig) => {
    - Check if deactivated (active: false)
    - Re-validate domain permissions
    - Re-apply theme (CSS variables)
    - Update state → triggers re-render
  })
    ↓
All components receive new tenant config
    ↓
UI updates instantly (theme, branding, features)
```

---

## State Management

### Local Component State

Simple UI state stays in components:

```javascript
const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
const [lang, setLang] = useState('no');
```

### Custom Hook State

Reusable stateful logic extracted to hooks:

```javascript
const { baseTariff, setBaseTariff } = useTariffData(tenantId);
const addresses = useAddressInputs(defaultAddress);
const tripParams = useTripParameters();
```

### Global Context State

Cross-cutting concerns use Context:

```javascript
const { tenant } = useTenant();
const { showToast } = useToast();
```

**Why no Redux/Zustand?**
- App complexity doesn't justify a state management library
- Context + hooks is sufficient
- Fewer dependencies = faster builds, smaller bundle

---

## Performance Optimizations

### 1. **Code Splitting with React.lazy**

```javascript
const TariffEditorModal = lazy(() => import('./components/TariffEditorModal'));
const PrintOffer = lazy(() => import('./components/PrintOffer'));
```

**Benefits:**
- Main bundle: 426 KB
- TariffEditorModal chunk: 6.14 KB (loaded only when opened)
- PrintOffer chunk: 5.07 KB (loaded only when printing)
- Faster initial load

### 2. **Memoization with useMemo & useCallback**

```javascript
// Expensive calculation — only recompute if inputs change
const t = useMemo(
  () => getTranslations(lang, tenant?.branding),
  [lang, tenant?.branding]
);

// Prevent re-creating handlers on every render
const handlePrint = useCallback(() => {
  window.print();
}, []);
```

### 3. **Singleton Pattern for Google Maps**

```javascript
let mapsLoaderPromise = null; // Module-level singleton

if (!mapsLoaderPromise) {
  const loader = new Loader({ apiKey, ... });
  mapsLoaderPromise = loader.load();
}
```

Prevents "Loader must not be called again" error when props change.

### 4. **Conditional Rendering**

Only render heavy components when needed:

```javascript
{tenant?.features?.showMap !== false && <MapDisplay />}
{tenant?.features?.showTariffTable !== false && <TariffTable />}
```

### 5. **CSS Variable Theming**

Theme changes don't require re-rendering:

```javascript
document.documentElement.style.setProperty('--brand-primary', '#6366f1');
```

CSS variables update instantly without React reconciliation.

---

## Error Handling

### 1. **ErrorBoundary Component**

Wraps the entire app to catch React errors:

```jsx
<ErrorBoundary name="Root">
  <TenantProvider>
    <App />
  </TenantProvider>
</ErrorBoundary>
```

**Features:**
- Displays user-friendly fallback UI
- Logs error with `reportError()` (hooks for Sentry)
- Shows stack trace in development
- "Try Again" button to reset

### 2. **Custom Error Classes**

```javascript
throw new FirebaseError('Failed to fetch tenant config', 'getTenantConfig', originalError);
throw new ValidationError('Invalid distance', 'distanceKm');
throw new NetworkError('API request failed', url, error);
```

**Benefits:**
- Type-safe error handling (catch by class)
- Structured error context
- Easier debugging

### 3. **Retry Logic with Exponential Backoff**

```javascript
const config = await retry(
  () => getTenantConfig(tenantId),
  {
    maxAttempts: 3,
    initialDelay: 2000,
    backoffFactor: 2,
    shouldRetry: (error) => error.name === 'NetworkError'
  }
);
```

**Use cases:**
- Firebase fetch failures (network issues)
- Google Maps API calls (rate limiting)

### 4. **User-Friendly Error Messages**

```javascript
const message = getUserFriendlyMessage(error, translations);
showToast(message, 'error');
```

Converts technical errors to localized, actionable messages.

---

## Utilities Layer

### Logger (`utils/logger.js`)

Centralized logging with levels and scopes:

```javascript
import { logger, createLogger } from '@/utils';

const log = createLogger('MapDisplay');
log.info('Route calculated:', distanceKm, durationMin);
log.warn('API rate limit approaching');
log.error('Failed to load map:', error);
```

**Features:**
- Log levels: DEBUG, INFO, WARN, ERROR
- Production mode: only WARN+ logged
- Timestamps in development
- Scoped loggers by module

**Benefits:**
- Replaces scattered `console.log` calls
- Easy to disable in production
- Searchable logs by module
- Consistent format

### Validators (`utils/validators.js`)

Input validation and sanitization:

```javascript
validateDistance(100);           // true
validateTime('14:30');           // true
validateTariff(baseTariff);      // true/false
sanitizeNumber('  100.5 km  ');  // 100.5
```

**Benefits:**
- Prevents invalid data from reaching calculations
- XSS protection via sanitization
- Type guards for runtime safety

### Constants (`utils/constants.js`)

Eliminates magic numbers/strings:

```javascript
// ❌ Before:
if (group === '1-4') price *= 1.0;

// ✅ After:
if (group === VEHICLE_GROUPS[0]) price *= VEHICLE_GROUP_FACTORS[group];
```

---

## Multi-Tenancy Architecture

### Tenant Resolution

**Methods** (priority order):
1. Query parameter: `?tenant=bergen-taxi`
2. Custom domain: `bergentaxi.no` → Firebase `/domainMap/` → tenant ID
3. Subdomain: `bergen-taxi.taxikalkulator.no`
4. Fallback: `voss-taxi`

### Tenant Config Schema

```javascript
{
  id: 'bergen-taxi',
  name: 'Bergen Taxi',
  active: true,
  branding: {
    companyName, logo, favicon,
    pageTitle: { no, en },
    pageDescription: { no, en }
  },
  theme: {
    '--brand-primary': '#0066cc',
    // ... 60+ CSS variables
  },
  defaults: {
    startAddress, lang, mapsCountry,
    mapsRegion, mapCenter: { lat, lng }
  },
  contact: { phone, email, website },
  allowedDomains: ['bergentaxi.no', '*.vercel.app'],
  features: {
    showLanguageSwitcher: true,
    showPrintButton: true,
    showTariffEditor: false,
    showMap: true,
    showTariffTable: true
  }
}
```

### Domain Validation

Blocks unauthorized domains:

```javascript
if (!validateDomain(tenant)) {
  return <UnauthorizedScreen />;
}

if (!validateEmbedding(tenant)) {
  return <IframeBlockedScreen />;
}
```

### Real-Time Sync

Control board updates propagate instantly:

```javascript
subscribeTenantConfig(tenantId, (updatedConfig) => {
  applyTheme(updatedConfig.theme);    // CSS variables update
  updatePageMeta(updatedConfig);       // Title/favicon change
  setTenant(updatedConfig);            // Trigger re-render
});
```

---

## Firebase Integration

### Database Paths

```
/tenantRegistry/
  /{tenantId}/
    /config → full tenant config

/tenants/
  /{tenantId}/
    /tariffs/
      /base14 → { start, km0_10, kmOver10, min }

/domainMap/
  /{encoded-domain} → tenantId string
    (e.g., "vosstaksi_dot_no" → "voss-taxi")

/tariffs/base14 → legacy path for default tenant
```

### Operations

```javascript
// Tenant
await getTenantConfig(tenantId);
subscribeTenantConfig(tenantId, callback);

// Tariffs
await saveTariffToFirebase(tariff, tenantId);
await getTariffFromFirebase(tenantId);
subscribeTariffChanges(callback, tenantId);

// Domain Map
await lookupTenantByDomain('vosstaksi.no');
await getDomainMap();
```

### Security Rules

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
          ".write": "auth != null"
        }
      }
    }
  }
}
```

---

## Testing Strategy

### Recommended Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Unit Tests

Test pure functions in isolation:

```javascript
// utils/tariffCalculator.test.js
describe('deriveAllTariffs', () => {
  test('applies correct vehicle group factors', () => {
    const result = deriveAllTariffs(DEFAULT_BASE_TARIFF_14);
    expect(result['1-4']['dag'].start).toBe(97);
    expect(result['9-16']['dag'].start).toBe(194); // 2x
  });

  test('time rate does NOT scale by vehicle group', () => {
    const result = deriveAllTariffs(DEFAULT_BASE_TARIFF_14);
    expect(result['1-4']['dag'].min).toBe(8.42);
    expect(result['9-16']['dag'].min).toBe(8.42); // Same!
  });
});
```

### Component Tests

Test user interactions:

```javascript
// components/EstimatedPriceCard.test.jsx
test('calculates correct price', () => {
  render(<EstimatedPriceCard distanceKm={100} durationMin={90} ... />);
  expect(screen.getByText(/kr/i)).toBeInTheDocument();
});
```

### Integration Tests

Test full workflows:

```javascript
test('address → route → price flow', async () => {
  // Mock Google Maps API
  // Enter addresses
  // Click calculate
  // Verify price updates
});
```

---

## Deployment

### Build Process

```bash
npm run build
```

**Output:**
- Main bundle: `index-[hash].js` (426 KB, 115 KB gzipped)
- CSS: `index-[hash].css` (20 KB, 4.6 KB gzipped)
- Lazy chunks: `TariffEditorModal-[hash].js`, `PrintOffer-[hash].js`

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment Variables

**Production (Vercel Dashboard):**
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_TARIFF_PASSWORD` (optional)

**Development (`.env`):**
Same as above, but gitignored.

---

## Key Design Decisions

### 1. **Why React Context over Redux?**

- App is not complex enough to justify Redux
- Context + custom hooks is simpler and lighter
- Fewer dependencies = faster CI/CD

### 2. **Why no TypeScript?**

- Project started before TypeScript adoption
- Adding now would be a massive refactor
- Validators + PropTypes provide runtime safety
- Future: consider migration to TypeScript

### 3. **Why monolithic CSS?**

- All styles in `App.css` (1,322 lines)
- No CSS modules, no CSS-in-JS
- **Pros**: Simple, fast, no build complexity
- **Cons**: Global namespace, harder to maintain
- **Mitigation**: BEM-like naming, CSS variables for theming

### 4. **Why lazy loading for modals only?**

- TariffEditorModal and PrintOffer are rarely used
- Main components (map, price card) needed immediately
- Balance between code splitting and UX

### 5. **Why manual i18n instead of react-i18next?**

- Only 2 languages (Norwegian, English)
- Simple key-value lookup with template strings
- No pluralization or complex formatting needed
- Custom solution is 100 lines vs. 50 KB library

---

## Performance Metrics

### Bundle Sizes

| File | Size | Gzipped |
|------|------|---------|
| Main JS | 426.69 KB | 115.80 KB |
| Main CSS | 20.45 KB | 4.65 KB |
| TariffEditorModal | 6.14 KB | 2.26 KB |
| PrintOffer | 5.07 KB | 1.42 KB |
| **Total (initial)** | **447.14 KB** | **120.45 KB** |

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## Future Enhancements

- [ ] Migrate to TypeScript
- [ ] Add Vitest + React Testing Library
- [ ] Integrate Sentry for error tracking
- [ ] Add PWA support (offline mode, install prompt)
- [ ] Extract CSS to CSS Modules
- [ ] Add Storybook for component documentation
- [ ] Implement A/B testing for pricing experiments
- [ ] Add analytics (Google Analytics / Plausible)
- [ ] Optimize images with next-gen formats (WebP, AVIF)
- [ ] Add skeleton loading states

---

**Maintained by**: AI assistants and developers
**License**: MIT
