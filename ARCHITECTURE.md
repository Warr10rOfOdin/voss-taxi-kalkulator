# Architecture & System Design

## System Overview

CTRL BOARD is a **distributed multi-app management platform** that acts as the central hub for all your SaaS applications. The system uses a **multi-database approach** combining SQL (Supabase) for transactional data and NoSQL (Firebase) for hierarchical tenant configurations. Apps connect via a TypeScript/Python SDK or direct REST API calls.

### System Diagram

```
                 ┌──────────────────────────────────────────────────┐
                 │          CTRL BOARD (Next.js 15)                 │
                 │                                                  │
                 │  ┌────────────┐  ┌──────────────┐  ┌─────────┐ │
                 │  │ Dashboard  │  │ Apps         │  │ Tenants │ │
                 │  │ Analytics  │  │ Monitoring   │  │ Config  │ │
                 │  └────────────┘  └──────────────┘  └─────────┘ │
                 │                                                  │
                 │  ┌────────────┐  ┌──────────────┐  ┌─────────┐ │
                 │  │ Billing &  │  │ Developer    │  │Settings │ │
                 │  │ Invoicing  │  │ Portal / API │  │ & Auth  │ │
                 │  └────────────┘  └──────────────┘  └─────────┘ │
                 │                                                  │
                 │  ┌────────────────────────────────────────────┐ │
                 │  │  Billing Fetcher Framework (11 providers)  │ │
                 │  │  Anthropic | OpenAI | Stripe | Vercel |    │ │
                 │  │  Google | GitHub | Supabase | DO |         │ │
                 │  │  Cloudflare | QuickBooks | Xero            │ │
                 │  └────────────────────────────────────────────┘ │
                 └──────────┬───────────────────────┬──────────────┘
                            │                       │
                 ┌──────────┴────┐         ┌────────┴─────────┐
                 │   Supabase    │         │    Firebase      │
                 │ (PostgreSQL)  │         │ (Realtime DB)    │
                 │               │         │                  │
                 │ • Apps        │         │ • Tenant Config  │
                 │ • Customers   │         │ • Branding       │
                 │ • Invoices    │         │ • Theme Vars     │
                 │ • Metrics     │         │ • Feature Flags  │
                 │ • Subscriptions│        │ • Tariffs        │
                 │ • Usage Events│         │ • Domain Map     │
                 │ • API Keys   │         │ • Regional       │
                 │ • Webhooks   │         │                  │
                 └──────────────┘         └──────────────────┘
                            ▲                       ▲
                 ┌──────────┤                       │
                 │          │                       │
                 ▼          ▼                       ▼
            ┌───────────┐ ┌──────────┐ ┌──────────────┐
            │ TAXI CALC │ │ FLEET APP│ │ FUTURE APPS  │
            │(React/Vite│ │(Next.js) │ │ (any stack)  │
            └───────────┘ └──────────┘ └──────────────┘
                  │              │             │
                  └──────────────┴─────────────┘
                           │
                  ┌────────┴──────────┐
                  │  @ctrlboard/sdk   │
                  │  ────────────────  │
                  │  • Heartbeat      │
                  │  • API Usage      │
                  │  • Billing Events │
                  │  • Incidents      │
                  │  • User Traffic   │
                  │  • Auto-instrument│
                  └───────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 with App Router (React 19) | Full-stack application |
| Language | TypeScript 5.7 | Type safety |
| SQL Database | Supabase (PostgreSQL) | Transactional data, RLS |
| NoSQL Database | Firebase Realtime Database | Tenant config, real-time sync |
| Authentication | NextAuth.js v5 | OAuth (GitHub, Google), credentials |
| Error Tracking | Sentry | Error monitoring, stack traces |
| Deployment | Vercel | CI/CD, CDN, edge functions |
| Styling | Tailwind CSS 3.4 | Custom "Sith" theme, glassmorphism |
| Icons | Lucide React | Consistent icon library |
| Charts | Recharts | Dashboard visualizations |
| SDKs | TypeScript (`@ctrlboard/sdk`), Python (`ctrlboard`) | App integration |

## Data Architecture

### Supabase Schema (PostgreSQL)

#### Core Tables

```
┌─ APPS ──────────────────────────────────────────┐
│ id, name, description, status, uptime           │
│ api_key, environment, integration_mode          │
│ cost_alert_threshold                            │
│ created_at, updated_at, last_heartbeat          │
└─────────────────────────────────────────────────┘
       │
       ├──→ APP_METRICS_DAILY                    (date, dau, new_users, sessions,
       │                                          api_calls, api_errors, cost,
       │                                          p50_latency, p99_latency, uptime_pct)
       │
       ├──→ APP_FEATURES                         (name, description, price_per_unit,
       │                                          unit, tier, included)
       │
       ├──→ USER_GROUPS                          (name, tier, user_count, price_per_user)
       │       └──→ USER_GROUP_FEATURES
       │
       └──→ HEALTH_EVENTS                        (event_type, event, detail, occurred_at)

┌─ CUSTOMERS ─────────────────────────────────────┐
│ id, name, email, billing_model                  │
│ billing_address, tax_id, is_active              │
│ created_at, updated_at                          │
└─────────────────────────────────────────────────┘
       │
       ├──→ CUSTOMER_APPS                        (customer_id, app_id, custom_rate,
       │                                          billing_start)
       │
       └──→ USAGE_EVENTS                         (app_id, feature_id, customer_id,
                                                   event_type, quantity, unit_cost,
                                                   metadata, occurred_at)
```

#### Billing Tables

```
┌─ INVOICES ──────────────────────────────────────┐
│ id, number (auto: INV-2026-001), customer_id    │
│ type (invoice/subscription/report/credit-note)  │
│ status (draft/pending/paid/overdue/cancelled)   │
│ issue_date, due_date, paid_date                 │
│ period_start, period_end                        │
│ subtotal, tax_rate, tax_amount, discount, total │
│ currency                                        │
└─────────────────────────────────────────────────┘
       └──→ INVOICE_LINE_ITEMS                   (sort_order, line_type, description,
                                                   quantity, unit_price, amount,
                                                   app_id, group_id, feature_id)
```

#### Subscription & Cost Tables

```
┌─ CONNECTED_ACCOUNTS ────────────────────────────┐
│ id, provider, provider_icon                     │
│ account_email, status (connected/expired/pending)│
│ connected_at, last_sync, scopes                 │
│ access_token, refresh_token (encrypted)         │
└─────────────────────────────────────────────────┘
       │
       └──→ SUBSCRIPTIONS                        (name, provider, plan, status,
              │                                    amount, billing_cycle,
              │                                    current_period_start/end,
              │                                    usage_percent, usage_label)
              │
              ├──→ SUBSCRIPTION_FEATURES          (name, sort_order)
              │
              └──→ SUBSCRIPTION_RECEIPTS          (date, amount, status, invoice_url)

┌─ COST_ITEMS ────────────────────────────────────┐
│ id, name, category, provider                    │
│ monthly_cost, billing_cycle, next_billing       │
│ status, icon                                    │
└─────────────────────────────────────────────────┘

┌─ MONTHLY_SPEND ─────────────────────────────────┐
│ month, year                                     │
│ claude, vercel, firebase, chatgpt, domains, other│
└─────────────────────────────────────────────────┘

┌─ API_USAGE_DAILY ───────────────────────────────┐
│ date, label                                     │
│ claude, chatgpt, firebase, vercel               │
└─────────────────────────────────────────────────┘

┌─ USER_GROWTH_MONTHLY ───────────────────────────┐
│ month, year                                     │
│ total_users, active_users, new_users            │
└─────────────────────────────────────────────────┘
```

#### Settings Tables

```
┌─ SETTINGS_API_KEYS ─────────────────────────────┐
│ id, name, key_prefix                            │
│ environment (production/staging/development)     │
│ created_at, last_used                           │
└─────────────────────────────────────────────────┘

┌─ SETTINGS_WEBHOOKS ─────────────────────────────┐
│ id, url, events[], is_active, secret            │
│ created_at, last_triggered                      │
└─────────────────────────────────────────────────┘
```

### Firebase Structure (Realtime Database)

```
/tenantRegistry/
  /{customerId}/
    config/
      id: string
      name: string
      active: boolean
      branding:
        companyName: string
        logo: string (Firebase Storage URL)
        favicon: string (Firebase Storage URL)
        logoAltText: string
        pageTitle: { no: string, en: string }
        pageDescription: { no: string, en: string }
        copyrightHolder: string
        madeBy: { no: string, en: string }
      theme: { [cssVariable]: string }     // 60+ CSS variables
      features:
        showLanguageSwitcher: boolean
        showPrintButton: boolean
        showTariffEditor: boolean
        showMap: boolean
        showTariffTable: boolean
      defaults:
        startAddress: string
        lang: "no" | "en"
        mapsCountry: string
        mapsRegion: string
        mapCenter: { lat: number, lng: number }
      contact: { phone, email, website }
      allowedDomains: string[]

/tenants/
  /{customerId}/
    tariffs/
      base14/
        start: number (NOK)
        km0_10: number (NOK/km)
        kmOver10: number (NOK/km)
        min: number (NOK/min)
        lastUpdated: timestamp
        version: number

/domainMap/
  /{encodedDomain}/            // dots replaced with commas
    tenantId: string
```

## Integration Architecture

### Data Flow Patterns

#### 1. Metrics Ingestion (App → CTRL BOARD)

```
App (SDK or REST)
  → POST /api/v1/ingest/api-usage      → app_metrics_daily, usage_events
  → POST /api/v1/ingest/user-traffic   → app_metrics_daily
  → POST /api/v1/ingest/heartbeat      → apps.last_heartbeat, health_events
  → POST /api/v1/ingest/incident       → health_events, app status update
  → POST /api/v1/ingest/billing-event  → invoices, usage_events
```

#### 2. Live Billing Sync (Provider → CTRL BOARD)

```
Connected Account (OAuth)
  → BillingFetcher.fetchSubscriptions() → subscriptions table
  → BillingFetcher.fetchReceipts()      → subscription_receipts table
  → BillingFetcher.fetchUsage()         → cost_items, monthly_spend tables
```

#### 3. Configuration Sync (CTRL BOARD → App)

```
Admin edits tenant config in CTRL BOARD
  → Saves to Firebase /tenantRegistry/{id}/config
  → App subscribes via Firebase SDK (onValue)
  → Config update arrives in real-time
  → App applies branding, theme, features
```

#### 4. Real-time Updates (CTRL BOARD → Client)

```
GET /api/v1/sse
  → Streams live metrics (every 5s)
  → Streams heartbeat keepalive (every 30s)
  → Pushes config change notifications
  → Pushes alert events
  → Pushes anomaly detections
```

#### 5. Webhook Dispatch (CTRL BOARD → External)

```
Event occurs (incident, spend threshold, invoice)
  → Webhook dispatch system
  → HMAC-SHA256 signature
  → POST to configured webhook URLs
  → Updates last_triggered timestamp
  → Retries on failure
```

#### 6. Accounting Export (CTRL BOARD → QuickBooks/Xero)

```
Admin clicks "Export to Accounting"
  → POST /api/accounting/export
  → Builds provider-specific invoice payload
  → Creates invoice in QuickBooks (with CustomerRef, Line items, Tax)
  → OR creates invoice in Xero (with Contact, LineItems, Currency)
```

### SDK Architecture

```
@ctrlboard/sdk (TypeScript)
├── client.ts          CtrlBoard class
│   ├── registerApp()      POST /api/v1/apps
│   ├── sendHeartbeat()    POST /api/v1/ingest/heartbeat
│   ├── trackApiUsage()    POST /api/v1/ingest/api-usage
│   ├── bufferEvent()      Auto-batch (50 events or 5s timer)
│   ├── trackClaude()      → bufferEvent (provider: "anthropic")
│   ├── trackOpenAI()      → bufferEvent (provider: "openai")
│   ├── trackBillingEvent() POST /api/v1/ingest/billing-event
│   ├── reportIncident()   POST /api/v1/ingest/incident
│   ├── trackUserTraffic() POST /api/v1/ingest/user-traffic
│   └── shutdown()         Stop heartbeat + flush buffer
├── types.ts           TypeScript interfaces
└── instrumentation/
    ├── nextjs.ts      withCtrlBoard() (Pages), withCtrlBoardApp() (App Router)
    └── express.ts     ctrlBoardMiddleware()
```

### Billing Fetcher Architecture

```
src/lib/billing/
├── types.ts           BillingFetcher interface, ProviderSubscription, SyncResult
├── index.ts           Registry: getBillingFetcher(), fetchBillingForAccount()
├── anthropic.ts       Anthropic Admin API
├── openai.ts          OpenAI Organization API
├── stripe.ts          Stripe Subscriptions/Invoices API
├── vercel.ts          Vercel Plan/Usage API
├── google.ts          Google Cloud Billing API
├── github.ts          GitHub Billing API
├── supabase-billing.ts Supabase Org API
├── digitalocean.ts    DigitalOcean Balance/Billing API
├── cloudflare.ts      Cloudflare Billing API
├── quickbooks.ts      Intuit QuickBooks API
└── xero.ts            Xero Accounting API
```

### Multi-Tenant Request Flow

```
1. Customer accesses app domain (e.g., bergentaxi.no)
   ↓
2. App encodes domain: bergentaxi,no
   ↓
3. Firebase lookup: /domainMap/bergentaxi,no → { tenantId: "bergen-taxi" }
   ↓
4. Customer config loaded: /tenantRegistry/bergen-taxi/config
   ↓
5. App applies: branding (logo, title) + theme (CSS vars) + features (flags)
   ↓
6. App renders with customer-specific customizations
   ↓
7. App tracks usage via SDK: client.bufferEvent(...)
   ↓
8. CTRL BOARD receives metrics → Supabase app_metrics_daily
   ↓
9. Dashboard updates with aggregated data
```

## Authentication Architecture

### CTRL BOARD Authentication

```
1. User navigates to CTRL BOARD
   ↓
2. middleware.ts checks session (protects all routes except /login, /api/v1/*)
   ↓
3. No session → redirect to /login
   ↓
4. Login via: GitHub OAuth | Google OAuth | Email/Password
   ↓
5. NextAuth.js authenticates, creates JWT session
   ↓
6. JWT includes role from team_members table
   ↓
7. Session stored as secure cookie
   ↓
8. RLS policies in Supabase enforce data isolation
```

### API Authentication

```
1. App sends request with:
   Authorization: Bearer drivas_live_abc123...
   X-App-ID: app_xyz789
   ↓
2. api-auth.ts validates:
   - API key prefix format
   - Key exists in settings_api_keys OR matches app.api_key
   - App exists in apps table
   ↓
3. Rate limiter checks per-app per-endpoint limits
   ↓
4. Request processed, response returned
   ↓
5. last_used timestamp updated on API key
```

### OAuth Provider Flow

```
1. User clicks "Connect" on provider (e.g., Stripe)
   ↓
2. GET /api/oauth/stripe/authorize → redirect to Stripe OAuth
   ↓
3. User authorizes scopes
   ↓
4. Stripe redirects to /api/oauth/stripe/callback with auth code
   ↓
5. Exchange code for access_token + refresh_token
   ↓
6. Store tokens in connected_accounts table
   ↓
7. Trigger initial billing sync
   ↓
8. BillingFetcher pulls subscriptions, receipts, usage
   ↓
9. Data upserted to subscriptions, subscription_receipts tables
```

## Security

| Layer | Mechanism |
|-------|-----------|
| Authentication | NextAuth.js v5 with JWT sessions |
| Route Protection | Next.js middleware (all routes except /login, /api/v1/*) |
| API Auth | Bearer token + X-App-ID validation |
| Database | Row-Level Security (RLS) policies on all 21 tables |
| Firebase | Realtime DB rules (auth required for writes) |
| Webhooks | HMAC-SHA256 payload signatures |
| Rate Limiting | Sliding-window per-app per-endpoint limits |
| Payload Limits | 1 MB max request body on ingest endpoints |
| OAuth Tokens | Stored encrypted in connected_accounts |
| Error Tracking | Sentry with replay sampling |

## Scalability & Performance

| Area | Strategy |
|------|----------|
| Database | Supabase RLS for multi-tenancy, indexes on all filtered columns |
| Real-time | Firebase for hierarchical config sync, SSE for live metrics |
| Caching | Next.js ISR/SSR, localStorage for widget config |
| Rate Limiting | Per-app sliding window (configurable per endpoint) |
| Batch Processing | SDK event buffer (50 events / 5s), billing sync (3 concurrent) |
| CDN | Vercel global CDN with edge functions |
| Webhooks | Asynchronous fire-and-forget dispatch |
| Background Jobs | Cron endpoint for aggregation, alerts, retention, health checks |

## Migrations

Database migrations in order:

| File | Purpose |
|------|---------|
| `001_billing_schema.sql` | Core tables: apps, customers, invoices, usage, metrics |
| `002_seed_data.sql` | Seed data for demo/testing |
| `003_subscriptions_costs_settings.sql` | Subscriptions, costs, API keys, webhooks |
| `004_rls_policies.sql` | Row-Level Security for all 21 tables |
| `005_seed_new_tables.sql` | Seed data for subscription/cost tables |
| `006_connected_accounts_oauth.sql` | OAuth connected accounts, token storage |

## Future Extensibility

Adding a new app requires zero code changes to CTRL BOARD:

1. Register app via dashboard or SDK (`POST /api/v1/apps`)
2. App starts sending metrics via SDK or REST API
3. Existing customers can be configured for the new app
4. Universal features (branding, themes, flags) apply automatically
5. App-specific settings added to Firebase under tenant config

Adding a new billing provider:

1. Create a `BillingFetcher` implementation in `src/lib/billing/`
2. Register in the provider registry (`index.ts`)
3. Add OAuth config in `providers.ts` if OAuth-based
4. Provider appears in Connected Accounts UI automatically

---

**See Also**: [API_INTEGRATION.md](./API_INTEGRATION.md) for integration guide, [FEATURES.md](./FEATURES.md) for feature reference, [DEPLOYMENT.md](./DEPLOYMENT.md) for setup, [integration/](./integration/INDEX.md) for integration guides
