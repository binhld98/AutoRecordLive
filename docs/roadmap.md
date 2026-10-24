# Roadmap

This is the plan for getting from today's Hello World SPA to an AutoRecordLive that works and is better than the reference app. It's split into small steps you can ship one PR at a time.

- What the reference app does, and its known issues (R1–R25): [reference app study](./ref-app-study.md)
- Stack, routes, and technical decisions: [front-end architecture overview](./fe-arch.md)

## Product principles

These come from the reference app's weak spots. Check every screen against them.

1. **Status you can trust.** Never show "live" unless we checked recently. Show how old the information is.
2. **Updates on its own.** No Refresh buttons. Lists update while you watch.
3. **Paste anything.** Any link, `@username`, or a whole list. We work out the platform, and ask only when a bare username could belong to more than one.
4. **No dead ends.** Every disabled or expired item says why and what to do next.
5. **Words over cryptic icons.** Icon-only buttons get a tooltip and an accessible label.
6. **Works at every width.** Nothing truncates important text at laptop width. Phones get a usable layout.
7. **Private by default.** A recording belongs to the users who follow its host. Sharing is opt-in, per recording, and can be revoked. No session replay or third-party trackers.
8. **Nothing disappears silently.** Warn before recording time runs out and before a recording expires. When a recording has a gap or fails, say where, why, and what we did about it.

## What we do better

How we fix each known issue from the [reference app study](./ref-app-study.md#known-issues), and the step where it happens.

| Issue | Our fix | Step |
| --- | --- | --- |
| R1 Dashboard is only a streamer list | A real overview: live now, recording now, recent recordings, failures, usage | 5 |
| R2 Stale live status | The server returns `liveStatus` (`live`, `offline`, `unknown`) based on its own check interval, plus `lastCheckedAt`. The UI shows "Last seen 8d ago" when the status is unknown | 2, 3, BE |
| R3 Truncated cards | Responsive grid that fills the width, plus a table view for many hosts | 3 |
| R4 Cryptic icons | Text labels, or tooltips with `aria-label`s | 3 |
| R5 Confusing usage numbers | Plain sentences: "Used 12m of 10m", with "over limit" and "trial ended" states | 1 |
| R6 Duplicate expiry warnings, dead cards | One retention line. Expired cards are dimmed, say why they can't play, and are hidden by default behind a filter | 4 |
| R7 Refresh buttons, uneven updates | No Refresh buttons. Every list polls every 30 s at first (step 2); Server-Sent Events once the back end exists | 2, BE |
| R8 Platform picker; one host at a time | Paste anything with auto-detect and a preview before saving; batch import | 3 |
| R9 Duplicate nav, no search | Header holds a ⌘K search for hosts and recordings instead of repeated links | 1, 6 |
| R10 Detail page layout | Two columns on desktop: player on the left, clickable chapters on the right that jump the video | 4 |
| R11 Batch Import and Record Rules never built | Batch import in step 3; recording rules in phase 3 | 3, P3 |
| R12 Mixed pagination and field names | One cursor style for every paged list; the API sends `camelCase` | 2, BE |
| R13 Tokens readable by scripts | Access token in memory only; refresh token in an `httpOnly` cookie on the same origin | 7, BE |
| R14 Recordings public by default | Recordings are private to the users who follow the host. No public pages; the recordings API only returns the caller's | BE |
| R15 Expiry only cosmetic | When retention ends, the API stops serving the playlist, segments, AI content, and transcript, and the files are deleted | Later |
| R16 Recordings vanish without warning | A notification before a recording expires. A link to a deleted recording opens a page that says when and why it was deleted | 4, 6, Later |
| R17 Filters list platforms we can't add | One list of supported platforms feeds both the URL parser and the platform filters | 3, 4 |
| R18 Fragile playback, blocked captions | Signed segment URLs last the recording's length plus a margin. Subtitles come from `/api` on our origin. On an error, the player reloads the playlist and resumes at the same time before showing a message | 4, BE |
| R19 No password reset or account controls | Forgot and reset password pages. `/account` adds change password and delete account | 7, BE |
| R20 Trial overshoots its quota | The recorder checks the quota before each segment and stops at the limit, so usage never goes past it | BE |
| R21 Room title used as the streamer's name | Notifications and previews name the host (display name and `@username`) and show the room title separately | 3, 6 |
| R22 Misleading "listening enabled" | Each preview row says what Add will do: "Already in your hosts", "Will start listening", or "Will be saved, but listening is paused: no recording time left" | 3 |
| R23 Recordings filter by platform only | Search, platform and host filters (step 4). The host filter shows as a removable chip, and host cards link to it. Sort by newest or longest | 4 |
| R24 Abandoned checkout stuck on "Pending" | Unpaid checkouts expire and show as "Canceled" | Later |
| R25 Session replay without consent | No session replay. If we add analytics, use a cookie-free tool that needs no consent prompt | Later |

## Where we go further

Fixing R1–R25 gets us level with the reference. These upgrades put us ahead. Each one answers something the [study](./ref-app-study.md) found: a weak spot, or an asset the reference has but barely uses.

| Upgrade | What it is | Answers | Step |
| --- | --- | --- | --- |
| Recording health | Each recording shows how much of the broadcast it captured. Gaps are marked on the player's timeline with the reason ("stream dropped for 40 s, reconnected"). A reconnect during the same broadcast continues the same recording instead of starting a new part | Operator-only repair tools, unbuilt "Abnormal Issues", confusing parts (R12) | 2, 4, BE |
| Instant download | Record HLS as fragmented MP4 (CMAF) segments. A download is the init segment plus the media segments, streamed by the API as one `.mp4`. It starts at once: no export job, no "your file is ready" email, no 36-hour cache | Exports that queue, then expire | 4, BE |
| Usage forecast | The overview says "At this pace your recording time runs out on Oct 28" and shows usage per host. Warnings arrive at 80% and 100% before any listener stops | Listening stops without warning when the quota runs out | 5, BE |
| Live alerts | A "host went live" notification with a link to the live stream, with per-host settings for in-app, email, Telegram, Discord webhook, and browser push | Only account-wide email settings | 6, P3 |
| Watch while recording | Play a recording while it's still in progress; the uploader keeps the HLS playlist growing as segments arrive | You wait for the stream to end | P3 |
| Clips | Download a chapter or a time range instead of the whole file. With short (about 6 s) segments, a clip is a slice of the segment list and costs only its own bytes against the download quota | Whole-file exports cut short by the quota; 60 s segments | P3 |
| Share links | Share one recording or clip through an unlisted link that expires and can be revoked | Everything public by default (R14) | P3 |
| Find the moment | ⌘K searches the transcripts of all your recordings. Each result shows the spoken line and opens the player at that second | Transcripts that are generated but only used as (blocked) captions | P3 |
| Keep your recordings | Copy each finished recording to the user's own storage (Google Drive, Dropbox, or an S3 bucket), so it outlives the plan's retention | Recordings deleted after 3–90 days, sometimes silently (R16) | P3 |
| Smarter live checks | Check each host more often around the times it usually goes live, so recordings start sooner. A heatmap shows those times and guesses the next stream | Stale status (R2), missed openings | P3 |
| Recording rules | Per host: only record during certain hours, a maximum length, a quality setting, or only when the stream title matches a keyword | "Record Rules" strings, never built (R11) | P3 |
| Resume after upgrade | When a limit blocks an action, the upgrade page remembers it and finishes it after payment, e.g. restarts the stopped listener. This is the reference's best pattern, so we copy it | — | Later |

## Routes

Our routes from [`fe-arch.md`](./fe-arch.md), next to the reference app's:

| Ours | Reference |
| --- | --- |
| `/` overview | `/` (streamer list only) |
| `/hosts` | Streamer list + Add Streamer modal |
| `/recordings`, `/recordings/:id` | `/recordings`, `/recordings/:platform/:recordingId` |
| `/notifications` | `/notifications` |
| `/account` | `/settings/subscription` |

## Phase 1 — Front end on fake data

The back end doesn't exist yet, so build the front end against a **fake API**: one module whose functions return Promises from in-memory data, with the same names and shapes as the real endpoints will have. When the back end is ready, swap the function bodies for API client calls and leave the pages untouched. See [`fe-arch.md`](./fe-arch.md#key-decisions).

Do each step in its own `feat/<slug>` branch and PR, following [AGENTS.md](../AGENTS.md). Run `npm run build`, `npm run lint`, and (from step 3) `npm test` before every PR.

### Step 1 — App shell and routing (`feat/app-shell`)

Goal: you can click between empty pages inside the sidebar + header layout.

```bash
cd fe/app
npx shadcn@latest add sidebar button card badge separator dropdown-menu avatar progress tooltip command
```

- `src/main.tsx`: set up React Router with two layouts: `AuthLayout` (centered card) for `/login`, `/register`, `/forgot-password`, and `/reset-password`, and `AppLayout` (sidebar + header + `<Outlet />`) for everything else.
- `src/components/app-sidebar.tsx`: logo, links to Overview, Hosts, Recordings, Notifications, Account (`lucide-react` icons), and a usage card in plain words ("Used 12m of 10m", "Downloads 0 of 1 GB"). Hard-code its numbers for now. The shadcn `sidebar` component handles collapsing on mobile.
- `src/components/app-header.tsx`: a search button that opens a ⌘K `command` dialog (empty for now), and an account dropdown with Appearance (light/dark/auto) and Logout.
- One placeholder per page in `src/pages/` (`overview.tsx`, `hosts.tsx`, ...) showing only the title and subtitle.
- Theme in `src/index.css`: `--primary` blue, background gray-50, plus the dark variant. Save the Appearance choice in `localStorage` and apply the `dark` class from a small inline script in `index.html`, so the page doesn't flash the wrong theme on load.

Done when every sidebar link changes the URL and page title, the theme switch works, and the layout holds at phone width.

### Step 2 — Types, fake API, and data fetching (`feat/fake-api`)

Goal: one place that defines the data, returns it, and keeps it fresh.

```bash
npm install @tanstack/react-query
```

- `src/lib/types.ts`: `Host`, `Recording`, `Notification`, `Quota`, `Overview`, based on the reference [data shapes](./ref-app-study.md#data-shapes) but in `camelCase`. Add what the reference lacks:
  - `Host.liveStatus` (`live`, `offline`, `unknown`) and `Host.lastCheckedAt` (for R2).
  - `Recording.chapters` (`{ startSec, title }[]`, for step 4).
  - `Recording.gaps` (`{ startSec, endSec, reason }[]`, for recording health) and `Recording.downloadUrl` (instant download).
  - `Quota.runsOutAt`: when recording time runs out at the current pace, or `null` (for the usage forecast).
- `src/lib/api.ts`, the fake API:
  - Hosts: `listHosts()` (the whole list), `inspectUrls(urls)`, `addHosts(urls)`, `stopHost(id)`, `startHost(id)`, `removeHost(id)`.
  - Recordings: `listRecordings(filters, cursor?)`, `getRecording(id)`.
  - Notifications: `listNotifications(cursor?)`, `markRead(id)`, `markAllRead()`, `getNotificationSettings()`, `updateNotificationSettings(settings)`.
  - Other: `getQuota()`, `getOverview(since)`.
  - Paged lists return `{ items, nextCursor, total }`.
  - Add a short delay to every call. Make the data change over time (a host goes live, a new recording appears) and make a few calls fail at random, so loading, polling, and error states get exercised.
- `src/lib/format.ts`: `formatDuration`, `formatBytes`, and `formatRelative` ("8d ago") using the built-in `Intl` APIs.
- Wrap the app in a `QueryClientProvider`. Pages read data with `useQuery` / `useInfiniteQuery` and `refetchInterval: 30_000` instead of a Refresh button.
- Wire the sidebar usage card to `getQuota()`.

### Step 3 — Hosts (`feat/hosts`)

This is the heart of the product, so build it first.

```bash
npx shadcn@latest add dialog alert-dialog input textarea field select toggle-group table sonner skeleton
npm install -D vitest
```

Add `"test": "vitest"` to the `package.json` scripts.

- Header: title, subtitle, and **Add hosts**. No Refresh button.
- Filter bar: search, platform, status, a grid/table toggle, and a result count. The hosts list comes back whole, so filter it in the browser.
- **Grid view:** responsive cards (`grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]`) with the full name, avatar, platform, status badge, room title, a live dot when `liveStatus` is `live` (or "Last seen 8d ago" when it's `unknown`), and the number of recordings as a link to the recordings filtered to that host.
- **Table view:** the same data in rows, for people with many hosts.
- Actions: Stop/Resume with a toast; Remove with an `AlertDialog` confirmation. After each action, invalidate the hosts query. Icon buttons get tooltips.
- **Add hosts dialog:**
  - One textarea. Paste a link, `@username`, or several lines.
  - While typing, `src/lib/parse-host-url.ts` gives instant hints per line (detected platform, or "not a link"). It's only a hint: the server's inspect is the real parser, because it can follow short links like `v.douyin.com/…`. Test the parser with Vitest.
  - On a short pause in typing, send all lines in one `inspectUrls` call and show a preview row per line (avatar, name, live or not) or a friendly error.
  - When a bare username could belong to more than one platform, the row shows a platform picker. Today `@name` means TikTok.
  - **Add** saves every valid row in one `addHosts` call.
- Empty state: "No hosts yet. Paste a TikTok or Douyin link to start."

### Step 4 — Recordings (`feat/recordings`)

```bash
npm install hls.js
```

- **List page:** search, platform and host filters, a "Show expired" switch (off by default), the result count from `total`, and a card grid with "Load more" (`useInfiniteQuery`). Each card has a thumbnail with platform tag and duration, title, host · date, size, and one retention line. Expired cards are dimmed and say why they can't be played.
- **Detail page:** two columns on desktop, stacked on mobile.
  - Left: header (Back, platform, title, host, date), then a `<video>` player that fits portrait and landscape video without empty space. Use hls.js when `Hls.isSupported()`, else native HLS; destroy the hls.js instance when the page unmounts.
  - Under the player, a coverage bar marks the recorded spans and the gaps from `Recording.gaps`; hovering a gap says why it happened. When there are gaps, the list card says "96% captured".
  - **Download** is a plain link to `Recording.downloadUrl` that starts at once. There's no export step to wait for.
  - Right: a chapter list. Clicking a chapter sets `video.currentTime`; the current chapter is highlighted as the video plays. Metadata goes below it.

For a test video, any public `.m3u8` sample stream with CORS enabled works.

### Step 5 — Overview (`feat/overview`)

The reference doesn't have this page. It reads one `getOverview(since)` call, because the stats can't be computed from paged lists. `since` is the start of today in the user's time zone, so "today" means the user's today.

- Stat cards: live now, recording now, recordings today, failures in the last 24 h.
- A "Live now" strip of hosts currently being recorded, linking to their hosts.
- The latest recordings.
- Anything that needs attention: failed recordings, recordings with gaps, hosts stopped because the quota ran out.
- Usage: time used, the forecast from `Quota.runsOutAt` ("At this pace your recording time runs out on Oct 28"), and usage per host.

### Step 6 — Notifications (`feat/notifications`)

- List with level-tinted rows, "Load more" (`useInfiniteQuery`), and mark all read.
- Unread count badge in the sidebar.
- Settings dialog with switches for host went live, recording started / completed / failed, and usage warnings (80% and 100%), plus per-host overrides.
- Wire the ⌘K search from step 1 to hosts and recordings.

### Step 7 — Auth (`feat/auth`)

- Login, register, forgot password, and reset password forms with React Hook Form + Zod, inputs with leading icons, and a show-password toggle. Login links to "Forgot password?".
- `src/lib/api-client.ts`: the shared client from [`fe-arch.md`](./fe-arch.md#key-decisions). It keeps the access token in memory, attaches it to requests, and on a `401` refreshes once and retries. Only one refresh runs at a time.
- On app start, call `refresh()`. A `RequireAuth` wrapper on `AppLayout` shows a loading state until it finishes, then renders the page or redirects to `/login?redirect=...`.
- Until the back end exists, the fake `login()` and `refresh()` always succeed, so a page reload keeps you signed in.

## Phase 2 — Back end

Start once the hosts and recordings pages work on fake data, so you know exactly what the API has to return. Write `docs/be-arch.md`, like `fe-arch.md`, first, so the language and framework choice is written down.

| Part | Job |
| --- | --- |
| API server | Served under `/api` on the app's origin. Auth (JWT access token + refresh cookie), hosts, recordings, notifications, SSE events. `camelCase` JSON, cursor pagination for paged lists |
| Database | PostgreSQL. Separate `channels` (a streamer on a platform) from `subscriptions` (a user follows a channel), so a streamer followed by many users is checked and recorded once. Plus users, recordings, recording parts, chapters, notifications |
| Monitor worker | Checks each channel that has at least one active subscription, at a rate the platform tolerates. Stores `lastCheckedAt` and computes `liveStatus`, which is `unknown` once a check is overdue |
| Recorder worker | When a channel goes live, records with `ffmpeg` (or `streamlink` / `yt-dlp`) as HLS with fragmented MP4 segments of about 6 s, **to local disk**. An uploader sends each finished segment and the updated playlist to S3-compatible object storage (e.g. Backblaze B2 or Cloudflare R2). If the stream drops or the worker crashes, the next attempt continues the same recording after an `#EXT-X-DISCONTINUITY` tag and saves the gap with its reason. A new part starts only when the stream's format changes, because the download needs one init segment. When the stream ends, it writes the thumbnail, duration, and size. It checks the quota before each segment and stops at the limit |
| Playback | `GET /api/recordings/:id/playlist.m3u8` returns the playlist with every segment rewritten to a signed URL that stays valid for the recording's length plus a margin, because hls.js won't fetch a finished playlist again. The bucket's CORS allows our origin |
| Downloads | `GET /api/recordings/:id/download.mp4` streams the init segment and then every media segment from storage as one file, and counts the bytes against the download quota. A time range (for clips) streams only its segments |

Build order:

1. Same-origin setup: Vite `server.proxy` for `/api` in development, a reverse proxy with HTTP/2 in production.
2. Auth: refresh cookie `HttpOnly; Secure; SameSite=Lax; Path=/api/auth`, no refresh token rotation at first. Then hosts CRUD and `POST /api/hosts/inspect`, which follows short links and returns a preview per URL.
3. Monitor for one platform.
4. Recorder and uploader for one platform.
5. Recordings API and signed playlists.
6. Downloads, usage warnings, and notifications (in-app and email).
7. AI content: transcribe each recording and generate its summary and chapters. The reference already has summaries, outlines, highlights, FAQs, and transcripts; step 4 builds the chapter UI with fake data.
8. Real-time: `POST /api/realtime/ticket` and `GET /api/events` (SSE with heartbeats; the proxy must not buffer it). Tickets are single-use, so the client reconnects with a fresh ticket instead of relying on `EventSource`'s auto-reconnect. Once the front end reacts to events, remove its 30 s polling.

## Phase 3 — Beyond the reference

The upgrades marked P3 in [Where we go further](#where-we-go-further). Each needs the back end first. Build them in this order:

1. Watch while recording: the playlist grows as segments arrive.
2. Clips, then share links: a share link can point to a clip.
3. Find the moment: needs the transcripts from build order 7.
4. Live alerts beyond email: Telegram, Discord webhook, browser push.
5. Keep your recordings.
6. Smarter live checks, then recording rules: both change how the monitor and recorder decide what to do.

## Later

Plans and quotas, billing (Stripe) with resume after upgrade, retention and auto-delete, more platforms (YouTube, Twitch), a Chinese UI for Douyin users, and an admin console.

The reference product limits itself to streams you own or have permission to record. Keep the same rule in our terms of use, and check each platform's terms before adding it.
