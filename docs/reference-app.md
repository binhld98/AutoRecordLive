# Reference app study

AutoRecordLive is modeled on https://app.autorecordlive.com. This document records what that app does and how, so we can match the parts that work and fix the parts that don't. Our plan is in the [roadmap](./roadmap.md).

Studied on 2026-10-23 on a Free Trial account with one followed streamer, by using the app, reading its JavaScript bundle, and calling its API.

## Core loop

1. The user pastes a streamer URL (TikTok or Douyin) or `@username`.
2. The back end checks the URL, saves the streamer, and starts **listening**: it polls the platform to see whether the streamer is live. Listening stops on its own when the user's recording quota runs out.
3. When the streamer goes live, the back end **records** the stream as HLS segments in cloud storage. A recording belongs to the channel, not the user, so everyone who follows that streamer shares it.
4. When the stream ends, post-processing builds a thumbnail, works out the duration and file size, and marks the recording ready. It also generates an AI summary, outline, highlights, FAQ, and a transcript with subtitles.
5. The user watches the recording in the browser (HLS player) or asks for an **export**. Exports are prepared in the background, and the user gets an in-app notification and an email when the MP4 (or ZIP of MP4s) is ready.
6. Recordings are **public by default**. Each one also gets an SEO page on the marketing site (`www.autorecordlive.com/en/:platform/recording/:id`) with a 5-minute preview and the AI summary.

## Layout

Every signed-in page shares one shell:

- **Left sidebar** (collapses to a hamburger menu on narrow screens):
  - Logo.
  - Usage card: remaining recording time, a usage progress bar, current plan, "Access until" date, download used/quota (e.g. `0GB / 1GB`), and an **Upgrade Now** button.
  - Nav: Dashboard, Recordings, Notifications, Subscription.
- **Top header**, right-aligned:
  - Icon shortcuts for Dashboard, Recordings, Notifications, and Email notification settings.
  - Account button (avatar initial, email, plan name) that opens a menu: Appearance (light/dark/auto), Language (English/中文), Logout.
- **Page content**: a page title and one-line subtitle on the left, page actions (Refresh, primary button) on the right, then a filter bar card, then the content.

## Screens

| Route | Screen | What's on it |
| --- | --- | --- |
| `/login`, `/register`, `/verify-email/*` | Auth | Centered form. Email + password, Google sign-in, Cloudflare Turnstile on register, email verification |
| `/` | Dashboard = **Streamers** | Platform and status filters, result count, grid of streamer cards (12 per page). **Add Streamer** opens a modal |
| `/add` | Add deep link | Opens Add Streamer; sends signed-out users to `/login?redirect=/add` |
| `/recordings` | Recordings | Platform filter, result count, grid of recording cards |
| `/recordings/:platform/:recordingId` | Recording detail | Header card, HLS player, Refresh / Download / Replay, a side column, AI sections, related recordings |
| `/recordings/export-download` | Export download | Opens a short-lived download link from `task_id`, `platform`, and `token` query params |
| `/notifications` | Notifications | Unread count, Refresh, list of notifications with "Load more" |
| `/settings/subscription`, `/settings/subscription/history` | Subscription | Tabs: Subscription settings / Payment history. Current plan card, billing status card, subscription details, Upgrade plan |
| `/upgrade`, `/payment/success` | Checkout | Plan picker and the page Stripe/PayPal return to |
| `/admin/*` | Operator console | Recording repair, export recovery, retention, publication, AI content, impersonation, trial anti-abuse, system notice. Internal only |

**Streamer card:** avatar, name, a green dot + platform, status badge (e.g. red `STOPPED`) in the top right, the current room title, and the last seen time. The footer has Resume/Stop Listening, a delete (unsubscribe) icon that asks for confirmation, a recording-history count, and an external link to the live page.

**Add Streamer modal:** a TikTok / Douyin segmented toggle, one input ("Paste TikTok link or @username"), helper text, examples (`tiktok.com/@username/live`, `@username`), and Cancel / Add Streamer buttons. Add Streamer stays disabled until the input is valid. Pasting a link of the other platform flips the toggle by itself.

**Recording card:** a thumbnail with a platform tag (top left) and duration (bottom right), the title, streamer · date, a retention line ("Available until …" / "Retention expired"), and the file size.

**Recording detail:** the player sits centered under a header card (Back, platform, access and retention badges, title, streamer, date). A right-hand column holds Retention, the metadata grid, and the access state ("Preview only", "Upgrade required"). Below the player come the summary, a session outline, highlights, and FAQ, then related recordings. Clicking an outline chapter or highlight seeks the video and adds `?t=<seconds>` to the URL; the current chapter is marked.

**Notification row:** a status icon, title, message, and time. The row is tinted by level: green for success ("Recording complete", "Monitoring started"), amber for warnings ("Monitoring auto-stopped"), and blue for info ("Monitoring stopped"). Clicking a row follows its `action_url`. The UI builds the title and message from `notification_type` and `metadata` in the current language, because the API's `title` stays in the language the account had when the notification was created.

## Plans

From `GET /payments/plans`. Yearly plans cost about 20% less than twelve months.

| Plan | Price (USD) | Recording | Active listeners | Retention | Download |
| --- | --- | --- | --- | --- | --- |
| Free Trial | free, 7 days | 10 min | 1 | 3 days | 1 GB/month |
| Pay as you go | 2.99 per pack, credits don't expire | 10 h per pack | 1 | 7 days | 10 GB per pack |
| Starter | 9.99/month, 95.90/year | 50 h/month | 2 | 30 days | 100 GB/month |
| Standard | 24.99/month, 239.90/year | 150 h/month | 6 | 60 days | 400 GB/month |
| Premium | 59.99/month, 575.90/year | 400 h/month | 10 | 90 days | 1 TB/month |

Every plan allows unlimited saved streamers; the listener limit caps how many are listening at once. Payment goes through Stripe (card) or PayPal. On the free plan, playback is cut off after 300 seconds unless you upgrade; the server enforces this by serving a preview playlist (`playlist.m3u8?preview=true`). When an export is bigger than the remaining free download quota, it only covers what the quota allows. To stop repeat trials, adding a streamer sends a browser fingerprint (user agent, timezone, screen, canvas and WebGL hashes).

## Status vocabulary

| Thing | States |
| --- | --- |
| Listener (streamer subscription) | `LISTENING`, `PENDING`, `RECORDING`, `STOPPED`. The status filter offers all but `PENDING` |
| Live status | live, offline (`is_living` boolean) |
| Recording | `PENDING`, `RECORDING`, `PROCESSING`, `READY`/completed, `FAILED` |
| Retention | `EXPIRED`, `POLICY_UNKNOWN` (shown as "Retention pending confirmation"), and more in the operator console |
| Export | not requested, preparing, ready, failed, expired, plus manual-recovery states for exports that need support |
| Notification level | `success`, `warning`, `info`, `error` |
| Notification type | `subscription_succeeded` ("Streamer added"), `listener_started`, `listener_stopped`, quota exceeded ("Monitoring auto-stopped"), `recording_started`, `recording_completed`, `recording_failed`, `recording_export_ready`, `recording_export_failed`, and payment success, renewal failed, cancel effective, refund result |

## API surface

The front end calls a REST API at `https://api.autorecordlive.com/api/v1` with a JWT bearer token. Recording endpoints also take a `?platform=` query param.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/language`; `GET /auth/quota` |
| Streamers | `POST /channels/inspect` (validate a URL before saving), `POST /channels/subscribe`, `GET /channels/subscriptions`, `POST /channels/subscriptions/:id/stop`, `.../start`, `DELETE /channels/subscriptions/:id` |
| Recordings | `GET /recordings?subscribed_only=true`, `GET /recordings/:id`, `GET /recordings/:id/playlist.m3u8`, `GET /recordings/:id/ai-content`, `GET /recordings/:id/transcript`, `GET /recordings/:id/subtitles.vtt` |
| Exports | `POST /recordings/:id/export`, `GET /recordings/:id/export/status`, `GET /recordings/:taskId/export/download?token=…` |
| Notifications | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`, `GET/PUT /notifications/settings` |
| Billing | `GET /payments/plans`, `POST /payments/checkout-sessions`, `POST /payments/subscription/upgrade-sessions`, `GET /payments/subscription`, `POST /payments/subscription/cancel`, `POST /payments/refunds`, `GET /payments/transactions` |
| Other | `GET /public/system-notice` (banner text) |

Without `subscribed_only=true`, `GET /recordings` returns every public recording on the service, not just the user's.

## Data shapes

Fields the API actually returns:

```jsonc
// GET /channels/subscriptions?page=1&page_size=12 → { data: [...], pagination: { page, page_size, total, total_pages } }
{
  "id": "89c4…", "channel_id": "c75a…", "platform": "TikTok",
  "url": "https://www.tiktok.com/@name/live", "host_name": "name", "avatar": "https://…",
  "room_name": "Current stream title", "is_living": true,
  "status": "STOPPED", "status_label": "Stopped",
  "subscribed_at": "2026-10-15T08:03:34+08:00", "last_seen_at": "2026-10-15T08:06:23+08:00",
  "channel_recording_count": 1, "user_recording_count": 0
}

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

// GET /notifications?limit=8&status=all → { items: [...], next_cursor, unread_count }
{
  "id": "d48a…", "notification_type": "recording_completed", "category": "recording",
  "level": "success", "title": "录制完成", "message": "…",
  "action_url": "/recordings/tiktok/…", "action_kind": "recording",
  "source_kind": "recording", "source_id": "…", "channel_id": "…",
  "is_read": true, "read_at": "…", "created_at": "…", "updated_at": "…",
  "metadata": { "platform": "tiktok", "recording_id": "eea4…", "task_id": "…", "channel_display_name": "…" }
}

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

// GET /notifications/settings
{ "recordingStarted": false, "recordingCompleted": true, "recordingFailed": false, "downloadUsageWarning": false }
```

## Look and feel

- Theme follows the system by default (Appearance "auto"). Light theme: page background `#f8f9fa`, sidebar `#f1f3f4`, primary `blue-500` (`#3b82f6`).
- Inter font, white cards with large rounded corners (16px) and a thin border, and pill-shaped status badges in soft tints (red for stopped, green for listening, amber for warnings).
- Small uppercase gray labels above values ("CURRENT PLAN", "STREAMER").
- Centered single-column auth forms with a faint background gradient.

## Known issues

Problems seen while using the app. The [roadmap](./roadmap.md#what-we-do-better) says how we fix each one.

| # | Issue | Where |
| --- | --- | --- |
| R1 | "Dashboard" shows only the streamer list. Strings for stat cards ("Recording Now", "Today's Sessions", "Abnormal Issues") ship in the bundle but nothing uses them | `/` |
| R2 | Live status goes stale: a streamer stopped 8 days ago still shows a green dot, and the API still says `is_living: true` | Streamer card |
| R3 | At 1280px the streamer name truncates to "v…" and the Resume button loses its label, leaving a bare play icon; cards are a fixed 210px wide with empty space beside them | Streamer grid |
| R4 | Icon-only controls explained only by a hover `title`, e.g. a lock with "1" that means "1 recording, preview only". No `aria-label`s | Streamer card |
| R5 | Usage card says "REMAINING 100%" next to "0m" (the 100% is usage). The quota API reports `-120` remaining seconds. The trial ended on Oct 22, but nothing says it expired | Sidebar |
| R6 | Expired recordings show "Retention expired" twice, stay in the list, and do nothing when clicked. The detail API still returns `READY` with a preview URL | Recordings |
| R7 | Refresh buttons on every page, while updates are uneven: streamers poll every 30 s and notifications every 60 s (only while the tab is visible) | All lists |
| R8 | Add Streamer makes you pick the platform even though it detects it from the link; you can't add more than one streamer at a time; Escape doesn't close the modal | Add Streamer modal |
| R9 | The header icon shortcuts repeat the sidebar links; there's no search | Header |
| R10 | Portrait video sits centered in empty space. The outline does seek the video, but it starts below the fold, so you can't see chapters and video together | Recording detail |
| R11 | Strings for Batch Import, Record Rules, and View Files exist in the code, but none of these features is built | — |
| R12 | Three pagination styles (page numbers, limit/offset, cursor), mixed `snake_case`/`camelCase` fields, and `platform` as `"TikTok"` in one response and `"tiktok"` in another | API |
| R13 | Both JWTs are kept in `localStorage` and in cookies set by JavaScript (not `HttpOnly`), readable by any injected script | Auth |
| R14 | Recordings are public by default: each gets a public page on the marketing site, which stays up after the user's retention expires, and `GET /recordings` without `subscribed_only` lists everyone's public recordings | Recordings, API |
