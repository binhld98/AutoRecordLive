# LiveCatch Product Charter

**Version:** 1.0<br>
**Date:** October 2026<br>
**Author:** @binhld98

## 1. Purpose

Repost creators and clippers live off moments from other people's live streams, but streams run for hours and the good part comes without warning. LiveCatch records TikTok and Douyin live streams for them. A user follows a channel by URL, and LiveCatch records every broadcast at the best quality available. The user then finds the moments worth reposting, cuts them out, and downloads them as files for their editor.

## 2. Objectives and success criteria

| Objective | Success criteria |
| --- | --- |
| O1 Capture broadcasts reliably | Provisional beta targets: record at least 99% of broadcasts from listening channels and start recording within 60 s of a channel going live. Validate these targets during beta on both supported platforms; they are not firm launch requirements or service guarantees. |
| O2 Get clips out fast | Every export ends in a notification: ready, or failed with a reason. None is lost silently. A ready file stays downloadable for 72 h. |
| O3 Run as a paid product | v1 launches with billing on. |

## 3. Scope

v1 covers the flows a normal user goes through, as listed in the [functional requirements](#4-functional-requirements).

v1 supports only publicly accessible TikTok and Douyin live streams. Connecting a user's platform account and recording streams that require login or membership are out of scope for v1.

Out of scope for v1:

| Item | Status |
| --- | --- |
| Admin console and operator tools | Phase 3 |
| Landing and marketing pages | Phase 2 |
| Public sharing or recording galleries | Not planned |
| A full video editor (overlays, text, music) | Not planned |
| Deleting recordings by hand | Not planned |
| Recording rules beyond listening on or off | Phase 4 |
| Following many channels in one paste | Phase 4 |

### System sketch

```text
TikTok / Douyin ──▶ Channel check ──▶ Recorder ──▶ Storage ──▶ Export builder
                                         │                          │
                                         ▼                          ▼
                Payment provider ◀─── User app ◀───────────── Notifications (in app, email)
```

The channel check watches listening channels and starts the recorder when one goes live. The recorder saves the stream to storage. The export builder cuts whole recordings or parts into files on request. The user app is the only part built in this repository. Everything else is the back end.

## 4. Functional requirements

### Accounts

- **FR-1** Sign up with email and password, and verify the email before using the app.
- **FR-2** Log in with email and password, or with Google.
- **FR-3** Reset a forgotten password, and change the password.
- **FR-4** Delete the account.

### Channels

- **FR-5** Follow a channel by pasting one TikTok or Douyin link or `@username`, with a preview of the channel before saving.
- **FR-6** Turn listening on or off per channel. A listening channel records every broadcast automatically while recording hours remain. Enabling listening while a channel is already live starts recording immediately, subject to plan limits. Show that the recording begins partway through the broadcast; the earlier portion is not captured. Turning listening off stops any active recording immediately and keeps the captured portion. A stopped listener must be turned back on manually.
- **FR-7** The plan caps how many channels listen at once. When the cap is reached, the app says so and why.
- **FR-8** Each channel shows whether it's live and when it was last checked.
- **FR-9** Unfollow a channel. This stops any active recording immediately and keeps the captured portion. Its recordings stay until they expire.

### Recording

- **FR-10** Record at the best quality the platform offers, without re-encoding and without adding a watermark.

### Recordings

- **FR-11** List recordings, newest first, with search and filters by channel, platform, and date.
- **FR-12** Open a recording's detail page: player, timeline, metadata, status (recording, processing, ready, failed, has gaps), and expiry date. In v1, users can watch, select parts, and export for download once recording has finished and processing is complete. This includes recordings stopped early, even if the host is still live. Make recordings available as soon as processing finishes, with no fixed processing-time target. Show a processing status during that wait. For recordings stopped early, show why they stopped.
- **FR-13** When a recording's retention ends, hide it from the user and prevent access, including playback and new export requests. Expiry ends user access; it does not guarantee immediate physical deletion from storage. The back end may retain the source to finish exports requested before expiry and delete it later.

### Exports

- **FR-14** Export a whole recording.
- **FR-15** Select one or more parts on the timeline. Edges snap to the nearest few seconds. Each part becomes its own export.
- **FR-16** The back end builds each export and notifies the user when it's ready. Exports requested before the source recording expires are allowed to finish, including those still queued or processing at expiry. Each completed export stays downloadable for 72 h from when it becomes ready, independently of its source recording's expiry. Expiring the source recording does not shorten this download window. After an export expires, the user can export it again only while the source recording has not expired.

### Notifications

- **FR-17** Notify the user when a channel goes live and recording starts, a recording finishes, fails, or has gaps, an export is ready, a recording is about to expire, plan usage reaches 75% and 100%, and a payment fails.
- **FR-18** Deliver notifications in the app and by email, with an on/off switch per event.

### Plans and billing

- **FR-19** A free trial requires no payment method and does not automatically convert to a paid subscription. Users must explicitly subscribe to a paid plan to continue recording after the trial. The exact trial duration and limits will be configured later and are not fixed by this charter. Plans limit recording hours per month, channels listening at once, and how long recordings are kept. Recording usage is the sum of captured footage duration across channels: recording three channels for one hour uses three recording hours. Failed attempts and gaps do not consume recording hours.
- **FR-20** Show usage in plain words. When recording hours run out, stop listening and all active recordings immediately, keep the captured portions, and notify the user. Explain that these recordings ended because the recording allowance ran out. Listening stays off when the allowance renews or increases; users must turn it back on manually.
- **FR-21** Paying, changing plans, cancelling, and invoices go through the payment provider's hosted pages. The provider isn't chosen yet.
- **FR-22** Upgrades take effect immediately and apply all new plan capabilities, including recalculating retention for existing unexpired recordings under the upgraded plan. Stopped listeners still require manual reactivation. Downgrades are scheduled for the end of the current paid billing period; all current plan capabilities remain available until then. Existing recordings keep their expiry dates when a downgrade takes effect; the downgraded retention applies only to new recordings. Show the scheduled plan and its effective date.
- **FR-23** If a scheduled downgrade would leave more listening channels than the new plan allows, let the user choose which channels stay on before it takes effect, up to the new limit. At the effective date, keep the selected listeners on and turn the others off. Without a valid selection, turn all listeners off and notify the user to enable channels manually within the new limit. Turning a listener off stops any active recording immediately and keeps the captured portion, as in FR-6.
- **FR-24** When a paid subscription ends, stop listening and new recordings. Stop any active recordings and keep the captured portions. Users retain access to existing recordings, including playback and new export requests, until those recordings expire. Existing recordings and completed exports keep their respective expiry dates.
- **FR-25** If a renewal payment fails, notify the user and stop listening and recording when the current paid billing period ends. Payment retries do not grant a recording grace period. Preserve access to existing recordings and exports as in FR-24. After payment succeeds, stopped listeners must still be turned back on manually.

## 5. Phases

| Phase | Delivers |
| --- | --- |
| Phase 0 — Concept and requirements | This charter and the docs that follow from it (sprint S0) |
| Phase 1 — Build and launch v1 | Every functional requirement, over sprints S1 onward (S1 is the app shell), then a private beta with a few clippers and a public launch with billing on |
| Phase 2 — Build and launch landing pages | Landing and marketing pages |
| Phase 3 — Build and launch the admin console | The admin console and operator tools |
| Phase 4 — Enhancements | Ideas, not commitments, listed below |

Phase 4 ideas:

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

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Platform terms and copyright claims against what users record, and payment providers reviewing the business | Recordings have no public pages or galleries. Review each platform's terms before adding it. |
| TikTok or Douyin change their unofficial stream protocols and recording breaks | Detect failed recordings at once, notify affected users, and keep the platform code isolated so a fix ships fast. |
| The platforms rate-limit or block our servers | Spread checks over time and addresses, and check each channel only as often as needed. |
| Storage and bandwidth cost per recorded hour eats the margin | Plans limit hours and retention. Track cost per recorded hour from the beta onward and price plans above it. |
| Solo project: one person's time and availability | Keep v1 to this charter, ship in small sprints, and move anything new to Phase 4. |
