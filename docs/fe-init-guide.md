# Core Front-End Initialization Guide

This guide describes the first setup of the SPA in `fe/app/`, following the [front-end architecture](./fe-arch.md). The goal is to prepare the selected tools and leave a simple Hello World screen as the starting point for later product work.

## Prerequisites

- Install a Node.js version supported by the current [Vite requirements](https://vite.dev/guide/) and npm.
- Run the commands below from the repository root unless a step says otherwise.

## 1. Scaffold the React app

Move into the empty app directory, check the installed runtime, and create a Vite React + TypeScript project:

```bash
cd fe/app
node --version
npm --version
npm create vite@latest . -- --template react-ts
npm install
```

Vite provides the development server and production build. The React + TypeScript template supplies the initial entry point, type checking setup, and starter screen.

## 2. Install the architecture dependencies

From `fe/app`, install the libraries selected in `fe-arch.md`:

```bash
npm install react-router react-hook-form zod @hookform/resolvers
npm install -D tailwindcss @tailwindcss/vite @types/node
```

React Router will support URL-based navigation; React Hook Form and Zod provide form state and validation. Tailwind supplies utility styling, and `@tailwindcss/vite` integrates it with Vite.

## 3. Configure Tailwind and shadcn/ui

Update `vite.config.ts` to load the React and Tailwind plugins and resolve the `@/` source alias. Add the same alias to `tsconfig.json` and `tsconfig.app.json` so Vite and TypeScript resolve imports consistently. In `src/index.css`, import Tailwind:

```css
@import "tailwindcss";
```

Then initialize shadcn/ui from `fe/app`:

```bash
npx shadcn@latest init
```

This prepares the component configuration and shared styling conventions. Individual UI components can be added as product screens need them.

## 4. Replace the starter screen

Change `src/App.tsx` to render a plain Hello World heading. Keep this first screen intentionally small; the route layouts and product pages described in the architecture document can be added in later work.

## 5. Add app onboarding information

Create `fe/app/README.md` with:

- A short description of the core front-end app.
- Node.js and npm prerequisites, with a link to Vite's current requirements.
- Quick-start commands: `npm install` and `npm run dev`.
- Available scripts such as `npm run build` and `npm run preview`.
- A link to `../../docs/fe-arch.md` (relative to `fe/app/README.md`).

This README gives someone entering `fe/app/` the commands and context they need without requiring them to find this initialization guide first.

## 6. Build and run the app

From `fe/app`, build the production assets and start the local development server:

```bash
npm run build
npm run dev -- --host 127.0.0.1
```

Confirm the build completes and the development page shows the Hello World heading.
