# Getting Started — Connect Your App to CTRL BOARD

This guide walks you through connecting any application to CTRL BOARD, from zero to fully integrated. It takes about 15 minutes.

---

## Table of Contents

1. [Step 1: Register Your App](#step-1-register-your-app)
2. [Step 2: Install the SDK](#step-2-install-the-sdk)
3. [Step 3: Send Your First Heartbeat](#step-3-send-your-first-heartbeat)
4. [Step 4: Track API Usage](#step-4-track-api-usage)
5. [Step 5: Report User Metrics](#step-5-report-user-metrics)
6. [Step 6: Track Billing Events](#step-6-track-billing-events)
7. [Step 7: Add Auto-Instrumentation](#step-7-add-auto-instrumentation)
8. [Step 8: Set Up Multi-Tenant Config (Optional)](#step-8-set-up-multi-tenant-config-optional)
9. [Step 9: Set Up Webhooks (Optional)](#step-9-set-up-webhooks-optional)
10. [Step 10: Document Your Integration](#step-10-document-your-integration)
11. [Verification Checklist](#verification-checklist)

---

## Step 1: Register Your App

You have two options:

### Option A: Via the Dashboard (Recommended)

1. Log in to CTRL BOARD
2. Go to **Apps** in the sidebar
3. Click **Add App**
4. Fill in:
   - **Name** — your app's display name (e.g., "Customer Portal")
   - **Description** — what the app does
   - **Environment** — production, staging, or development
   - **Integration Mode** — "push" (your app sends data to CTRL BOARD)
5. Click **Create**
6. Copy the generated **API Key** and **App ID**

### Option B: Via the SDK

```typescript
import { CtrlBoard } from "@ctrlboard/sdk";

const client = new CtrlBoard({
  apiKey: "drivas_live_...",  // Use your master API key from Settings
  baseUrl: "https://your-ctrl-board.vercel.app",
});

const result = await client.registerApp({
  name: "Customer Portal",
  environment: "production",
  integration_mode: "push",
  description: "Customer-facing web application with AI chat",
});

console.log("App ID:", result.data.id);
console.log("API Key:", result.data.api_key);
```

### Store Your Credentials

Add these to your app's `.env` file:

```env
CTRL_BOARD_URL=https://your-ctrl-board.vercel.app
CTRL_BOARD_API_KEY=drivas_live_abc123...
CTRL_BOARD_APP_ID=your-app-id
```

> **API Key Prefixes:**
> - `drivas_live_` / `ctrl_live_` / `cb_live_` — Production
> - `drivas_test_` / `ctrl_test_` / `cb_test_` — Development/Test

---

## Step 2: Install the SDK

### TypeScript / JavaScript

```bash
npm install @ctrlboard/sdk
```

### Python

```bash
pip install ctrlboard
```

### No SDK? Use the REST API Directly

If your language doesn't have an SDK, you can call the REST API directly. All endpoints accept JSON with these headers:

```
Authorization: Bearer <api_key>
X-App-ID: <app_id>
Content-Type: application/json
```

See the [API Reference](./API_REFERENCE.md) for all endpoints.

---

## Step 3: Send Your First Heartbeat

The heartbeat tells CTRL BOARD your app is alive. This enables uptime monitoring.

### TypeScript

```typescript
// lib/ctrlboard.ts — create this file in your app
import { CtrlBoard } from "@ctrlboard/sdk";

export const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,
  heartbeat: true,            // Auto-sends heartbeats every 60 seconds
  heartbeatInterval: 60000,   // Adjust interval if needed (in ms)
});

// Always shut down gracefully
process.on("SIGTERM", async () => {
  await ctrlboard.shutdown();
  process.exit(0);
});
```

That's it. Import `ctrlboard` from this file anywhere in your app and heartbeats are automatic.

### Python

```python
# lib/ctrlboard.py
from ctrlboard import CtrlBoard

ctrlboard = CtrlBoard(
    api_key=os.environ["CTRL_BOARD_API_KEY"],
    base_url=os.environ["CTRL_BOARD_URL"],
    app_id=os.environ["CTRL_BOARD_APP_ID"],
    heartbeat=True,
    heartbeat_interval=60,  # seconds
)

# Or use as context manager for auto-cleanup:
# with CtrlBoard(...) as client:
#     ...
```

### REST API (No SDK)

```bash
curl -X POST https://your-ctrl-board.vercel.app/api/v1/ingest/heartbeat \
  -H "Authorization: Bearer drivas_live_abc123..." \
  -H "X-App-ID: your-app-id" \
  -H "Content-Type: application/json" \
  -d '{"status": "healthy", "latency_ms": 45}'
```

### Verify It Works

1. Open CTRL BOARD dashboard
2. Go to **Apps**
3. Your app should show a **green** status indicator
4. Click the app to see health event history

---

## Step 4: Track API Usage

If your app calls external APIs (AI models, payment processors, cloud services), track them to get cost visibility.

### AI API Calls (Shorthand Methods)

```typescript
import { ctrlboard } from "@/lib/ctrlboard";

// After calling Claude
const response = await anthropic.messages.create({ ... });
ctrlboard.trackClaude({
  model: response.model,
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens,
  latencyMs: Date.now() - startTime,
});

// After calling OpenAI
const result = await openai.chat.completions.create({ ... });
ctrlboard.trackOpenAI({
  model: result.model,
  inputTokens: result.usage.prompt_tokens,
  outputTokens: result.usage.completion_tokens,
  latencyMs: Date.now() - startTime,
});
```

### Any API Call (Generic Method)

```typescript
// Track any provider or internal service
ctrlboard.bufferEvent({
  provider: "google-maps",       // or "stripe", "twilio", "internal", etc.
  model: "directions-api",       // endpoint or model name
  cost: 0.007,                   // cost in USD (optional)
  latency_ms: 340,               // response time (optional)
  input_tokens: 0,               // if applicable
  output_tokens: 0,              // if applicable
  metadata: {                    // any extra context (optional)
    endpoint: "/api/directions",
    region: "us-east-1",
  },
});
```

Events are **buffered** and auto-flushed (every 50 events or 5 seconds) for efficiency.

### Verify It Works

1. Open CTRL BOARD dashboard
2. The **API Calls** KPI should increment
3. The **Spend** chart should show your tracked costs
4. Go to **Costs** for per-provider breakdown

---

## Step 5: Report User Metrics

Send user engagement data for growth analytics. Typically run this once per day via a cron job or scheduled task.

```typescript
// Run daily (e.g., via cron, GitHub Actions, or a scheduled API route)
await ctrlboard.trackUserTraffic({
  dau: 1250,           // daily active users
  new_users: 45,       // new signups today
  sessions: 3200,      // total sessions today
  metadata: {          // optional
    source: "analytics-worker",
  },
});
```

### Verify It Works

1. Check the **Users** KPI on the dashboard
2. The **User Growth** chart should populate over time

---

## Step 6: Track Billing Events

Report charges, refunds, and credits for revenue tracking and invoice generation.

```typescript
// After a successful payment (e.g., Stripe webhook handler)
await ctrlboard.trackBillingEvent({
  provider: "stripe",
  type: "charge",               // "charge" | "refund" | "credit" | "adjustment"
  amount: 49.99,
  currency: "USD",
  description: "Pro plan — March 2026",
  external_id: "inv_abc123",    // external reference ID (optional)
  metadata: {
    customer_email: "user@example.com",
    plan: "pro",
  },
});
```

### Verify It Works

1. Check the **Costs** page for billing entries
2. Go to **Invoices** to see if auto-generated invoices appear

---

## Step 7: Add Auto-Instrumentation

The SDK can automatically track every HTTP request your app handles — latency, status codes, error rates — with zero manual code.

### Next.js App Router

```typescript
// app/api/your-endpoint/route.ts
import { ctrlboard } from "@/lib/ctrlboard";
import { withCtrlBoardApp } from "@ctrlboard/sdk";

export const GET = withCtrlBoardApp(ctrlboard, async (request) => {
  // Your handler code — no tracking code needed
  return Response.json({ data: "Hello" });
});

export const POST = withCtrlBoardApp(ctrlboard, async (request) => {
  const body = await request.json();
  return Response.json({ received: true });
});
```

### Next.js Pages Router

```typescript
// pages/api/your-endpoint.ts
import { ctrlboard } from "@/lib/ctrlboard";
import { withCtrlBoard } from "@ctrlboard/sdk";

async function handler(req, res) {
  res.json({ message: "Hello" });
}

export default withCtrlBoard(ctrlboard, handler);
```

### Express.js

```typescript
import express from "express";
import { ctrlboard } from "./lib/ctrlboard";
import { ctrlBoardMiddleware } from "@ctrlboard/sdk/instrumentation/express";

const app = express();

app.use(ctrlBoardMiddleware(ctrlboard, {
  ignorePaths: ["/health", "/healthz", "/favicon.ico"],
  incidentThreshold: 500,  // status >= 500 auto-reports an incident
}));

app.get("/api/data", (req, res) => res.json({ ok: true }));
```

### Python (FastAPI / Starlette)

```python
from ctrlboard.instrumentation import CtrlBoardMiddleware

app = FastAPI()
app.add_middleware(CtrlBoardMiddleware, client=ctrlboard)
```

### What Gets Tracked Automatically

| Metric | Description |
|--------|-------------|
| Request count | Every request logged as an API usage event |
| Latency | Time from request start to response end |
| Status code | Stored in event metadata |
| 5xx errors | Auto-reported as incidents (severity: error) |
| Route path | `METHOD /path` recorded as the model field |

---

## Step 8: Set Up Multi-Tenant Config (Optional)

If your app serves multiple customers/tenants and you want per-customer branding, themes, and feature flags managed from CTRL BOARD:

### 1. Set Up Firebase

Your app needs read access to the same Firebase project CTRL BOARD uses.

```env
# Add to your .env
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 2. Resolve the Customer

When a user accesses your app, determine which customer they belong to. The most common approach is domain-based:

```typescript
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase(initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_URL,
}));

function resolveCustomer(hostname: string): Promise<string | null> {
  return new Promise((resolve) => {
    const encoded = hostname.replace(/\./g, ",");
    onValue(ref(db, `domainMap/${encoded}`), (snap) => {
      resolve(snap.val()?.tenantId ?? null);
    }, { onlyOnce: true });
  });
}
```

Other resolution strategies:
- **URL path** — `yourapp.com/company-name/...`
- **Subdomain** — `company.yourapp.com`
- **Query param** — `yourapp.com?tenant=company-name`
- **Auth token** — extract tenant from the user's JWT

### 3. Subscribe to Customer Config

```typescript
function watchConfig(customerId: string) {
  const configRef = ref(db, `tenantRegistry/${customerId}/config`);

  onValue(configRef, (snap) => {
    const config = snap.val();
    if (!config) return;

    // Apply branding
    document.title = config.branding.pageTitle.en;
    setLogo(config.branding.logo);
    setFavicon(config.branding.favicon);

    // Apply theme — set all CSS custom properties
    if (config.theme) {
      Object.entries(config.theme).forEach(([variable, value]) => {
        document.documentElement.style.setProperty(variable, value as string);
      });
    }

    // Apply feature flags
    if (config.features) {
      setFeatureFlags(config.features);
    }
  });
}
```

### 4. Use CSS Variables in Your Styles

CTRL BOARD provides 60+ CSS custom properties per customer. Use them in your CSS:

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  font-family: var(--font-family);
  color: var(--text-primary);
}

.button-primary {
  background: var(--color-primary);
  border-radius: var(--radius-btn);
  transition: all var(--transition-speed);
}

.input {
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  color: var(--text-primary);
}
```

Available variable groups:
- **Brand colors** — `--color-primary`, `--color-secondary`, `--color-success`, `--color-danger`, `--color-warning`
- **Backgrounds** — `--bg-body-1` through `--bg-body-5`, `--bg-card`, `--bg-input`, `--bg-modal`
- **Text** — `--text-primary`, `--text-secondary`, `--text-muted`, `--text-label`, `--text-placeholder`
- **Borders** — `--border-card`, `--border-input`, `--border-row`
- **Typography** — `--font-family`, `--font-size-h1`, `--font-size-body`, `--font-size-price`
- **Radius** — `--radius-card`, `--radius-btn`, `--radius-input`, `--radius-modal`
- **Shadows** — `--shadow-card`, `--shadow-card-hover`, `--shadow-input`, `--shadow-btn`
- **Animations** — `--gradient-duration`, `--fade-duration`, `--transition-speed`

### 5. Manage Customers in CTRL BOARD

Admins create and configure customers via the CTRL BOARD tenant editor:

| Tab | What It Controls |
|-----|-----------------|
| **Branding** | Logo, favicon, company name, page titles, copyright |
| **Theme** | All CSS custom properties (color picker with presets) |
| **Features** | Boolean feature flags (toggled instantly, no redeploy) |
| **Domains** | Which domains route to this customer's config |
| **Regional** | Default language, map center, contact info |

Changes are saved to Firebase and your app receives them in real-time via the `onValue` subscription — no polling, no redeployment needed.

---

## Step 9: Set Up Webhooks (Optional)

Receive HTTP notifications from CTRL BOARD when events occur.

### 1. Create a Webhook Endpoint in Your App

```typescript
// app/api/webhooks/ctrlboard/route.ts (Next.js)
import { createHmac } from "crypto";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-webhook-signature") ?? "";

  // Verify HMAC signature
  const expected = createHmac("sha256", process.env.WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== `sha256=${expected}`) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, data } = JSON.parse(body);

  switch (event) {
    case "app.status_changed":
      console.log(`App ${data.app_name} is now ${data.status}`);
      break;
    case "spend.threshold_reached":
      console.log(`Spending alert: $${data.current_spend} exceeds $${data.threshold}`);
      break;
    case "incident.detected":
      console.log(`Incident: ${data.title} (${data.severity})`);
      break;
    case "invoice.created":
      console.log(`New invoice: ${data.invoice_id}`);
      break;
  }

  return Response.json({ received: true });
}
```

### 2. Register Your Webhook in CTRL BOARD

1. Go to **Settings > Webhooks**
2. Click **Add Webhook**
3. Enter your endpoint URL (e.g., `https://your-app.com/api/webhooks/ctrlboard`)
4. Select which events to receive
5. Copy the **Webhook Secret** for signature verification

### Available Webhook Events

| Event | Trigger |
|-------|---------|
| `app.status_changed` | App health changes (healthy/degraded/down) |
| `app.metrics_updated` | Daily metrics aggregation completed |
| `incident.detected` | New incident reported |
| `spend.threshold_reached` | Cost exceeds alert threshold |
| `invoice.created` | New invoice generated |
| `invoice.paid` | Invoice payment received |
| `invoice.overdue` | Invoice past due date |

---

## Step 10: Document Your Integration

Fill out the [App Profile Template](./APP_PROFILE_TEMPLATE.md) and share it back. This helps:

- Other developers understand how your app connects to CTRL BOARD
- The CTRL BOARD team identify new integration opportunities
- Future maintainers onboard faster

---

## Verification Checklist

After completing the steps above, verify everything is working:

- [ ] **App appears in CTRL BOARD** — Go to Apps, your app is listed
- [ ] **Health status is green** — Heartbeats are arriving
- [ ] **API usage data shows up** — Costs page has entries from your provider tracking
- [ ] **Dashboard KPIs update** — Active Apps, API Calls, Total Costs reflect your data
- [ ] **Auto-instrumentation works** — API routes show latency and request counts
- [ ] **User metrics appear** (if sending) — Users KPI and growth chart populate
- [ ] **Billing events log** (if sending) — Costs page shows charges/refunds
- [ ] **Customer config applies** (if multi-tenant) — Branding and theme change in your app when edited in CTRL BOARD
- [ ] **Webhooks fire** (if configured) — Your endpoint receives events
- [ ] **Graceful shutdown works** — `SIGTERM` flushes buffered events before exit

---

## Common Patterns

### Pattern: Singleton Client

Create one SDK instance and export it. Don't create multiple instances.

```typescript
// lib/ctrlboard.ts
export const ctrlboard = new CtrlBoard({ ... });

// Everywhere else:
import { ctrlboard } from "@/lib/ctrlboard";
```

### Pattern: Environment-Specific Setup

```typescript
const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,
  heartbeat: process.env.NODE_ENV === "production",  // Only in prod
  debug: process.env.NODE_ENV === "development",     // Verbose in dev
});
```

### Pattern: Error Boundary with Incident Reporting

```typescript
// Report uncaught errors to CTRL BOARD
process.on("uncaughtException", async (error) => {
  await ctrlboard.reportIncident({
    severity: "critical",
    title: `Uncaught: ${error.message}`,
    description: error.stack,
    source: "process-handler",
  });
});

process.on("unhandledRejection", async (reason) => {
  await ctrlboard.reportIncident({
    severity: "error",
    title: `Unhandled rejection: ${String(reason)}`,
    source: "process-handler",
  });
});
```

### Pattern: Daily Metrics Cron

```typescript
import cron from "node-cron";

// Report user metrics at midnight
cron.schedule("0 0 * * *", async () => {
  await ctrlboard.trackUserTraffic({
    dau: await db.countActiveUsersToday(),
    new_users: await db.countNewSignupsToday(),
    sessions: await db.countSessionsToday(),
  });
});
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App not appearing | Check API key and `appId` are correct |
| Health status gray | Heartbeat not arriving — check `heartbeat: true` and network |
| Metrics delayed | Events buffer for up to 5 seconds — wait or call `flush()` |
| 401 errors | API key invalid or revoked — check prefix (`drivas_live_` etc.) |
| 429 errors | Rate limited — use `bufferEvent()` instead of individual requests |
| Config not syncing | Check Firebase URL and that the customer exists in CTRL BOARD |
| Webhook not firing | Verify URL is accessible, check webhook secret, inspect CTRL BOARD logs |

For more details, see the [API Reference](./API_REFERENCE.md).

---

**Next:** [API Reference](./API_REFERENCE.md) | [App Profile Template](./APP_PROFILE_TEMPLATE.md) | **Back:** [What Is CTRL BOARD?](./WHAT_IS_CTRL_BOARD.md)
