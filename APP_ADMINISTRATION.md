# App Administration & Customer Management

This guide covers everything platform administrators need to manage customers, control user access, configure branding and themes per tenant, set feature flags, and handle billing — all from the CTRL BOARD dashboard.

---

## Table of Contents

1. [Customer Management](#customer-management)
2. [User & Team Management](#user--team-management)
3. [Branding Customization](#branding-customization)
4. [Theme Customization](#theme-customization)
5. [Feature Flags](#feature-flags)
6. [Domain Management](#domain-management)
7. [Regional & Localization Settings](#regional--localization-settings)
8. [App-Specific Configuration](#app-specific-configuration)
9. [Billing & Invoicing Controls](#billing--invoicing-controls)
10. [Connected Accounts & OAuth](#connected-accounts--oauth)
11. [Notifications & Alerts](#notifications--alerts)
12. [API Keys & Webhooks](#api-keys--webhooks)
13. [Workflow Examples](#workflow-examples)
14. [Troubleshooting](#troubleshooting)

---

## Customer Management

### Creating a Customer

Navigate to **Tenants** and click **New Tenant**.

**Required Fields:**
- **Customer ID** — unique kebab-case identifier (e.g., `bergen-taxi`)
- **Display Name** — human-friendly name (e.g., `Bergen Taxi`)

**Optional Fields:**
- Company name, email, phone, default address

After creation:
- Customer record created in Supabase (`customers` table)
- Customer config initialized in Firebase (`/tenantRegistry/{id}/config`)
- Default settings applied (dark theme, all features enabled)
- Customer appears in the Tenants list

### Customer Status

| Status | Effect |
|--------|--------|
| **Active** | Customer can access all assigned apps |
| **Inactive** | Customer's access is paused; can be reactivated |

Toggle status from the Tenants list. Changes take effect immediately.

### Deleting a Customer

1. Click the delete icon on the customer card
2. Confirm permanent deletion
3. All customer data is removed from both Supabase and Firebase

### Searching Customers

Use the search bar to filter by:
- Customer ID (`bergen-taxi`)
- Display name (`Bergen`)
- Company name (`Bergen Taxi AS`)
- Email (`contact@`)

### Customer Dashboard Stats

The Tenants page shows:
- **Total Customers** — all registered tenants
- **Active Customers** — currently active tenants
- **Inactive Customers** — paused tenants

---

## User & Team Management

### Team Members

Manage who has access to CTRL BOARD itself via **Settings > Team**.

**Roles:**

| Role | Permissions |
|------|------------|
| **Owner** | Full access, can manage all settings, billing, and team members |
| **Admin** | Full access except ownership transfer and account deletion |
| **User** | Can view dashboards, manage apps and customers |
| **Viewer** | Read-only access to dashboards and reports |
| **Billing** | Access to billing, invoicing, and cost pages only |

**Actions:**
- **Invite Member** — send invitation with name, email, and role assignment
- **Change Role** — promote or demote team members via dropdown
- **Remove Member** — remove access with confirmation dialog

### Authentication

CTRL BOARD supports multiple authentication methods:

| Method | Setup |
|--------|-------|
| **GitHub OAuth** | Configure in Settings > Integrations (recommended) |
| **Google OAuth** | Configure via Google Cloud Console |
| **Email/Password** | Default admin credentials for initial setup |

### Per-Section Access Control

Each team member's role determines which sections they can access:

| Section | Owner | Admin | User | Viewer | Billing |
|---------|-------|-------|------|--------|---------|
| Dashboard | Full | Full | Full | Read | - |
| Apps | Full | Full | Full | Read | - |
| Tenants | Full | Full | Full | Read | - |
| Billing | Full | Full | Full | Read | Full |
| Settings | Full | Full | - | - | - |
| API Keys | Full | Full | - | - | - |
| Team | Full | - | - | - | - |

### Activity Logs

All changes are tracked for compliance:
- Who made the change
- What was changed
- When it happened
- Previous and new values

---

## Branding Customization

### Per-Customer Branding

Navigate to **Tenants > [Customer] > Branding** tab.

Every connected app can display customer-specific branding. Changes are saved to Firebase and sync to apps in real-time.

### Branding Fields

| Field | Description | Recommendation |
|-------|-------------|----------------|
| **Logo** | Company/brand logo | 200x50px, PNG/JPG/WebP |
| **Favicon** | Browser tab icon | 64x64px, PNG |
| **Company Name** | Displayed in app header/footer | Full brand name |
| **Logo Alt Text** | Accessibility text for logo | Descriptive text |
| **Page Title (NO)** | Norwegian `<title>` tag | "CompanyName Kalkulator" |
| **Page Title (EN)** | English `<title>` tag | "CompanyName Calculator" |
| **Page Description (NO)** | Norwegian meta description | SEO-friendly, <160 chars |
| **Page Description (EN)** | English meta description | SEO-friendly, <160 chars |
| **Copyright Holder** | Footer copyright text | "CompanyName AS" |
| **Made By (NO)** | Norwegian attribution | "Laget av CompanyName" |
| **Made By (EN)** | English attribution | "Made by CompanyName" |

### Logo Upload

1. Click the logo upload area or drag-and-drop
2. Image uploads to Firebase Storage
3. URL is saved in customer config
4. All apps using this customer's config update immediately

### How Apps Read Branding

Apps subscribe to Firebase and apply branding in real-time:

```typescript
// Firebase path: /tenantRegistry/{customerId}/config/branding
{
  companyName: "Bergen Taxi",
  logo: "https://firebasestorage.googleapis.com/...",
  favicon: "https://firebasestorage.googleapis.com/...",
  pageTitle: { no: "Bergen Taxi Kalkulator", en: "Bergen Taxi Calculator" },
  pageDescription: { no: "Beregn pris...", en: "Calculate fare..." },
  copyrightHolder: "Bergen Taxi AS",
  madeBy: { no: "Laget av Drivas", en: "Made by Drivas" }
}
```

---

## Theme Customization

### Per-Customer Themes

Navigate to **Tenants > [Customer] > Theme** tab.

Each customer can have a completely unique visual theme applied to their app instance.

### Quick Presets

Apply a preset with one click, then customize further:

| Preset | Description |
|--------|-------------|
| **Dark** (Default) | Dark backgrounds, light text, red accents |
| **Light** | White backgrounds, dark text, blue accents |
| **Red Brand** | Red primary color with dark theme |
| **Blue Brand** | Blue primary color with dark theme |
| **Green Brand** | Green primary color with dark theme |

### CSS Variable Groups

The theme editor organizes 60+ CSS variables into groups:

#### Brand Colors
| Variable | Description | Example |
|----------|-------------|---------|
| `--color-primary` | Primary brand color | `#FF1B23` |
| `--color-secondary` | Secondary brand color | `#FFD700` |
| `--color-tertiary` | Tertiary accent | `#7C3AED` |
| `--color-success` | Success states | `#22C55E` |
| `--color-danger` | Error/danger states | `#EF4444` |
| `--color-warning` | Warning states | `#F59E0B` |

#### Backgrounds
| Variable | Description |
|----------|-------------|
| `--bg-body-1` through `--bg-body-5` | Page background layers |
| `--bg-card` | Card/panel backgrounds |
| `--bg-input` | Form input backgrounds |
| `--bg-modal` | Modal/dialog backgrounds |
| `--bg-map` | Map container background |
| `--bg-tooltip` | Tooltip backgrounds |
| `--bg-tariff-header` | Table header background |
| `--bg-tariff-cell` | Table cell background |

#### Text Colors
| Variable | Description |
|----------|-------------|
| `--text-primary` | Main text color |
| `--text-secondary` | Secondary text |
| `--text-muted` | Muted/subtle text |
| `--text-label` | Form label text |
| `--text-placeholder` | Input placeholder text |
| `--text-footer` | Footer text |

#### Typography
| Variable | Description |
|----------|-------------|
| `--font-family` | Base font family |
| `--font-size-h1` | Heading size |
| `--font-size-card-title` | Card title size |
| `--font-size-body` | Body text size |
| `--font-size-small` | Small text size |
| `--font-size-price` | Price display size |

#### Borders, Radius, Shadows
| Variable | Description |
|----------|-------------|
| `--border-card`, `--border-input` | Border colors |
| `--radius-card`, `--radius-btn` | Border radius values |
| `--shadow-card`, `--shadow-card-hover` | Box shadow values |

#### Animations
| Variable | Description |
|----------|-------------|
| `--gradient-duration` | Gradient animation speed |
| `--fade-duration` | Fade animation speed |
| `--transition-speed` | General transition speed |

### How Apps Apply Themes

Apps read the theme object and apply CSS variables:

```typescript
// Theme config from Firebase
const theme = config.theme; // Record<string, string>

// Apply all variables to :root
Object.entries(theme).forEach(([variable, value]) => {
  document.documentElement.style.setProperty(variable, value);
});
```

### Per-Variable Reset

Each variable has a reset button to restore the default value from the active preset.

---

## Feature Flags

### Per-Customer Feature Flags

Navigate to **Tenants > [Customer] > Features** tab.

Toggle UI components on/off per customer. Changes take effect on the customer's next page load — no app redeploy required.

### Available Flags

| Flag | Description | Default |
|------|-------------|---------|
| `showLanguageSwitcher` | NO/EN language toggle in header | ON |
| `showPrintButton` | Print/PDF export button | ON |
| `showTariffEditor` | In-app tariff editing menu | OFF |
| `showMap` | Google Maps route visualization | ON |
| `showTariffTable` | Price matrix below estimate | ON |

### Extending Feature Flags

To add new feature flags for your app:

1. Add the flag to the Firebase config schema
2. Initialize it in the tenant creation flow
3. Add a toggle in the Features tab editor
4. Read the flag in your app:

```typescript
const features = config.features;
if (features.showMap) {
  renderMap();
}
if (features.showLanguageSwitcher) {
  renderLanguageToggle();
}
```

### Use Cases

- **Disable Google Map** for customers on tight budgets (saves API costs)
- **Disable tariff editor** to prevent customers from self-editing rates
- **Disable language switcher** for single-language deployments
- **Disable print button** if PDF export isn't needed

---

## Domain Management

### Per-Customer Domain Restrictions

Navigate to **Tenants > [Customer] > Domains** tab.

Control which domains can access this customer's app instance.

### How Domain Restriction Works

1. User visits app from `example.com`
2. App encodes domain: `example,com` (dots replaced with commas)
3. App checks Firebase `/domainMap/example,com`
4. If mapping exists and matches customer -> access granted
5. If domain not in customer's `allowedDomains` -> access denied

### Adding Domains

- Enter domain name (e.g., `bergentaxi.no`)
- Click "Add" or press Enter
- Domain appears in the allowed list

### Wildcard Support

| Pattern | Matches |
|---------|---------|
| `bergentaxi.no` | Exact domain only |
| `*.bergentaxi.no` | All subdomains (`www.bergentaxi.no`, `app.bergentaxi.no`) |
| `*.vercel.app` | All Vercel preview deployments |
| `*` | All domains (unrestricted) |

### Special Cases

- `localhost` is **always allowed** for development
- **Empty domain list** = unrestricted access from any domain
- Domain changes sync to Firebase `/domainMap/` automatically

### Recommended Setup

```
bergentaxi.no          # Production domain
www.bergentaxi.no      # WWW variant
*.vercel.app           # Preview deployments
```

---

## Regional & Localization Settings

### Per-Customer Regional Settings

Navigate to **Tenants > [Customer] > Regional** tab.

Configure location-specific defaults for each customer.

### Settings

| Setting | Description | Example |
|---------|-------------|---------|
| **Default Start Address** | Pre-filled location | `Torgallmenningen, Bergen` |
| **Language** | Default UI language | `no` (Norwegian) or `en` (English) |
| **Maps Country** | ISO 3166-1 lowercase | `no` |
| **Maps Region** | ISO 3166-2 uppercase | `NO` |
| **Map Center Latitude** | Default map center lat | `60.3912` |
| **Map Center Longitude** | Default map center lng | `5.3220` |

### Contact Information

| Setting | Description | Example |
|---------|-------------|---------|
| **Phone** | Customer support phone | `+47 55 99 70 00` |
| **Email** | Customer support email | `support@bergentaxi.no` |
| **Website** | Customer website URL | `https://bergentaxi.no` |

---

## App-Specific Configuration

### Universal vs. App-Specific

Every connected app gets universal features automatically:

| Universal (All Apps) | App-Specific |
|---------------------|--------------|
| Branding | Taxi Calculator: tariff rates |
| Themes | Fleet App: vehicle types |
| Feature flags | Your App: custom settings |
| Domains | |
| Regional settings | |

### Taxi Calculator: Tariff Management

Navigate to **Tenants > [Customer] > Tariffs** tab.

#### Base Rates

All rates are for 1-4 seat vehicles, day period:

| Rate | Description | Example |
|------|-------------|---------|
| **Start Fee** | Minimum charge | NOK 97.00 |
| **0-10 km** | Rate per km (short trips) | NOK 11.14/km |
| **>10 km** | Rate per km (long trips) | NOK 21.23/km |
| **Per Minute** | Waiting/slow traffic | NOK 8.42/min |

#### Automatic Rate Matrix

The system auto-calculates rates for all combinations:

**Vehicle Multipliers:**
| Vehicle Group | Multiplier |
|---------------|-----------|
| 1-4 seats | 1.00x |
| 5-7 seats | 1.25x |
| 8+ seats | 1.50x |
| Business/VIP | 2.00x |

**Period Multipliers:**
| Period | Multiplier |
|--------|-----------|
| Day | 1.00x |
| Night | 1.20x |
| Weekend | 1.15x |
| Holiday | 1.50x |

The rate matrix preview shows all calculated combinations (5 periods x 4 vehicle groups).

#### Tariff Sync

Saving tariffs updates Firebase in real-time. All open calculator instances for this customer receive the new rates immediately.

### Adding Custom App Settings

For new apps, extend the Firebase schema:

```
/tenantRegistry/{customerId}/config/
  appSpecific/
    fleetApp/
      vehicleTypes: ["sedan", "suv", "van"]
      insuranceRate: 0.05
      maintenanceSchedule: "monthly"
    yourApp/
      customField1: "value"
      customField2: 42
```

---

## Billing & Invoicing Controls

### Invoice Management

Navigate to **Billing** section.

#### Creating Invoices

1. Click **New Invoice**
2. Fill in:
   - Client name (auto-creates customer if new)
   - Type: Invoice, Subscription, Report, or Credit Note
   - Due date
3. Add line items:
   - Description, quantity, unit price
   - Auto-calculated amounts
4. Tax rate applied automatically (configurable)
5. Click "Create Invoice"

**Invoice number format:** `INV-2026-001` (auto-generated)

#### Invoice States

| Status | Description |
|--------|-------------|
| **Draft** | Not yet sent to customer |
| **Pending** | Sent, awaiting payment |
| **Paid** | Payment received |
| **Overdue** | Past due date, not paid |
| **Cancelled** | Voided invoice |

#### Line Item Types

| Type | Description |
|------|-------------|
| `app` | App-level charge |
| `group` | User group charge |
| `user` | Per-user charge |
| `feature` | Feature-based charge |
| `custom` | Custom line item |

### Cost Tracking

Navigate to **Costs** section.

#### Subscription Monitoring

Track all SaaS subscriptions with:
- Monthly cost per subscription
- Billing cycle (monthly/yearly)
- Usage percentage for usage-based plans
- Status indicators (active, past due, expired)
- Provider-wise cost breakdown

#### Cost Categories

| Category | Examples |
|----------|---------|
| AI APIs | Claude, ChatGPT (usage-based) |
| AI Subscriptions | Claude Pro, ChatGPT Plus |
| Infrastructure | Vercel, Firebase, Supabase |
| Tools | GitHub, Figma, Notion |
| Domains | Domain registrations |
| One-time | Setup fees, migrations |

#### Spend Alerts

Configure spending thresholds per subscription:
1. Go to **Subscriptions** page
2. Click **Set Spend Alert**
3. Choose subscription and threshold amount
4. When spending exceeds the threshold:
   - Dashboard alert card appears
   - Webhook `spend.threshold_reached` fires
   - Notification sent via configured channels

#### Cost Insights (AI-Powered)

The Costs page generates automatic optimization suggestions:
- Model tier downgrades (e.g., switch from Opus to Haiku for simple tasks)
- Unused subscription detection
- Month-over-month trend analysis
- Provider consolidation opportunities
- Cost-per-call efficiency recommendations
- Projected spend forecasts

---

## Connected Accounts & OAuth

### Supported Providers

Connect external accounts for live billing data sync:

| Provider | Data Synced |
|----------|-------------|
| **Anthropic** | API usage, key validation, invoice history |
| **OpenAI** | Organization costs, subscription plan, billing limits |
| **Stripe** | Subscriptions, invoices (with PDF), charges, balance |
| **Vercel** | Plan info, bandwidth/build usage, billing invoices |
| **Google/Firebase** | Billing accounts, budgets, project usage |
| **GitHub** | Plan info, Actions/Packages/Storage billing |
| **Supabase** | Org subscriptions, project count, usage metrics |
| **DigitalOcean** | Balance, billing history, droplet count |
| **Cloudflare** | Billing profile, zone count, Workers usage |
| **QuickBooks** | Invoices, bills, payments, P&L reports |
| **Xero** | Invoices (ACCREC/ACCPAY), payments, organisation info |

### Connecting an Account

1. Go to **Settings > Integrations** or **Subscriptions > Connected Accounts**
2. Click **Connect** on the provider card
3. Complete the OAuth flow
4. Account appears with "Connected" status

### Syncing Data

- **Auto-sync** on connection and periodically
- **Manual sync** via "Sync Now" button per account
- **Batch sync** via "Sync All" button (syncs all accounts in parallel)
- **Sync status** shown per account with last sync timestamp

### Account States

| Status | Action |
|--------|--------|
| **Connected** | Active, data syncing |
| **Expired** | OAuth token expired — click "Reconnect" |
| **Pending** | OAuth flow incomplete |

### Accounting Export

Export CTRL BOARD invoices to connected accounting providers:
- **QuickBooks** — creates QB invoices with customer mapping and line items
- **Xero** — creates Xero ACCREC invoices with contact and currency mapping

---

## Notifications & Alerts

### Notification Channels

Navigate to **Settings > Notifications**.

Configure where alerts are sent:

| Channel | Setup |
|---------|-------|
| **Email** | Enable per alert type |
| **Push** | Browser push notifications |
| **Slack** | Webhook URL, color-coded severity |
| **Discord** | Webhook URL, embed format |

### Alert Events

| Event | Description |
|-------|-------------|
| `spend.threshold_reached` | Cost exceeded configured limit |
| `app.status_changed` | App health changed (healthy/degraded/down) |
| `incident.detected` | New incident reported by an app |
| `invoice.created` | New invoice generated |
| `invoice.paid` | Invoice payment received |
| `invoice.overdue` | Invoice past due date |
| `app.metrics_updated` | Daily metrics aggregation completed |

### Testing Channels

Each notification channel has a **Test** button that sends a sample alert to verify the integration works.

---

## API Keys & Webhooks

### API Keys

Navigate to **Settings > API Keys**.

#### Creating Keys

1. Click **Create API Key**
2. Enter a name and select environment:
   - **Production** — `drivas_live_` prefix
   - **Staging** — `drivas_test_` prefix
   - **Development** — `drivas_test_` prefix
3. Copy the full key (shown only once)

#### Key Management

| Action | Description |
|--------|-------------|
| **Copy** | Copy key to clipboard |
| **Rotate** | Delete old key + create new one |
| **Revoke** | Permanently delete the key |
| **View Usage** | See last used timestamp |

### Webhooks

Navigate to **Settings > Webhooks**.

#### Creating Webhooks

1. Click **Add Webhook**
2. Enter the HTTPS endpoint URL
3. Select which events trigger this webhook
4. Webhook secret is auto-generated for signature verification

#### Webhook Management

| Action | Description |
|--------|-------------|
| **Enable/Disable** | Toggle webhook without deleting |
| **View Secret** | Show HMAC signing secret |
| **View Last Triggered** | See when last event was sent |
| **Delete** | Remove webhook permanently |

### Danger Zone

Under **Settings > Danger Zone**:
- **Export All Data** — download all apps, invoices, costs, subscriptions as JSON
- **Revoke All API Keys** — delete every API key (requires confirmation)

---

## Workflow Examples

### Example 1: Onboarding a New Customer

**Scenario:** Bergen Taxi wants to use the Taxi Calculator.

1. **Create Customer**
   - Tenants > New Tenant
   - ID: `bergen-taxi`, Name: `Bergen Taxi`

2. **Configure Branding**
   - Branding tab: upload logo, set company name
   - Page Title (NO): `Bergen Taxi Kalkulator`
   - Copyright: `Bergen Taxi AS`

3. **Set Custom Tariffs**
   - Tariffs tab: Start 97 NOK, 0-10km 11.14 NOK/km, >10km 21.23 NOK/km

4. **Apply Theme**
   - Theme tab: select "Red Brand" preset
   - Adjust `--color-primary` to Bergen Taxi's exact brand color

5. **Configure Domains**
   - Domains tab: add `bergentaxi.no`, `www.bergentaxi.no`, `*.vercel.app`

6. **Set Regional Defaults**
   - Regional tab: language `no`, map center `60.3912, 5.3220`

**Result:** Bergen Taxi's calculator instance immediately shows their branding, colors, rates, and map defaults.

### Example 2: Managing a Multi-App Customer

```
Customer: Bergen Taxi
|
|-- App: Taxi Calculator
|   |-- Branding: Bergen Taxi logo
|   |-- Theme: Red & gold colors
|   |-- Features: Map ON, Tariff editor OFF
|   |-- Tariffs: Custom rates
|
|-- App: Fleet Manager
|   |-- Branding: Same logo (shared)
|   |-- Theme: Same colors (shared)
|   |-- Features: Map OFF (save API costs)
|   |-- Fleet Config: Vehicle types, insurance
```

Universal settings (branding, theme) are shared. App-specific settings (tariffs, fleet config) are independent.

### Example 3: Setting Up Spend Monitoring

1. Connect provider accounts (Anthropic, OpenAI, Vercel)
2. Click "Sync All" to pull current billing data
3. Set spend alerts: $100 for Anthropic, $50 for OpenAI
4. Configure Slack webhook for `spend.threshold_reached` events
5. Dashboard now shows live cost tracking with alerts

### Example 4: Team Access Setup

1. **Owner** creates the CTRL BOARD account
2. Invite **Admin** for day-to-day management
3. Invite **Viewer** for stakeholders who need read-only dashboards
4. Invite **Billing** role for finance team (invoices and costs only)
5. All actions are tracked in the activity log

---

## Troubleshooting

### Customer Can't Access App
1. Check customer status is **Active** (green toggle)
2. Check domain is in `allowedDomains` (or list is empty for unrestricted)
3. Verify the app is registered and active in Apps section
4. Check the domain map in Firebase (`/domainMap/`)

### Branding Not Showing
1. Verify changes were saved (check for confirmation toast)
2. Clear browser cache or hard refresh
3. Check image URLs are valid in Firebase Storage
4. Verify the app is reading from the correct Firebase path

### Theme Not Applying
1. Check the app applies CSS variables from `config.theme`
2. Verify variable names match exactly (e.g., `--color-primary`)
3. Check for CSS specificity issues overriding variables
4. Use browser DevTools to inspect computed styles

### Tariffs Not Updating
1. Verify save was successful (check Firebase console)
2. App must subscribe to Firebase tariff path with `onValue`
3. Check for browser caching (add `?v=timestamp` to force refresh)
4. Verify tariff path: `/tenants/{customerId}/tariffs/base14`

### OAuth Connection Failing
1. Verify OAuth credentials in environment variables
2. Check callback URL matches the configured redirect URI
3. Try disconnecting and reconnecting the account
4. Check provider's API status page for outages

### Webhook Not Firing
1. Verify webhook is enabled (toggle is ON)
2. Check the endpoint URL is HTTPS and reachable
3. Verify the correct events are selected
4. Check the webhook secret matches what your server expects
5. View `last_triggered` timestamp to see if it's been attempted

---

**See Also**: [API_INTEGRATION.md](./API_INTEGRATION.md) for connecting apps, [FEATURES.md](./FEATURES.md) for feature reference, [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details, [integration/](./integration/INDEX.md) for integration guides
