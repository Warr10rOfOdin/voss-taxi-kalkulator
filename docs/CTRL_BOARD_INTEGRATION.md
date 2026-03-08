# CTRL BOARD Integration Guide

**Application:** Voss Taxi Kalkulator
**Integration Type:** Push (SDK-based)
**Last Updated:** 2026-03-08
**Status:** ✅ Implemented

---

## Table of Contents

1. [Overview](#overview)
2. [What Gets Tracked](#what-gets-tracked)
3. [Architecture](#architecture)
4. [Setup Instructions](#setup-instructions)
5. [API Reference](#api-reference)
6. [Data Formats](#data-formats)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Privacy & Compliance](#privacy--compliance)

---

## Overview

### Integration Summary

Voss Taxi Kalkulator integrates with CTRL BOARD to provide:

- **Health monitoring** via automatic heartbeats (60s interval)
- **API cost tracking** for Google Maps APIs (Directions, Places, Maps JS)
- **User analytics** with daily aggregation (DAU, calculations, prints)
- **Incident reporting** for errors and Maps API failures
- **Multi-tenant support** with per-tenant metrics

### Key Characteristics

| Property | Value |
|----------|-------|
| **Integration Mode** | Push (SDK sends data to CTRL BOARD) |
| **SDK Version** | @ctrlboard/sdk v1.x |
| **Runtime** | Browser (client-side React app) |
| **Heartbeat Interval** | 60 seconds |
| **Event Buffering** | 50 events or 5 seconds (whichever comes first) |
| **Multi-Tenant** | Yes (domain-based resolution) |
| **Privacy-Safe** | Yes (no PII tracked) |

---

## What Gets Tracked

### 1. Heartbeats (Health Monitoring)

**Frequency:** Every 60 seconds
**Endpoint:** Automatic (SDK handles)
**Metadata Included:**

```json
{
  "tenantId": "voss-taxi",
  "appVersion": "1.0.0",
  "environment": "production",
  "timestamp": "2026-03-08T14:30:00Z"
}
```

**Purpose:** Track uptime, detect outages, monitor availability per tenant

---

### 2. Google Maps API Usage

#### Directions API

**Frequency:** Per route calculation (typically 1-10/day per user)
**Endpoint:** `bufferEvent()`
**Example payload:**

```json
{
  "provider": "google_maps",
  "api": "directions",
  "latency": 342,
  "success": true,
  "metadata": {
    "distance": 15.3,
    "duration": 18,
    "waypoints": 2,
    "vehicleGroup": "1-4",
    "cost": 0.005
  },
  "tenantId": "voss-taxi",
  "timestamp": "2026-03-08T14:30:15Z"
}
```

**Cost calculation:**
- $5.00 per 1,000 requests = $0.005 per request
- See: https://developers.google.com/maps/billing/gmp-billing

#### Places API (Autocomplete)

**Frequency:** Per address selection (3-5 per calculation)
**Endpoint:** `bufferEvent()`
**Example payload:**

```json
{
  "provider": "google_maps",
  "api": "places_autocomplete",
  "latency": 123,
  "success": true,
  "metadata": {
    "cost": 0.00283,
    "type": "autocomplete_session"
  },
  "tenantId": "voss-taxi",
  "timestamp": "2026-03-08T14:30:12Z"
}
```

**Cost calculation:**
- $2.83 per 1,000 sessions = $0.00283 per session
- Session = multiple autocomplete requests + 1 place details request

---

### 3. User Traffic Metrics

**Frequency:** Daily aggregation (sent once per day per user)
**Endpoint:** `trackUserTraffic()`
**Example payload:**

```json
{
  "date": "2026-03-08",
  "dau": 42,
  "calculations": 156,
  "prints": 23,
  "sessions": 87,
  "metadata": {
    "vehicle_groups": {
      "1-4": 98,
      "5-6": 34,
      "7-8": 18,
      "9-16": 6
    },
    "languages": {
      "no": 134,
      "en": 22
    },
    "avg_distance": 12.3,
    "avg_duration": 15.6
  },
  "tenantId": "voss-taxi"
}
```

**Aggregation logic:**
- Uses `localStorage` to track daily counts
- Resets at midnight (local time)
- Sent on first load of next day

---

### 4. Incidents & Errors

**Frequency:** Immediate (as they occur)
**Endpoint:** `reportIncident()`

#### Application Errors

**Example payload:**

```json
{
  "severity": "error",
  "title": "Maps API initialization failed",
  "description": "Failed to load Google Maps JavaScript API: Network error",
  "source": "MapDisplay.jsx:45",
  "metadata": {
    "apiKey": "AIza***************",
    "error": "ERR_CONNECTION_REFUSED",
    "tenantId": "voss-taxi"
  },
  "timestamp": "2026-03-08T14:30:20Z"
}
```

#### Google Maps API Errors

**Example payload:**

```json
{
  "severity": "warning",
  "title": "Directions API ZERO_RESULTS",
  "description": "No route found between start and destination",
  "source": "MapDisplay.jsx:handleRouteCalculation",
  "metadata": {
    "start": "Hestavangen 11, Voss",
    "destination": "Invalid Address 123",
    "status": "ZERO_RESULTS",
    "tenantId": "voss-taxi"
  },
  "timestamp": "2026-03-08T14:30:22Z"
}
```

**Severity levels:**
- `critical` - App completely broken (rare)
- `error` - Feature broken, user impact (e.g., Maps won't load)
- `warning` - Degraded experience (e.g., route not found)
- `info` - Informational (not used currently)

---

## Architecture

### Integration Flow

```
┌─────────────────────────────────────────┐
│   Voss Taxi Kalkulator (React App)     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  App.jsx (Root Component)       │   │
│  │  - Initializes on mount         │   │
│  │  - Tracks user actions          │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  useCtrlBoard Hook              │   │
│  │  - trackMapApiCall()            │   │
│  │  - reportError()                │   │
│  │  - trackCalculation()           │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  ctrlboard.js (SDK Client)      │   │
│  │  - Singleton instance           │   │
│  │  - Auto heartbeats (60s)        │   │
│  │  - Event buffering              │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
└─────────────┼───────────────────────────┘
              │ HTTPS POST
              │ (batched events)
              │
      ┌───────▼─────────┐
      │   CTRL BOARD    │
      │   API Server    │
      │  (Vercel Edge)  │
      └───────┬─────────┘
              │
      ┌───────▼─────────┐
      │  Firebase RTDB  │
      │  - Events       │
      │  - Incidents    │
      │  - Metrics      │
      └─────────────────┘
```

### File Structure

```
src/
├── utils/
│   ├── ctrlboard.js           # SDK initialization (singleton)
│   └── logger.js              # Enhanced with incident reporting
├── hooks/
│   ├── useCtrlBoard.js        # Monitoring hook (main API)
│   ├── useAnalytics.js        # User metrics aggregation
│   └── index.js               # Exports all hooks
├── components/
│   ├── MapDisplay.jsx         # Tracks Directions API calls
│   ├── AddressAutocomplete.jsx # Tracks Places API calls
│   ├── EstimatedPriceCard.jsx  # Tracks print actions
│   └── ErrorBoundary.jsx      # Catches React errors
└── App.jsx                    # Root - wraps with ErrorBoundary
```

---

## Setup Instructions

### For CTRL BOARD Developers

#### 1. Register the App

In CTRL BOARD dashboard:

1. Navigate to **Apps** → **Register New App**
2. Fill in:
   - **App Name:** Voss Taxi Kalkulator
   - **Description:** Multi-tenant taxi fare calculator with real-time pricing
   - **Integration Type:** Push (SDK)
   - **Environment:** Production (add staging separately)
3. Copy the generated:
   - **App ID** (e.g., `voss-taxi-kalkulator-prod`)
   - **API Key** (e.g., `drivas_live_abc123...`)

#### 2. Configure Expected Metrics

In app settings, configure:

- **Heartbeat expected interval:** 60 seconds
- **Alert if no heartbeat for:** 5 minutes
- **API providers to track:** Google Maps (custom)
- **Billing events:** None (no payment processing)
- **Multi-tenant:** Yes (domain-based)

#### 3. Set Up Alerts

Recommended alerts:

| Alert | Condition | Recipients |
|-------|-----------|------------|
| App Down | No heartbeat for 5+ minutes | Ops team |
| High API Costs | Google Maps costs > $10/day | Finance team |
| Error Spike | >10 errors in 1 hour | Dev team |
| Tenant Offline | Specific tenant no heartbeat for 10+ min | Account manager |

#### 4. Dashboard Widgets

Suggested dashboard layout:

- **Uptime Chart** (7 days)
- **Google Maps Cost Trend** (30 days)
- **DAU Chart** (30 days)
- **Top 5 Tenants by Usage**
- **Recent Incidents** (last 24 hours)

---

### For Voss Taxi Developers

See [SETUP_GUIDE.md](../integration/SETUP_GUIDE.md) for detailed setup instructions.

**Quick start:**

```bash
# Install SDK
npm install @ctrlboard/sdk

# Add to .env
VITE_CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_...
VITE_CTRL_BOARD_APP_ID=voss-taxi-kalkulator-prod
VITE_CTRL_BOARD_ENABLED=true

# Deploy
git push origin main
```

---

## API Reference

### SDK Methods Used

#### `new CtrlBoard(config)`

**Initialization:**

```javascript
import { CtrlBoard } from '@ctrlboard/sdk';

const ctrlboard = new CtrlBoard({
  apiKey: process.env.VITE_CTRL_BOARD_API_KEY,
  baseUrl: process.env.VITE_CTRL_BOARD_URL,
  appId: process.env.VITE_CTRL_BOARD_APP_ID,
  heartbeat: true,
  heartbeatInterval: 60000, // 60 seconds
  debug: false
});
```

#### `bufferEvent(event)`

**Track API usage:**

```javascript
ctrlboard.bufferEvent({
  provider: 'google_maps',
  api: 'directions',
  latency: 342,
  success: true,
  metadata: {
    distance: 15.3,
    cost: 0.005,
    tenantId: 'voss-taxi'
  }
});
```

#### `reportIncident(incident)`

**Report errors:**

```javascript
ctrlboard.reportIncident({
  severity: 'error',
  title: 'Maps API initialization failed',
  description: error.message,
  source: 'MapDisplay.jsx',
  metadata: {
    tenantId: getCurrentTenantId(),
    error: error.stack
  }
});
```

#### `trackUserTraffic(metrics)`

**Daily user metrics:**

```javascript
ctrlboard.trackUserTraffic({
  date: '2026-03-08',
  dau: 42,
  calculations: 156,
  prints: 23,
  metadata: {
    tenantId: 'voss-taxi',
    vehicle_groups: {...}
  }
});
```

#### `shutdown()`

**Graceful cleanup:**

```javascript
// On page unload
window.addEventListener('beforeunload', async () => {
  await ctrlboard.shutdown();
});
```

---

## Data Formats

### Event Metadata Structure

All events include these standard fields:

```typescript
interface BaseEvent {
  timestamp: string;        // ISO 8601 UTC
  tenantId: string;         // Current tenant ID
  environment: 'production' | 'staging' | 'development';
  appVersion: string;       // From package.json
}
```

### Google Maps Cost Calculation

```javascript
// Directions API
const directionsRequestCost = 0.005; // $5 per 1000 requests

// Places Autocomplete (per session)
const autocompleteSessionCost = 0.00283; // $2.83 per 1000 sessions

// Total event cost
const totalCost = directionsRequestCost + (autocompleteSessionCost * 3); // Avg 3 autocompletes per calculation
```

### Daily Metrics Aggregation

**localStorage schema:**

```javascript
{
  "ctrlboard_daily_metrics_2026-03-08": {
    "calculations": 15,
    "prints": 3,
    "vehicle_groups": {
      "1-4": 10,
      "5-6": 3,
      "7-8": 2
    },
    "total_distance": 184.5,
    "total_duration": 234
  }
}
```

**Reset logic:**

```javascript
// Check if new day
const today = new Date().toISOString().split('T')[0];
const lastDate = localStorage.getItem('ctrlboard_last_date');

if (today !== lastDate) {
  // Send previous day's metrics
  sendDailyMetrics(lastDate);

  // Reset counters
  localStorage.setItem('ctrlboard_last_date', today);
  localStorage.removeItem(`ctrlboard_daily_metrics_${lastDate}`);
}
```

---

## Testing & Verification

### Pre-Deployment Checklist

- [ ] SDK initializes without errors (check console)
- [ ] Heartbeats appear in CTRL BOARD (green status)
- [ ] Test Google Maps API call tracking:
  - [ ] Enter addresses
  - [ ] Calculate route
  - [ ] Verify event in CTRL BOARD "Costs" page
- [ ] Test incident reporting:
  - [ ] Force an error (invalid API key)
  - [ ] Verify incident appears in CTRL BOARD
- [ ] Test daily metrics:
  - [ ] Perform calculations
  - [ ] Change `localStorage` date to trigger send
  - [ ] Verify metrics in CTRL BOARD "Users" page
- [ ] Test multi-tenant:
  - [ ] Switch domains (different tenants)
  - [ ] Verify separate metrics per tenant
- [ ] Test feature flag:
  - [ ] Set `VITE_CTRL_BOARD_ENABLED=false`
  - [ ] Verify app works without tracking
- [ ] Performance check:
  - [ ] No UI lag during tracking
  - [ ] Network tab shows batched requests (not per-event)

### Development Testing

```bash
# Enable debug mode
VITE_CTRL_BOARD_ENABLED=true
VITE_DEBUG=true  # Enables verbose SDK logging

# Run dev server
npm run dev

# Open console and verify:
# ✅ "CTRL BOARD SDK initialized"
# ✅ "Heartbeat sent" (every 60s)
# ✅ "Event buffered: google_maps" (after route calculation)
```

### Production Monitoring

**Week 1 checks:**
1. Verify 99%+ heartbeat success rate
2. Check Google Maps costs align with expected usage
3. Review incident frequency (should be low)
4. Confirm DAU numbers match Google Analytics (if available)

**Ongoing:**
- Set up CTRL BOARD alerts (see Setup Instructions)
- Weekly review of cost trends
- Monthly review of incident patterns

---

## Troubleshooting

### Issue: No Heartbeats Appearing

**Symptoms:**
- App shows offline in CTRL BOARD
- Last heartbeat > 5 minutes ago

**Diagnosis:**

```javascript
// In browser console
console.log(window.ctrlboard); // Should be defined
console.log(import.meta.env.VITE_CTRL_BOARD_ENABLED); // Should be "true"
```

**Solutions:**
1. Check environment variables are set in Vercel
2. Verify API key is valid (test in CTRL BOARD dashboard)
3. Check browser console for CORS errors
4. Verify `VITE_CTRL_BOARD_ENABLED=true` (case-sensitive)

---

### Issue: Events Not Appearing in CTRL BOARD

**Symptoms:**
- Heartbeats work, but no API usage events
- Cost tracking shows $0.00

**Diagnosis:**

```javascript
// Add to useCtrlBoard.js
const trackMapApiCall = (type, latency, metadata) => {
  console.log('Tracking Maps API call:', { type, latency, metadata });

  if (!ctrlboard) {
    console.warn('CTRL BOARD not initialized');
    return;
  }

  ctrlboard.bufferEvent({...});
};
```

**Solutions:**
1. Verify `MapDisplay.jsx` is calling `trackMapApiCall()`
2. Check SDK batching (events sent every 5s or 50 events)
3. Wait 5 seconds, then check CTRL BOARD
4. Verify no JavaScript errors in console

---

### Issue: Duplicate Events

**Symptoms:**
- Same event appears multiple times
- Costs are 2x-3x expected

**Diagnosis:**

```javascript
// Check if component re-renders are triggering multiple events
useEffect(() => {
  console.log('MapDisplay rendered');
  // Should only log once per route calculation
}, [distanceKm]);
```

**Solutions:**
1. Ensure `trackMapApiCall()` is inside callback, not render
2. Add `useRef` to prevent duplicate tracking
3. Check for React StrictMode double-invocation (dev only)

---

### Issue: High API Costs

**Symptoms:**
- Google Maps costs higher than expected
- CTRL BOARD alert triggered

**Diagnosis:**

1. Check CTRL BOARD "Costs" page → filter by tenant
2. Look for:
   - Excessive Directions API calls (>10/user/day)
   - Places API quota exceeded errors
   - Bot traffic (many requests, no calculations)

**Solutions:**
1. Implement caching for popular routes
2. Add rate limiting (e.g., max 5 calculations per session)
3. Check for infinite loops in route calculation
4. Review Google Cloud Console for usage details

---

### Issue: Privacy Concerns

**Symptoms:**
- Question about whether user addresses are tracked

**Clarification:**

**What IS tracked:**
- ✅ Distance (km)
- ✅ Duration (minutes)
- ✅ Vehicle group (1-4, 5-6, etc.)
- ✅ Calculation count

**What is NOT tracked:**
- ❌ User addresses (start, destination, via points)
- ❌ IP addresses (CTRL BOARD anonymizes)
- ❌ User names or identifiers
- ❌ Any PII

**Verification:**
- Review `src/hooks/useCtrlBoard.js` → no address data in metadata
- Check CTRL BOARD event logs → no address fields
- GDPR compliant by design

---

## Privacy & Compliance

### GDPR Compliance

**Data Protection Measures:**

1. **No PII tracking** - Only aggregate metrics (distance, duration, counts)
2. **IP anonymization** - CTRL BOARD anonymizes IPs server-side
3. **Data retention** - 90 days (configurable in CTRL BOARD)
4. **Opt-out mechanism** - Feature flag: `VITE_CTRL_BOARD_ENABLED=false`
5. **Data deletion** - Available via CTRL BOARD API

### User Privacy

**What users should know:**

> "We collect anonymous usage statistics (calculation frequency, route distances) to improve service quality and monitor system health. No personal information or addresses are stored."

**Privacy policy additions:**

```markdown
## Analytics & Monitoring

We use CTRL BOARD monitoring to:
- Track application uptime and performance
- Monitor third-party API costs (Google Maps)
- Analyze aggregate usage patterns

We do NOT collect:
- Your search addresses or destinations
- Personal identifying information
- Individual user behavior beyond aggregate statistics

Data retention: 90 days. Opt-out: Contact support.
```

### Security

**API Key Protection:**

- ✅ API keys stored in environment variables (not in code)
- ✅ Vercel environment variables encrypted at rest
- ✅ HTTPS-only communication
- ✅ CORS restrictions configured in CTRL BOARD

**Incident Data:**

- Error messages may contain partial addresses (e.g., "Invalid address")
- Stack traces contain file names and line numbers only
- No user session tokens or authentication data

---

## Support & Contact

### For CTRL BOARD Issues

- **Dashboard:** [Your CTRL BOARD URL]/apps/voss-taxi-kalkulator
- **API Docs:** [CTRL BOARD API Reference](../integration/API_REFERENCE.md)
- **Support:** CTRL BOARD team via Slack/email

### For Voss Taxi Issues

- **GitHub:** https://github.com/Warr10rOfOdin/voss-taxi-kalkulator/issues
- **Developer:** Toni Kolve / Kolve ST
- **Documentation:** [CLAUDE.md](../CLAUDE.md)

---

**Last Updated:** 2026-03-08
**Integration Version:** 1.0.0
**Next Review:** 2026-06-08 (3 months)
