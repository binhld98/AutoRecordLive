# LiveCatch Product Charter

**Version:** 1.0<br>
**Date:** October 2026<br>
**Author:** @binhld98

## 1. Purpose

LiveCatch helps repost creators and clippers capture moments from TikTok and Douyin live streams. Users follow channels, LiveCatch records their broadcasts automatically, and users select and download footage for their editor.

## 2. Objectives and success criteria

| Objective | Success criteria |
| --- | --- |
| O1 Capture broadcasts reliably | Provisional targets: record at least 99% of broadcasts from listening channels and start recording within 60 s of a channel going live. Validate these targets on both supported platforms before launch; they are not firm requirements or service guarantees. |
| O2 Get clips out fast | Every export ends in a notification: ready, or failed with a reason. None is lost silently. A ready file stays downloadable for its full window (FR-16). |
| O3 Run as a paid product | LiveCatch launches with billing on. |

## 3. Scope

This charter covers the complete LiveCatch application across two repositories:

- **User app (this repository):** accounts, channel management, recording playback, clip selection, export requests, notifications, and subscription management.
- **Back end (separate repository):** APIs, authentication, channel monitoring, recording, storage, processing, exports, notifications, usage tracking, and billing integration.

Streaming platforms, payment processing, and email delivery are external integrations. Landing pages, the admin console, and operator tools are outside this charter's scope.

LiveCatch records only publicly accessible TikTok and Douyin live streams. It does not connect users' platform accounts or record streams that require login or membership. It has no public sharing or recording galleries, no full video editor (overlays, text, music), and no deleting recordings by hand.

### System sketch

```text
TikTok / Douyin ──▶ Channel check ──▶ Recorder ──▶ Storage ──▶ Export builder
                                         │                          │
                                         ▼                          ▼
                Payment provider ◀─── User app ◀───────────── Notifications (in app, email)
```

The channel check watches listening channels and starts the recorder when one goes live. The recorder saves the stream to storage. The export builder cuts whole recordings or parts into files on request.

## 4. Functional requirements

### Accounts

- **FR-1** Sign up with email and password, and verify the email before using the app.
- **FR-2** Log in with email and password, or with Google.
- **FR-3** Reset a forgotten password, and change the password.
- **FR-4** Delete the account. This cancels any paid subscription and pending exports, and permanently removes all account data and media in the background, regardless of expiry.

### Channels

- **FR-5** Follow a channel by pasting one TikTok or Douyin link or `@username`, with a preview of the channel before saving.
- **FR-6** Turn listening on or off per channel. A listening channel records every broadcast automatically while recording hours remain. Enabling listening while a channel is already live starts recording immediately, subject to plan limits; show that the recording begins partway through the broadcast and the earlier portion is not captured. Whenever listening turns off, by the user or by the app under this charter, any active recording stops immediately and keeps the captured portion. A listener the app turns off stays off until the user turns it back on.
- **FR-7** The plan caps how many channels listen at once. When the cap is reached, the app says so and why.
- **FR-8** Each channel shows whether it's live and when it was last checked.
- **FR-9** Unfollow a channel. This stops any active recording as in FR-6. Its recordings stay until they expire.

### Recording

- **FR-10** Record at the best quality the platform offers, without re-encoding and without adding a watermark. After a temporary platform or back-end interruption, retry automatically while the channel is live, listening is on, and recording hours remain. Preserve captured footage and mark gaps on the recording's timeline.

### Recordings

- **FR-11** List recordings, newest first, with search and filters by channel, platform, and date.
- **FR-12** Open a recording's detail page: player, timeline, metadata, status (recording, processing, ready, failed, has gaps), and expiry date. A recording becomes available once recording has finished and processing is complete, including recordings stopped early while the host is still live. Users can watch, select parts, and export only available recordings; show a processing status until then. Processing has a fixed deadline, configured later. Missing it, or failing permanently, marks the recording failed. For recordings stopped early, show why they stopped.
- **FR-13** Retention starts when a recording becomes available. At expiry, hide the recording and block access, including playback and new exports. Storage is cleaned up later, as in §5.

### Exports

- **FR-14** Export a whole recording.
- **FR-15** Select one or more parts on the timeline. Edges snap to the nearest few seconds. Each part becomes its own export.
- **FR-16** The back end builds each export and notifies the user when it's ready. Exports requested before the source recording expires are allowed to finish, including those still queued or processing at expiry. Each completed export stays downloadable for 72 h from when it becomes ready, independently of its source recording's expiry. After an export expires, the user can export it again only while the source recording has not expired.

### Notifications

- **FR-17** Notify the user when a channel goes live and recording starts, a recording finishes, fails, or has gaps, an export is ready or fails, a recording is about to expire, plan usage reaches 75% and 100%, and a payment fails.
- **FR-18** Always deliver every notification event in the app. Email delivery is optional, with an on/off switch per event.

### Plans and billing

- **FR-19** New users start on a time-limited free trial. It requires no payment method and does not automatically convert to a paid subscription; users must subscribe to a paid plan to keep recording, and FR-24 applies when the trial expires without one. The trial is not a plan users can downgrade to. The trial and each paid plan limit recording hours per month, channels listening at once, and how long recordings are kept; the trial's duration and limits will be configured later. Recording usage is the sum of captured footage duration across channels: recording three channels for one hour uses three recording hours. Failed attempts, gaps, and recordings that fail processing (FR-12) do not consume recording hours.
- **FR-20** Show usage in plain words. When recording hours run out, turn off all listeners as in FR-6 and notify the user, explaining that their recordings ended because the recording allowance ran out.
- **FR-21** Paying, changing plans, cancelling, and invoices go through the payment provider's hosted pages. The provider isn't chosen yet.
- **FR-22** Upgrades take effect immediately and apply all new plan capabilities. For existing unexpired recordings, recalculate expiry from when each became available, using the upgraded plan's retention period; expired recordings stay expired. Subscribing to a paid plan during or after the trial counts as an upgrade. Downgrades are scheduled for the end of the current paid billing period; all current plan capabilities remain available until then. Existing recordings keep their expiry dates when a downgrade takes effect; the downgraded retention applies only to new recordings. Show the scheduled plan and its effective date.
- **FR-23** If a scheduled downgrade would leave more listening channels than the new plan allows, let the user choose which channels stay on before it takes effect, up to the new limit. At the effective date, keep the selected listeners on and turn the others off as in FR-6. Without a valid selection, turn all listeners off and notify the user to enable channels manually within the new limit.
- **FR-24** When a paid subscription ends, or the trial expires without one, turn off all listeners as in FR-6 and start no new recordings. Processing of captured recordings and accepted exports continues under FR-12 and FR-16. Users keep access to their recordings, including playback and new export requests, from when each becomes available until it expires. Existing expiry dates stay unchanged; recordings still processing get their retention period when they become available.
- **FR-25** If a renewal payment fails, notify the user. When the current paid billing period ends unpaid, apply FR-24, even while payment retries continue; retries grant no recording grace period.

## 5. Service requirements

- **Background operation:** Monitoring, recording, processing, exports, notifications, and billing transitions run without the user's browser being open.
- **Recovery:** Persist background job state across restarts and recover interrupted work. Retrying the same job must not duplicate recordings, exports, usage, or charges.
- **Back-end enforcement:** The back end enforces authentication, ownership, plan limits, usage, and expiry for every operation, including direct playback and download links. Checks in the user app alone are not enough.
- **Private access:** Account data, follow lists, recordings, and exports are private to each user.
- **Cleanup:** In the background, remove expired recordings and exports, and footage from recordings that failed processing (FR-12). Keep source footage while exports accepted before its expiry still need it.

## 6. Future enhancements

Ideas, not commitments:

- Watch and cut a recording while it is still being recorded.
- More platforms: YouTube, Twitch, Kick.
- Chat and gift activity on the timeline, to find the moments worth clipping.
- More notification channels: Telegram, Discord, browser push.
- Exact-frame cuts.
- Merging parts into one clip, and reframing to 9:16.
- Burned-in captions.
- Transcripts, transcript search, and AI chapters.
- Recording rules beyond listening on or off.
- Following many channels in one paste.

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Platform terms and copyright claims against what users record, and payment providers reviewing the business | Recordings have no public pages or galleries. Review each platform's terms before adding it. |
| Platform changes, rate limits, or outages interrupt capture | Detect failures, notify affected users, back off failed checks, and keep platform integrations replaceable. |
| Storage and bandwidth cost per recorded hour eats the margin | Plans limit hours and retention. Track cost per recorded hour from the first users onward and price plans above it. |
