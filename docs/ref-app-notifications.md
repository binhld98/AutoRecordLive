# Reference app: Notifications

How the reference app tells users what happened: the `/notifications` inbox, the header bell and its pop-up, read state and links, email settings, and the toasts that answer the user's own clicks. The [reference app study](./ref-app-study.md) covers the whole app at overview level. Our own design is in the [notifications user flows](./user-flows-notifications.md).

Studied on 2026-10-28 with the Free Trial account from the dashboard study. It held 24 notifications from that study's test (15 streamers added, listeners started and stopped, two recordings, time running out) and one export. Methods: using the inbox, the bell panel, and the email settings in a browser pane about 1000 px wide and at 375 px, reading the JavaScript bundle, and calling the notifications API with read-only requests. The only write was opening one notification, which marked it read. We didn't change settings or trigger new events, so the pop-up's behavior comes from the code and the dashboard study's test.

## Answers

**What creates a notification?** The server, on 12 kinds of event: a streamer saved, listening started or stopped, a recording started, completed, or failed, an export ready or failed, and four billing results. Your own clicks count: 20 of our 24 came from our own actions (R33). Nothing warns before a limit is reached, and nothing says a streamer went live (R34).

**How does a new one reach you?** By polling. The header bell fetches the newest 8 every 60 seconds while the tab is visible, and again on focus. A new unread one pops up at the top right and stays until you dismiss it or change pages. There's no push, WebSocket, or Server-Sent Events. Email settings are four checkboxes that apply to all streamers at once.

**When is it a toast, and when a notification?** A toast answers your own click, in the browser, for 4 seconds. A notification is stored on the server, and many describe your own clicks too, so one action often gets both: the toast at once, then a pop-up about the same thing up to a minute later.

## Where messages show

| Surface | What it shows | Kept |
| --- | --- | --- |
| Inbox, `/notifications` | Every notification, 20 at a time | No way to delete one |
| Bell panel (header) | The newest 8, with Mark all read | — |
| Pop-up | One new unread notification, top right | Until dismissed or you change pages |
| Email | Recording updates you tick in four account-wide checkboxes, plus export-ready and time-ran-out emails | — |
| Toast | The result of your own click | 4 seconds |
| System notice | A banner operators can put above every page (off during the study) | Until dismissed |

## The inbox

- **Header:** "Notifications", a subtitle that points at export-ready updates being easy to miss in email, then "N unread" as plain text (not a button) and **Refresh**.
- **List:** 20 per page, newest first, then "Load more" (cursor paging) until "You've reached the end of your notification history." Rows show two lines of title and two of message.
- **States:** four skeleton rows while loading. A failed load says "Unable to load notifications" with Refresh and "Report this issue", which opens the website's contact page. A failed refresh with rows already shown adds an amber bar with Retry. An empty inbox says "You're all caught up".
- **No Mark all read** on this page, and no filter, search, delete, or mark unread (R36).
- **Phones:** the same single column, and it works well.

### Notification row

| Part | What it shows |
| --- | --- |
| Icon | By level: green check (success), amber alert (warning), red alert (error), blue "i" (info). The row's background is tinted to match |
| Unread | A blue dot before the title, a blue border, and a shadow. Read rows have none |
| Title and message | Built in the browser from the type (see Language) |
| Time | "Just now", "5m ago", "3h ago", or "2d ago"; from 7 days, the date. The exact date and time show on hover |
| Chevron | On the right. The whole row is a button, so it can't be opened in a new tab |

Levels in our data: a manual stop was info, the automatic stop a warning, and everything else success. Nothing used error.

## Bell and pop-up

**Bell:** a header button labeled "Notifications" with a blue badge for the unread count ("99+" above 99). Screen readers hear only "Notifications", not the count (R37). The sidebar's Notifications link has no badge.

**Bell panel:** a 384 px dropdown (on phones, a sheet under the header) with "N unread", **Mark all read**, the newest 8 rows with one-line messages, and a footer hint. It has no link to the inbox page (R36). A separate header button opens the email settings; opening one closes the other.

**Pop-up:** a card at the top right under the header (full width on phones) with a bell icon tinted by level, the title, the time, two lines of message, and a close button labeled "Dismiss notification alert". From the code:

- After sign-in, every unread notification counts as seen, so old ones don't pop up.
- Each bell refresh pops up the newest unread notification it hasn't seen; the rest are marked seen and never pop up. One Add Streamer that starts listening creates two notifications in the same second, and only one pops up.
- Nothing pops up while the bell panel is open, and whatever arrived then never will.
- It stays until you close it, click it (marks it read and opens its link), or change pages. There's no timer. A newer one replaces it.
- It has no `role` or `aria-live`, so screen readers don't announce it. Toasts show in the same corner, just above it (R37).

## Read state

- Clicking a row (inbox or panel) or the pop-up marks it read at once with `POST /notifications/:id/read`, then opens its link. If the request fails, the row turns unread again.
- **Mark all read** exists only in the bell panel. It calls `POST /notifications/read-all`.
- There's no mark unread, delete, or archive. The API filters `status=unread`, but the UI never uses it, and `status=read` returns everything.
- An operator impersonating a user doesn't mark anything read.

## What refreshes when

| What | Refreshes |
| --- | --- |
| Bell badge and panel (newest 8) | On load, every 60 s while the tab is visible, on window focus, when the tab becomes visible, when the panel opens, and on a shared refresh event that Mark all read, the inbox, and export requests fire |
| Inbox page (20 per page) | On load, on Refresh, and on the shared refresh event. No timer and no focus refetch |
| Pop-up | When a bell refresh finds an unread notification it hasn't seen |

So on `/notifications`, a new notification raises the badge and pops up, while the list you're reading doesn't show it until you press Refresh (R7, R36).

## Types and links

All 12 types the UI knows, with the English text the browser builds. `{channel}` is `metadata.channel_display_name`. Messages are summarized.

| Type | Sent when | Level | Title | Message | Opens |
| --- | --- | --- | --- | --- | --- |
| `subscription_succeeded` | A streamer is saved, listening or not | success | Streamer added | You added {channel} | `/` |
| `listener_started` | Resume, or Add with a free listener (`trigger_kind: manual`); a system start has its own wording | success | Monitoring started | You're monitoring {channel} | `/` |
| `listener_stopped`, manual | Stop Listening | info | Monitoring stopped | You stopped monitoring {channel} | `/` |
| `listener_stopped`, system, `reason: quota_exceeded` | Recording time runs out | warning | Monitoring auto-stopped | Monitoring stopped because the quota ran out | `/upgrade?reason=listener_quota_stopped&source=notification` |
| `listener_stopped`, system, other reason | Not seen | — | Monitoring stopped | The system stopped it | — |
| `recording_started` | Not seen, though we recorded twice; its email setting was off | — | Recording started | {channel} started recording | — |
| `recording_completed` | A recording is processed, about 75 s after it ends | success | Recording complete | {channel}'s recording is in your list | `/recordings/:platform/:taskId` |
| `recording_failed` | Not seen | — | Recording failed | It couldn't be completed: try later or contact support | — |
| `recording_export_ready` | An export is ready | success | Recording export file ready | The file for {recording} is ready, "Click to download". Variants for a ZIP of several MP4s, for skipped damaged segments, and for segments that couldn't be processed | `/recordings/export-download?platform=…&task_id=…` |
| `recording_export_failed` | Not seen | — | Recording export file could not be prepared | Try later or contact support | — |
| `payment_success`, `payment_renewal_failed`, `payment_cancel_effective`, `payment_refund_result` | Billing results; not seen | — | Payment success, Renewal failed, Subscription cancelled, Refund processed | Each points to the subscription page or its history | — |

Where the links lead (R35):

- **`/`** is the whole streamer list, not the streamer the notification is about.
- **The upgrade page** from "Monitoring auto-stopped" is titled "Restart listening for this channel" and sells recording credits, but the link carries no channel or subscription, so it can't know which listener to restart after payment.
- **The export link** opens the export download page. The metadata says how long the file is kept (`cached_until`, 36 hours after it's ready), but nothing shows it, and the message keeps saying "Click to download".
- **Recordings** that were deleted answer `410` while their notifications still link to them (R16).

### Language

The server stores `title` and `message` in the account's language when it creates the notification. Our account had none set, so all 24 were stored in Chinese. The browser rebuilds both from `notification_type` and `metadata` in the language you're using, and falls back to the stored text when the metadata has no name. Names come from `channel_display_name`, which can be the stream title (R21).

## Email settings

A header button with a sliders icon opens "Email notification settings": four checkboxes for Recording completed (on by default), Recording started, Recording failed, and Download usage warning. The description says they apply to every channel you monitor.

- Each click saves the whole set with `PUT /notifications/settings`, and the boxes are disabled while saving. If saving fails, the box flips back and "Unable to save email notification settings." shows.
- Escape doesn't close the popover; a click outside does.
- In-app notifications have no settings, and nothing is per streamer (R38). The subscribe response carries per-streamer flags (all `false`) that no screen shows, and Add Streamer ships unused "Notify via Email / Push Notification" strings.
- Download usage warning is email-only: no in-app type matches it. The export page promises an email when an export is ready, and the upgrade page tracks `source=email_quota_stopped`, so a time-ran-out email exists too. We couldn't read the account's inbox to see them.

## Toasts

The app uses react-hot-toast: top right, 16 px from the edges, 4 seconds for every kind (the app overrides the library's 2 seconds for success), paused on hover, up to 20 stacked, announced with `role="status"` and `aria-live="polite"`. The toasts users see:

| After | Toast | Kind |
| --- | --- | --- |
| Add Streamer, listening started | "Streamer saved and listening started." | success |
| Add Streamer, listening not started | "Streamer saved, but listening has not started yet." | success, with a green check for a partial failure (R26) |
| Resume Listening | "Resumed listening successfully" | success |
| Stop Listening | "Stopped listening successfully" | success |
| Remove, after the confirmation | "Unsubscribed successfully" | success |
| Any of these fails | The server's message, or "Operation failed" | error |
| Subscription page | Cancel succeeded or failed, checkout errors | success, error |

When Add or Resume hits a plan limit, an upgrade prompt opens instead of a toast. Exports, Mark all read, and email settings show no toast. The operator console uses many more.

## System notice

Operators can show a banner above every page: `GET /public/system-notice?surface=dashboard&locale=en`, fetched every 60 seconds while the tab is visible. It has a title, body, level, and a dismissible flag; dismissing it saves the notice's ID in `localStorage`. It was off during the study (`{ enabled: false }`).

## What our test created

The dashboard study's test on 2026-10-26 (UTC), as notifications:

| Time | Action | Notifications |
| --- | --- | --- |
| 05:23 | Add @valorant, listener free | "Streamer added" and "Monitoring started", same second |
| 05:24–05:28 | Add 13 more, all saved as Stopped | 13 × "Streamer added" |
| 05:31 | Stop @valorant, Resume Al Jazeera English | "Monitoring stopped", "Monitoring started" |
| 05:35 | Stop Al Jazeera while recording | "Monitoring stopped", then "Recording complete" at 05:37 |
| 05:37 | Resume Al Jazeera | "Monitoring started" |
| 05:47 | Time runs out | "Monitoring auto-stopped" |
| 05:48 | The recording ends; add Lofi Girl again (Stopped, no time) | "Recording complete", "Streamer added" |
| Oct 27, 09:32 | An export finishes | "Recording export file ready" |

No notification came from Resume being refused (HTTP 500 and 429), from a listener that couldn't start on Add, from removing a streamer, or from the two recordings starting.

## API

```jsonc
// GET /notifications?limit=20&status=all&cursor=… → { items: [...], unread_count, next_cursor }
// The bell asks for 8 and the inbox 20; limit=500 worked. status=unread filters; status=read returns everything.
// next_cursor is base64 of "<created_at>|<id>".
{
  "id": "…", "notification_type": "listener_stopped", "category": "subscription", "level": "warning",
  "title": "监听已自动停止", "message": "…",   // stored in the account's language at creation
  "action_url": "/upgrade?reason=listener_quota_stopped&source=notification",
  "action_kind": "subscription", "source_kind": "subscription", "source_id": "…", "channel_id": "…",
  "metadata": { "channel_display_name": "Al Jazeera English", "channel_id": "…", "subscription_id": "…",
                "trigger_kind": "system", "reason": "quota_exceeded", "event_occurred_at": "2026-10-26T05:47:14.884157397Z" },
  "is_read": false, "read_at": "", "created_at": "2026-10-26T13:47:14+08:00", "updated_at": "2026-10-26T13:47:14+08:00"
}
// recording_completed metadata: platform, recording_id, task_id, merged_file_id (the playlist's storage path)
// recording_export_ready metadata adds: recording_title, download_url, artifact_format, artifact_part_count,
//   file_size_bytes, cached_until. Numbers come as strings

// POST /notifications/:id/read and POST /notifications/read-all → the new unread_count
// GET /notifications/settings; PUT takes the whole object
{ "recordingStarted": false, "recordingCompleted": true, "recordingFailed": false, "downloadUsageWarning": false }
```

## Issues

From the reference app study's known issues, the ones these screens show:

| # | In short |
| --- | --- |
| R7 | The bell polls every 60 s; the inbox doesn't, and has a Refresh button |
| R16 | Notifications link to recordings that were deleted |
| R21 | Names come from `channel_display_name`, which can be the stream title |
| R26 | "Streamer saved, but listening has not started yet." is a green success toast, and no notification says why |
| R33 | Your own clicks fill the inbox, and also get a toast |
| R34 | What matters never arrives: no live alert, no failure to start, no warning before time runs out |
| R35 | Links open the whole list, an upgrade page that forgot the channel, or an export whose expiry nothing shows |
| R36 | Mark all read only in the bell panel, no filters, no link from the panel to the inbox, and an inbox that doesn't update |
| R37 | The pop-up shows one of several, stays until closed, and isn't announced; the bell's label has no count |
| R38 | Settings are email-only and account-wide; per-streamer flags exist but nothing uses them |

## What this means for us

Our answers are in the notifications user flows. The ones this study tests:

- **Your own action gets a toast, never a notification.** Adding 15 hosts is one toast, not 15 inbox rows (R33).
- **Notify what happens without you, before anything is lost:** a host went live, a recording is ready or failed, 80% and 100% of hours, a recording about to expire, the listener limit dropping, a host we can't reach (R34).
- **Every notification opens the thing it's about:** the host, the recording, or the plan, and a page that says why when that thing is gone (R35, R16).
- **One inbox:** `/notifications` with an Unread filter and Mark all read, and a badge in the sidebar. No bell panel and no pop-up; browser push, in phase 3, is the opt-in way to be interrupted (R36, R37).
- **Keep the reference's best idea: build the text from the type** in the reader's language. Unlike the reference, store no sentences on the server, so there's no stored language to fall back to.
- **Settings per event, for in-app and email, with live alerts per host.** Problems always show in the app (R38).
