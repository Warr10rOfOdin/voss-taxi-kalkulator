# CTRL BOARD Setup Guide

**For:** Voss Taxi Kalkulator Developers
**Last Updated:** 2026-03-08
**Estimated Setup Time:** 30-45 minutes

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Access to Vercel dashboard (for production deployment)
- [ ] CTRL BOARD credentials (API key and App ID)
- [ ] Git repository access

---

## Step 1: Get CTRL BOARD Credentials

### Option A: If CTRL BOARD is Already Set Up

Contact the CTRL BOARD administrator to get:

1. **CTRL BOARD URL** - e.g., `https://ctrl-board.vercel.app`
2. **API Key** - e.g., `drivas_live_abc123...`
3. **App ID** - e.g., `voss-taxi-kalkulator-prod`

### Option B: If You're Setting Up CTRL BOARD

1. Deploy CTRL BOARD instance (see CTRL BOARD documentation)
2. Access dashboard at your deployed URL
3. Navigate to **Settings** → **API Keys**
4. Generate a new API key for Voss Taxi Kalkulator
5. Navigate to **Apps** → **Register New App**
6. Fill in:
   - Name: `Voss Taxi Kalkulator`
   - Environment: `production`
   - Integration: `Push (SDK)`
7. Copy the generated App ID

---

## Step 2: Install Dependencies

### Install @ctrlboard/sdk

```bash
cd voss-taxi-kalkulator
npm install @ctrlboard/sdk
```

**Expected output:**

```
added 1 package, and audited 543 packages in 3s
```

### Verify Installation

```bash
npm list @ctrlboard/sdk
```

**Expected output:**

```
voss-taxi-kalkulator@1.0.0 /home/user/voss-taxi-kalkulator
└── @ctrlboard/sdk@1.x.x
```

---

## Step 3: Configure Environment Variables

### Update .env.example

This file documents required variables for all developers:

```bash
# Add to .env.example (already done if following this guide)
cat >> .env.example << 'EOF'

# CTRL BOARD Integration
VITE_CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_your_api_key
VITE_CTRL_BOARD_APP_ID=your-app-id
VITE_CTRL_BOARD_ENABLED=true  # Set to false to disable tracking
EOF
```

### Create/Update Local .env

```bash
# Copy example to .env
cp .env.example .env

# Edit with your actual credentials
nano .env  # or code .env, vim .env, etc.
```

**Replace placeholders:**

```env
# CTRL BOARD Integration
VITE_CTRL_BOARD_URL=https://ctrl-board-actual.vercel.app
VITE_CTRL_BOARD_API_KEY=drivas_live_actual_key_here
VITE_CTRL_BOARD_APP_ID=voss-taxi-kalkulator-prod
VITE_CTRL_BOARD_ENABLED=true
```

### Verify .env is Gitignored

```bash
grep "^\.env$" .gitignore
```

**Expected output:** `.env` (if not found, add it!)

---

## Step 4: Implementation Files

The following files should already be created (if following the integration plan):

### ✅ Core Files

1. **`src/utils/ctrlboard.js`** - SDK client initialization
2. **`src/hooks/useCtrlBoard.js`** - Monitoring hook
3. **`src/hooks/useAnalytics.js`** - Analytics hook (optional for Day 1)
4. **`src/components/ErrorBoundary.jsx`** - Error boundary

### ✅ Modified Files

1. **`src/hooks/index.js`** - Exports new hooks
2. **`src/utils/logger.js`** - Enhanced with incident reporting
3. **`src/components/MapDisplay.jsx`** - Tracks Directions API
4. **`src/components/AddressAutocomplete.jsx`** - Tracks Places API
5. **`src/App.jsx`** - Wrapped with ErrorBoundary

### Verify Files Exist

```bash
# Check core integration files
ls -lh src/utils/ctrlboard.js
ls -lh src/hooks/useCtrlBoard.js
ls -lh src/components/ErrorBoundary.jsx

# Check hooks are exported
grep "useCtrlBoard" src/hooks/index.js
```

---

## Step 5: Development Testing

### Start Dev Server

```bash
npm run dev
```

**Expected output:**

```
VITE v5.4.10  ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Open Browser Console

1. Open http://localhost:5173/
2. Open Developer Tools (F12)
3. Go to **Console** tab

**Look for:**

```
✅ CTRL BOARD SDK initialized
✅ Heartbeat sent (appears every 60 seconds)
```

**If you see errors:**

```javascript
// Common issues:

// 1. SDK not initialized
"CTRL BOARD SDK is disabled (VITE_CTRL_BOARD_ENABLED not true)"
// Fix: Check .env has VITE_CTRL_BOARD_ENABLED=true

// 2. API key invalid
"Failed to send heartbeat: 401 Unauthorized"
// Fix: Verify API key is correct

// 3. Network error
"Failed to initialize CTRL BOARD: ERR_CONNECTION_REFUSED"
// Fix: Verify CTRL BOARD URL is accessible
```

### Test Google Maps Tracking

1. Enter start address: `Hestavangen 11, Voss`
2. Enter destination: `Voss Stasjon, Voss`
3. Click "Beregn pris" (Calculate price)

**In console, look for:**

```
✅ Tracking Maps API call: { type: 'directions', latency: 342, ... }
✅ Event buffered: google_maps
```

**In CTRL BOARD dashboard:**
1. Go to **Apps** → **Voss Taxi Kalkulator**
2. Click **Costs** tab
3. You should see a new event (may take up to 5 seconds to appear)

### Test Incident Reporting

Force an error to test incident reporting:

**Option 1: Invalid Google Maps API key**

```bash
# Temporarily break Maps API key in .env
VITE_GOOGLE_MAPS_API_KEY=INVALID_KEY
```

Reload page → should report incident to CTRL BOARD

**Option 2: Trigger route error**

1. Enter invalid start address: `asdfasdfasdf`
2. Enter destination: `Voss Stasjon`
3. Calculate route → should report ZERO_RESULTS incident

**Verify in CTRL BOARD:**
1. Go to **Apps** → **Voss Taxi Kalkulator**
2. Click **Incidents** tab
3. You should see the error

---

## Step 6: Production Deployment

### Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `voss-taxi-kalkulator` project
3. Go to **Settings** → **Environment Variables**
4. Add the following for **Production** environment:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_CTRL_BOARD_URL` | `https://ctrl-board.vercel.app` | Production |
| `VITE_CTRL_BOARD_API_KEY` | `drivas_live_...` | Production |
| `VITE_CTRL_BOARD_APP_ID` | `voss-taxi-kalkulator-prod` | Production |
| `VITE_CTRL_BOARD_ENABLED` | `true` | Production |

**Important:** Also add for **Preview** environment if you want tracking on preview deployments.

### Deploy to Production

```bash
# Commit changes
git add .
git commit -m "Add CTRL BOARD integration"

# Push to main (triggers Vercel deployment)
git push origin main
```

### Verify Production Deployment

1. Wait for Vercel deployment to complete (~2-3 minutes)
2. Visit production URL: https://voss-taxi-kalkulator.vercel.app
3. Open browser console → should see "CTRL BOARD SDK initialized"
4. Perform a calculation
5. Check CTRL BOARD dashboard → should see production events

---

## Step 7: Staging Environment (Optional but Recommended)

### Create Staging App in CTRL BOARD

1. In CTRL BOARD, register a new app:
   - Name: `Voss Taxi Kalkulator (Staging)`
   - Environment: `staging`
2. Copy the staging App ID (will be different from production)

### Configure Vercel Preview Environment

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Edit `VITE_CTRL_BOARD_APP_ID`
3. Add value for **Preview** environment:
   - Value: `voss-taxi-kalkulator-staging` (your staging App ID)

**Result:**
- Production deployments → tracked under "Voss Taxi Kalkulator (Production)"
- Preview deployments → tracked under "Voss Taxi Kalkulator (Staging)"

---

## Step 8: Verification Checklist

After completing setup, verify:

### Development Environment

- [ ] `npm run dev` starts without errors
- [ ] Console shows "CTRL BOARD SDK initialized"
- [ ] Heartbeats sent every 60 seconds
- [ ] Google Maps API calls tracked
- [ ] Incidents reported (test with forced error)
- [ ] No UI performance degradation

### Production Environment

- [ ] Production site loads correctly
- [ ] Heartbeats appear in CTRL BOARD for production app
- [ ] Test calculation → event appears in CTRL BOARD
- [ ] No console errors related to CTRL BOARD
- [ ] All existing features work (Maps, PDF, etc.)

### CTRL BOARD Dashboard

- [ ] App shows as "Online" (green status)
- [ ] Heartbeat chart shows data points
- [ ] Costs page shows Google Maps events
- [ ] Incidents page is empty (or shows test incidents)
- [ ] Multi-tenant metrics tagged correctly

---

## Troubleshooting

### Issue: "CTRL BOARD SDK is disabled"

**Console message:**
```
CTRL BOARD SDK is disabled (VITE_CTRL_BOARD_ENABLED not true)
```

**Solution:**
1. Check `.env` file has `VITE_CTRL_BOARD_ENABLED=true`
2. Ensure no typos (case-sensitive)
3. Restart dev server after changing `.env`

```bash
# Verify environment variable
echo $VITE_CTRL_BOARD_ENABLED  # Should print "true"

# Restart dev server
npm run dev
```

---

### Issue: "401 Unauthorized" on Heartbeat

**Console message:**
```
Failed to send heartbeat: 401 Unauthorized
```

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check API key is enabled in CTRL BOARD
3. Verify App ID matches registered app

```bash
# Test API key manually
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  https://ctrl-board.vercel.app/api/events

# Should return 200 OK, not 401
```

---

### Issue: No Events Appearing in CTRL BOARD

**Symptoms:**
- Heartbeats work, but no Google Maps events
- Console shows "Event buffered" but nothing in dashboard

**Solutions:**
1. **Wait 5 seconds** - Events are batched and sent every 5s
2. Check browser Network tab:
   - Filter: `api/events`
   - Should see POST requests every 5s or 50 events
3. Check CTRL BOARD app ID matches in:
   - `.env` file
   - Vercel environment variables
   - CTRL BOARD dashboard

---

### Issue: CORS Errors

**Console message:**
```
Access to fetch at 'https://ctrl-board.vercel.app/api/events'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
1. In CTRL BOARD dashboard, go to **Settings** → **CORS**
2. Add allowed origins:
   - `http://localhost:5173` (development)
   - `https://voss-taxi-kalkulator.vercel.app` (production)
   - `https://*.vercel.app` (all Vercel preview deployments)
3. Save settings

---

### Issue: Duplicate Events

**Symptoms:**
- Same calculation tracked 2-3 times
- Costs are higher than expected

**Diagnosis:**

```javascript
// Add to MapDisplay.jsx to debug
console.count('handleRouteCalculation called');
// Should only increment once per button click
```

**Solutions:**
1. Check for React StrictMode in `main.jsx`:
   ```javascript
   // Development only - causes double renders
   <React.StrictMode>
     <App />
   </React.StrictMode>
   ```
   Duplicate events in dev are normal with StrictMode (not in production).

2. Ensure tracking is inside callback, not render:
   ```javascript
   // ❌ Bad - tracks on every render
   useEffect(() => {
     trackMapApiCall(...);
   }, [distanceKm]);

   // ✅ Good - tracks only on user action
   const handleCalculate = () => {
     // ... calculate route
     trackMapApiCall(...);
   };
   ```

---

### Issue: Feature Flag Not Working

**Symptoms:**
- Set `VITE_CTRL_BOARD_ENABLED=false`
- Still see CTRL BOARD logs

**Solution:**

```bash
# Verify environment variable
cat .env | grep VITE_CTRL_BOARD_ENABLED

# Must be EXACTLY: VITE_CTRL_BOARD_ENABLED=false
# Not: "false", not: FALSE, not: 0

# Restart dev server
npm run dev
```

**Check in code:**

```javascript
// In src/utils/ctrlboard.js
const enabled = import.meta.env.VITE_CTRL_BOARD_ENABLED === 'true';
console.log('CTRL BOARD enabled:', enabled); // Should be false
```

---

## Rollback Plan

If you need to disable CTRL BOARD integration:

### Quick Disable (No Code Changes)

**Development:**
```bash
# In .env file
VITE_CTRL_BOARD_ENABLED=false
```

**Production:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Edit `VITE_CTRL_BOARD_ENABLED` → set to `false`
4. Redeploy

### Complete Removal

```bash
# 1. Uninstall SDK
npm uninstall @ctrlboard/sdk

# 2. Remove integration files
rm src/utils/ctrlboard.js
rm src/hooks/useCtrlBoard.js
rm src/hooks/useAnalytics.js
rm src/components/ErrorBoundary.jsx

# 3. Revert modified files
git checkout src/App.jsx
git checkout src/utils/logger.js
git checkout src/components/MapDisplay.jsx
git checkout src/components/AddressAutocomplete.jsx
git checkout src/hooks/index.js

# 4. Remove env vars
# Edit .env and .env.example - remove CTRL BOARD section

# 5. Commit and deploy
git add .
git commit -m "Remove CTRL BOARD integration"
git push origin main
```

---

## Next Steps

After successful setup:

1. **Configure alerts** in CTRL BOARD:
   - App down (no heartbeat for 5+ minutes)
   - High API costs (> $10/day)
   - Error spike (> 10/hour)

2. **Set up dashboard widgets**:
   - Uptime chart (7 days)
   - Google Maps cost trend (30 days)
   - DAU chart
   - Recent incidents

3. **Monitor for first week**:
   - Check daily for incidents
   - Verify cost tracking is accurate
   - Compare DAU with other analytics sources

4. **Phase 2 implementation** (optional):
   - Track user analytics (prints, sessions)
   - Add ErrorBoundary for React errors
   - Implement daily metrics aggregation

---

## Support

### Documentation

- **Integration Guide:** [docs/CTRL_BOARD_INTEGRATION.md](../docs/CTRL_BOARD_INTEGRATION.md)
- **App Profile:** [integration/VOSS_TAXI_PROFILE.md](./VOSS_TAXI_PROFILE.md)
- **CLAUDE.md:** [CLAUDE.md](../CLAUDE.md) (full developer guide)

### Getting Help

- **CTRL BOARD issues:** Contact CTRL BOARD team
- **Integration issues:** Check [Troubleshooting](#troubleshooting) section
- **App issues:** https://github.com/Warr10rOfOdin/voss-taxi-kalkulator/issues

---

**Last Updated:** 2026-03-08
**Setup Guide Version:** 1.0.0
