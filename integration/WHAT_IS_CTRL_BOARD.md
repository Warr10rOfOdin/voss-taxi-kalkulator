# What Is CTRL BOARD?

CTRL BOARD is a **centralized management platform** for monitoring, billing, customer administration, and real-time analytics across all your applications — from a single dashboard.

Think of it as mission control for your entire app ecosystem.

---

## The Problem It Solves

When you run multiple applications (or even one), you end up building the same infrastructure repeatedly:

- Health monitoring and uptime tracking
- Cost tracking across providers (cloud, AI APIs, SaaS tools)
- Customer/tenant management with branding and feature flags
- Invoicing and subscription management
- Real-time analytics dashboards
- Alerting and incident management
- Webhook delivery systems

CTRL BOARD handles **all of this** as a shared platform. Your apps just connect to it and instantly inherit these capabilities.

---

## What Your App Gets

When you connect your application to CTRL BOARD, you gain access to:

### 1. Health Monitoring & Uptime

Your app sends periodic heartbeats. CTRL BOARD tracks:

- **Uptime percentage** (30-day rolling)
- **Health status** (healthy / degraded / unhealthy) with color indicators
- **Latency, memory, and CPU trends** over time
- **Automatic alerts** when health degrades (Slack, Discord, email, webhooks)

### 2. API Usage & Cost Tracking

Track every API call your app makes to external providers:

- **Per-provider cost breakdown** (Anthropic, OpenAI, Google, Stripe, etc.)
- **Token usage and model performance** charts
- **Latency percentiles** (p50, p99)
- **Cost forecasting** and month-over-month trends
- **Spend alerts** when costs exceed thresholds you define
- **Anomaly detection** for unusual cost spikes

### 3. User & Traffic Analytics

Report user metrics and see them visualized:

- **Daily active users** (DAU) trends
- **New user signups** over time
- **Session counts** and engagement metrics
- **User growth charts** (monthly)

### 4. Billing & Invoicing

Centralize all billing operations:

- Track charges, refunds, credits, and adjustments
- Auto-sync with **11 billing providers** (Stripe, Anthropic, OpenAI, Vercel, Google Cloud, GitHub, Supabase, DigitalOcean, Cloudflare, QuickBooks, Xero)
- Generate invoices with PDF export
- Set up recurring invoice schedules
- Export to QuickBooks or Xero for accounting

### 5. Customer/Tenant Management

If your app serves multiple customers (multi-tenant), CTRL BOARD provides:

- **Per-customer branding** — logo, favicon, company name, page titles
- **Per-customer theming** — 60+ CSS variables for complete visual customization
- **Feature flags** — toggle features on/off per customer without redeployment
- **Domain mapping** — route customers to their config based on the domain they access
- **Regional settings** — default language, map center, contact info
- **Real-time sync** — changes made in CTRL BOARD apply instantly to your app via Firebase

### 6. Incident Management

Report and track incidents:

- Severity levels: info, warning, error, critical
- Automatic notifications to configured channels
- Health event timeline for post-mortems
- Webhook-triggered incident workflows

### 7. Real-Time Data Streams

Subscribe to live updates from CTRL BOARD:

- **SSE (Server-Sent Events)** — live metric broadcasts every 5 seconds
- **Webhooks** — HTTP POST notifications for 7+ event types (status changes, spend alerts, invoice events, incidents)
- **HMAC-signed payloads** for webhook security

### 8. Developer Tools

- **Interactive API playground** — test endpoints directly in the browser
- **Postman collection export** — import all endpoints into Postman with one click
- **TypeScript SDK** (`@ctrlboard/sdk`) with auto-instrumentation
- **Python SDK** (`ctrlboard`) with context manager support

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CTRL BOARD (Hub)                          │
│                                                             │
│  Dashboard  │  Apps  │  Customers  │  Costs  │  Invoices    │
│  Settings   │  Developer Portal   │  Subscriptions          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────┐            │
│  │ Supabase (SQL)   │    │ Firebase (NoSQL)      │           │
│  │ • Apps           │    │ • Tenant configs       │           │
│  │ • Metrics        │    │ • Branding & themes    │           │
│  │ • Invoices       │    │ • Feature flags        │           │
│  │ • Subscriptions  │    │ • Domain mapping       │           │
│  │ • Cost items     │    │ • Real-time sync       │           │
│  └─────────────────┘    └──────────────────────┘            │
│                                                             │
│  Ingestion API (5 endpoints)  │  SSE  │  Webhooks           │
│  OAuth (11 providers)         │  SDK  │  Cron jobs           │
└──────────┬──────────────────────────────────────┬───────────┘
           │                                      │
    ┌──────▼──────┐                      ┌────────▼────────┐
    │  Your App A  │                      │  Your App B      │
    │              │                      │                  │
    │ • SDK sends  │                      │ • REST API sends │
    │   heartbeats │                      │   metrics        │
    │ • Tracks AI  │                      │ • Subscribes to  │
    │   API usage  │                      │   Firebase for   │
    │ • Reports    │                      │   customer       │
    │   incidents  │                      │   config         │
    └─────────────┘                      └──────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5.9 |
| SQL Database | Supabase (PostgreSQL) |
| NoSQL Database | Firebase Realtime Database |
| Authentication | NextAuth.js v5 |
| Deployment | Vercel |
| SDKs | TypeScript (`@ctrlboard/sdk`), Python (`ctrlboard`) |

---

## How Your App Connects

There are two directions of data flow:

### Your App → CTRL BOARD (Push)

Your app sends data to CTRL BOARD via the SDK or REST API:

| What You Send | How | Why |
|---------------|-----|-----|
| Heartbeats | SDK auto-sends every 60s | Uptime monitoring |
| API usage events | `trackClaude()`, `trackOpenAI()`, `bufferEvent()` | Cost tracking, performance charts |
| User traffic | `trackUserTraffic()` | Growth analytics |
| Billing events | `trackBillingEvent()` | Revenue tracking, invoicing |
| Incidents | `reportIncident()` | Reliability tracking, alerting |

### CTRL BOARD → Your App (Pull / Subscribe)

Your app reads configuration from CTRL BOARD via Firebase:

| What You Read | How | Why |
|---------------|-----|-----|
| Customer branding | Firebase subscription to `/tenantRegistry/{id}/config` | White-labeling |
| Theme CSS variables | Firebase subscription (same path) | Visual customization |
| Feature flags | Firebase subscription (same path) | Toggle features per customer |
| Domain mapping | Firebase lookup at `/domainMap/{domain}` | Multi-tenant routing |
| App-specific config | Firebase subscription to custom paths | Business-specific data |

### CTRL BOARD → Your App (Events)

CTRL BOARD pushes events to your app:

| What You Receive | How | Why |
|------------------|-----|-----|
| Metric broadcasts | SSE stream | Live dashboard embedding |
| Status changes | Webhook POST | React to health changes |
| Spend alerts | Webhook POST | Budget notifications |
| Invoice events | Webhook POST | Payment workflow triggers |

---

## How Your App Benefits — By App Type

### SaaS / Web Application

- Monitor uptime and response times across environments
- Track AI API costs (Claude, GPT, etc.) per customer
- Get spend alerts before budgets are exceeded
- Generate invoices automatically from usage data
- Offer white-labeled experiences per customer

### Internal Tool / Admin Panel

- Centralize monitoring across all internal tools in one dashboard
- Track which tools cost the most and optimize
- Get alerted when any tool goes down
- Manage who has access to what via feature flags

### Multi-Tenant Application

- Manage per-customer branding (logo, colors, fonts) from CTRL BOARD
- Toggle features per customer without code changes or redeployment
- Map custom domains to customer configurations
- Track costs and revenue per customer/tenant

### API / Backend Service

- Auto-instrument every endpoint (latency, error rates, request counts)
- Track third-party API costs and performance
- Report incidents automatically on 5xx errors
- Receive webhook notifications for downstream processing

### Mobile App Backend

- Monitor backend health from the CTRL BOARD dashboard
- Track push notification costs, API gateway usage, etc.
- Manage in-app feature flags (premium features, A/B tests)
- Get notified when error rates spike

---

## Vision & Roadmap

### Current Capabilities (v2.3)

- 12-widget configurable dashboard with real-time SSE
- App registration, monitoring, and health tracking
- Per-customer branding, themes (60+ CSS variables), and feature flags
- Live billing sync from 11 providers
- Invoicing with QuickBooks/Xero export
- TypeScript & Python SDKs with auto-instrumentation
- Webhook delivery with HMAC-SHA256 signatures
- Anomaly detection and spend alerts

### Coming Next

- **Usage-based billing engine** — auto-generate invoices from tracked API usage per customer
- **Multi-workspace isolation** — full data separation per workspace
- **Alerting rules engine** — configurable conditions (if metric > threshold for N minutes, alert)
- **Dashboard sharing** — public read-only dashboard links for stakeholders
- **Embedded analytics SDK** — `@ctrlboard/react` for embedding charts in your app

### Long-Term Vision

- **App marketplace** — third-party apps self-register and receive universal features
- **White-label CTRL BOARD** — per-customer branded versions of the control board itself
- **Predictive cost optimization** — ML-based recommendations for model/provider switching
- **Global edge ingestion** — multi-region endpoints for lower latency
- **Infrastructure-as-code** — manage app infrastructure from CTRL BOARD

---

## Next Steps

1. **Read the [Getting Started guide](./GETTING_STARTED.md)** to connect your app
2. **Browse the [API Reference](./API_REFERENCE.md)** for all available endpoints and SDK methods
3. **Fill out the [App Profile Template](./APP_PROFILE_TEMPLATE.md)** to document your integration

---

**See Also:** [GETTING_STARTED.md](./GETTING_STARTED.md) | [API_REFERENCE.md](./API_REFERENCE.md) | [APP_PROFILE_TEMPLATE.md](./APP_PROFILE_TEMPLATE.md)
