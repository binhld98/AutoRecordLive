# User flows: recordings

How people find, watch, cut, and download recordings on `/recordings` and `/recordings/:id`, and what happens when they expire. This is the detailed workflow for those screens; the rest of the app (sitemap, limits) is in [user flows](./user-flows.md), and the wording of its messages is in the [notifications user flows](./user-flows-notifications.md). How the reference app does the same job: [Recordings](./ref-app-recordings.md). Principles P1–P8 are the product principles in the roadmap.

Flow numbers (3, 6) match user flows, so references elsewhere stay valid.

## Terms

| Term | Means |
| --- | --- |
| **Recording** | What we captured of one broadcast for you. Recordings are shared per broadcast, but each follower has their own span, list, and actions |
| **Part** | A recording is one part unless the stream changed format mid-broadcast; each part downloads as its own `.mp4` |
| **Gap** | A span where the stream dropped and we reconnected. It's saved with its reason and shown on the timeline |
| **Section** | A span you select on the timeline to download on its own |
| **Retention** | How long your plan keeps your access to a recording after it ends |

## Rules

**Who sees what**

1. You see only recordings of hosts you follow, made while you were listening. Nothing is public, and another user's recording link opens "Recording not found" (P7).
2. Removing a host keeps its recordings until their retention ends, under the host's name.

**Watching**

3. Playback starts in a second or two and seeking is quick: segments are about 6 s (R29). Segment links stay valid for the recording's length plus a margin (R18).
4. A recording in progress shows on the list as "Recording now · ready when the stream ends". Watching it while it records comes later (watch while recording in the roadmap).
5. Chapters and the transcript come after the recording is ready. Until then the page says "Chapters are being prepared"; if they fail it says "Couldn't make chapters for this recording". The page never leaves a silent blank (R32).

**Downloading**

6. Download starts at once as a plain `.mp4` link, for the whole recording or a section. There's no export job, notification, or download quota; downloads are rate-limited against abuse (R30).
7. Section edges snap to segments (about 6 s), so the file starts and ends where the timeline shows.
8. A recording with more than one part downloads one `.mp4` per part, and the Download button says how many.

**Retention**

9. Every recording shows one retention line: "Expires Oct 3" ("Expires today" on the last day).
10. Three days before, a notification says "Recording of @host expires Oct 3. Download it to keep it."
11. When your retention ends, the recording is automatically removed from your list and the API stops serving it to you (R15). Shared files are deleted when no follower still needs them. Recordings cannot be removed manually.

## Recording states

```mermaid
stateDiagram-v2
  [*] --> Recording: Host goes live while you listen
  Recording --> Processing: Stream ends, you stop listening, or hours run out
  Recording --> Failed: Recorder fails
  Processing --> Ready: Thumbnail, duration, size done
  Processing --> Expired: Retention ends
  Ready --> Expired: Retention ends
  Failed --> Expired: Retention ends
  Expired --> [*]
  note right of Failed
    Keeps what was captured
    and says what failed
  end note
```

| State | On the list | Can play | Can download | Actions |
| --- | --- | --- | --- | --- |
| Recording | "Recording now · ready when the stream ends" | No | No | — |
| Processing | "Processing · ready in a minute" | No | No | — |
| Ready | Thumbnail, duration, "Expires Oct 3"; "96% captured" when it has gaps | Yes | Yes | Download |
| Failed | "Recording failed at 12:40 · 38 min kept" | What was kept | What was kept | Download |

## Screen: `/recordings`

- **Header:** "Recordings" and the result count. No Refresh button: the list updates by itself (P2).
- **Filters (in the URL):** search by title or host (`?q=`), platform (`?platform=`), host (`?host=`, shown as a removable chip with the host's name). Platforms come from the list of supported ones (R17).
- **Sort:** newest first, or longest (`?sort=longest`).
- **Paging:** 20 cards, then **Load more**.
- **Empty states:** "No recordings yet. Hosts you listen to are recorded when they go live." with a link to `/hosts`. A filter that matches nothing says so, with **Clear filters**.

### Recording card

- Thumbnail with platform tag and duration; title (the room title); host name and `@username` · date; size.
- One retention line, and one status line when it's not plain Ready (see the states table).
- Action: **Download**, with a text label or an `aria-label` (P5). An unavailable action stays visible, disabled, with a tooltip that says why (P4).
- A host card's "N recordings" opens this list filtered to the host, and the count matches the list.

## Screen: `/recordings/:id`

- **Two columns on desktop, stacked on phones** (R10). Left: header (Back, platform, title, host, date, retention line), the player, the timeline, and the section list. Right: chapters, then metadata.
- **Player:** fits portrait and landscape video without empty space. On an error it reloads the playlist and resumes at the same time; if that fails, a message with **Retry** and **Download**.
- **Timeline:** recorded spans, gaps as hatched spans (hovering one says why), chapter marks, and the playhead. Handles are big enough to drag on a phone (P6).
- **Chapters:** clicking one jumps the video; the current one is highlighted. Their status shows when they aren't ready (rule 5).
- **Captions:** from the transcript, loaded from our own origin.

### Pages for recordings that aren't there

A link to a recording you can't open gets a page that says what happened, when, and what you can do, never the generic not-found page (R16):

| Case | Page says | Actions |
| --- | --- | --- |
| Expired | "Expired Oct 3: your plan keeps recordings 30 days." | Back to Recordings |
| Not yours, or no such ID | "Recording not found" | Back to Recordings |

## Flows

### 3. Watch, cut, or download a recording

```mermaid
flowchart TD
  entry(["Notification, Overview latest recordings,<br/>/recordings, or a host's 'N recordings' link"]) --> list["/recordings, filtered to the host when opened from one"]
  list --> card{"Card state"}
  card -- "recording now" --> inprog["'Recording now · ready when the stream ends'"]
  card -- ready --> detail["/recordings/:id"]
  detail --> editor["Player + timeline: recorded spans, gaps, chapter marks, playhead<br/>Chapter list beside it (stacked on phones)"]
  editor --> watch["Watch: click the timeline or a chapter to jump"]
  editor --> select["Select a section: drag on the timeline, set start/end at the playhead,<br/>or 'Select chapter'. Edges snap to about 6 s"]
  select --> sections["Section list: '12:00–15:30 · 3m 30s · 42 MB'<br/>Shows 'includes a 40 s gap' when it spans one"]
  sections --> previewsel["Play section to check it"]
  sections --> dlsec["Download section: .mp4 starts at once"]
  sections -- "add another" --> select
  editor --> dlall["Download whole recording: .mp4 starts at once"]
  watch -- "playback error" --> retry["Reload playlist, resume at the same time"]
  retry -- "still failing" --> msg["Message with Retry and Download"]
```

The reference makes you wait for an export and a notification, and its 60-second segments made every seek wait about 25 s on our connection (R29, R30).

### 6. A recording expires

```mermaid
flowchart TD
  ready["Recording ready"] --> line["Card and detail show one retention line: 'Expires Oct 3'"]
  line --> warn["3 days before: notification<br/>'Recording of @host expires Oct 3. Download it to keep it.'"]
  warn --> exp["Retention ends: access ends; files are deleted when no follower still needs them"]
  exp --> card["Recording is automatically removed from the list"]
  exp --> links["Old links open 'Expired Oct 3: your plan keeps recordings 30 days'<br/>with a link to /recordings"]
```

## Feedback

| Event | Toast | Notification | Status on the card |
| --- | --- | --- | --- |
| Recording started | — | "@host went live" · "Recording now." (per settings) | "Recording now" |
| Recording ready | — | "Recording of @host is ready" | Ready |
| Recording failed | — | What failed and what we kept | "Recording failed at 12:40 · 38 min kept" |
| Download | — (the browser shows the download) | — | — |
| Expires in 3 days | — | "Recording of @host expires Oct 3. Download it to keep it." | "Expires Oct 3" |
| Expired | — | — | Leaves the list |

## Edge cases

| Case | What happens |
| --- | --- |
| A section spans a gap | The section row says "includes a 40 s gap" before download; the file skips the gap |
| Two followers of the same host | Each recording leaves its follower's list when their retention ends; shared files stay while anyone still needs them |
| The host is removed | Its recordings stay until they expire; the host filter still works by name |
| A link with the wrong or old URL format | Opens by ID; the platform isn't part of our URL |

## API (fake API first, see roadmap step 2)

`listRecordings(filters, cursor?)`, `getRecording(id)`, `getSectionDownloadUrl(id, startSec, endSec)`. `Recording` carries `playlistUrl`, `subtitlesUrl`, and `downloadUrl` as signed URLs. A recording you can't open answers `404 recording_not_found`, or `410 recording_expired` plus when it happened, so the page can say why.

## Principles check

| Flow | No dead ends (P4) | Nothing disappears silently (P8) | Other |
| --- | --- | --- | --- |
| 3. Watch, cut, download | In-progress cards say why they can't play; playback errors offer Retry and Download | Sections that span a gap say so before download; missing chapters say why | P6 timeline works by touch |
| 6. Expires | Expired links open a page with a way back | Retention line, warning 3 days before, page says when and why (R16) | P7 only followers see it |
