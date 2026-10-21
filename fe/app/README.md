# AutoRecordLive Core App

The core AutoRecordLive web application: a React + TypeScript SPA built with Vite. Users sign in here, manage the hosts and channels they follow, review and download recordings, manage notifications, and view their account and plan.

See the [front-end architecture overview](../../docs/fe-arch.md) for the selected stack and the planned routes.

## Prerequisites

- A Node.js version supported by [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project)
- npm

## Quick start

```bash
npm install
npm run dev
```

The development server runs at http://localhost:8484.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 8484 |
| `npm run build` | Type-check with `tsc -b` and build production assets into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the source with oxlint |

## UI components

UI primitives come from [shadcn/ui](https://ui.shadcn.com/) and are configured in `components.json`. Add components as screens need them:

```bash
npx shadcn@latest add button
```

Generated components go in `src/components/ui/`. They are owned by this codebase and can be edited freely.
