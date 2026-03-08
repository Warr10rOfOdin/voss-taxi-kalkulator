# CTRL BOARD Documentation

Welcome to **CTRL BOARD** — the universal admin, monitoring, and billing hub for managing multiple SaaS applications from a single command center.

## What is CTRL BOARD?

CTRL BOARD is a Next.js-based **multi-app management platform** that gives you centralized control over every application in your ecosystem. Connect any app — regardless of tech stack — and instantly get:

- **Real-time monitoring** — health, uptime, latency, and incident tracking
- **Usage analytics** — API calls, user traffic, DAU, sessions, and growth trends
- **Cost management** — track spending across 11+ providers, set alerts, forecast budgets
- **Billing & invoicing** — generate invoices, sync live data from Stripe/QuickBooks/Xero
- **Customer administration** — manage tenants with per-customer branding, themes, and feature flags
- **SDK & API** — drop-in TypeScript/Python SDKs with auto-instrumentation for Next.js and Express

## App Ecosystem

| App | Description | Stack |
|-----|-------------|-------|
| **CTRL BOARD** | Central admin & monitoring platform (this app) | Next.js 15, Supabase, Firebase |
| **Voss Taxi Kalkulator** | White-label multi-tenant taxi fare calculator | React 18, Vite, Firebase, Google Maps |
| **Drivas Fleet** | Fleet management & local taxi operations | Next.js, Firebase |

The platform scales to any number of apps. Register a new app and it automatically inherits universal features (monitoring, branding, themes, billing).

## Documentation Index

### Platform Docs

| Document | Purpose |
|----------|---------|
| [API_INTEGRATION.md](./API_INTEGRATION.md) | **Start here** — connect your app using the SDK or REST API |
| [APP_ADMINISTRATION.md](./APP_ADMINISTRATION.md) | Customer management, branding, themes, user controls, feature flags |
| [FEATURES.md](./FEATURES.md) | Complete feature reference for every section of the platform |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, database schema, multi-tenant architecture |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Setup, configuration, and deployment instructions |

### Integration Guides (For Any App Developer)

| Document | What You'll Learn |
|----------|-------------------|
| [integration/INDEX.md](./integration/INDEX.md) | Start here — overview and reading order |
| [integration/WHAT_IS_CTRL_BOARD.md](./integration/WHAT_IS_CTRL_BOARD.md) | What CTRL BOARD is, its vision, and what your app gains |
| [integration/GETTING_STARTED.md](./integration/GETTING_STARTED.md) | Step-by-step guide to connect your app |
| [integration/API_REFERENCE.md](./integration/API_REFERENCE.md) | Complete SDK methods, REST endpoints, webhooks, SSE |
| [integration/APP_PROFILE_TEMPLATE.md](./integration/APP_PROFILE_TEMPLATE.md) | Template to document your app's integration |

## Quick Start for App Developers

### 1. Register Your App

Go to **Apps > Add App** in the CTRL BOARD dashboard, or register via the SDK:

```typescript
import { CtrlBoard } from "@ctrlboard/sdk";

const client = new CtrlBoard({
  apiKey: "drivas_live_...",
  baseUrl: "https://your-ctrl-board.vercel.app",
});

const { data } = await client.registerApp({
  name: "My App",
  environment: "production",
});

console.log("App ID:", data.id);
console.log("API Key:", data.api_key);
```

### 2. Install the SDK

```bash
npm install @ctrlboard/sdk
```

### 3. Initialize and Start Sending Data

```typescript
const client = new CtrlBoard({
  apiKey: "drivas_live_...",
  baseUrl: "https://your-ctrl-board.vercel.app",
  appId: "your-app-id",
  heartbeat: true,           // auto-send health pings every 60s
  heartbeatInterval: 60000,
});

// Track an API call
client.trackClaude({
  model: "claude-sonnet-4-20250514",
  inputTokens: 1500,
  outputTokens: 500,
  cost: 0.012,
  latencyMs: 450,
});

// Report a billing event
await client.trackBillingEvent({
  provider: "stripe",
  type: "charge",
  amount: 49.99,
  currency: "USD",
  description: "Pro plan — March 2026",
});

// Graceful shutdown
await client.shutdown();
```

### 4. Add Auto-Instrumentation (Optional)

**Next.js App Router:**
```typescript
import { withCtrlBoardApp } from "@ctrlboard/sdk";

export const GET = withCtrlBoardApp(client, async (request) => {
  return Response.json({ ok: true });
});
```

**Express.js:**
```typescript
import { ctrlBoardMiddleware } from "@ctrlboard/sdk";

app.use(ctrlBoardMiddleware(client, {
  ignorePaths: ["/health", "/favicon.ico"],
}));
```

### 5. View Your Data

Open the CTRL BOARD dashboard. Your app now appears with:
- Live health status (green/yellow/red)
- API usage charts and cost tracking
- User traffic analytics
- Incident history

## What Each App Gets from CTRL BOARD

### Universal Features (Every Connected App)

| Feature | Description |
|---------|-------------|
| **Health Monitoring** | Automatic heartbeat, uptime tracking, incident alerts |
| **API Analytics** | Request volume, latency percentiles, error rates, cost per call |
| **User Metrics** | DAU, new signups, sessions, retention |
| **Cost Tracking** | Per-provider spend, budget alerts, anomaly detection |
| **Billing Events** | Charges, refunds, credits with full audit trail |
| **Webhooks** | Real-time notifications for 9 event types |
| **Customer Branding** | Per-tenant logos, favicons, company names, page titles |
| **Theme Customization** | 60+ CSS variables, color presets, per-customer themes |
| **Feature Flags** | Toggle UI components per customer without redeploy |
| **Domain Restrictions** | Control which domains can access each customer's instance |
| **Regional Settings** | Language, timezone, map center, currency per customer |
| **Real-time SSE** | Live metric streams, config change notifications, alerts |

### App-Specific Extensions

Individual apps can add custom configuration on top of universal features:
- **Taxi Calculator** — tariff rates, vehicle multipliers, period pricing
- **Fleet App** — vehicle types, insurance, maintenance schedules
- **Your App** — any custom settings stored in Firebase per customer

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend/Backend | Next.js 15, React 19, TypeScript 5.7 |
| SQL Database | Supabase (PostgreSQL) with RLS |
| NoSQL Database | Firebase Realtime Database |
| Authentication | NextAuth.js v5 (GitHub, Google, credentials) |
| Error Tracking | Sentry |
| Deployment | Vercel with CI/CD |
| Styling | Tailwind CSS with custom Sith theme |
| SDKs | TypeScript (`@ctrlboard/sdk`), Python (`ctrlboard`) |

## Getting Started by Role

### App Developers
1. Read your app's integration guide in [integration/](./integration/INDEX.md)
2. Read [API_INTEGRATION.md](./API_INTEGRATION.md) — SDK setup, endpoints, examples
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) — understand the data flow

### Platform Administrators
1. Read [APP_ADMINISTRATION.md](./APP_ADMINISTRATION.md) — customer management, branding, themes
2. Review [FEATURES.md](./FEATURES.md) — complete feature reference
3. See the full [integration guides](./integration/INDEX.md)

### DevOps / Deployment
1. Start with [DEPLOYMENT.md](./DEPLOYMENT.md) — environment setup, credentials
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) — database schema, infrastructure

---

**Version**: 2.3.0
**Last Updated**: March 2026
**Repository**: https://github.com/Warr10rOfOdin/Main-control-board
