# Integration Documentation

Welcome to the CTRL BOARD integration guide. This folder contains everything a software developer needs to connect any application to the CTRL BOARD platform.

## Who Is This For?

You are a developer with an application (web app, API, mobile backend, SaaS product, internal tool — anything) and you want to connect it to CTRL BOARD for centralized monitoring, billing, customer management, and real-time analytics.

These guides are **generic** — they work for any tech stack, any language, any framework.

## Documents

Read them in this order:

| # | Document | What You'll Learn |
|---|----------|-------------------|
| 1 | [WHAT_IS_CTRL_BOARD.md](./WHAT_IS_CTRL_BOARD.md) | What CTRL BOARD is, its vision, and what your app gains by connecting |
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
