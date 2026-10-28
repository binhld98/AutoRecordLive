# Reference app study

AutoRecordLive is modeled on https://app.autorecordlive.com. This document is the overview of what that app does and how, so we can match the parts that work and fix the parts that don't. Our plan is in the [roadmap](./roadmap.md).

Deep studies of single screens:

- [Streamers dashboard](./ref-app-dashboard.md): the streamer list, Add Streamer, live status, and the active listener limit (studied 2026-10-26).
- [Recordings](./ref-app-recordings.md): the recordings list, the detail page and player, exports, and what the free plan locks (studied 2026-10-27).
- [Notifications](./ref-app-notifications.md): the inbox, the header bell and its pop-up, read state, links, email settings, toasts, and every notification type (studied 2026-10-28).
- [Subscription](./ref-app-subscription.md): the subscription settings and payment history tabs, every plan state, cancelling auto-renew, and billing errors (studied 2026-10-28).

The overview was last studied on 2026-10-24 on a Free Trial account (trial ended 2026-10-22) with one followed streamer. Methods: using the app at desktop and phone widths, reading its JavaScript bundle, and calling its API with read-only requests.

## Core loop

1. The user pastes a streamer URL (TikTok or Douyin) or `@username`. The browser rewrites it to a full live URL and calls `POST /channels/inspect`, which checks the platform and returns the avatar, name, and live status as a preview before anything is saved.
2. Saving the streamer starts **listening** if one of the plan's active listeners is free; otherwise the streamer is saved as stopped. Only listening streamers are checked: the back end polls the platform to see whether they're live. Listening stops on its own when the user's recording quota runs out.
3. When the streamer goes live, the back end **records** the stream as HLS (60-second MPEG-TS segments) in cloud storage. A recording belongs to the channel, not the user, so everyone who follows that streamer shares it. One recording can have several parts ("tasks", each with its own playlist). The detail page shows them as episodes ("Part 1 of 2").
4. When the stream ends, post-processing builds a thumbnail, works out the duration and file size, and marks the recording ready. It transcribes the audio with Whisper on Cloudflare Workers AI (`@cf/openai/whisper-large-v3-turbo`). From the transcript it generates a summary, outline, highlights, FAQ, SEO fields (meta title, description, H1, keywords, tags), and a content-quality verdict.
5. The user watches the recording in the browser (hls.js player) or asks for an **export**. Exports are prepared in the background as MP4 (or a ZIP of MP4s for multi-part recordings) and kept for about 36 hours. The user gets an in-app notification and an email when the export is ready.
6. Recordings are **public by default**. Each one gets an SEO page on the marketing site (`www.autorecordlive.com/en/:platform/recording/:id`) with a 5-minute preview, the AI summary, outline, highlights, and FAQ.
7. When retention ends, the recording becomes **expired**, then is **deleted** (the API answers `410 recording_deleted`). The UI has expired, deleting, and deleted states.

## Layout

Every signed-in page shares one shell:

- **Left sidebar**:
  - Logo, linking to the marketing site.
  - Usage card: remaining recording time, a usage progress bar, current plan, "Access until" date, download used/quota (e.g. `0GB / 1GB`), and an **Upgrade Now** button.
  - Nav: Dashboard, Recordings, Notifications, Subscription.
- **Top header**, right-aligned:
  - Icon shortcuts for Dashboard, Recordings, Notifications, and Email notification settings.
  - Account button (avatar initial, email, plan name) that opens a menu: Appearance (light/dark/auto), Language (English/中文), Logout.
- **Page content**: a page title and one-line subtitle on the left, page actions (Refresh, primary button) on the right, then a filter bar card, then the content.

**On phones**, the sidebar (with the usage card) moves behind a hamburger menu. Page actions shrink to icon buttons, the filters fold into one **Filter** button, the result count becomes "1 Streamers", and **Add Streamer** becomes a sticky bar at the bottom of the screen. Cards span the full width, so names show in full. The phone layout works better than the desktop one (see R3).

## Screens

| Route | Screen | What's on it |
| --- | --- | --- |
| `/login`, `/register`, `/verify-email/*` | Auth | Centered form. Email + password (6+ characters), nickname on register, Google sign-in, Cloudflare Turnstile on register, email verification. Signed-out users are sent to `/login?redirect=<path>` |
| `/` | Dashboard = **Streamers** | Platform and status filters, result count, grid of streamer cards (12 per page). **Add Streamer** opens a modal. See the dashboard study |
| `/add` | Add deep link | Opens Add Streamer; sends signed-out users to `/login?redirect=/add` |
| `/recordings` | Recordings | Platform filter, result count, grid of recording cards. Takes a hidden `?channel_id=` filter |
| `/recordings/:platform/:recordingId` | Recording detail | Header card, player, Refresh / Download / Replay, a side column, AI sections, related recordings |
| `/recordings/export-download` | Export download | Refreshes the session, asks `export/status` for a short-lived download link for the `task_id` and `platform` query params, and opens it |
| `/notifications` | Notifications | Unread count, Refresh, list of notifications with "Load more". See the notifications study |
| `/settings/subscription`, `/settings/subscription/history` | Subscription | Tabs: Subscription settings / Payment history. `/subscription` and `/subscription/history` redirect here. See the subscription study |
| `/upgrade`, `/payment/success` | Checkout | Plan picker and the page Stripe/PayPal return to |
| `/admin/*` | Operator console | Recording repair, metadata repair, export recovery, retention, publication, AI content, impersonation, trial anti-abuse, system notice. Internal only |
| `*` | Catch-all | Redirects to `/` (or to `/verify-email` when the URL has a `token`) |

**Streamer card and Add Streamer modal:** see the dashboard study.

**Recording card:** a thumbnail with a platform tag (top left) and duration (bottom right), the title, streamer · date, a retention line ("Available until …" / "Retention expired"), and the file size.

**Recording detail:** the player sits centered under a header card (Back, platform, access and retention badges, title, streamer, date). Portrait video gets a 9:16 box, and landscape a 16:9 one. A "Preview only" badge sits on the video, and playback stops at 300 seconds. A right-hand column holds Retention, the metadata grid (streamer, channel, category, duration, file size, recording ID, status, format), the access state ("Preview only", the preview limit, "Upgrade required"), and an Overview card with the current playback time. Below the player come the summary, a session outline, highlights, and FAQ (questions only, collapsed), then related recordings. Clicking an outline chapter or highlight seeks the video and adds `?t=<seconds>` to the URL; the current chapter is marked. Expired recordings replace the player with an amber "This recording has expired" card, and deleted ones show "This recording was deleted". Any signed-in user can open any public recording by its URL, not just recordings of streamers they follow.

**Notification row, header bell, pop-up, and email settings:** see the notifications study.

**Subscription settings and payment history:** see the subscription study.

**Upgrade page:** a current-plan card, then the Pay as you go pack, then a Monthly / Yearly · Save 20% toggle over three plan cards (Starter "Recommended", Standard "Best Value", Premium "High Volume"), then a short FAQ. Payment is by card (Stripe) or PayPal.

## Plans and limits

From `GET /payments/plans`. Prices are in cents in the API. Yearly plans cost about 20% less than twelve months.

| Plan | Price (USD) | Recording | Active listeners | Retention | Download |
| --- | --- | --- | --- | --- | --- |
| Free Trial | free, 7 days | 10 min | 1 | 3 days | 1 GB/month |
| Pay as you go | 2.99 per pack, credits don't expire | 10 h per pack | 1 | 7 days | 10 GB per pack |
| Starter | 9.99/month, 95.90/year | 50 h/month | 2 | 30 days | 100 GB/month |
| Standard | 24.99/month, 239.90/year | 150 h/month | 6 | 60 days | 400 GB/month |
| Premium | 59.99/month, 575.90/year | 400 h/month | 10 | 90 days | 1 TB/month |

- Every plan allows unlimited saved streamers; the listener limit caps how many are listening or recording at once. The dashboard study shows how it's counted.
- Packs stack recording time and download traffic; listener limit and retention stay the same. The pack also carries `inactivity_pause_days: 30`, which the UI never explains.
- On the free plan, playback stops after 300 seconds. The server enforces this by serving a preview playlist (`playlist.m3u8?preview=true`) that lists only the first five segments. Full playback and downloads work only for the user's **latest** recording; older ones answer `403 "full playback is available for latest recording only"`. Yet an export of an older recording was accepted from its detail page (R31).
- When an export is bigger than the remaining download quota, it only covers what the quota allows.
- To stop repeat trials, adding a streamer sends a browser fingerprint (user agent, language, timezone, screen, device memory, CPU count, canvas and WebGL hashes).

**Paywall and upgrade:** every upgrade link carries why the user is upgrading: `/upgrade?reason=…&source=…`. Reasons include `add_channel_limit`, `start_listening_limit`, `active_listener_limit`, `download_recording_limit`, and `listener_quota_stopped`. Sources include `notification`, `email`, and `recording_detail`. An `intent` param records the blocked action (`add_channel` with a URL, `start_listening` with a subscription ID, or `download_recording` with a recording ID). After payment, the app retries that action, e.g. restarts the stopped listener. If that fails it says "your credits arrived but we couldn't automatically resume this listener" and shows a **Resume Listening Now** button. We should copy this pattern.

## Status vocabulary

| Thing | States |
| --- | --- |
| Listener (streamer subscription) | `LISTENING`, `PENDING`, `RECORDING`, `STOPPED`. The status filter offers all but `PENDING`, which never appeared in use |
| Live status | live, offline (`is_living` boolean, a stored value, not checked on each request). `POST /channels/inspect` checks the platform and returns a label instead (`"Live now"`, `"Not live"`) |
| Recording | `PENDING`, `RECORDING`, `PROCESSING`, `READY`/completed, `FAILED` |
| Retention | `EXPIRED`, `POLICY_UNKNOWN` (shown as "Retention pending confirmation"); the UI also has deleting and deleted; more in the operator console |
| Export | not requested, preparing, ready, failed, expired, plus manual-recovery states for exports that need support |
| Transaction | `pending`, `succeeded`, `failed`, `refunded`, `partially_refunded`, plus a separate `refund_status`; `transaction_type` such as `credit_purchase` |
| Subscription | `pending`, `active`, `past_due`, `cancelled`, `expired`; `cancel_at_period_end` marks a scheduled cancellation |
| Notification level | `success`, `warning`, `info`, `error` |
| Notification type | `subscription_succeeded` ("Streamer added"), `listener_started`, `listener_stopped` (manual, or system with `reason: quota_exceeded` → "Monitoring auto-stopped"), `recording_started`, `recording_completed`, `recording_failed`, `recording_export_ready`, `recording_export_failed`, and payment success, renewal failed, cancel effective, refund result |

## API surface

The front end calls a REST API at `https://api.autorecordlive.com/api/v1` with a JWT bearer token. Recording endpoints also take `?platform=` and, for AI content, `?locale=`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/language`; `GET /auth/quota` |
| Streamers | `POST /channels/inspect` (preview a URL before saving), `POST /channels/subscribe`, `GET /channels/subscriptions`, `POST /channels/subscriptions/:id/stop`, `.../start`, `DELETE /channels/subscriptions/:id`. Requests, responses, and error codes are in the dashboard study |
| Recordings | `GET /recordings?subscribed_only=true` (plus `&channel_id=` for one streamer), `GET /recordings/:id`, `GET /recordings/:id/playlist.m3u8`, `GET /recordings/:id/ai-content`, `GET /recordings/:id/transcript`, `GET /recordings/:id/subtitles.vtt` |
| Exports | `POST /recordings/:id/export`, `GET /recordings/:id/export/status`, `GET /recordings/:taskId/export/download?token=…` |
| Notifications | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`, `GET/PUT /notifications/settings` |
| Billing | `GET /payments/plans`, `POST /payments/checkout-sessions`, `POST /payments/subscription/upgrade-sessions`, `GET /payments/subscription`, `POST /payments/subscription/cancel`, `POST /payments/refunds`, `GET /payments/transactions` |
| Other | `GET /public/system-notice?surface=dashboard&locale=en` (banner text, `{ enabled: false }` when off) |
| Operator | `/admin/*`, plus publish, unpublish, purge, repair-metadata, and rerun AI (`/ai-content/run`) on `/recordings/:id`, and quota overrides on `/users/:id` |

Without `subscribed_only=true`, `GET /recordings` returns every public recording on the service, not just the user's, and works without a token.

**Auth tokens:** the access JWT lasts 15 minutes and the refresh JWT 7 days. Their claims are `user_id`, `token_id`, `token_type`, `membership_tier`, `exp`, `nbf`, `iat`. The front end refreshes once on a `401` and signs the user out if that fails.

**Media access:** `playlist.m3u8` is a VOD playlist of 60-second segments on `cdn.autorecordlive.com/records/<channel_id>/<task_id>/segment_NNN.ts`. Each segment URL is signed with two query params:

- `pt`: base64 JSON with `recording_id`, `task_id`, `path_prefix`, `max_segment_index`, `access_mode` (`preview`), and `exp`, about 5 minutes ahead.
- `ps`: the signature.

The preview playlist caps `max_segment_index` at 4 (5 × 60 s = 300 s) and needs no bearer token. Full playback skips the CDN: its segments are presigned S3 URLs straight to a Backblaze B2 bucket, valid for 24 minutes (see the recordings study). Thumbnails and avatars are plain public CDN URLs.

## Data shapes

Fields the API actually returns. Streamer shapes (subscriptions, inspect, subscribe) are in the dashboard study.

```jsonc
// GET /recordings?offset=0&limit=20&subscribed_only=true → { items: [...], limit, offset, total }
{
  "id": "c88c…", "session_id": "ca20…", "platform": "tiktok", "title": "Stream title",
  "slug": "stream_title-2026-10-15-10m", "date": "2026-10-15T00:06:36Z",
  "duration": 600, "file_size": 453911712, "aspect_ratio": "landscape", "category": "Gaming",
  "thumbnail_url": "https://…", "task_count": 1, "is_public": true,
  "is_restricted": true, "restriction_reason": "expired",
  "retention_status": "EXPIRED", "access_expires_at": "2026-10-18T00:16:19Z",
  "url": "/en/tiktok/recording/c88c…", // public page on www.autorecordlive.com
  "streamer": { "username": "name", "display_name": "Name", "avatar": "https://…" }
}

// GET /recordings/:id?platform=tiktok adds:
{
  "status": "READY", "preview_url": "/api/v1/recordings/…/playlist.m3u8?platform=tiktok&preview=true",
  "is_preview": true, "preview_duration": 300, "playback_mode": "preview",
  "upgrade_prompt": "upgrade_to_unlock_full_video",
  "file_format": "HLS", "play_type": "hls", "part_number": 1, "total_parts": 1, "logical_task_ids": ["…"],
  "related_recordings": [{ "id": "…", "date": "…", "duration": 720, "title": "…", "thumbnail_url": "…" }]
}

// GET /recordings/:id/ai-content?platform=tiktok&locale=en
{
  "status": "READY", "locale": "en", "meta_title": "…", "meta_description": "…", "h1": "…", "summary": "…",
  "outline": [{ "start_sec": 148, "time_label": "02:28", "title": "…", "description": "…" }],
  "highlights": [{ "start_sec": 173, "title": "…", "description": "…" }],
  "faq": [{ "question": "…", "answer": "…" }], "keywords": ["…"], "tags": ["…"],
  "content_quality": { "confidence": "high", "has_enough_speech": true, "reason": "…" }
}

// GET /recordings/:id/transcript?platform=tiktok (subtitles.vtt is the same text as WebVTT)
{
  "status": "READY", "provider": "cloudflare", "model": "@cf/openai/whisper-large-v3-turbo",
  "segments": [{ "index": 0, "chunk_index": 0, "start_sec": 0, "end_sec": 2.74, "text": "…" }]
}

// GET /notifications?limit=8&status=all → { items: [...], next_cursor, unread_count }
{
  "id": "d48a…", "notification_type": "recording_completed", "category": "recording",
  "level": "success", "title": "录制完成", "message": "…",
  "action_url": "/recordings/tiktok/…", "action_kind": "recording",
  "source_kind": "recording", "source_id": "…", "channel_id": "…",
  "is_read": true, "read_at": "…", "created_at": "…", "updated_at": "…",
  "metadata": { "platform": "tiktok", "recording_id": "eea4…", "task_id": "…", "channel_display_name": "Current stream title" }
}
// recording_export_ready metadata adds: { "download_url": "/recordings/export-download?platform=tiktok&task_id=…",
//   "artifact_format": "mp4", "artifact_part_count": "1", "file_size_bytes": "23502188", "cached_until": "…" }

// GET /auth/quota
{
  "level": "FREE", "effective_entitlement": "free", "plan_expires_at": "2026-10-21T23:55:11Z",
  "max_seconds": 600, "used_seconds": 720, "remaining_seconds": -120,
  "used_bytes": 532022704, "max_bytes": -1, "storage_used_percentage": 0,
  "download_quota": {
    "monthly_download_quota_gb": 1, "monthly_download_quota_bytes": 1000000000,
    "monthly_download_used_bytes": 23502188, "monthly_download_remaining_bytes": 976497812,
    "resets_monthly": true, "year": 2026, "month": 10
  }
}

// GET /payments/plans
{
  "plans": [{ "plan_id": "starter-monthly", "level": "starter", "billing_cycle": "monthly", "amount": 999, "currency": "USD",
              "max_channels": 2, "max_seconds": 180000, "monthly_download_quota_gb": 100, "features": ["…"] }],
  "products": [{ "product_id": "recording-credits-10h", "purchase_kind": "recording_credits", "amount": 299,
                 "recording_seconds": 36000, "download_bytes": 10737418240, "active_listener_limit": 1,
                 "retention_days": 7, "credits_expire": false, "inactivity_pause_days": 30 }]
}

// GET /payments/transactions → { total, transactions: [...] }
{
  "transaction_id": "9209…", "transaction_type": "credit_purchase", "purchase_type": "recording_credits",
  "plan_name": "Pay as you go", "amount": 299, "final_amount": 299, "currency": "USD",
  "payment_gateway": "stripe", "status": "pending", "refundable": false,
  "refund_unavailable_reason": "only succeeded transactions can be refunded", "created_at": "…"
}

// GET /notifications/settings
{ "recordingStarted": false, "recordingCompleted": true, "recordingFailed": false, "downloadUsageWarning": false }

// Errors come in two shapes
{ "error": "full playback is available for latest recording only" }   // 403
{ "code": "recording_deleted", "message": "recording deleted" }      // 410
```

## Look and feel

- Theme follows the system by default (Appearance "auto"). Light theme: page background `#f8f9fa`, sidebar `#f1f3f4`, cards white. Dark theme: page `#0a0a0c`, sidebar `#111114`, cards `#16161a`. Primary `#3b82f6` (blue-500), secondary `#10b981` (emerald).
- Inter font, cards with large rounded corners (16px) and a thin border, and pill-shaped status badges in soft tints (red for stopped, green for listening, amber for warnings and preview).
- Small uppercase gray labels above values ("CURRENT PLAN", "STREAMER").
- Buttons grow slightly on hover. Toasts appear top right for 4 seconds.
- Centered single-column auth forms with a faint background gradient.
- Front-end stack: React with React Router, built with Vite, styled with Tailwind CSS, plus axios, i18next (English and Chinese; the Chinese brand name is 录播宝), hls.js, and Framer Motion.
- Third parties: Google Analytics 4, Cloudflare Web Analytics, self-hosted Umami analytics with session replay, Cloudflare Turnstile, Google sign-in, Stripe, and PayPal.

## Known issues

Problems seen while using the app. The roadmap says how we fix each one.

| # | Issue | Where |
| --- | --- | --- |
| R1 | "Dashboard" shows only the streamer list. Strings for stat cards ("Recording Now", "Today's Sessions", "Abnormal Issues", "Storage Health") ship in the bundle but nothing uses them | `/` |
| R2 | Live status goes stale. Only listening streamers are checked, so a stopped one keeps its last value: a streamer stopped 9 days ago still shows a green dot and `is_living: true`, while `POST /channels/inspect` for the same streamer says "Not live". "Last seen" is the last time a listener recorded the stream, not the last check, so a streamer that is live now can show "Last seen Jul 15" | Streamer card |
| R3 | On desktop (seen at 1280px and 1368px) the streamer name truncates to "val…" and the Resume button shrinks to "R…" or a bare play icon; cards are a fixed 210px wide with empty space beside them | Streamer grid |
| R4 | Card controls are icons explained only by a hover `title`, e.g. a lock with "1" that means "1 recording, preview only". They have no `aria-label` (the header icons do) | Streamer card |
| R5 | Usage card says "REMAINING 100%" next to "0m" (the 100% is usage). The quota API reports `-120` remaining seconds. The trial ended on Oct 22, but nothing says so: the subscription page still shows "Current plan: Free Trial" three times and status "Free Trial" | Sidebar, Subscription |
| R6 | Expired recordings show "Retention expired" twice, stay in the list, and do nothing when clicked. Opening one by URL says it has expired and, beside that, "Upgrade your plan to unlock full playback". The API still returns `READY` with a preview URL | Recordings |
| R7 | Refresh buttons on every page, while updates are uneven: streamers poll every 30 s and notifications every 60 s (only while the tab is visible), and each page load fetches `/auth/quota` three times | All lists |
| R8 | Add Streamer makes you pick the platform even though it detects it from the link: only a paste flips it, and a typed link of the other platform gets a contradictory error. You can't add more than one streamer at a time; Escape doesn't close the modal. It has no `role="dialog"`, focus stays on the page behind it, and the close button has no label | Add Streamer modal |
| R9 | The header icon shortcuts repeat the sidebar links; there's no search | Header |
| R10 | Portrait video sits centered in empty space. The outline does seek the video, but it starts below the fold, so you can't see chapters and video together. Highlights past 5:00 can't play on the free plan | Recording detail |
| R11 | Strings for Batch Import, Record Rules, and View Files exist in the code, but none of these features is built | — |
| R12 | Inconsistent API. Three pagination styles (page numbers, limit/offset, cursor). Requests send `pageSize` but responses say `page_size`. Fields mix `snake_case` and `camelCase`. `platform` is `"TikTok"` in one response and `"tiktok"` in another. Timestamps are `+08:00` in one and `Z` in another. Errors are `{ error }` or `{ code, message }`. Notification metadata sends numbers as strings. Sizes mix decimal GB (1 GB = 10⁹ bytes) and binary GiB shown as "MB". IDs are confusing: a list item's `id` is a task ID, while notifications carry a separate `recording_id` | API |
| R13 | Both JWTs are kept in `localStorage` and in cookies set by JavaScript: not `HttpOnly`, not `Secure`, scoped to every `*.autorecordlive.com` subdomain, and kept for 7 and 30 days. Any injected script can read them. The cached `user` object also carries empty `password` and `access_token` fields, a sign the database model is sent as-is | Auth |
| R14 | Recordings are public by default: each gets a public page on the marketing site, which stays up after the user's retention expires. `GET /recordings` without `subscribed_only` lists everyone's public recordings (444 at the time) even without signing in, and any signed-in user can open them in the app | Recordings, API |
| R15 | Expiry is only cosmetic. An expired recording still serves its preview playlist and segments, AI content, transcript, and subtitles from the API, and its public page still plays the 5-minute preview | Recordings, API |
| R16 | Recordings vanish without warning. The first, 2-minute recording of the session is gone (`410 recording_deleted`) with no notification. Its "Recording complete" and "export ready" notifications still link to it, and the upgrade page promises "Your current recordings stay in your account" | Recordings, Notifications |
| R17 | The platform filters list YouTube and Twitch, but Add Streamer accepts only TikTok and Douyin | Filters, Add Streamer |
| R18 | Playback is fragile. A public recording's preview failed with "Playback failed. Please retry." about 15 seconds after loading, after only the first segment, with two `403`s in the console. The subtitle `<track>` loads from the API's origin without `crossorigin`, so the browser blocks it and captions never show | Recording detail |
| R19 | "Forgot password?" links to `/forgot-password`, which has no route, so the catch-all sends you to `/`. The app has no password reset, password change, or account deletion | Auth |
| R20 | The trial overshoots its quota: recordings keep running to 12:00 on a 10-minute allowance (`used_seconds: 720` of 600), and 42 of the 50 newest public recordings are exactly 12:00 long | Recording, Quota |
| R21 | Notifications name the stream by its room title ("You successfully added VALORANT Champions Tour Brazil"), not the streamer, because `channel_display_name` holds the room title. The inspect preview joins both ("name-Room title") | Notifications, Add Streamer |
| R22 | Add Streamer says "Streamer detected and listening enabled" before anything is saved, for a streamer already in the list, with every listener in use, and on an account with no recording time left. Adding a streamer that's already in the list then says "Streamer saved and listening started." and changes nothing | Add Streamer modal |
| R23 | Recordings can only be filtered by platform: there's no streamer, date, or status filter, and no sort. The card's history button opens `/recordings?channel_id=…`, but the page shows no sign of that filter and no way to clear it | Recordings |
| R24 | An abandoned checkout stays "Pending" in payment history, still 11 days later. Like every Pay as you go purchase, it reads "Plan details are not available for this transaction", because that line expects a subscription plan | Payment history |
| R25 | Umami session replay records every session (sample rate 1, "moderate" masking), and the app shows no consent prompt | Whole app |
| R26 | The listener limit is invisible. Past it, Add Streamer saves the streamer as stopped and only says "Streamer saved, but listening has not started yet."; the server's reason (`active_listener_limit_exceeded`) is never shown. Resume answers HTTP 500 and opens an upgrade prompt that doesn't suggest stopping another streamer. No screen says how many listeners are in use, and the list can't be sorted, so the one listening streamer can sit on page 2 | Streamers, Add Streamer |
| R27 | Add Streamer's check misfires. Usernames under 5 characters (`@nba`) aren't checked until the field loses focus, each typed username is checked twice, checks run in parallel get `429` shown as "Recording resources are busy", and an unknown username says "This account has not enabled live streaming." | Add Streamer modal |
| R28 | Recording starts late. When listening starts on a streamer that is already live (the preview said "Live now"), recording starts about 100 s later (100 s and 97 s in two tries), so that part of the stream is lost | Listener |
| R29 | Playback starts and seeks slowly. Segments are 60 s of 1080p, about 60–70 MB each, and nothing plays until a whole one is in: on our 28 Mbit/s connection the first frame and every seek waited about 25 s | Recording detail |
| R30 | Download isn't a download. It requests an export, prepared in the background; the file comes later through a notification. The Download button forgets the request when the page reloads, and nothing on the page shows that an export is ready | Recordings, Recording detail |
| R31 | Access labels contradict each other. A 3:00 recording that the 300 s preview fully covers is still "Preview only" and "Upgrade required"; its card hides Download, but its detail page offers Download and the export goes through | Recordings, Recording detail |
| R32 | AI content can be missing without a word. A day after recording, `ai-content` and `transcript` answered `404` for both of our recordings, and the detail page just left out the summary, chapters, and captions | Recording detail |
| R33 | Your own clicks fill the inbox: 20 of our 24 notifications came from our own actions, a "Streamer added" for each of 15 streamers (also those that never started listening) plus "Monitoring started" and "Monitoring stopped". Each action also showed a toast, and its notification popped up again up to a minute later | Notifications |
| R34 | What matters never arrives. No notification says a streamer went live, that listening couldn't start, or that recording time is running out (the download warning is email-only). The first sign is "Monitoring auto-stopped", after the fact | Notifications |
| R35 | Notification links lead nowhere useful. "Streamer added" and "Monitoring started/stopped" open the whole streamer list. "Monitoring auto-stopped" opens an upgrade page that offers to restart "this channel" without knowing which one. "Export ready" never says the file is kept only 36 hours | Notifications |
| R36 | The inbox is hard to use. Mark all read is only in the header bell's panel, which shows 8 and doesn't link to the inbox. There's no filter (though the API takes `status=unread`), delete, or mark unread. The bell polls every 60 s and the inbox doesn't, so the badge counts notifications the page doesn't list | `/notifications`, Header |
| R37 | The pop-up for new notifications shows only the newest of several (the rest never pop up), stays until closed or you change pages, shares its corner with toasts, and has no `aria-live`, so screen readers miss it. The bell's label leaves out the unread count | Header |
| R38 | Notification settings are four account-wide email checkboxes: nothing for in-app, nothing per streamer. The subscribe response carries per-streamer flags and Add Streamer ships unused "Notify via Email / Push Notification" strings, but no screen uses them. Escape doesn't close the popover | Header |
| R39 | Billing status contradicts itself (from the code). Every status except past due and a scheduled cancellation reads "Your subscription is active and set to renew automatically.", under "Cancelled" and "Expired" too. Pay as you go gets it under "No active paid subscription", while its plan card says it "does not renew automatically" and its date reads "Renews on --" | Subscription |
| R40 | Cancelling is easy and can't be undone. On the upgrade page, Cancel auto-renew cancels on the first click; the subscription page at least asks first. Afterwards "Reactivate Subscription" is a disabled button that says to contact support | Subscription, Upgrade |
| R41 | No billing self-service: no receipts or invoices, no way to update a card (a failed renewal needs a fresh checkout), refunds only through support although the API takes refund requests, and no downgrade or monthly/yearly switch | Subscription, Payment history |
| R42 | Errors show the HTTP library's raw "Network Error" instead of the app's own messages. A failed load replaces the whole subscription page, tabs included, and Payment history's error has no Retry | Subscription, Payment history |
