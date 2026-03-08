# API Integration Guide

This is the complete guide for connecting your application to CTRL BOARD. It covers the TypeScript SDK, REST API endpoints, auto-instrumentation, real-time events, webhooks, and full integration examples.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [SDK Setup (Recommended)](#sdk-setup-recommended)
3. [SDK Reference](#sdk-reference)
4. [Auto-Instrumentation](#auto-instrumentation)
5. [REST API Endpoints](#rest-api-endpoints)
6. [Real-time Events (SSE)](#real-time-events-sse)
7. [Webhooks](#webhooks)
8. [Statistics & Analytics](#statistics--analytics)
9. [Customer Configuration Sync](#customer-configuration-sync)
10. [Integration Examples](#integration-examples)
11. [Error Handling & Best Practices](#error-handling--best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Register Your App

**Via Dashboard:**
1. Go to **Apps** section in CTRL BOARD
2. Click **Add App**
3. Fill in app name, description, environment, and integration mode
4. Copy the generated **API Key** and **App ID**

**Via SDK:**
```typescript
import { CtrlBoard } from "@ctrlboard/sdk";

const client = new CtrlBoard({
  apiKey: "drivas_live_...",
  baseUrl: "https://your-ctrl-board.vercel.app",
});

const result = await client.registerApp({
  name: "My SaaS App",
  environment: "production",    // "production" | "staging" | "development"
  integration_mode: "push",     // "push" (app sends data) | "pull" (board fetches)
  description: "Customer portal with AI features",
});

// Save these — you'll need them
const appId = result.data.id;
const apiKey = result.data.api_key;
```

### 2. Store Credentials

Add to your app's `.env`:
```env
CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
CTRL_BOARD_API_KEY=drivas_live_abc123...
CTRL_BOARD_APP_ID=your-app-id
```

### 3. API Key Format

| Prefix | Environment |
|--------|------------|
| `drivas_live_` or `ctrl_live_` or `cb_live_` | Production |
| `drivas_test_` or `ctrl_test_` or `cb_test_` | Development/Test |

---

## SDK Setup (Recommended)

### Installation

```bash
# TypeScript / JavaScript
npm install @ctrlboard/sdk

# Python
pip install ctrlboard
```

### TypeScript Initialization

```typescript
import { CtrlBoard } from "@ctrlboard/sdk";

const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,

  // Optional settings
  heartbeat: true,            // Auto-send health pings (default: true)
  heartbeatInterval: 60000,   // Ping interval in ms (default: 60000 = 1 min)
  debug: false,               // Log SDK activity to console (default: false)
});
```

### Python Initialization

```python
from ctrlboard import CtrlBoard

# As a context manager (recommended)
with CtrlBoard(
    api_key="drivas_live_...",
    base_url="https://your-ctrl-board.vercel.app",
    app_id="your-app-id",
    heartbeat=True,
    heartbeat_interval=60,  # seconds
) as client:
    client.track_claude(model="claude-sonnet-4-20250514", input_tokens=1000, output_tokens=500)
```

### Graceful Shutdown

Always shut down the client when your app exits to flush buffered events:

```typescript
// TypeScript
process.on("SIGTERM", async () => {
  await ctrlboard.shutdown();  // stops heartbeat + flushes buffered events
  process.exit(0);
});
```

```python
# Python — automatic with context manager, or call manually:
client.shutdown()
```

---

## SDK Reference

### `CtrlBoard` Constructor

```typescript
new CtrlBoard(config: CtrlBoardConfig)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `apiKey` | `string` | *required* | API key (`drivas_live_...` or `drivas_test_...`) |
| `baseUrl` | `string` | *required* | CTRL BOARD instance URL |
| `appId` | `string` | `""` | App ID (required for all endpoints except `registerApp`) |
| `heartbeat` | `boolean` | `true` | Auto-send health pings |
| `heartbeatInterval` | `number` | `60000` | Heartbeat interval in milliseconds |
| `debug` | `boolean` | `false` | Log SDK activity to console |

### Methods

#### `registerApp(input)` — Register a new app
```typescript
const result = await client.registerApp({
  name: "My App",                        // required
  environment: "production",             // optional: "production" | "staging" | "development"
  integration_mode: "push",              // optional: "push" | "pull"
  description: "App description",        // optional
});
// result.data = { id, name, api_key, status }
```

#### `sendHeartbeat(payload?)` — Send a health check
```typescript
await client.sendHeartbeat({
  status: "healthy",            // "healthy" | "degraded" | "unhealthy"
  latency_ms: 45,               // optional: current response time
  memory_mb: 256,               // optional: memory usage
  cpu_percent: 12.5,            // optional: CPU usage
  metadata: { db: "ok" },       // optional: any extra data
});
```

#### `trackApiUsage(events)` — Send API usage batch
```typescript
await client.trackApiUsage([
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    input_tokens: 5000,
    output_tokens: 2000,
    cost: 0.045,
    latency_ms: 850,
    metadata: { endpoint: "/api/chat" },
  },
]);
```

#### `bufferEvent(event)` — Buffer a single event (auto-flushes)
```typescript
// Events auto-flush after 50 events or 5 seconds
client.bufferEvent({
  provider: "openai",
  model: "gpt-4o",
  input_tokens: 3000,
  output_tokens: 1000,
  cost: 0.015,
  latency_ms: 600,
});
```

#### `trackClaude(opts)` — Track Anthropic Claude API call
```typescript
client.trackClaude({
  model: "claude-sonnet-4-20250514",
  inputTokens: 1500,
  outputTokens: 500,
  cost: 0.012,           // optional
  latencyMs: 450,        // optional
});
```

#### `trackOpenAI(opts)` — Track OpenAI API call
```typescript
client.trackOpenAI({
  model: "gpt-4o",
  inputTokens: 2000,
  outputTokens: 800,
  cost: 0.018,
  latencyMs: 700,
});
```

#### `trackBillingEvent(payload)` — Report billing event
```typescript
await client.trackBillingEvent({
  provider: "stripe",
  type: "charge",               // "charge" | "refund" | "credit" | "adjustment"
  amount: 49.99,
  currency: "USD",              // optional (default: USD)
  description: "Pro plan",      // optional
  external_id: "inv_abc123",    // optional: external reference
  metadata: {},                 // optional
});
```

#### `reportIncident(payload)` — Report an incident
```typescript
await client.reportIncident({
  severity: "error",            // "info" | "warning" | "error" | "critical"
  title: "Database connection timeout",
  description: "Primary DB unreachable for 30s",   // optional
  source: "health-checker",                         // optional
  metadata: { affected_users: 150 },                // optional
});
```

#### `trackUserTraffic(payload)` — Report user metrics
```typescript
await client.trackUserTraffic({
  dau: 1250,             // daily active users
  new_users: 45,         // new signups today
  sessions: 3200,        // total sessions
  metadata: {},          // optional
});
```

#### `flush()` — Force-flush buffered events
```typescript
await client.flush();
```

#### `shutdown()` — Graceful shutdown
```typescript
await client.shutdown();  // stops heartbeat timer + flushes buffer
```

---

## Auto-Instrumentation

The SDK provides middleware that automatically tracks every HTTP request — latency, status codes, error rates — with zero manual instrumentation.

### Next.js Pages Router

```typescript
import { CtrlBoard, withCtrlBoard } from "@ctrlboard/sdk";

const ctrlboard = new CtrlBoard({ /* config */ });

async function handler(req, res) {
  res.json({ message: "Hello" });
}

export default withCtrlBoard(ctrlboard, handler);
```

### Next.js App Router

```typescript
import { CtrlBoard, withCtrlBoardApp } from "@ctrlboard/sdk";

const ctrlboard = new CtrlBoard({ /* config */ });

export const GET = withCtrlBoardApp(ctrlboard, async (request) => {
  return Response.json({ data: "Hello" });
});

export const POST = withCtrlBoardApp(ctrlboard, async (request) => {
  const body = await request.json();
  return Response.json({ received: true });
});
```

### Express.js

```typescript
import express from "express";
import { CtrlBoard } from "@ctrlboard/sdk";
import { ctrlBoardMiddleware } from "@ctrlboard/sdk/instrumentation/express";

const app = express();
const ctrlboard = new CtrlBoard({ /* config */ });

app.use(ctrlBoardMiddleware(ctrlboard, {
  ignorePaths: ["/health", "/healthz", "/favicon.ico"],  // skip these paths
  incidentThreshold: 500,  // status codes >= this trigger incident reports
}));

app.get("/api/data", (req, res) => {
  res.json({ ok: true });
});
```

### What Auto-Instrumentation Tracks

| Metric | Description |
|--------|-------------|
| Request count | Every request is logged as an API usage event |
| Latency | Time from request start to response finish |
| Status code | Recorded in event metadata |
| 5xx errors | Automatically reported as incidents with severity `error` |
| Route path | `METHOD /path` recorded as the model field |

Events are buffered and auto-flushed (50 events or 5-second timer) for efficiency.

### Python FastAPI/Starlette

```python
from ctrlboard import CtrlBoard
from ctrlboard.instrumentation import CtrlBoardMiddleware

client = CtrlBoard(api_key="...", base_url="...", app_id="...")

app = FastAPI()
app.add_middleware(CtrlBoardMiddleware, client=client)
```

---

## REST API Endpoints

All endpoints require authentication. The SDK handles this automatically, but if you're calling the API directly:

### Authentication Headers

```
Authorization: Bearer <api_key>
X-App-ID: <app_id>
Content-Type: application/json
```

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/v1/ingest/heartbeat` | 1 request/minute |
| `/api/v1/ingest/api-usage` | 12 requests/minute |
| `/api/v1/ingest/user-traffic` | 12 requests/minute |
| `/api/v1/ingest/billing-event` | 100 requests/day |
| `/api/v1/ingest/incident` | 12 requests/minute |

When exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.

### POST /api/v1/apps — Register App

```json
// Request
{
  "name": "My SaaS App",
  "environment": "production",
  "integration_mode": "push",
  "description": "Customer-facing portal"
}

// Response (201)
{
  "id": "app_abc123",
  "name": "My SaaS App",
  "api_key": "drivas_live_xyz789...",
  "status": "active"
}
```

### POST /api/v1/ingest/heartbeat — Health Check

```json
// Request
{
  "status": "healthy",
  "latency_ms": 45,
  "memory_mb": 256,
  "cpu_percent": 12.5,
  "metadata": {
    "db_connection": "ok",
    "cache_hit_rate": 0.95,
    "active_connections": 42
  }
}

// Response (200)
{ "ok": true }
```

**Status values and their effect on the dashboard:**
- `healthy` — green indicator, 100% uptime contribution
- `degraded` — yellow indicator, triggers warning alert
- `unhealthy` — red indicator, triggers critical alert

### POST /api/v1/ingest/api-usage — API Usage Metrics

```json
// Request
{
  "events": [
    {
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514",
      "input_tokens": 5000,
      "output_tokens": 2000,
      "cost": 0.045,
      "latency_ms": 850,
      "metadata": { "endpoint": "/api/chat" }
    },
    {
      "provider": "openai",
      "model": "gpt-4o",
      "input_tokens": 3000,
      "output_tokens": 1000,
      "cost": 0.015,
      "latency_ms": 600
    }
  ]
}

// Response (200)
{ "ok": true }
```

**Fields per event:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | yes | Provider name (e.g., "anthropic", "openai", "google", "internal") |
| `model` | string | no | Model or endpoint name |
| `input_tokens` | number | no | Input tokens used |
| `output_tokens` | number | no | Output tokens generated |
| `cost` | number | no | Cost in USD |
| `latency_ms` | number | no | Request latency in milliseconds |
| `metadata` | object | no | Arbitrary key-value pairs |

### POST /api/v1/ingest/user-traffic — User Metrics

```json
// Request
{
  "dau": 1250,
  "new_users": 45,
  "sessions": 3200,
  "metadata": {
    "source": "analytics-worker",
    "region": "eu-west-1"
  }
}

// Response (200)
{ "ok": true }
```

### POST /api/v1/ingest/billing-event — Billing Event

```json
// Request
{
  "provider": "stripe",
  "type": "charge",
  "amount": 49.99,
  "currency": "USD",
  "description": "Pro plan subscription — March 2026",
  "external_id": "inv_abc123",
  "metadata": {
    "customer_email": "user@example.com",
    "plan": "pro"
  }
}

// Response (200)
{ "ok": true }
```

**Event types:**
- `charge` — new charge or payment
- `refund` — refund issued
- `credit` — credit applied to account
- `adjustment` — manual billing adjustment

### POST /api/v1/ingest/incident — Incident Report

```json
// Request
{
  "severity": "error",
  "title": "Database connection timeout",
  "description": "Primary PostgreSQL unreachable for 30 seconds. Failover activated.",
  "source": "health-monitor",
  "metadata": {
    "affected_users": 150,
    "error_code": "DB_TIMEOUT",
    "region": "us-east-1"
  }
}

// Response (200)
{ "ok": true }
```

**Severity levels and their effects:**

| Severity | Dashboard Effect |
|----------|-----------------|
| `info` | Logged, no alert |
| `warning` | Yellow alert, notification sent |
| `error` | Red alert, notification + webhook fired |
| `critical` | App status set to "down", all alert channels notified |

---

## Real-time Events (SSE)

Connect to the SSE endpoint to receive live updates from CTRL BOARD:

```javascript
const eventSource = new EventSource(
  `${CTRL_BOARD_URL}/api/v1/sse?app_id=${APP_ID}&api_key=${API_KEY}`
);

// Receive live metric broadcasts (every 5 seconds)
eventSource.addEventListener("metrics", (event) => {
  const data = JSON.parse(event.data);
  console.log("Live metrics:", data);
});

// Receive config change notifications
eventSource.addEventListener("config-update", (event) => {
  const config = JSON.parse(event.data);
  console.log("Config changed:", config);
  // Reload customer settings
});

// Receive alerts
eventSource.addEventListener("alert", (event) => {
  const alert = JSON.parse(event.data);
  console.error("Alert:", alert.message);
});

// Receive anomaly detections
eventSource.addEventListener("metric-anomaly", (event) => {
  const anomaly = JSON.parse(event.data);
  console.warn("Anomaly detected:", anomaly);
});

// Handle connection errors with reconnect
eventSource.addEventListener("error", () => {
  console.error("SSE connection lost, reconnecting...");
  // EventSource auto-reconnects by default
});
```

**SSE Event Types:**

| Event | Description | Frequency |
|-------|-------------|-----------|
| `metrics` | Live dashboard metrics snapshot | Every 5 seconds |
| `heartbeat` | SSE keepalive | Every 30 seconds |
| `config-update` | Customer config changed in Firebase | On change |
| `alert` | Critical alert or notification | On trigger |
| `metric-anomaly` | Unusual metric pattern detected | On detection |

---

## Webhooks

Configure webhooks in **Settings > Webhooks** to receive HTTP POST notifications when events occur.

### Webhook Events

| Event | Trigger |
|-------|---------|
| `app.status_changed` | App health status changes (healthy/degraded/down) |
| `app.metrics_updated` | Daily metrics aggregation completed |
| `incident.detected` | New incident reported |
| `spend.threshold_reached` | Cost exceeds configured alert threshold |
| `invoice.created` | New invoice generated |
| `invoice.paid` | Invoice payment received |
| `invoice.overdue` | Invoice past due date |

### Webhook Payload Format

```json
{
  "event": "spend.threshold_reached",
  "timestamp": "2026-03-07T14:30:00Z",
  "data": {
    "app_id": "app_abc123",
    "app_name": "My SaaS App",
    "threshold": 100.00,
    "current_spend": 112.50,
    "currency": "USD"
  }
}
```

### Webhook Security

All webhooks are signed with HMAC-SHA256. Verify the signature:

```typescript
import { createHmac } from "crypto";

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature === `sha256=${expected}`;
}

// In your webhook handler:
app.post("/webhooks/ctrlboard", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const isValid = verifyWebhook(JSON.stringify(req.body), signature, WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process the event
  const { event, data } = req.body;
  switch (event) {
    case "spend.threshold_reached":
      notifyTeam(`Spending alert: $${data.current_spend} exceeds $${data.threshold}`);
      break;
    case "incident.detected":
      createPagerDutyAlert(data);
      break;
  }

  res.json({ received: true });
});
```

---

## Statistics & Analytics

### What Data Your App Should Send

To get the most out of CTRL BOARD analytics, send these data types:

#### 1. API Usage (for cost tracking & performance charts)
```typescript
// After every AI API call
client.trackClaude({
  model: "claude-sonnet-4-20250514",
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens,
  cost: calculateCost(response.usage),
  latencyMs: Date.now() - startTime,
});
```

**Dashboard shows:** API calls/day chart, cost by provider pie chart, latency percentiles (p50/p99), per-provider cost breakdown, month-over-month trends.

#### 2. User Traffic (for growth & engagement charts)
```typescript
// Daily aggregation job (e.g., cron at midnight)
await client.trackUserTraffic({
  dau: await countActiveUsersToday(),
  new_users: await countNewSignupsToday(),
  sessions: await countSessionsToday(),
});
```

**Dashboard shows:** User growth chart (monthly), DAU trends, new user signups, session volume.

#### 3. Heartbeats (for uptime & health monitoring)
```typescript
// Automatic with SDK — just set heartbeat: true
// Or send custom status:
await client.sendHeartbeat({
  status: allSystemsGo ? "healthy" : "degraded",
  latency_ms: await measureDbLatency(),
  memory_mb: process.memoryUsage().heapUsed / 1024 / 1024,
  cpu_percent: await getCpuUsage(),
});
```

**Dashboard shows:** Uptime percentage (30-day), health status indicator (green/yellow/red), latency graphs, health event timeline.

#### 4. Billing Events (for revenue & cost attribution)
```typescript
// After a successful payment
await client.trackBillingEvent({
  provider: "stripe",
  type: "charge",
  amount: invoice.amount_paid / 100,
  currency: invoice.currency.toUpperCase(),
  description: `${customer.name} — ${invoice.lines.data[0].description}`,
  external_id: invoice.id,
});
```

**Dashboard shows:** Monthly spend by provider, cost trends, billing history, revenue tracking.

#### 5. Incidents (for reliability tracking)
```typescript
// In your error handler
process.on("uncaughtException", async (error) => {
  await client.reportIncident({
    severity: "critical",
    title: `Uncaught exception: ${error.message}`,
    description: error.stack,
    source: "process-handler",
  });
});
```

**Dashboard shows:** Incident timeline, severity distribution, mean time to recovery, app status changes.

### Dashboard Metrics Summary

| Metric | Source Endpoint | Refresh |
|--------|----------------|---------|
| Total Apps | App registration | Real-time |
| Active Apps | Heartbeat status | Every heartbeat interval |
| Total Users | User traffic | Daily |
| API Calls | API usage events | Real-time (buffered) |
| Total Costs | API usage + billing events | Real-time |
| Average Uptime | Heartbeat history | 30-day rolling |
| Pending Invoices | Billing events | On event |

---

## Customer Configuration Sync

CTRL BOARD stores per-customer configuration in Firebase Realtime Database. Your app reads this configuration to customize the experience for each customer/tenant.

### How It Works

```
1. Admin configures customer in CTRL BOARD
   (branding, theme, features, domains)
        |
2. Config saved to Firebase: /tenantRegistry/{customerId}/config
        |
3. Your app subscribes to Firebase path
        |
4. Config updates arrive in real-time
        |
5. Your app applies branding, theme, features
```

### Reading Customer Configuration

```typescript
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseApp = initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const db = getDatabase(firebaseApp);

// Watch a specific customer's config
function watchCustomerConfig(customerId: string) {
  const configRef = ref(db, `tenantRegistry/${customerId}/config`);

  onValue(configRef, (snapshot) => {
    const config = snapshot.val();

    // Apply branding
    document.title = config.branding.pageTitle.en;
    setFavicon(config.branding.favicon);
    setLogo(config.branding.logo);

    // Apply theme (CSS variables)
    Object.entries(config.theme).forEach(([variable, value]) => {
      document.documentElement.style.setProperty(variable, value as string);
    });

    // Apply feature flags
    setFeatureFlags({
      showLanguageSwitcher: config.features.showLanguageSwitcher,
      showPrintButton: config.features.showPrintButton,
      showMap: config.features.showMap,
    });
  });
}
```

### Domain-Based Customer Resolution

Your app identifies which customer is accessing it based on the domain:

```typescript
// Look up customer by domain
function resolveCustomerFromDomain(hostname: string) {
  const encodedDomain = hostname.replace(/\./g, ",");
  const domainRef = ref(db, `domainMap/${encodedDomain}`);

  onValue(domainRef, (snapshot) => {
    const mapping = snapshot.val();
    if (mapping?.tenantId) {
      watchCustomerConfig(mapping.tenantId);
    }
  });
}

// On app load
resolveCustomerFromDomain(window.location.hostname);
```

### Configuration Structure

```typescript
interface CustomerConfig {
  id: string;
  name: string;
  active: boolean;

  branding: {
    companyName: string;
    logo: string;                              // Firebase Storage URL
    favicon: string;                           // Firebase Storage URL
    logoAltText: string;
    pageTitle: { no: string; en: string };
    pageDescription: { no: string; en: string };
    copyrightHolder: string;
    madeBy: { no: string; en: string };
  };

  theme: Record<string, string>;               // CSS variable -> value map
  // Example: { "--color-primary": "#FF1B23", "--bg-body-1": "#0a0a0a" }

  features: {
    showLanguageSwitcher: boolean;
    showPrintButton: boolean;
    showTariffEditor: boolean;
    showMap: boolean;
    showTariffTable: boolean;
  };

  defaults: {
    startAddress: string;
    lang: "no" | "en";
    mapsCountry: string;
    mapsRegion: string;
    mapCenter: { lat: number; lng: number };
  };

  contact: {
    phone: string;
    email: string;
    website: string;
  };

  allowedDomains: string[];
}
```

### Theme CSS Variables Available

Your app can use these 60+ CSS variables set per customer:

**Brand Colors:**
`--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-success`, `--color-danger`, `--color-warning`

**Backgrounds:**
`--bg-body-1` through `--bg-body-5`, `--bg-card`, `--bg-input`, `--bg-modal`, `--bg-map`, `--bg-tooltip`, `--bg-tariff-header`, `--bg-tariff-cell`

**Text Colors:**
`--text-primary`, `--text-secondary`, `--text-muted`, `--text-label`, `--text-faint`, `--text-placeholder`, `--text-footer`, `--text-tooltip`

**Borders:**
`--border-card`, `--border-input`, `--border-row`, `--border-tariff`

**Typography:**
`--font-family`, `--font-size-h1`, `--font-size-card-title`, `--font-size-body`, `--font-size-small`, `--font-size-price`

**Border Radius:**
`--radius-card`, `--radius-btn`, `--radius-input`, `--radius-modal`, `--radius-map`

**Shadows:**
`--shadow-card`, `--shadow-card-hover`, `--shadow-input`, `--shadow-btn`

**Animations:**
`--gradient-duration`, `--fade-duration`, `--transition-speed`

---

## Integration Examples

### Example 1: Next.js App with Claude AI

```typescript
// lib/ctrlboard.ts
import { CtrlBoard } from "@ctrlboard/sdk";

export const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,
  heartbeat: true,
});

// app/api/chat/route.ts
import { ctrlboard } from "@/lib/ctrlboard";
import { withCtrlBoardApp } from "@ctrlboard/sdk";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const POST = withCtrlBoardApp(ctrlboard, async (request) => {
  const { message } = await request.json();
  const start = Date.now();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: message }],
  });

  // Track the Claude API call
  ctrlboard.trackClaude({
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs: Date.now() - start,
  });

  return Response.json({ reply: response.content[0].text });
});
```

### Example 2: Express API with Multi-Provider AI

```typescript
// server.ts
import express from "express";
import { CtrlBoard } from "@ctrlboard/sdk";
import { ctrlBoardMiddleware } from "@ctrlboard/sdk/instrumentation/express";

const app = express();
const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,
});

// Auto-instrument all routes
app.use(express.json());
app.use(ctrlBoardMiddleware(ctrlboard));

// Track AI API calls
app.post("/api/generate", async (req, res) => {
  const start = Date.now();

  const result = await callClaudeAPI(req.body.prompt);

  ctrlboard.trackClaude({
    model: "claude-sonnet-4-20250514",
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
    cost: calculateCost(result.usage),
    latencyMs: Date.now() - start,
  });

  res.json({ output: result.text });
});

// Daily metrics cron job
import cron from "node-cron";

cron.schedule("0 0 * * *", async () => {
  await ctrlboard.trackUserTraffic({
    dau: await db.countActiveUsersToday(),
    new_users: await db.countNewSignupsToday(),
    sessions: await db.countSessionsToday(),
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await ctrlboard.shutdown();
  process.exit(0);
});

app.listen(3000);
```

### Example 3: Taxi Calculator with Config Sync

```typescript
// lib/ctrlboard-config.ts
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase(initializeApp({ databaseURL: process.env.FIREBASE_URL }));

export function loadTenantConfig(tenantId: string, callback: (config: any) => void) {
  // Watch branding + theme
  onValue(ref(db, `tenantRegistry/${tenantId}/config`), (snap) => {
    callback(snap.val());
  });
}

export function loadTariffs(tenantId: string, callback: (tariffs: any) => void) {
  // Watch tariff rates
  onValue(ref(db, `tenants/${tenantId}/tariffs/base14`), (snap) => {
    callback(snap.val());
  });
}

// App.tsx
function App() {
  const [config, setConfig] = useState(null);
  const [tariffs, setTariffs] = useState(null);
  const tenantId = resolveTenantFromDomain();

  useEffect(() => {
    loadTenantConfig(tenantId, setConfig);
    loadTariffs(tenantId, setTariffs);
  }, [tenantId]);

  // Apply theme CSS variables
  useEffect(() => {
    if (config?.theme) {
      Object.entries(config.theme).forEach(([key, val]) => {
        document.documentElement.style.setProperty(key, val as string);
      });
    }
  }, [config?.theme]);

  return (
    <div>
      <header>
        <img src={config?.branding?.logo} alt={config?.branding?.logoAltText} />
        <h1>{config?.branding?.companyName}</h1>
      </header>
      {config?.features?.showMap && <GoogleMap center={config.defaults.mapCenter} />}
      <FareCalculator tariffs={tariffs} />
      {config?.features?.showTariffTable && <TariffTable tariffs={tariffs} />}
    </div>
  );
}
```

### Example 4: Python Service with Billing

```python
from ctrlboard import CtrlBoard
import stripe

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

with CtrlBoard(
    api_key=os.environ["CTRL_BOARD_API_KEY"],
    base_url=os.environ["CTRL_BOARD_URL"],
    app_id=os.environ["CTRL_BOARD_APP_ID"],
) as client:

    # Track AI calls
    response = anthropic.messages.create(model="claude-sonnet-4-20250514", ...)
    client.track_claude(
        model=response.model,
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )

    # Track billing events from Stripe webhook
    @app.route("/webhooks/stripe", methods=["POST"])
    def stripe_webhook():
        event = stripe.Webhook.construct_event(...)

        if event.type == "invoice.payment_succeeded":
            invoice = event.data.object
            client.track_billing_event(
                provider="stripe",
                type="charge",
                amount=invoice.amount_paid / 100,
                currency=invoice.currency.upper(),
                description=f"{invoice.customer_name} - {invoice.lines.data[0].description}",
                external_id=invoice.id,
            )

        return "", 200
```

---

## Error Handling & Best Practices

### Retry with Exponential Backoff

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

// Usage
await withRetry(() => ctrlboard.trackApiUsage(events));
```

### Handle Rate Limits

```typescript
const response = await fetch(`${CTRL_BOARD_URL}/api/v1/ingest/api-usage`, {
  method: "POST",
  headers: { Authorization: `Bearer ${API_KEY}`, "X-App-ID": APP_ID },
  body: JSON.stringify({ events }),
});

if (response.status === 429) {
  const retryAfter = parseInt(response.headers.get("Retry-After") ?? "5", 10);
  await new Promise((r) => setTimeout(r, retryAfter * 1000));
  // Retry the request
}
```

### Batch Events for Efficiency

```typescript
// DON'T: send one request per API call
await client.trackApiUsage([singleEvent]); // 100 calls = 100 requests

// DO: use the buffer (auto-batches)
client.bufferEvent(singleEvent); // 100 calls = ~2 requests (batched at 50)

// Or batch manually
const events: ApiUsageEvent[] = [];
events.push(event1, event2, event3);
await client.trackApiUsage(events); // 1 request for all 3
```

### Security Checklist

- Store API keys in environment variables, never in code
- Use `drivas_live_` keys for production, `drivas_test_` for development
- Rotate API keys periodically via Settings > API Keys
- Use HTTPS for all API calls (enforced in production)
- Verify webhook signatures before processing
- Never log API keys or send them to the client

### Payload Limits

- Maximum request body: **1 MB**
- Maximum events per batch: **No hard limit** (stay under 1 MB)
- Recommended batch size: **50 events** (SDK default)

---

## Troubleshooting

### "Missing or invalid Authorization header"
- Ensure header format is `Authorization: Bearer <api_key>` (not `X-API-Key`)
- Check the API key hasn't been revoked

### "Missing X-App-ID header"
- Include `X-App-ID: <app_id>` in every request
- The SDK handles this automatically — check your `appId` config

### "Invalid API key prefix"
- Keys must start with `drivas_live_`, `drivas_test_`, `ctrl_live_`, `ctrl_test_`, `cb_live_`, or `cb_test_`
- Regenerate in Settings > API Keys if needed

### "Rate limit exceeded (429)"
- Use event buffering instead of individual requests
- Batch daily metrics into a single request
- Implement exponential backoff on retries

### "App not found"
- The `appId` must match a registered app in CTRL BOARD
- Register via dashboard or `client.registerApp()` first

### Metrics not appearing in dashboard
- Allow 5-30 seconds for data to appear
- Check app status is "active" in the Apps section
- Verify `appId` matches the registered app
- Enable `debug: true` in SDK config to see request logs

### Heartbeat not sending
- SDK heartbeat only starts when `appId` is set
- If using `registerApp()`, heartbeat starts after successful registration
- Check `heartbeat: true` in config (default is `true`)

### Events not flushing
- Call `await client.shutdown()` before process exit
- Buffer flushes at 50 events or every 5 seconds
- Force flush with `await client.flush()`

---

**See Also**: [APP_ADMINISTRATION.md](./APP_ADMINISTRATION.md) for customer management & theming, [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, [integration/](./integration/INDEX.md) for integration guides
