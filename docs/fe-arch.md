# Core SPA Front-End Architecture Overview

## Purpose

This document guides the design and development of AutoRecordLive's core web application in `fe/app/`. It covers the pages users use to sign in, manage followed hosts and channels, review recordings, manage notifications, and view their account and plan information.

Marketing and advertising landing pages live in `fe/ads/`. They are separate from the core app and outside this document's scope. The core app relies on the back end for authentication, live-status monitoring, recording operations, and billing.

## Selected stack

| Area | Selection | Responsibility |
| --- | --- | --- |
| UI | React + TypeScript | Components, page composition, and typed front-end code |
| Build | Vite | Local development server and production SPA assets |
| Routing | React Router | URL-based navigation, nested layouts, and protected app routes |
| Server state | TanStack Query | Fetching, caching, polling, paged lists, and refreshing data after changes |
| Forms | React Hook Form + Zod | Form state and schema-based client-side validation |
| Styling | Tailwind CSS | Utility-first styling and design tokens |
| UI primitives | shadcn/ui (`base-nova` style, built on Base UI) | Accessible, editable components owned in the front-end codebase |
| Back-end API | REST/JSON over HTTPS, same origin under `/api` | CRUD operations and data queries through a shared API client |
| API authentication | JWT access token + refresh token cookie | Authenticated API requests and session renewal |
| Real-time updates | Server-Sent Events (SSE) | Live status, recording progress, and in-app notification events, pushed from server to browser |
| Video playback | hls.js | HLS playback in browsers without native HLS |
| Testing | Vitest | Unit tests for non-trivial logic, such as URL parsing and formatting |

## Key decisions

| Decision | Why |
| --- | --- |
| Call the API at `/api` on the app's own origin (Vite proxy in development, reverse proxy in production) | The refresh cookie stays first-party, and we don't need CORS |
| Keep the access token in memory and the refresh token in an `httpOnly` cookie; refresh on app start | Scripts can't steal the refresh token, and a page reload keeps the user signed in |
| Fetch all API data through TanStack Query; poll lists every 30 s until real-time exists | Caching, polling, paging, and reloading after changes come built in |
| Use SSE for real-time, authenticated with a short-lived, single-use ticket, and serve the app over HTTP/2 | Updates only flow server to browser, and `EventSource` can't send an `Authorization` header. Over HTTP/1.1 a browser allows six connections per origin, and every open tab holds one |
| The API sends `camelCase` JSON with ISO 8601 UTC timestamps; paged lists return `{ items, nextCursor, total }` | Front-end types match responses without conversion, and the UI shows every date in the user's own time zone |
| The server computes derived state (e.g. `liveStatus`, `runsOutAt`) and parses host links | Only the server knows when it last checked a host and how fast quota is being used, and only it can follow short links like `v.douyin.com/…` |
| Anything the browser loads by itself comes as a signed URL inside the recording data: `playlistUrl`, `subtitlesUrl`, `downloadUrl`. Segment URLs in the playlist stay valid for the recording's length plus a margin | Recordings are private, but `<video>`, `<track>`, native HLS on iPhone, and download links can't send the in-memory access token. hls.js loads a finished recording's playlist only once, so segment URLs that expire sooner break playback partway through (reference issue R18) |
| Load no third-party scripts: no analytics tags, session replay, or tag managers | Recordings and account data stay private, and no other script on the page can read them (reference issues R13, R25) |
| Build pages against a fake API with the real function names and shapes ([roadmap](./roadmap.md)) | The front end can start before the back end, and switching later doesn't change any page |

## Application routes

Use a public authentication layout and a separate authenticated application shell with shared navigation, account menu, and notification affordances.

| Route area | Access | Main responsibilities |
| --- | --- | --- |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public | Sign in, create an account, and recover access |
| `/` | Authenticated | Overview of followed hosts, current live/recording activity, recent recordings, items that need attention, and plan usage with its forecast |
| `/hosts` | Authenticated | Add (one or many at once), view, edit, and remove followed hosts or channels |
| `/recordings` | Authenticated | Search, filter, and review recordings, and see their status and retention |
| `/recordings/:id` | Authenticated | Play a recording, jump between its chapters, see where it has gaps, view its metadata, and download it |
| `/notifications` | Authenticated | Review in-app notifications and manage notification preferences, including per-host overrides |
| `/account` | Authenticated | Profile, password change, account deletion, plan, subscription, and billing details |
