# Roadmap

This is the plan for getting from today's Hello World SPA to an AutoRecordLive that works and is better than the reference app. It's split into small steps you can ship one PR at a time.

- What the reference app does, and its known issues (R1–R42): [reference app study](./study/ref-app-study.md)
- Stack, routes, and technical decisions: [front-end architecture overview](./fe-arch.md)
- How people move through the app: [user flows and sitemap](./flows/user-flows.md)
- How hosts are followed, listened to, and recorded: [hosts user flows](./flows/user-flows-hosts.md)
- How recordings are watched, downloaded, and expire: [recordings user flows](./flows/user-flows-recordings.md)
- When the app uses a notification, a toast, or another message, and what each one says: [notifications user flows](./flows/user-flows-notifications.md)

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

How we fix each known issue from the reference app study, and the step where it happens.

| Issue | Our fix | Step |
| --- | --- | --- |
| R1 Dashboard is only a streamer list | A real overview: live now, recording now, recent recordings, failures, usage | 5 |
| R2 Stale live status | The server returns `liveStatus` (`live`, `offline`, `unknown`) based on its own check interval, plus `lastCheckedAt`. The UI shows "Status unknown · checked 8d ago" when the status is unknown | 2, 3, BE |
| R3 Truncated cards | Responsive grid that fills the width, plus a table view for many hosts | 3 |
| R4 Cryptic icons | Text labels, or tooltips with `aria-label`s | 3 |
| R5 Confusing usage numbers | Plain sentences on the Overview and `/account`: "Used 12h of 50h · resets Nov 1" and "3 of 5 listeners in use", with "no time left" and "trial ended" states | 5, 7 |
| R6 Duplicate expiry warnings, dead cards | One retention line. Recordings leave the list when retention ends; expired links explain why they can't play | 4 |
| R7 Refresh buttons, uneven updates | No Refresh buttons and no polling. Lists refetch when the tab regains focus and update at once after the user's own actions (step 2); Server-Sent Events push changes while you watch once the back end exists. Statuses show how old they are, and a failed update shows "Couldn't update · Retry" | 2, BE |
| R8 Platform picker; one host at a time | Paste anything with auto-detect and a preview before saving; batch import | 3 |
| R9 Duplicate nav, no search | Header holds a ⌘K search for hosts and recordings instead of repeated links | 1, 6 |
| R10 Detail page layout | Two columns on desktop: player on the left, clickable chapters on the right that jump the video | 4 |
| R11 Batch Import and Record Rules never built | Batch import in step 3; recording rules in phase 3 | 3, P3 |
| R12 Mixed pagination and field names | One cursor style for every paged list; the API sends `camelCase` | 2, BE |
| R13 Tokens readable by scripts | Access token in memory only; refresh token in an `httpOnly` cookie on the same origin | 7, BE |
| R14 Recordings public by default | Recordings are private to the users who follow the host. No public pages; the recordings API only returns the caller's | BE |
| R15 Expiry only cosmetic | When a user's retention ends, the API stops serving them the playlist, segments, AI content, and transcript; shared files are deleted when no follower still needs them | BE |
| R16 Recordings vanish without warning | A notification before a recording expires. A link to an expired recording opens a page that says when and why it expired | 4, 6, BE |
| R17 Filters list platforms we can't add | One list of supported platforms feeds both the URL parser and the platform filters | 3, 4 |
| R18 Fragile playback, blocked captions | Signed segment URLs last the recording's length plus a margin. Subtitles come from `/api` on our origin. On an error, the player reloads the playlist and resumes at the same time before showing a message | 4, BE |
| R19 No password reset or account controls | Forgot and reset password pages. `/account` adds sign-in methods, change password, and delete account | 7, BE |
| R20 Trial overshoots its quota | The recorder checks the quota before each segment and stops at the limit, so usage never goes past it | BE |
| R21 Room title used as the streamer's name | Notifications and previews name the host (display name and `@username`) and show the room title separately | 3, 6 |
| R22 Misleading "listening enabled" | Each preview row says what Add will do: "Will listen and record when live", "Will be saved, not listening: all 5 listeners in use", or "Already in your hosts" | 3 |
| R23 Recordings filter by platform only | Search, platform and host filters (step 4). The host filter shows as a removable chip, and host cards link to it. Sort by newest or longest | 4 |
| R24 Abandoned checkout stuck on "Pending" | Unpaid checkouts expire and show as "Canceled". Each payment names what was bought ("Pay as you go · 10 hours") and links its receipt | Later |
| R25 Session replay without consent | No session replay. If we add analytics, use a cookie-free tool that needs no consent prompt | Later |
| R26 Invisible listener limit | Rows past the limit say "Will be saved, not listening: all 5 listeners in use" before Add. Resume listening when all are in use is disabled with "Stop listening to another host to free one". `/hosts`, the Overview, and `/account` say "3 of 5 listeners in use". The API answers `409` with a code, never `500` | 3, 5, BE |
| R27 Add Streamer's check misfires | One check per pasted line, of any length, batched into one request. A line that couldn't be checked says so with Retry; an unknown username says "Not found" | 3, BE |
| R28 Recording starts late | Adding a host or resuming listening reuses the latest live check, so a host that is live starts recording at once | BE |
| R29 Slow start and seeking | About 6 s segments instead of 60 s, so playback starts and seeks in a second or two | BE |
| R30 Download is an export you wait for | Download is a plain link that starts at once, whole or by section (instant download) | 4, BE |
| R31 Contradictory access labels | No preview limit. When a plan does lock something, the card and detail page say the same thing, and only when it limits the recording | 4 |
| R32 AI content missing without a word | Chapters and transcript show their state: "Chapters are being prepared" or "Couldn't make chapters for this recording" | 4, BE |

| R33 Own clicks fill the inbox | Your own actions get a toast, never a notification: adding 15 hosts is one toast | 3, 6, BE |
| R34 What matters never arrives | Notifications when a host goes live, a recording is ready or failed, hours reach 80% and 100%, a recording is about to expire, the listener limit drops, or a host can't be reached | 6, BE |
| R35 Notification links lead nowhere | Every notification opens the host, recording, or plan it's about; a link to something gone opens a page that says why | 6 |
| R36 Inbox hard to use | `/notifications` with an Unread filter and Mark all read, a sidebar badge, and a list that updates by itself. No bell panel | 6 |
| R37 Pop-up shows one and isn't announced | No pop-ups: a new notification updates the badge and the item in place. The badge's label includes the count. Browser push is opt-in | 6, P3 |
| R38 Email-only, account-wide settings | In the app and Email switches per event, with live alerts per host. Problems always show in the app | 6, BE |
| R39 Billing status contradicts itself | `/account` says the plan once, in a sentence with its date: "Trial ended Oct 22", "Starter · renews Nov 28", "Starter · ends Nov 28, auto-renew is off". A one-time pack never says it renews | 7, Later |
| R40 Cancel is easy and can't be undone | Cancelling asks once, says the end date and what stops after it, and can be undone until then | Later |
| R41 No billing self-service | The payment provider's hosted billing page (Stripe's customer portal) handles cards, invoices, cancel and resume, and plan changes | Later |
| R42 Raw "Network Error", whole page lost | Errors use our own words and cover only the part that failed, with Retry. `/account` still shows the plan and usage when billing can't load | 7 |

## Where we go further

Fixing R1–R42 gets us level with the reference. These upgrades put us ahead. Each one answers something the study found: a weak spot, or an asset the reference has but barely uses.

| Upgrade | What it is | Answers | Step |
| --- | --- | --- | --- |
| Recording health | Each recording shows how much of the broadcast it captured. Gaps are marked on the player's timeline with the reason ("stream dropped for 40 s, reconnected"). A reconnect during the same broadcast continues the same recording instead of starting a new part | Operator-only repair tools, unbuilt "Abnormal Issues", confusing parts (R12) | 2, 4, BE |
| Instant download | Record HLS as fragmented MP4 (CMAF) segments. A download is the init segment plus the media segments, streamed by the API as one `.mp4`. It starts at once: no export job, no "your file is ready" email, no 36-hour cache | Exports that queue, then expire (R30) | 4, BE |
| Usage forecast | The overview says "At this pace your recording time runs out on Oct 28" and shows usage per host. Warnings arrive at 80% and 100% before recording stops | Listening stops without warning when the quota runs out | 5, BE |
| Live alerts | A "host went live" notification with a link to the live stream, with per-host settings for in-app, email, Telegram, Discord webhook, and browser push | Only account-wide email settings, and no live alert (R34, R38) | 6, P3 |
| Watch while recording | Play a recording while it's still in progress; the uploader keeps the HLS playlist growing as segments arrive | You wait for the stream to end | P3 |
| Section downloads | On the recording page, select one or more sections on the timeline and download each as its own `.mp4`. With short (about 6 s) segments, a section is a slice of the segment list | Whole-file exports cut short by the quota; 60 s segments (R29) | 4, BE |
| Share links | Share one recording or section through an unlisted link that expires and can be revoked | Everything public by default (R14) | P3 |
| Find the moment | ⌘K searches the transcripts of all your recordings. Each result shows the spoken line and opens the player at that second | Transcripts that are generated but only used as (blocked) captions | P3 |
| Keep your recordings | Copy each finished recording to the user's own storage (Google Drive, Dropbox, or an S3 bucket), so it outlives the plan's retention | Recordings deleted after 3–90 days, sometimes silently (R16) | P3 |
| Smarter live checks | Check each host more often around the times it usually goes live, so recordings start sooner. A heatmap shows those times and guesses the next stream | Stale status (R2), missed openings | P3 |
| Recording rules | A settings screen per host that goes beyond listening on or off: listen without recording (alerts only), record by hand, record on a schedule or during certain hours, a maximum length, a quality setting, or only when the stream title matches a keyword | "Record Rules" strings, never built (R11); listening is all or nothing, as in the reference and in our first version | P3 |
| Resume after upgrade | When a limit blocks an action, the upgrade page remembers it and finishes it after payment, e.g. resumes listening to the host that was blocked. This is the reference's best pattern, so we copy it | — | Later |

## Routes

Our routes from `fe-arch.md`, next to the reference app's:

| Ours | Reference |
| --- | --- |
| `/` overview | `/` (streamer list only) |
| `/hosts` | Streamer list + Add Streamer modal |
| `/recordings`, `/recordings/:id` | `/recordings`, `/recordings/:platform/:recordingId` |
| `/notifications` | `/notifications` |
| `/account` | `/settings/subscription` |

## Phase 1 — Front end on fake data

The back end doesn't exist yet, so build the front end against a **fake API**: one module whose functions return Promises from in-memory data, with the same names and shapes as the real endpoints will have. When the back end is ready, swap the function bodies for API client calls and leave the pages untouched. See `fe-arch.md`.

Do each step in its own `feat/<slug>` branch and PR, following [AGENTS.md](../AGENTS.md). Run `npm run build`, `npm run lint`, and (from step 3) `npm test` before every PR.

### Step 1 — App shell and routing (`feat/app-shell`)

Goal: you can click between empty pages inside the sidebar + header layout.

```bash
cd fe/app
npx shadcn@latest add sidebar button card badge separator dropdown-menu avatar progress tooltip command
```

- `src/main.tsx`: set up React Router with two layouts: `AuthLayout` (centered card) for `/login`, `/register`, `/verify-email`, `/forgot-password`, and `/reset-password`, and `AppLayout` (sidebar + header + `<Outlet />`) for everything else.
- `src/components/app-sidebar.tsx`: logo and links to Overview, Hosts, Recordings, Notifications, Account (`lucide-react` icons). No usage card (see user flows). The shadcn `sidebar` component handles collapsing on mobile.
- `src/components/app-header.tsx`: a search button that opens a ⌘K `command` dialog (empty for now), and an account dropdown with Appearance (light/dark/auto) and Logout.
- One placeholder per page in `src/pages/` (`overview.tsx`, `hosts.tsx`, ...) showing only the title and subtitle.
- Theme in `src/index.css`: `--primary` blue, background gray-50, plus the dark variant. Save the Appearance choice in `localStorage` and apply the `dark` class from a small inline script in `index.html`, so the page doesn't flash the wrong theme on load.

Done when every sidebar link changes the URL and page title, the theme switch works, and the layout holds at phone width.

### Step 2 — Types, fake API, and data fetching (`feat/fake-api`)

Goal: one place that defines the data, returns it, and keeps it fresh.

```bash
npm install @tanstack/react-query
```

- `src/lib/types.ts`: `Host`, `Recording`, `Notification`, `Quota`, `Overview`, based on the reference app's data shapes but in `camelCase`. Add what the reference lacks:
  - `Host.liveStatus` (`live`, `offline`, `unknown`) and `Host.lastCheckedAt` (for R2).
  - `Host.listening` (boolean) and `Host.recording` (the recording in progress for you, or `null`).
  - `Recording.status` (`recording`, `processing`, `ready`, `failed`, `expired`) and `Recording.chapters` (`{ startSec, title }[]`, for step 4) with `chaptersStatus` (`pending`, `ready`, `failed`, for R32).
  - `Recording.gaps` (`{ startSec, endSec, reason }[]`, for recording health).
  - `Recording.playlistUrl`, `subtitlesUrl`, and `downloadUrl`: signed URLs the browser loads by itself (`fe-arch.md`).
  - `Quota`: recording hours used and allowed with `resetsAt`, listeners used and allowed, and `runsOutAt`: when recording time runs out at the current pace, or `null` (for the usage forecast). No download quota.
  - `Notification.type`: an ID from the message catalog, with `values` for its text and a `link`, instead of finished sentences.
- `src/lib/api.ts`, the fake API:
  - Hosts: `listHosts()` (the whole list), `inspectUrls(urls)`, `addHosts(urls)`, `startListening(id)`, `stopListening(id)`, `removeHost(id)`.
  - Recordings: `listRecordings(filters, cursor?)`, `getRecording(id)`, `getSectionDownloadUrl(id, startSec, endSec)`.
  - Notifications: `listNotifications({ unreadOnly }, cursor?)`, `getUnreadCount()`, `markRead(id)`, `markAllRead()`, `getNotificationSettings()`, `updateNotificationSettings(settings)`.
  - Other: `getQuota()`, `getOverview(since)`.
  - Paged lists return `{ items, nextCursor, total }`.
  - Add a short delay to every call. Make the data change over time (a host goes live, a new recording and its notification appear) and make a few calls fail at random, so loading, refetch-on-focus, and error states get exercised.
- `src/lib/format.ts`: `formatDuration`, `formatBytes`, and `formatRelative` ("8d ago") using the built-in `Intl` APIs.
- Wrap the app in a `QueryClientProvider`. Pages read data with `useQuery` / `useInfiniteQuery`, refetching on window focus and after the user's own changes, instead of a Refresh button.

### Step 3 — Hosts (`feat/hosts`)

This is the heart of the product, so build it first.

```bash
npx shadcn@latest add dialog alert-dialog input textarea field select toggle-group table sonner skeleton
npm install -D vitest
```

Add `"test": "vitest"` to the `package.json` scripts.

- Header: title, subtitle, "3 of 5 listeners in use", and **Add hosts**. No Refresh button.
- Filter bar: search, platform, status, a grid/table toggle, and a result count. The hosts list comes back whole, so filter it in the browser.
- **Grid view:** responsive cards (`grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]`) with the full name, avatar, platform, status badge, room title, "Listening" or "Not listening", a live dot when `liveStatus` is `live` (or "Status unknown · checked 8d ago" when it's `unknown`), and the number of recordings as a link to the recordings filtered to that host.
- **Table view:** the same data in rows, for people with many hosts.
- Actions: Stop listening or Resume listening, each with a toast, and Remove. Stop listening while recording and Remove ask first with an `AlertDialog`; the one for a recording host says "This stops the current recording. What's recorded so far is kept." Resume listening while every listener is in use is disabled with the reason. After each action, invalidate the hosts query. Icon buttons get tooltips.
- **Add hosts dialog:**
  - One textarea. Paste a link, `@username`, or several lines.
  - While typing, `src/lib/parse-host-url.ts` gives instant hints per line (detected platform, or "not a link"). It's only a hint: the server's inspect is the real parser, because it can follow short links like `v.douyin.com/…`. Test the parser with Vitest.
  - On a short pause in typing, send all lines in one `inspectUrls` call and show a preview row per line (avatar, name, live or not) or a friendly error.
  - When a bare username could belong to more than one platform, the row shows a platform picker. Today `@name` means TikTok.
  - New hosts start listening while listeners are free. Each row says what Add will do, including "Will be saved, not listening" once listeners run out.
  - **Add** saves every valid row in one `addHosts` call.
- Empty state: "No hosts yet. Paste a TikTok or Douyin link to start."
- Toast, confirmation, and inline text goes in `src/lib/messages.ts`, keyed by the message catalog's IDs, so later steps and notifications reuse it.

### Step 4 — Recordings (`feat/recordings`)

```bash
npm install hls.js
```

- **List page:** search, platform and host filters (the host as a removable chip), sort by newest or longest, all in the URL; the result count from `total`, and a card grid with "Load more" (`useInfiniteQuery`). Each card has a thumbnail with platform tag and duration, title, host · date, size, and one retention line. Recordings automatically leave the list when retention ends.
- **Recordings that aren't there:** an expired or unknown recording at `/recordings/:id` opens a page that says what happened, when, and what you can do.
- **Detail page:** two columns on desktop, stacked on mobile.
  - Left: header (Back, platform, title, host, date), then a `<video>` player that fits portrait and landscape video without empty space. Use hls.js when `Hls.isSupported()`, else native HLS; destroy the hls.js instance when the page unmounts.
  - Under the player, a timeline marks the recorded spans, the gaps from `Recording.gaps` (hovering one says why it happened), the chapters, and the playhead. When there are gaps, the list card says "96% captured".
  - Select sections on the timeline by dragging, by start/end at the playhead, or by chapter. Edges snap to segments (about 6 s). Each section downloads through `getSectionDownloadUrl`.
  - **Download** of the whole recording is a plain link to `Recording.downloadUrl` that starts at once. There's no export step to wait for.
  - Right: a chapter list. Clicking a chapter sets `video.currentTime`; the current chapter is highlighted as the video plays. While `chaptersStatus` isn't `ready`, the list says so. Metadata goes below it.

For a test video, any public `.m3u8` sample stream with CORS enabled works.

### Step 5 — Overview (`feat/overview`)

The reference doesn't have this page. It reads one `getOverview(since)` call, because the stats can't be computed from paged lists. `since` is the start of today in the user's time zone, so "today" means the user's today.

- Stat cards: live now, recording now, recordings today, failures in the last 24 h.
- A "Live now" strip of hosts currently being recorded, linking to their hosts.
- The latest recordings.
- Anything that needs attention: failed recordings, recordings with gaps, hosts paused because recording time ran out.
- Usage: hours used and when they reset, the forecast from `Quota.runsOutAt` ("At this pace your recording time runs out on Oct 28"), listeners in use, and usage per host.

### Step 6 — Notifications (`feat/notifications`)

Build the screen, settings dialog, and badge from the notifications user flows.

- `/notifications`: an All / Unread filter in the URL, "Load more" (`useInfiniteQuery`), and **Mark all read**. Each type's text comes from `src/lib/messages.ts`.
- Unread count badge on the sidebar's Notifications link, from `getUnreadCount()`.
- Settings dialog with In the app and Email switches per event, and live alerts per host.
- Wire the ⌘K search from step 1 to hosts and recordings.

### Step 7 — Auth (`feat/auth`)

- Login, register, verify email, forgot password, and reset password pages with React Hook Form + Zod, inputs with leading icons, and a show-password toggle. Login offers "Continue with Google"; register is email and password only. Login links to "Forgot password?".
- `src/lib/api-client.ts`: the shared client from `fe-arch.md`. It keeps the access token in memory, attaches it to requests, and on a `401` refreshes once and retries. Only one refresh runs at a time.
- On app start, call `refresh()`. A `RequireAuth` wrapper on `AppLayout` shows a loading state until it finishes, then renders the page, redirects to `/login?redirect=...`, or shows `/verify-email` while the email isn't verified.
- `/account`: profile, sign-in methods, change password, plan and usage, and delete account.
- Until the back end exists, the fake `login()` and `refresh()` always succeed, so a page reload keeps you signed in.

## Phase 2 — Back end

Start once the hosts and recordings pages work on fake data, so you know exactly what the API has to return. Write `docs/be-arch.md`, like `fe-arch.md`, first, so the language and framework choice is written down.

| Part | Job |
| --- | --- |
| API server | Served under `/api` on the app's origin. Auth (JWT access token + refresh cookie), hosts, recordings, notifications, SSE events. `camelCase` JSON, cursor pagination for paged lists |
| Database | PostgreSQL. Separate `channels` (a streamer on a platform) from `subscriptions` (a user follows a channel, listening or not), so a streamer followed by many users is checked and recorded once. Plus users, recordings, recording parts, chapters, notifications |
| Monitor worker | Checks each channel that has at least one listening subscription, at a rate the platform tolerates. Stores `lastCheckedAt` and computes `liveStatus`, which is `unknown` once a check is overdue |
| Recorder worker | When a channel goes live, records with `ffmpeg` (or `streamlink` / `yt-dlp`) as HLS with fragmented MP4 segments of about 6 s, **to local disk**. An uploader sends each finished segment and the updated playlist to S3-compatible object storage (e.g. Backblaze B2 or Cloudflare R2). If the stream drops or the worker crashes, the next attempt continues the same recording after an `#EXT-X-DISCONTINUITY` tag and saves the gap with its reason. A new part starts only when the stream's format changes, because the download needs one init segment. When the stream ends, it writes the thumbnail, duration, and size. It records while at least one follower wants the broadcast, and each follower's recording covers their span (from when it starts recording for them until the stream ends or they stop listening). It checks each follower's hours before each segment and stops their span at the limit |
| Playback | `GET /api/recordings/:id/playlist.m3u8` returns the playlist with every segment rewritten to a signed URL that stays valid for the recording's length plus a margin, because hls.js won't fetch a finished playlist again. The bucket's CORS allows our origin |
| Downloads | `GET /api/recordings/:id/download.mp4` streams the init segment and then every media segment from storage as one file, rate-limited per user; there's no download quota. A section streams only its segments |

Build order:

1. Same-origin setup: Vite `server.proxy` for `/api` in development, a reverse proxy with HTTP/2 in production.
2. Auth with email verification and Google sign-in: refresh cookie `HttpOnly; Secure; SameSite=Lax; Path=/api/auth`, no refresh token rotation at first. Then hosts CRUD with listening and the listener limit, and `POST /api/hosts/inspect`, which follows short links and returns a preview per URL.
3. Monitor for one platform.
4. Recorder and uploader for one platform.
5. Recordings API and signed playlists.
6. Downloads, usage warnings, notifications (in-app and email), and deletion: recordings leave each user's list when their retention ends, and shared files go when no follower still needs them.
7. AI content: transcribe each recording and generate its summary and chapters. The reference already has summaries, outlines, highlights, FAQs, and transcripts; step 4 builds the chapter UI with fake data.
8. Real-time: `POST /api/realtime/ticket` and `GET /api/events` (SSE with heartbeats; the proxy must not buffer it). Tickets are single-use, so the client reconnects with a fresh ticket instead of relying on `EventSource`'s auto-reconnect. Front end: open the stream after sign-in and turn each event into a TanStack Query cache update or invalidation (host status, recording, unread count). While the stream is down, show a quiet "Reconnecting…", and refetch everything after reconnecting, since events may have been missed.

## Phase 3 — Beyond the reference

The upgrades marked P3 in [Where we go further](#where-we-go-further). Each needs the back end first. Build them in this order:

1. Watch while recording: the playlist grows as segments arrive.
2. Share links: a share link can point to a section.
3. Find the moment: needs the transcripts from build order 7.
4. Live alerts beyond email: Telegram, Discord webhook, browser push.
5. Keep your recordings.
6. Smarter live checks, then recording rules: both change how the monitor and recorder decide what to do.

## Later

Plans (hours, listeners, retention), billing (Stripe, with its hosted customer portal for cards, invoices, cancelling, and plan changes) with resume after upgrade, more platforms (YouTube, Twitch), a Chinese UI for Douyin users, and an admin console.

The reference product limits itself to streams you own or have permission to record. Keep the same rule in our terms of use, and check each platform's terms before adding it.
