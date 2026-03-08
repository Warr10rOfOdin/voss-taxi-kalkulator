# App Profile Template

Use this template to document your application and its CTRL BOARD integration. Fill it out and share it with the team — it helps everyone understand how your app connects to the platform and what opportunities exist for deeper integration.

**Instructions:**
1. Copy this template into a new file (e.g., `MY_APP_PROFILE.md`)
2. Replace all `[placeholders]` with your app's details
3. Delete any sections that don't apply
4. Share the completed profile with the CTRL BOARD team

---

# [Your App Name]

## Overview

**What it does:**
[2-3 sentences describing what the app does and the problem it solves]

**Who it's for:**
- [Primary user type — e.g., "End customers browsing products"]
- [Secondary user type — e.g., "Admins managing inventory"]
- [Additional user types as needed]

**Repository:** [Link to your repo]

**Live URL:** [Production URL, if applicable]

**Status:** [Active / In Development / Beta / Deprecated]

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [e.g., Next.js 15, React 18, Django, Rails] |
| Language | [e.g., TypeScript, Python, Ruby] |
| Database | [e.g., PostgreSQL, MongoDB, Firebase] |
| Authentication | [e.g., NextAuth.js, Firebase Auth, Auth0] |
| Hosting | [e.g., Vercel, AWS, DigitalOcean] |
| Other Services | [e.g., Google Maps, Stripe, Twilio] |

### Application Structure

```
[your-repo]/
├── src/
│   ├── [main entry point]
│   ├── [key directories]
│   └── ...
└── [other important directories]
```

### Key Components

[Describe 3-5 main components or modules of your app]

| Component | Purpose |
|-----------|---------|
| [Component 1] | [What it does] |
| [Component 2] | [What it does] |
| [Component 3] | [What it does] |

---

## Vision & Roadmap

### Current State

[What's built and working today]

### Short-Term Goals

- [Goal 1]
- [Goal 2]
- [Goal 3]

### Long-Term Vision

[Where the app is heading — 1-2 paragraphs]

---

## CTRL BOARD Integration

### Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| SDK Installed | [Yes / No / Planned] | |
| Heartbeats | [Active / Not Yet] | Interval: [e.g., 60s] |
| API Usage Tracking | [Active / Not Yet] | Providers: [e.g., Anthropic, Google Maps] |
| User Traffic | [Active / Not Yet] | Reported: [daily / hourly] |
| Billing Events | [Active / Not Yet] | Provider: [e.g., Stripe] |
| Auto-Instrumentation | [Active / Not Yet] | Framework: [e.g., Next.js App Router] |
| Multi-Tenant Config | [Active / Not Yet] | Resolution: [domain / subdomain / path / auth] |
| Webhooks | [Active / Not Yet] | Events: [which ones you subscribe to] |

### How It Connects

[Describe the data flow between your app and CTRL BOARD]

```
[Your App]
    │
    ├── Sends to CTRL BOARD:
    │   ├── [What data you push — e.g., heartbeats, API usage]
    │   └── [...]
    │
    └── Reads from CTRL BOARD:
        ├── [What data you pull — e.g., customer config, feature flags]
        └── [...]
```

### SDK Setup

```typescript
// Show your actual SDK initialization code
import { CtrlBoard } from "@ctrlboard/sdk";

export const ctrlboard = new CtrlBoard({
  apiKey: process.env.CTRL_BOARD_API_KEY!,
  baseUrl: process.env.CTRL_BOARD_URL!,
  appId: "[your-app-id]",
  heartbeat: true,
});
```

### What You Track

[List the specific metrics your app sends to CTRL BOARD]

| Metric | Endpoint | Frequency | Example |
|--------|----------|-----------|---------|
| [e.g., AI API calls] | `bufferEvent()` | Per request | `{ provider: "anthropic", model: "claude-sonnet", cost: 0.03 }` |
| [e.g., User signups] | `trackUserTraffic()` | Daily | `{ dau: 500, new_users: 12 }` |
| [e.g., Payments] | `trackBillingEvent()` | Per event | `{ provider: "stripe", type: "charge", amount: 29.99 }` |

### Multi-Tenant Configuration (If Applicable)

[How your app resolves customers and applies their config]

**Resolution method:** [Domain-based / Subdomain / URL path / Auth token / Other]

**Firebase paths used:**
- `/tenantRegistry/{customerId}/config` — [What you read from it]
- `/domainMap/{domain}` — [If using domain-based resolution]
- [Any custom paths your app uses]

**CSS variables consumed:**
[List the CTRL BOARD CSS variables your styles actually use]

---

## Environment Variables

```env
# CTRL BOARD SDK
CTRL_BOARD_URL=[your CTRL BOARD instance URL]
CTRL_BOARD_API_KEY=[your API key]
CTRL_BOARD_APP_ID=[your app ID]

# Firebase (if using multi-tenant config)
FIREBASE_DATABASE_URL=[your Firebase URL]

# [Other env vars your app needs]
```

---

## Integration Opportunities

### What We Could Leverage Next

[List ideas for deeper CTRL BOARD integration — things your app could benefit from but hasn't implemented yet]

1. **[Opportunity 1]** — [Description and benefit]
2. **[Opportunity 2]** — [Description and benefit]
3. **[Opportunity 3]** — [Description and benefit]

### What We'd Need from CTRL BOARD

[Any new CTRL BOARD features that would help your app]

1. **[Feature request 1]** — [Why you need it]
2. **[Feature request 2]** — [Why you need it]

---

## Cross-App Communication (If Applicable)

[If your app shares data with other apps in the ecosystem via Firebase or CTRL BOARD webhooks]

| Direction | Data | Path/Method | Frequency |
|-----------|------|-------------|-----------|
| [Your App → Other App] | [What data] | [Firebase path or webhook] | [How often] |
| [Other App → Your App] | [What data] | [Firebase path or webhook] | [How often] |

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | [Name] | [Email/Slack] |
| Product Owner | [Name] | [Email/Slack] |

---

**Last Updated:** [Date]

**See Also:** [INDEX.md](./INDEX.md) | [GETTING_STARTED.md](./GETTING_STARTED.md) | [API_REFERENCE.md](./API_REFERENCE.md)
