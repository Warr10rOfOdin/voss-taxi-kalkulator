# Voss Taxi Kalkulator

## Overview

**What it does:**
A professional web-based calculator for estimating taxi fares for Voss Taxi in Norway. The application calculates prices based on official Norwegian tariff regulations, integrates with Google Maps for route planning, and supports multiple vehicle groups with complex time-based pricing across 12 Norwegian public holidays.

**Who it's for:**
- Primary: End customers planning taxi trips in the Voss region
- Secondary: Voss Taxi staff generating quick price estimates
- Tertiary: Business clients requesting formal price quotes (PDF export)

**Repository:** https://github.com/Warr10rOfOdin/voss-taxi-kalkulator

**Live URL:** https://voss-taxi-kalkulator.vercel.app

**Status:** Active (Multi-tenant production deployment)

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3 + Vite 5.4 |
| Language | JavaScript (ES6+, no TypeScript) |
| Database | Firebase Realtime Database |
| Authentication | Password-protected tariff editor (client-side) |
| Hosting | Vercel (serverless static hosting) |
| Other Services | Google Maps JavaScript API, Google Places API, Google Directions API |

### Application Structure

```
voss-taxi-kalkulator/
├── src/
│   ├── components/         # 7 React components
│   │   ├── AddressAutocomplete.jsx    # Google Places integration
│   │   ├── EstimatedPriceCard.jsx     # Price display with breakdown
│   │   ├── MapDisplay.jsx             # Google Maps + routing
│   │   ├── TariffEditorModal.jsx      # Password-protected editor
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useTariffData.js
│   │   ├── useRouteCalculation.js
│   │   └── ...
│   ├── utils/              # Business logic (pure functions)
│   │   ├── tariffCalculator.js        # Core pricing engine (257 lines)
│   │   ├── helligdager.js             # Norwegian holidays (956 lines)
│   │   └── logger.js                  # Centralized logging
│   ├── locales/
│   │   └── translations.js            # Manual i18n (NO/EN)
│   ├── App.jsx             # Main application (460 lines)
│   └── App.css             # Monolithic styles (1,322 lines)
├── integration/            # CTRL BOARD integration docs
└── public/                 # Static assets
```

### Key Components

| Component | Purpose |
|-----------|---------|
| **App.jsx** | Root component, centralized state management (no Redux), coordinates all child components |
| **tariffCalculator.js** | Pure function pricing engine with timeline-based calculations, handles 20 tariff combinations (4 vehicle groups × 5 time periods) |
| **MapDisplay.jsx** | Google Maps integration with DirectionsService, route visualization, distance/duration calculation |
| **Multi-tenant system** | Firebase-based tenant resolver with domain-based identification, 60+ CSS variables applied dynamically |
| **helligdager.js** | Calculates 12 Norwegian public holidays using Computus algorithm (moveable holidays from Easter) |

---

## Vision & Roadmap

### Current State

**Production-ready multi-tenant SaaS:**
- Real-time tariff updates via Firebase Realtime Database
- Domain-based tenant resolution (e.g., `tenant1.example.com` → loads tenant1 config)
- Theme customization with 60+ CSS variables per tenant
- Google Maps integration for route planning with via points
- PDF/print-friendly price quotes
- Bilingual interface (Norwegian/English)
- Password-protected tariff editor
- Responsive mobile design

### Short-Term Goals

- **CTRL BOARD integration** — Health monitoring, API cost tracking, user analytics, incident reporting
- **Improved tariff editor UX** — Hide edit button from normal users, only show to authenticated staff
- **Enhanced analytics** — Track which routes are most popular, peak usage times
- **Cost optimization** — Monitor Google Maps API costs per tenant, optimize route calculation caching

### Long-Term Vision

Transform from a single-company calculator into a white-label SaaS platform for taxi companies across Norway. Enable any taxi operator to deploy their own branded calculator with custom tariffs, themes, and domains. Provide centralized monitoring and management through CTRL BOARD to ensure uptime, track costs, and optimize performance across all tenants.

---

## CTRL BOARD Integration

### Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| SDK Installed | Planned | @ctrlboard/sdk v1.x |
| Heartbeats | Planned | Interval: 60s |
| API Usage Tracking | Planned | Provider: Google Maps (Directions, Places, Maps JS) |
| User Traffic | Planned | Reported: daily (DAU, calculations performed, prints) |
| Billing Events | Not Applicable | No payment processing in app |
| Auto-Instrumentation | Not Applicable | Pure client-side React app |
| Multi-Tenant Config | Active (Firebase) | Resolution: domain-based, already implemented |
| Webhooks | Not Yet | Future: tenant provisioning, config updates |

### How It Connects

```
[Voss Taxi Kalkulator]
    │
    ├── Sends to CTRL BOARD:
    │   ├── Heartbeats (every 60s) with tenant ID and app version
    │   ├── Google Maps API usage (Directions, Places) with cost metadata
    │   ├── User metrics (DAU, calculations, prints, sessions)
    │   ├── Incidents (errors from logger.js, Maps API failures)
    │   └── Performance metrics (route calculation latency)
    │
    └── Reads from Firebase:
        ├── /tenantRegistry/{tenantId}/config — Tariff rates, theme CSS variables
        ├── /domainMap/{domain} — Domain → tenant ID resolution
        └── [Already implemented, no changes needed for CTRL BOARD]
```

### SDK Setup

```javascript
// src/utils/ctrlboard.js
import { CtrlBoard } from '@ctrlboard/sdk';

// Feature flag to disable in development
const enabled = import.meta.env.VITE_CTRL_BOARD_ENABLED === 'true';

export const ctrlboard = enabled ? new CtrlBoard({
  apiKey: import.meta.env.VITE_CTRL_BOARD_API_KEY,
  baseUrl: import.meta.env.VITE_CTRL_BOARD_URL,
  appId: import.meta.env.VITE_CTRL_BOARD_APP_ID,
  heartbeat: true,
  heartbeatInterval: 60000, // 60 seconds
  debug: !import.meta.env.PROD
}) : null;

// Browser-compatible shutdown (no Node.js process object)
if (enabled) {
  window.addEventListener('beforeunload', async () => {
    await ctrlboard?.shutdown();
  });
}
```

### What You Track

| Metric | Endpoint | Frequency | Example |
|--------|----------|-----------|---------|
| Google Directions API | `bufferEvent()` | Per route calculation | `{ provider: "google_maps", api: "directions", latency: 342, success: true, distance: 15.3, waypoints: 2, cost: 0.005 }` |
| Google Places API | `bufferEvent()` | Per autocomplete selection | `{ provider: "google_maps", api: "places", latency: 123, success: true, cost: 0.017 }` |
| User calculations | `trackUserTraffic()` | Daily aggregation | `{ dau: 42, calculations: 156, prints: 23, vehicle_groups: {"1-4": 98, "5-6": 34, ...} }` |
| App errors | `reportIncident()` | Immediate | `{ severity: "error", title: "Maps API initialization failed", source: "MapDisplay.jsx", tenantId: "voss-taxi" }` |
| Route calculation errors | `reportIncident()` | Immediate | `{ severity: "warning", title: "Directions API ZERO_RESULTS", metadata: { start: "...", dest: "..." } }` |

### Multi-Tenant Configuration

**Already implemented** — CTRL BOARD integration will leverage existing Firebase structure without changes.

**Resolution method:** Domain-based (e.g., `tenant1.example.com` → `tenant1`)

**Firebase paths used:**
- `/tenantRegistry/{customerId}/config` — Tariff rates, holiday overrides, feature flags
- `/domainMap/{domain}` — Domain → customer ID mapping
- `/tenantRegistry/{customerId}/theme` — 60+ CSS variables for branding

**CSS variables consumed:**
- `--primary-color`, `--secondary-color`, `--accent-color`
- `--bg-gradient-start`, `--bg-gradient-end`
- `--card-bg`, `--card-border`, `--card-shadow`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--button-*`, `--input-*` variables (20+ total)
- Full list: See `src/App.jsx` lines 45-110

**CTRL BOARD enhancement:** All events will include `tenantId` in metadata for per-tenant analytics.

---

## Environment Variables

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=[Google Cloud API key with Maps JS, Places, Directions enabled]

# Tariff Editor
VITE_TARIFF_PASSWORD=Hestavangen11  # Optional, defaults to this

# Firebase Multi-Tenant Config (already in use)
VITE_FIREBASE_DATABASE_URL=[Firebase Realtime Database URL]
VITE_FIREBASE_API_KEY=[Firebase project API key]
VITE_FIREBASE_PROJECT_ID=[Firebase project ID]

# CTRL BOARD SDK (to be added)
VITE_CTRL_BOARD_URL=[CTRL BOARD instance URL]
VITE_CTRL_BOARD_API_KEY=[SDK API key from CTRL BOARD dashboard]
VITE_CTRL_BOARD_APP_ID=[App ID from CTRL BOARD registration]
VITE_CTRL_BOARD_ENABLED=true  # Feature flag to disable tracking
```

**Note:** All env vars must be prefixed with `VITE_` to be exposed to client-side code (Vite requirement).

---

## Integration Opportunities

### What We Could Leverage Next

1. **Real-time cost alerts** — Send alert when a tenant's daily Google Maps API costs exceed threshold (e.g., $5/day)
   - Benefit: Prevent surprise bills, identify misconfigured domains, detect bot traffic

2. **Tenant-specific uptime SLAs** — Track uptime per tenant, send alerts if specific tenant experiences errors
   - Benefit: Premium tenants could receive 99.9% SLA guarantees with proactive monitoring

3. **A/B testing via CTRL BOARD feature flags** — Use CTRL BOARD's Firebase integration to toggle features per tenant
   - Benefit: Test new tariff calculation UX, address autocomplete improvements, or UI changes with subset of tenants

4. **Webhook-based tenant provisioning** — When new tenant created in CTRL BOARD, auto-configure Firebase paths and DNS
   - Benefit: Fully automated tenant onboarding (currently manual)

5. **Route popularity analytics** — Track most common start/end addresses per tenant
   - Benefit: Pre-cache popular routes, optimize autocomplete suggestions, suggest common destinations

### What We'd Need from CTRL BOARD

1. **Multi-provider cost tracking** — Currently tracks individual API providers, need aggregated "total external costs per tenant"
   - Why: Single dashboard showing total Google Maps spend across all tenants

2. **Embedded widget for tenant dashboards** — iFrame or SDK component showing real-time uptime and API costs
   - Why: Allow white-label customers to monitor their own instance without CTRL BOARD login

3. **Cost forecasting** — Predict end-of-month Google Maps costs based on current usage trends
   - Why: Budget planning for multi-tenant operators, proactive cost management

---

## Cross-App Communication

**Not currently applicable** — Voss Taxi Kalkulator is standalone and does not share data with other apps.

**Future potential:** If Voss Taxi deploys additional apps (booking system, dispatch system), could share:

| Direction | Data | Path/Method | Frequency |
|-----------|------|-------------|-----------|
| Calculator → Booking System | Estimated prices | Firebase `/quotes/{quoteId}` | Per quote generation |
| Dispatch → Calculator | Real-time vehicle locations | Firebase `/vehicles/{vehicleId}` | Every 30s |

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | Toni Kolve / Kolve ST | [GitHub: Warr10rOfOdin] |
| Product Owner | Voss Taxi | [Contact via repository issues] |

---

## Implementation Timeline

**Planned 5-day rollout:**

- **Day 1** (4-5 hours): SDK setup, heartbeat testing
- **Day 2** (3-4 hours): Google Maps API tracking
- **Day 3** (2-3 hours): Error/incident reporting
- **Day 4** (4-5 hours): User analytics and comprehensive testing
- **Day 5** (2-3 hours): Staging → production rollout (10% → 100% gradual)

**Total effort:** 15-20 hours development + 5-10 hours testing

---

## Technical Considerations

### Bundle Size Impact
- **@ctrlboard/sdk**: ~15-20KB gzipped
- **Current bundle**: ~500KB
- **Impact**: ~2-4% increase, negligible

### Performance Impact
- **Heartbeats**: Background thread, no UI blocking
- **Event buffering**: Auto-batches 50 events or 5 seconds
- **Google Maps tracking overhead**: ~2ms per API call

### Privacy & GDPR Compliance
- **No PII tracked**: Only aggregate metrics (distance, duration, vehicle group)
- **User addresses**: NOT sent to CTRL BOARD (only sent to Google Maps)
- **IP anonymization**: CTRL BOARD handles server-side
- **Opt-out**: Feature flag (`VITE_CTRL_BOARD_ENABLED=false`)
- **Data retention**: 90 days (configurable in CTRL BOARD)

### Error Handling
- **Graceful degradation**: App continues working if CTRL BOARD is down
- **Silent failures**: All SDK calls are try-catch wrapped
- **No blocking operations**: Fire-and-forget pattern

---

**Last Updated:** 2026-03-08

**See Also:** [APP_PROFILE_TEMPLATE.md](./APP_PROFILE_TEMPLATE.md) | [Implementation Plan](../docs/CTRL_BOARD_INTEGRATION.md) | [CLAUDE.md](../CLAUDE.md)
