# CTRL BOARD Integration Testing Guide

**Application:** Voss Taxi Kalkulator
**Last Updated:** 2026-03-08
**Test Coverage:** Complete integration testing for CTRL BOARD monitoring and analytics

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Testing](#development-testing)
4. [Production Testing](#production-testing)
5. [Test Scenarios](#test-scenarios)
6. [Verification Checklist](#verification-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- ✅ CTRL BOARD instance deployed and accessible
- ✅ App registered in CTRL BOARD (API key and App ID obtained)
- ✅ Voss Taxi Kalkulator running locally or deployed
- ✅ Google Maps API key configured
- ✅ Browser with developer tools (Chrome/Firefox recommended)

### Optional but Recommended

- 📊 Google Analytics (to cross-verify DAU numbers)
- 📧 Email for alert testing
- 🔔 Slack webhook for incident notifications

---

## Environment Setup

### Step 1: Configure Local Environment

Create or update `.env` file:

```bash
# Copy from example
cp .env.example .env

# Edit with your actual credentials
nano .env
```

**Required variables:**

```env
# Google Maps API (already configured)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase (already configured)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_DATABASE_URL=https://your-project.firebasedatabase.app

# CTRL BOARD Integration
VITE_CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_your_actual_key
VITE_CTRL_BOARD_APP_ID=voss-taxi-kalkulator-dev  # Use 'dev' for testing
VITE_CTRL_BOARD_ENABLED=true
```

**Optional debug flag:**

```env
# Enable CTRL BOARD reporting in development
VITE_CTRL_BOARD_DEBUG=true
```

### Step 2: Verify Configuration

```bash
# Check environment variables
grep VITE_CTRL_BOARD .env

# Should output:
# VITE_CTRL_BOARD_URL=...
# VITE_CTRL_BOARD_API_KEY=...
# VITE_CTRL_BOARD_APP_ID=...
# VITE_CTRL_BOARD_ENABLED=true
```

### Step 3: Start Development Server

```bash
npm install
npm run dev
```

Expected output:

```
VITE v5.4.10  ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Development Testing

### Test 1: SDK Initialization

**Objective:** Verify CTRL BOARD SDK initializes correctly

**Steps:**

1. Open http://localhost:5173/
2. Open browser DevTools (F12)
3. Go to **Console** tab

**Expected Output:**

```
[CTRL BOARD] Initializing SDK { appId: "voss-taxi-kalkulator-dev", ... }
[CTRL BOARD] Heartbeat started (60000ms interval)
[CTRL BOARD] SDK initialized successfully
[CTRL BOARD] Heartbeat sent { appId: "...", timestamp: "...", status: "online" }
```

**Pass Criteria:**

- ✅ No CTRL BOARD errors in console
- ✅ "SDK initialized successfully" message appears
- ✅ Heartbeat messages appear every 60 seconds

**Failure Indicators:**

- ❌ "SDK is disabled" → Check `VITE_CTRL_BOARD_ENABLED=true`
- ❌ "401 Unauthorized" → Verify API key is correct
- ❌ Network error → Check CTRL BOARD URL is accessible

---

### Test 2: Heartbeat Monitoring

**Objective:** Verify heartbeats appear in CTRL BOARD dashboard

**Steps:**

1. Keep browser tab open for 2 minutes
2. Go to CTRL BOARD dashboard
3. Navigate to **Apps** → **Voss Taxi Kalkulator**
4. Check **Health** tab

**Expected Results:**

- ✅ App status shows **green** (Online)
- ✅ Last heartbeat timestamp is recent (< 60 seconds ago)
- ✅ Uptime chart shows data points

**CTRL BOARD Dashboard Screenshot:**

```
┌─────────────────────────────────────┐
│ Voss Taxi Kalkulator                │
│ ● Online  Last heartbeat: 23s ago   │
├─────────────────────────────────────┤
│ Uptime (Last 24h): 99.8%            │
│ ████████████████████████████████    │
└─────────────────────────────────────┘
```

---

### Test 3: Google Maps API Tracking

**Objective:** Verify Maps API calls are tracked with cost data

**Steps:**

1. In the calculator, enter addresses:
   - **Start:** `Hestavangen 11, Voss`
   - **Destination:** `Voss Stasjon, Voss`

2. Click "Beregn pris" / "Calculate Price"

3. Check browser console

**Expected Console Output:**

```
[MapDisplay] Calculating route (trigger: 1)
[MapDisplay] From: Hestavangen 11, Voss → To: Voss Stasjon, Voss
[CTRL BOARD] Event buffered: { provider: "google_maps", api: "places_autocomplete", ... }
[CTRL BOARD] Event buffered: { provider: "google_maps", api: "directions", ... }
[MapDisplay] Route calculated: 1.23 km, 3 min
[CTRL BOARD] Flushed 4 events
```

4. Go to CTRL BOARD → **Costs** tab

**Expected Dashboard Data:**

| API | Requests | Cost per Request | Total Cost |
|-----|----------|------------------|------------|
| Google Maps - Directions | 1 | $0.005 | $0.005 |
| Google Maps - Places Autocomplete | 3 | $0.00283 | $0.00849 |
| **Total** | **4** | | **$0.01349** |

**Pass Criteria:**

- ✅ 1 Directions API event appears
- ✅ 2-4 Places Autocomplete events appear
- ✅ Cost calculation is correct (~$0.013)
- ✅ Events include metadata (distance, duration, waypoints)

---

### Test 4: Via Points Tracking

**Objective:** Verify route calculations with via points are tracked correctly

**Steps:**

1. Enter addresses:
   - **Start:** `Bergen, Norway`
   - **Via 1:** `Voss Stasjon, Voss`
   - **Via 2:** `Stalheim Hotel, Stalheim`
   - **Destination:** `Flåm, Norway`

2. Calculate route
3. Check CTRL BOARD Costs page

**Expected Results:**

- ✅ Directions API event includes `waypoints: 2`
- ✅ Distance is sum of all segments
- ✅ Places Autocomplete events: 6-8 (2 per field)

---

### Test 5: Error Reporting - Maps API Failure

**Objective:** Verify Maps API errors are reported as incidents

**Steps:**

1. Temporarily break the Maps API key:
   ```bash
   # In .env
   VITE_GOOGLE_MAPS_API_KEY=INVALID_KEY_FOR_TESTING
   ```

2. Restart dev server: `npm run dev`
3. Reload browser
4. Check console for errors
5. Go to CTRL BOARD → **Incidents** tab

**Expected Console Output:**

```
Google Maps failed to load: InvalidKeyMapError
[CTRL BOARD] Incident reported: { severity: "error", title: "Maps API initialization failed", ... }
```

**Expected Dashboard:**

```
┌────────────────────────────────────────────────────┐
│ Recent Incidents                                   │
├────────────────────────────────────────────────────┤
│ 🔴 CRITICAL  Maps API initialization failed        │
│    Source: MapDisplay.jsx                          │
│    Time: 2 seconds ago                             │
│    Tenant: development                             │
│    Details: InvalidKeyMapError                     │
└────────────────────────────────────────────────────┘
```

**Pass Criteria:**

- ✅ Incident appears in CTRL BOARD within 5 seconds
- ✅ Severity is "error" or "critical"
- ✅ Includes error message and source file
- ✅ Tenant ID is correct

**Cleanup:**

```bash
# Restore correct API key
VITE_GOOGLE_MAPS_API_KEY=your_correct_key
npm run dev
```

---

### Test 6: Error Reporting - Invalid Route

**Objective:** Verify failed route calculations are handled gracefully

**Steps:**

1. Enter addresses:
   - **Start:** `Voss, Norway`
   - **Destination:** `Tokyo, Japan`  # No driving route possible

2. Calculate route
3. Check console and CTRL BOARD

**Expected Behavior:**

- ✅ Directions API tracked with `success: false`
- ✅ Error status: `ZERO_RESULTS`
- ❌ **Should NOT** create incident (user input error, not system error)

**Console Output:**

```
[MapDisplay] Directions API request failed: ZERO_RESULTS
[CTRL BOARD] Event buffered: { provider: "google_maps", api: "directions", success: false, error: "ZERO_RESULTS" }
```

---

### Test 7: Logger Integration

**Objective:** Verify logger errors are auto-reported to CTRL BOARD

**Steps:**

1. Open browser console
2. Manually trigger an error using the logger:
   ```javascript
   // In browser console
   import('./src/utils/logger.js').then(({ logger }) => {
     logger.error('[TEST]', 'Manual error test', new Error('Test error'));
   });
   ```

3. Check CTRL BOARD Incidents tab

**Expected Results:**

- ✅ Incident appears with title: `[TEST]: Test error`
- ✅ Severity: `error`
- ✅ Source: `TEST`

---

## Production Testing

### Pre-Deployment Checklist

Before deploying to production:

- [ ] All development tests pass
- [ ] Environment variables configured in Vercel
- [ ] Separate CTRL BOARD App ID for production
- [ ] Alert rules configured in CTRL BOARD
- [ ] Team notified of deployment

### Production Environment Variables

In **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_CTRL_BOARD_URL` | `https://ctrl-board.vercel.app` | Production |
| `VITE_CTRL_BOARD_API_KEY` | `drivas_live_prod_key` | Production |
| `VITE_CTRL_BOARD_APP_ID` | `voss-taxi-kalkulator-prod` | Production |
| `VITE_CTRL_BOARD_ENABLED` | `true` | Production |

**DO NOT set `VITE_CTRL_BOARD_DEBUG=true` in production!**

### Production Smoke Test

After deployment:

1. **Visit production URL**: https://voss-taxi-kalkulator.vercel.app
2. **Open DevTools** (briefly, then close)
3. **Perform 1 calculation**
4. **Wait 5 minutes**
5. **Check CTRL BOARD dashboard**

**Expected Results:**

- ✅ Heartbeats arriving every 60s
- ✅ 1 Directions API event
- ✅ 3-4 Places Autocomplete events
- ✅ No incidents (if everything works)
- ✅ Costs tracking enabled

---

## Test Scenarios

### Scenario 1: Normal User Journey

**User Story:** Customer calculates a taxi fare

**Steps:**

1. Visit homepage
2. Enter start address (uses autocomplete)
3. Enter destination address (uses autocomplete)
4. Click calculate
5. View price breakdown
6. Print PDF

**Expected Tracking:**

| Event | Count | Notes |
|-------|-------|-------|
| Heartbeats | ~1 per minute | During session |
| Maps JS Init | 1 | On page load |
| Places Autocomplete | 4-6 | 2-3 per address field |
| Directions API | 1 | On calculate |
| Print | 1 | On print (Day 4 feature) |

**Expected Cost:** ~$0.018

---

### Scenario 2: Multi-Leg Journey with Via Points

**User Story:** Customer plans multi-stop trip

**Steps:**

1. Enter start address
2. Add 3 via points
3. Enter destination
4. Calculate route

**Expected Tracking:**

| Event | Count | Notes |
|-------|-------|-------|
| Places Autocomplete | 10-15 | 2-3 per field (5 fields) |
| Directions API | 1 | Includes waypoints metadata |

**Metadata Check:**

```json
{
  "provider": "google_maps",
  "api": "directions",
  "success": true,
  "metadata": {
    "distance": 45.2,
    "duration": 52,
    "waypoints": 3  // ✅ Should match via points count
  }
}
```

---

### Scenario 3: Error Recovery

**User Story:** User experiences a temporary network issue

**Steps:**

1. Disable network in DevTools
2. Try to calculate route
3. Re-enable network
4. Calculate again

**Expected Behavior:**

- ✅ First attempt: Directions API fails, incident reported
- ✅ Second attempt: Succeeds, normal tracking
- ✅ App continues working (graceful degradation)

---

### Scenario 4: Multi-Tenant Verification

**User Story:** Different tenants use the calculator

**Steps:**

1. Access as Tenant A: `tenant-a.example.com`
2. Calculate 1 route
3. Access as Tenant B: `tenant-b.example.com`
4. Calculate 1 route
5. Check CTRL BOARD dashboard

**Expected Results:**

- ✅ Events tagged with correct tenant IDs
- ✅ Can filter by tenant in CTRL BOARD
- ✅ Separate cost tracking per tenant

**Dashboard Filters:**

```
Tenant: tenant-a
  - Costs: $0.013
  - Events: 4
  - Incidents: 0

Tenant: tenant-b
  - Costs: $0.013
  - Events: 4
  - Incidents: 0
```

---

## Verification Checklist

### ✅ Functional Tests

- [ ] SDK initializes without errors
- [ ] Heartbeats sent every 60 seconds
- [ ] Heartbeats appear in CTRL BOARD dashboard
- [ ] Maps API calls tracked (Directions, Places)
- [ ] API events include cost metadata
- [ ] Errors reported as incidents
- [ ] Logger integration works (error → incident)
- [ ] ErrorBoundary integration works (React error → incident)

### ✅ Data Accuracy Tests

- [ ] Cost calculations are correct
  - Directions: $0.005 per request
  - Places: $0.00283 per session
- [ ] Distance and duration metadata accurate
- [ ] Waypoints count matches via points
- [ ] Tenant ID correctly tagged on all events

### ✅ Performance Tests

- [ ] No visible UI lag during tracking
- [ ] Event buffering works (batches sent every 5s or 50 events)
- [ ] Network requests are batched (not per-event)
- [ ] App works offline (tracking fails gracefully)

### ✅ Production Readiness

- [ ] Environment variables configured in Vercel
- [ ] Separate app IDs for dev/staging/prod
- [ ] Alert rules configured in CTRL BOARD
- [ ] Team trained on dashboard usage
- [ ] Rollback plan documented

---

## Troubleshooting

### Issue: No events appearing in CTRL BOARD

**Symptoms:**
- Console shows "Event buffered"
- But CTRL BOARD Costs page is empty

**Diagnosis:**

```javascript
// In browser console
// Check if events are being sent
window.ctrlboard  // Should be defined
```

**Solutions:**

1. **Wait 5 seconds** - Events are batched
2. **Check Network tab**:
   - Filter: `api/events`
   - Should see POST requests every 5s
3. **Verify App ID matches**:
   - `.env` file
   - CTRL BOARD dashboard
4. **Check CORS settings** in CTRL BOARD:
   - Allowed origins should include `http://localhost:5173`

---

### Issue: Heartbeats not appearing

**Symptoms:**
- App shows offline in CTRL BOARD
- Last heartbeat > 5 minutes ago

**Diagnosis:**

```bash
# Check environment variables
grep VITE_CTRL_BOARD_ENABLED .env
# Should output: VITE_CTRL_BOARD_ENABLED=true
```

**Solutions:**

1. **Restart dev server** after changing `.env`
2. **Clear browser cache**
3. **Verify API key is valid** (test with curl)
4. **Check firewall/network** - can you reach CTRL BOARD URL?

---

### Issue: Too many events / High costs

**Symptoms:**
- Places Autocomplete events: 20+ per calculation
- Costs are 3x-5x expected

**Diagnosis:**

```javascript
// Check for component re-renders
// In AddressAutocomplete.jsx, check console:
// [AddressAutocomplete startAddress] Initializing Google Places Autocomplete (count: 1)
// If count > 1, there's a re-initialization issue
```

**Solutions:**

1. **Check React StrictMode** (causes double-renders in dev):
   - Remove `<React.StrictMode>` in `main.jsx` (for testing only!)
2. **Verify dependencies** in `useEffect` hooks
3. **Check for infinite loops** in state updates

---

### Issue: Incidents not appearing for errors

**Symptoms:**
- Errors logged to console
- But not in CTRL BOARD Incidents tab

**Diagnosis:**

```javascript
// Check if reportError is being called
// In browser console, trigger test error:
import('./src/utils/errors.js').then(({ reportError }) => {
  reportError(new Error('Test'), { boundary: 'Manual Test' });
});
```

**Solutions:**

1. **Check production mode**:
   - Logger only reports in production by default
   - Set `VITE_CTRL_BOARD_DEBUG=true` for dev reporting
2. **Verify ctrlboard is initialized**:
   - `window.ctrlboard` should be defined
3. **Check for circular import errors**:
   - Errors in errors.js or logger.js could break reporting

---

## Performance Benchmarks

### Expected Overhead

| Metric | Without CTRL BOARD | With CTRL BOARD | Overhead |
|--------|-------------------|-----------------|----------|
| Page load time | 1.2s | 1.22s | +20ms |
| Route calculation | 350ms | 352ms | +2ms |
| Memory usage | 45MB | 46MB | +1MB |
| Network requests | 15 | 16 | +1 |

**Conclusion:** CTRL BOARD integration has **negligible performance impact** (<2%).

---

## Test Report Template

After completing testing, fill out this report:

```markdown
# CTRL BOARD Integration Test Report

**Date:** YYYY-MM-DD
**Tester:** [Your Name]
**Environment:** [Development / Staging / Production]
**App Version:** [Git commit hash]

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| SDK Initialization | ✅ Pass | |
| Heartbeat Monitoring | ✅ Pass | |
| Maps API Tracking | ✅ Pass | |
| Error Reporting | ✅ Pass | |
| Logger Integration | ✅ Pass | |
| Multi-Tenant Tagging | ✅ Pass | |

## Metrics

- **Total events tracked:** 247
- **Total cost:** $3.21
- **Incidents reported:** 2 (both test incidents)
- **Uptime:** 100%

## Issues Found

1. [Issue description]
   - Severity: [Low / Medium / High]
   - Status: [Open / Resolved]
   - Resolution: [Fix description]

## Recommendations

- [Recommendation 1]
- [Recommendation 2]

## Sign-off

- [ ] All critical tests pass
- [ ] No blocker issues
- [ ] Ready for production deployment

**Tester Signature:** _________________
**Date:** _________________
```

---

**Last Updated:** 2026-03-08
**Next Review:** After Day 4 implementation (analytics features)
