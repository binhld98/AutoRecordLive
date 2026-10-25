# User flows and sitemap

How people move through AutoRecordLive, agreed before any screen is drawn (ARL-1). Every design card (ARL-2 to ARL-14) draws its screens from these flows. Routes come from [`fe-arch.md`](./fe-arch.md#application-routes); the principles (P1–P8) are the [product principles](./roadmap.md#product-principles).

## Decisions

**Hosts and recording**

- **Following a host and recording it are separate.** We check the live status of every host you follow. Each host has **auto-record** on or off: on records every broadcast by itself, off only tells you it's live. You choose when adding hosts (on by default) and can change it any time.
- **You can always record or stop by hand.** **Record now** starts recording a live host from that moment. **Stop recording** ends the current recording and keeps what was captured. After a manual stop, auto-record waits for the next broadcast instead of starting again.
- **Recordings are shared but your actions are yours.** One recorder runs per broadcast for everyone who wants it. Your recording covers the time it recorded for you, your Stop doesn't stop anyone else's, and removing a recording hides it only for you.
- **Removing a host keeps its recordings** until their retention ends. Adding the host again starts fresh with the auto-record choice in the Add dialog.

**Recordings**

- **The recording page is a simple editor.** A timeline under the player shows recorded spans, gaps, and chapters. Select one or more sections and download each as its own `.mp4`, or download the whole recording. Section edges snap to the recording's segments (about 6 s), so the file starts and ends where the timeline shows.
- **Removed recordings go to a recycle bin.** You can restore them. They're deleted for good 30 days after removal, or when their retention ends if that comes first. There's no "delete forever" button.
- **Removing a recording doesn't give back recording time.** Time counts when it's recorded.

**Limits**

- **One limit: recording hours per month.** It resets monthly. Downloads are unlimited (rate-limited against abuse), and storage is capped by hours and retention, so there's no download or storage quota flow.
- **Running out of hours pauses recording, never the app.** Warnings come at 80% and 100%. At the limit, recording stops, auto-record pauses, and Record now is disabled, each saying "No recording time left. Recording resumes on Nov 1." with a link to the plan section of `/account`. Its Upgrade button arrives with billing. Live status keeps updating, because checks don't use hours.
- **Usage lives on the Overview and `/account`, not in the sidebar.**

**Accounts**

- **Email is the account.** The same email signs in with Google or with a password, whichever the user likes.
- **Nothing works until the email is verified.** A signed-in but unverified user only sees `/verify-email`. Google sign-ins are verified already, and so is anyone who completes a password reset.
- **Google sign-in on an unverified account takes it over.** Google proves the address, so we verify the account and drop its unproven password. This stops someone from registering another person's email first and keeping a way in.

## Feedback: toast, notification, or status

A toast isn't a notification. Each kind of feedback has one job:

| Kind | When | Where it lives |
| --- | --- | --- |
| **Toast** | Result of something you just did: hosts added, auto-record turned off, recording removed (with Undo) | Pops up once and disappears. Nothing is stored |
| **Notification** | Something happened without you: host went live, recording ready or failed, recording stopped at the limit, usage at 80% / 100%, recording expires soon | Stored in `/notifications` with an unread badge in the sidebar, plus email or other channels per the notification settings |
| **Status** | What's true right now | On the item itself: badges on host cards, retention line on recording cards |

So adding a host gives a toast and the host appears with its status, but no notification (the reference sends one, R21).

## Sitemap

```mermaid
flowchart TD
  subgraph Public["Auth layout"]
    login["/login"]
    register["/register"]
    verify["/verify-email (signed in but unverified; also opens ?token= links)"]
    forgot["/forgot-password"]
    reset["/reset-password?token="]
  end
  subgraph App["App layout (verified): sidebar nav, header with ⌘K search and account menu"]
    overview["/ Overview, with usage"]
    hosts["/hosts"]
    add(["Add hosts dialog"])
    recs["/recordings?host="]
    bin["/recordings/recycle-bin"]
    rec["/recordings/:id player and editor"]
    notifs["/notifications"]
    nsettings(["Notification settings dialog"])
    account["/account: profile, sign-in methods, password, plan and usage, delete account"]
  end
  notfound["Not found: link to Overview"]

  login <--> register
  login --> forgot --> reset --> login
  register --> verify --> overview
  login -- "?redirect=" --> overview
  overview --> hosts & recs & account
  hosts --> add
  hosts -- "N recordings" --> recs
  recs --> rec
  recs --> bin
  bin -- "Restore" --> recs
  notifs --> nsettings
  notifs -- "notification link" --> rec & hosts & account
```

- **Signed out:** every app route sends you to `/login?redirect=<path>`, and signing in returns you there.
- **Signed in, unverified:** every app route shows `/verify-email` until the email is verified, then continues to where you were going.
- **Sidebar:** Overview, Hosts, Recordings, Notifications (unread badge), Account. No usage card.
- **Recordings that aren't there:** a removed, expired, or deleted recording at `/recordings/:id` opens a page that says what happened, when, and what you can do (Restore, or back to Recordings), not the generic not-found page (R16).
- **Removed from the reference:** `/add` and the export download route. Add hosts is a dialog on `/hosts`, and downloads start at once.

## Host card

Every host card (and table row) answers three questions in words, with an icon beside the text (P5):

| Question | What it shows |
| --- | --- |
| Is it live? | "Live", "Offline · checked 2m ago", or "Last seen 8d ago" when the check is overdue (P1) |
| Is it recording? | "Recording · 12:34" while recording for you |
| Will it record when it goes live? | "Auto-record on", "Auto-record off", or "Auto-record paused: no recording time left" |

Actions: **Record now** (live and not recording), **Stop recording** (recording), the **auto-record** switch, **Remove**, and the "N recordings" link to its recordings. An unavailable action stays visible, disabled, with a tooltip that says why (P4).

## Core flows

### 1. Follow a host

```mermaid
flowchart TD
  start(["Overview, /hosts, or empty state: 'Add hosts'"]) --> paste["Paste a link, @username, or many lines"]
  paste --> hint["Instant hint per line: platform or 'not a link'"]
  hint --> inspect["Pause in typing: server inspects every line"]
  inspect --> row{"Each row"}
  row -- "found" --> preview["Avatar, name, @username, live or not"]
  row -- "username on 2+ platforms" --> pick["Platform picker on the row"] --> preview
  row -- "not found / unsupported" --> err["Friendly reason, row skipped on Add"]
  preview --> auto["Switch for all rows: 'Record automatically when live' (on by default)"]
  auto --> will["Row says what Add will do:<br/>'Will record when live' / 'Will follow without recording' /<br/>'Already in your hosts' / 'Saved, but no recording time left'"]
  will --> addbtn["Add saves every valid row"]
  addbtn --> done["Toast 'Added 3 hosts'; hosts appear with their status"]
  done --> live{"Host live right now?"}
  live -- "yes, auto-record on" --> recnow["Recording starts at once (flow 2)"]
  live -- "yes, auto-record off" --> offer["Card shows 'Live' with Record now"]
  live -- no --> waits["Card waits: 'Offline · checked just now'"]
```

### 2. A host goes live and gets recorded

```mermaid
flowchart TD
  check["Monitor checks the host"] --> live{"Live?"}
  live -- no --> idle["'Offline · checked 2m ago'"]
  live -- "check overdue" --> unknown["'Last seen 8d ago' (never a stale 'Live')"]
  live -- yes --> wentlive["Card: 'Live'; Overview: Live now strip<br/>Notification '@host went live' (per settings)"]
  wentlive --> auto{"Auto-record on and hours left?"}
  auto -- yes --> rec["Recording starts by itself: 'Recording · 0:00'"]
  auto -- "no, auto-record off" --> manual["Record now on the card and in the notification"]
  manual -- "user clicks" --> rec
  auto -- "no hours left" --> blocked["Record now disabled: 'No recording time left. Recording resumes on Nov 1.'"]
  rec --> during{"During the stream"}
  during -- "user clicks Stop recording" --> stopped["Toast 'Recording stopped, 42 min kept'<br/>Auto-record waits for the next broadcast"]
  during -- "stream drops, comes back" --> gap["Same recording continues, gap saved with its reason"]
  gap --> during
  during -- "hours run out" --> cut["Stops at the limit, kept up to there (flow 7)"]
  during -- "recorder fails" --> fail["Notification + Overview 'Needs attention':<br/>what failed and what we kept"]
  during -- "stream ends" --> process["Processing: thumbnail, duration, chapters"]
  stopped --> process
  cut --> process
  process --> ready["Notification 'Recording of @host is ready' → /recordings/:id"]
```

### 3. Watch, cut, or download a recording

```mermaid
flowchart TD
  entry(["Notification, Overview latest recordings,<br/>/recordings, or a host's 'N recordings' link"]) --> list["/recordings (host filter shows as a removable chip)"]
  list --> card{"Card state"}
  card -- "recording now" --> inprog["'Recording now · ready when the stream ends'"]
  card -- "expired (hidden unless 'Show expired')" --> expired["Dimmed: 'Expired Oct 3 after 30 days' (flow 6)"]
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

Gaps show on the timeline as hatched spans; hovering one says why ("stream dropped for 40 s, reconnected"). The timeline's handles are big enough to drag on a phone (P6).

## Secondary flows

### 4. Manage a host

```mermaid
flowchart TD
  card(["Host card or table row"]) --> act{"Action"}
  act -- "Auto-record off" --> off["Toast 'Won't record @host automatically'<br/>Badge 'Auto-record off'; a recording in progress continues"]
  act -- "Auto-record on" --> hours{"Hours left?"}
  hours -- yes --> on["Toast; badge 'Auto-record on'<br/>If live now and not recording, recording starts"]
  hours -- no --> paused["Badge 'Auto-record paused: no recording time left'<br/>Resumes on its own on Nov 1"]
  act -- "Record now / Stop recording" --> flow2["Flow 2"]
  act -- Remove --> recording{"Recording right now?"}
  recording -- no --> rm["Confirm: 'Remove @host? Its N recordings stay until they expire.'"]
  recording -- yes --> rmrec["Confirm also says: 'This stops the current recording. What's recorded so far is kept.'"]
  rmrec --> rm
  rm --> removed["Toast; host leaves the list<br/>Its recordings stay in /recordings, the host chip keeps its name"]
```

### 5. Remove and restore a recording

```mermaid
flowchart TD
  card(["Recording card or detail page: Remove"]) --> state{"Still recording?"}
  state -- yes --> disabled["Remove disabled: 'Stop recording first'"]
  state -- no --> moved["Moved to the recycle bin<br/>Toast 'Moved to recycle bin' with Undo"]
  moved -- Undo --> back["Back in /recordings"]
  moved --> binlist["/recordings/recycle-bin: each row says 'Deleted for good on Nov 24'<br/>(30 days, or retention end if sooner)"]
  binlist -- Restore --> restored["Toast; back in /recordings with its original retention"]
  binlist -- "date reached" --> gone["Deleted for good<br/>Old links open 'Deleted on Nov 24: removed by you'"]
  moved -. "link opened while in the bin" .-> inbin["Page 'In the recycle bin since Oct 25' with Restore"]
```

Only you lose the recording. Other followers of the host keep theirs.

### 6. A recording expires

```mermaid
flowchart TD
  ready["Recording ready"] --> line["Card and detail show one retention line: 'Expires Oct 3'"]
  line --> warn["3 days before: notification<br/>'Recording of @host expires Oct 3. Download it to keep it.'"]
  warn --> exp["Retention ends: files deleted"]
  exp --> card["Card stays dimmed under 'Show expired' and says why it can't play"]
  exp --> links["Old links open 'Expired Oct 3: your plan keeps recordings 30 days'<br/>with a link to /recordings"]
```

### 7. Recording time runs out

```mermaid
flowchart TD
  use["Hours used this month"] --> w80["80%: notification<br/>Overview usage: 'At this pace your time runs out on Oct 28'"]
  w80 --> w100["100%: notification 'No recording time left'"]
  w100 --> stop["Recordings in progress stop at the limit, kept up to there"]
  stop --> pause["Auto-record pauses on every host; Record now disabled<br/>Both say 'Recording resumes on Nov 1' → /account plan section"]
  pause --> checks["Live status keeps updating"]
  pause --> plan["/account plan section: hours used, reset date, retention<br/>(Upgrade button once billing exists)"]
  plan --> resetday["Reset day: auto-record resumes on hosts that had it on"]
```

### 8. Sign up and verify

```mermaid
flowchart TD
  reg(["/register"]) --> how{"How?"}
  how -- "Continue with Google" --> google["Google consent"] --> exists{"Email has an account?"}
  exists -- "yes" --> signin["Signed in to it; verified now if it wasn't"]
  exists -- no --> created["Account created, already verified"]
  signin --> app["/ (or the ?redirect= target)"]
  created --> app
  how -- "Email + password" --> form["Email, password (inline errors)"]
  form -- "email has an account" --> taken["'This email has an account' + Sign in and Forgot password links"]
  form -- ok --> gate["/verify-email: 'Check your inbox for a link'<br/>Resend, 'Use a different email' (signs out → /register)"]
  gate --> link["Email link → /verify-email?token="]
  link -- valid --> app
  link -- "expired / used" --> bad["'This link expired' + Resend"]
```

### 9. Sign in

```mermaid
flowchart TD
  visit(["Any app URL while signed out"]) --> login["/login?redirect=path"]
  login --> how{"How?"}
  how -- Google --> verified["Signed in (Google means verified)"]
  how -- "Email + password" --> check{"Correct?"}
  check -- no --> err["'Email or password is wrong' + Forgot password? link"]
  check -- yes --> isverified{"Email verified?"}
  isverified -- no --> gate["/verify-email (flow 8)"]
  isverified -- yes --> verified
  verified --> back["App start: refresh session, show loading, then the redirect target"]
```

The error never says whether the email exists or signs in with Google only.

### 10. Reset password

```mermaid
flowchart TD
  forgot(["/forgot-password"]) --> email["Enter email"]
  email --> sent["Always: 'If an account exists, we sent a link' (no account probing)"]
  sent --> link["Email link → /reset-password?token="]
  link -- valid --> newpw["New password"] --> done["'Password changed' → /login<br/>Email verified; other sessions signed out"]
  link -- "expired / used" --> bad["'This link expired' + Send a new link"]
```

This is also how a Google-only account adds a password. `/account` lists the sign-in methods an account has.

## Principles check

Each flow against **P4 no dead ends** and **P8 nothing disappears silently**, plus any other principle it leans on.

| Flow | No dead ends (P4) | Nothing disappears silently (P8) | Other |
| --- | --- | --- | --- |
| 1. Follow a host | Bad rows say why; hosts saved without time left say so and link to the plan | Rows say exactly what Add will do (R22) | P3 paste anything |
| 2. Goes live, recorded | Auto-record off still offers Record now; disabled Record now says why and when | Manual stops, gaps, cut-offs, and failures say what we kept | P1 status shows how old it is |
| 3. Watch, cut, download | Expired and in-progress cards say why they can't play; playback errors offer Retry and Download | Sections that span a gap say so before download | P6 timeline works by touch |
| 4. Manage a host | Disabled actions say why | Removing a host says its recordings stay; removing while recording says what's kept | P5 every badge is text, not just an icon |
| 5. Remove a recording | Undo, Restore, and a page for links to removed recordings | Every bin row shows the day it's deleted for good | P7 removal affects only you |
| 6. Expires | Expired links open a page with a way back | Retention line, warning 3 days before, page says when and why (R16) | P7 only followers see it |
| 7. Time runs out | Paused hosts link to the plan and the reset date | Warnings at 80% and 100% before anything stops; forecast on Overview | P1 live status keeps updating |
| 8. Sign up and verify | Resend, and 'Use a different email' for a typo | — | — |
| 9. Sign in | Wrong password links to Forgot password; unverified goes to the verify page; redirect returns you | — | — |
| 10. Reset password | Expired link offers a new one | Other sessions are signed out, and the page says so | — |
