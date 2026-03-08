# Integration Documentation

> **CTRL BOARD is already built and running.** You do NOT build anything inside CTRL BOARD. You do NOT build a "control board" inside your app. You simply **connect your existing app** to the existing CTRL BOARD platform by installing the SDK or calling the REST API. That's it.

This folder contains everything a software developer needs to connect any application to CTRL BOARD.

---

## The Mental Model

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│  CTRL BOARD (already built)     │     │  YOUR APP (your codebase)    │
│                                 │     │                              │
│  • Dashboard           ✅ Done  │     │  You add ~20 lines of code:  │
│  • App monitoring      ✅ Done  │     │                              │
│  • Customer management ✅ Done  │     │  1. Install SDK              │
│  • Theme editor        ✅ Done  │     │  2. Initialize with API key  │
│  • Billing & invoices  ✅ Done  │     │  3. Track what matters       │
│  • Analytics           ✅ Done  │     │  4. (Optional) Read customer │
│  • Alerting            ✅ Done  │     │     config from Firebase     │
│  • Webhooks            ✅ Done  │     │                              │
│  • SDK & REST API      ✅ Done  │     │  That's your entire scope.   │
│                                 │     │                              │
│  Nothing to build here.         │     │  No admin UI to build.       │
│  Just log in and use it.        │     │  No dashboard to create.     │
└─────────────────────────────────┘     └──────────────────────────────┘
              ▲                                      │
              │          SDK / REST API / Firebase    │
              └──────────────────────────────────────┘
```

**What your app sends** (via SDK or REST API):
- Heartbeats (health pings)
- API usage metrics (tokens, cost, latency)
- User traffic numbers (DAU, signups, sessions)
- Billing events (charges, refunds)
- Incidents (errors, outages)

**What your app reads** (from Firebase, optional):
- Customer branding (logo, company name)
- Theme CSS variables (60+ color/layout settings)
- Feature flags (toggles per customer)
- Domain-to-customer mapping

**What you do NOT build:**
- No admin dashboard — CTRL BOARD already has one
- No analytics UI — CTRL BOARD already shows charts and KPIs
- No user management — CTRL BOARD handles team members and roles
- No theme editor — CTRL BOARD has a full visual editor with color pickers
- No billing system — CTRL BOARD syncs with 11 providers

---

## Who Is This For?

You are a developer with your own application (web app, API, mobile backend, SaaS product, internal tool) and you have been given these docs to connect your app to CTRL BOARD.

These guides are **generic** — they work for any tech stack, any language, any framework.

## Documents

Read them in this order:

| # | Document | What You'll Learn |
|---|----------|-------------------|
| 1 | [WHAT_IS_CTRL_BOARD.md](./WHAT_IS_CTRL_BOARD.md) | What CTRL BOARD is, what's already built, and what your app gains by connecting |
| 2 | [GETTING_STARTED.md](./GETTING_STARTED.md) | Step-by-step guide to register your app and send your first data |
| 3 | [API_REFERENCE.md](./API_REFERENCE.md) | Complete SDK methods, REST endpoints, webhooks, SSE, and code examples |
| 4 | [APP_PROFILE_TEMPLATE.md](./APP_PROFILE_TEMPLATE.md) | Template to document your app's integration (fill this out and share it back) |

## Quick Start (30 seconds)

```bash
npm install @ctrlboard/sdk
```

```typescript
import { CtrlBoard } from "@ctrlboard/sdk";

const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: process.env.CTRL_BOARD_APP_ID!,
  heartbeat: true,
});
```

That's it. Your app is now sending health pings to CTRL BOARD. Read the guides above to add metrics, billing, customer config, and more.

---

**Parent docs:** [../README.md](../README.md) | [../ARCHITECTURE.md](../ARCHITECTURE.md)
