# Features & Capabilities

Complete reference for every feature in CTRL BOARD, organized by section.

---

## Dashboard

Real-time command center showing the health and performance of your entire system.

### KPI Metrics

| Metric | Description | Data Source |
|--------|-------------|-------------|
| **Total Apps** | Count of registered applications | App registration |
| **Active Apps** | Apps with healthy heartbeat | Heartbeat endpoint |
| **Total Users** | Aggregate users across all apps | User traffic endpoint |
| **API Calls** | Total API calls in selected period | API usage endpoint |
| **Total Costs** | Aggregate spending across providers | Billing events + connected accounts |
| **Average Uptime** | System-wide uptime (30-day) | Heartbeat history |
| **Pending Invoices** | Unpaid invoices count + total | Invoice records |

### Visualizations

| Chart | Description |
|-------|-------------|
| **Spend Chart** | Monthly spending by provider (stacked area) or total with MoM delta |
| **Cost Pie Chart** | Spending by category (AI, infrastructure, tools, domains) |
| **API Usage Chart** | Daily API calls by provider (bar chart, 28-day window) |
| **User Growth Chart** | Monthly total/active/new users (line chart, 6-month window) |
| **Provider Bar Chart** | Comparative monthly cost per provider (horizontal bar) |

### Real-time Features

| Feature | Description |
|---------|-------------|
| **SSE Live Metrics** | Metrics refresh every 5 seconds via Server-Sent Events |
| **Health Alerts** | Instant notification when an app goes down |
| **Spending Notifications** | Alert when cost thresholds are exceeded |
| **Connection Indicator** | Shows SSE connection status (live/reconnecting) |
| **Recent Events Feed** | Scrolling list of latest metric events |

### Dashboard Widgets

12 configurable widgets with drag-and-drop ordering:

| Widget | Content |
|--------|---------|
| KPI Stats | 6 key metric cards |
| Live Metrics | SSE-powered real-time data |
| Anomaly Alerts | AI-detected cost/traffic anomalies |
| Spend Chart | Historical spending by provider |
| Cost Pie | Category breakdown |
| API Usage | Daily call volume |
| User Growth | Monthly user trends |
| Provider Bar | Comparative provider costs |
| Recent Invoices | Latest invoice list with status |
| App Status | Health indicator per app |
| Spend Forecast | Projected end-of-month spend |
| Pending Actions | Items requiring attention |

**Widget Configurator:**
- Toggle widget visibility
- Reorder widgets via drag-and-drop
- Reset to default layout
- Settings persist in localStorage

### Date Range Picker

Filter dashboard data by: 7 days, 30 days, 90 days, or 6 months.

---

## Apps

Central hub for registering, monitoring, and managing all connected applications.

### App Registration

3-step wizard:
1. **Details** — name, description, URL, environment, integration mode, cost threshold
2. **API Key** — auto-generated key with copy-to-clipboard and reveal toggle
3. **Setup** — SDK installation instructions (push mode) or `.well-known` endpoint spec (pull mode)

### App Monitoring

**Per-App Metrics:**

| Metric | Description |
|--------|-------------|
| Daily Active Users | Users active today |
| New Users | Signups today |
| API Calls | Volume and trend |
| Monthly Cost | Aggregated spending |
| Response Time | p50 and p99 latency |
| Uptime | 30-day percentage |

**Status Indicators:**

| Status | Criteria |
|--------|---------|
| Active (green) | >99% uptime, no errors |
| Warning (yellow) | >95% uptime, minor errors |
| Down (red) | <95% uptime or critical errors |

### App Detail Page

- Complete metrics dashboard per app
- Usage trends and performance graphs
- Cost analysis and billing breakdown
- Per-provider API usage breakdown table
- User analytics (DAU, MAU, retention)
- Health event timeline (deployments, spikes, outages)
- App configuration panel (environment, integration mode, API key)
- Edit, Archive, and Delete actions

### Health Tracking

| Feature | Description |
|---------|-------------|
| Heartbeat Monitoring | Apps send periodic health pings |
| Incident Reporting | Apps report errors and outages |
| Health Event Log | Historical timeline of all incidents |
| Automatic Alerting | Notifications on status changes |
| Auto-Status Update | Critical incidents set app to "down" |

---

## Tenants / Customers

Unified customer administration across all applications.

### Customer Management

| Feature | Description |
|---------|-------------|
| Create Customer | Add new tenants with ID, name, company, contact |
| Edit Customer | Update information anytime |
| Delete Customer | Remove tenant and all associated data |
| Toggle Status | Activate/deactivate without deletion |
| Search & Filter | Find by name, ID, email, company |

### Customer Dashboard

| Metric | Description |
|--------|-------------|
| Total Customers | System-wide count |
| Active Customers | Currently enabled |
| Inactive Customers | Paused tenants |

### Per-Customer Configuration (6 Tabs)

| Tab | Features |
|-----|----------|
| **Branding** | Logo, favicon, company name, page titles (NO/EN), descriptions, copyright, attribution |
| **Theme** | 60+ CSS variables, color pickers, presets (Dark, Light, Red/Blue/Green), per-variable reset |
| **Tariffs** | Base rates, auto-calculated rate matrix (vehicle groups x time periods), real-time sync |
| **Features** | 5 toggle switches for UI components, no redeploy required |
| **Domains** | Allowed domains with wildcard support, Firebase domain map auto-sync |
| **Regional** | Language, map center, country/region codes, contact info |

---

## Billing & Costs

### Invoicing

| Feature | Description |
|---------|-------------|
| Invoice Generation | Auto-numbered (INV-2026-001), multiple types |
| Types | Invoice, Subscription, Report, Credit Note |
| Line Items | App-based, group-based, per-user, per-feature, custom |
| Tax Calculation | Configurable tax rates |
| Status Tracking | Draft, Pending, Paid, Overdue, Cancelled |
| PDF Export | Print-friendly styled invoice layout |
| Payment Tracking | Record payments with auto paid_date |
| Billing History | Full payment history per customer |
| Recurring Invoices | Scheduled auto-generation with configurable frequency |

### Cost Tracking

| Feature | Description |
|---------|-------------|
| Subscription Monitoring | Track all SaaS subscriptions with usage % |
| 6 Cost Categories | AI APIs, AI Subscriptions, Infrastructure, Tools, Domains, Other |
| Monthly Spend Breakdown | Historical by provider, category breakdown |
| Period Comparison | Current vs previous month with % deltas |
| Budget Tracking | Progress bars with color-coded thresholds |
| CSV Export | Export costs and invoices as CSV |
| PDF Reports | Custom date range PDF export |
| Per-App Cost Attribution | Drill-down with date filtering |

### Cost Intelligence

| Feature | Description |
|---------|-------------|
| Spend Alerts | Per-subscription threshold configuration |
| Anomaly Detection | Auto-detect cost spikes, traffic drops, error surges |
| AI Cost Insights | 6 optimization suggestion types |
| Spend Forecast | Projected end-of-month based on current trends |
| Provider Consolidation | Suggestions to reduce redundant subscriptions |

### Connected Accounts

| Feature | Description |
|---------|-------------|
| 11 OAuth Providers | Anthropic, OpenAI, Stripe, Vercel, Google, GitHub, Supabase, DigitalOcean, Cloudflare, QuickBooks, Xero |
| Live Data Sync | Pull actual billing data from providers |
| Batch Sync | Sync all accounts in parallel |
| Token Management | Auto-detect expired tokens, reconnect flow |
| Accounting Export | Push invoices to QuickBooks or Xero |

---

## Developer Portal

Interactive API playground and management tools.

### API Playground

| Feature | Description |
|---------|-------------|
| 13+ Endpoints | Organized by category |
| Endpoint Selector | Method badges, descriptions |
| Request Editor | Editable JSON body |
| cURL Generator | Auto-generated curl commands |
| Live Send | Execute requests with response display |
| Config Panel | Base URL and API key inputs |

### API Keys

| Feature | Description |
|---------|-------------|
| Generate Keys | Per environment (production, staging, development) |
| Key Prefix | `drivas_live_` or `drivas_test_` with 24 random chars |
| Key Management | View prefix, creation date, last used |
| Rotation | Create new key + retire old in one action |
| Revocation | Permanent deletion |

### Webhooks

| Feature | Description |
|---------|-------------|
| Create Webhooks | HTTPS endpoint + event selection |
| 7 Event Types | Status, incident, spend, invoice events |
| HMAC Signing | SHA256 payload signatures |
| Enable/Disable | Toggle without deletion |
| Delivery Tracking | Last triggered timestamp |
| Auto-Retry | Failed delivery retry |

### Postman Export

`GET /api/v1/export/postman` — download complete Postman v2.1 collection covering all endpoints with auth and variables.

---

## Settings

### Sections

| Tab | Features |
|-----|----------|
| **API Keys** | Create, rotate, revoke keys; usage stats |
| **Webhooks** | CRUD with event picker; enable/disable; secret view |
| **Notifications** | Channel management (Email, Push, Slack, Discord); per-event toggles; test button |
| **Team** | Invite members, assign roles (Owner/Admin/User/Viewer/Billing), remove members |
| **Integrations** | OAuth provider connections, sync status, reconnect/disconnect |
| **Profile** | Avatar, display name, email, role, timezone |
| **Appearance** | Dark/Light/System theme; accent color picker |
| **Danger Zone** | Export all data as JSON; revoke all API keys |

### Notification Channels

| Channel | Format |
|---------|--------|
| **Slack** | Attachments with color-coded severity |
| **Discord** | Embeds with color-coded severity |
| **Email** | Per alert type configuration |
| **Push** | Browser push notifications |

---

## Cross-Cutting Features

### Data Management
- **Global Search** — search across apps, customers, invoices
- **CSV/PDF Export** — export reports from Costs and Invoices pages
- **JSON Export** — full data export from Settings > Danger Zone
- **Bulk Operations** — batch update customers or settings
- **Audit Logs** — track all changes with who/what/when

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search |
| `Ctrl+1` through `Ctrl+5` | Navigate to sections |
| `Ctrl+N` | Create new app |

### Multi-Workspace Support
- Workspace switcher in sidebar
- Create new workspaces inline
- Persistent workspace selection (localStorage)

### Accessibility & Responsive
- Dark/Light/System themes
- Full keyboard navigation
- Mobile-responsive (bottom tab bar on mobile)
- 44px minimum touch targets
- Multi-language UI (Norwegian + English)

### Security
- Session management with secure cookies/JWT
- HTTPS-only communications
- CSRF protection
- Row-Level Security (RLS) in Supabase
- API rate limiting per key
- HMAC-SHA256 webhook signatures
- Firebase Realtime DB rules

### Performance
- Server-Sent Events for real-time updates
- Page-level and data caching
- Lazy loading on demand
- Optimized database queries with indexes
- ISR/SSR via Next.js for optimal load times

### PWA Support
- `manifest.json` with app metadata
- Standalone display mode
- Custom app icons
- Apple Web App capable

---

**See Also**: [API_INTEGRATION.md](./API_INTEGRATION.md) for connecting apps, [APP_ADMINISTRATION.md](./APP_ADMINISTRATION.md) for customer management, [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, [integration/](./integration/INDEX.md) for integration guides
