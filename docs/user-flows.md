# User flows and sitemap

How people move through AutoRecordLive, agreed before any screen is drawn (ARL-1). Every design card (ARL-2 to ARL-14) draws its screens from these flows. Routes come from [`fe-arch.md`](./fe-arch.md); the principles (P1–P8) are the [product principles](./roadmap.md).

## Decisions

**Hosts and listeners:** see the [hosts user flows](./user-flows-hosts.md): listening, active listeners, live checks, recording, and removing hosts.

**Recordings**

- **The recording page is a simple editor** (flow 3). Select one or more sections on the timeline and download each as its own `.mp4`, or download the whole recording. Section edges snap to the recording's segments (about 6 s), so the file starts and ends where the timeline shows.
- **Removed recordings go to a recycle bin** (flow 5). You can restore them. They're deleted for good after 30 days, or when their retention ends if that's sooner. There's no "delete forever" button.
- **Removing a recording doesn't give back recording time.** Time counts when it's recorded.
- **Removing a recording hides it only for you.** Recordings are shared per broadcast, so others who follow the host keep theirs.

**Limits and usage**

- **Two limits: recording hours per month and active listeners.** Hours reset monthly. Downloads are unlimited (rate-limited against abuse), and storage is capped by hours and retention, so there's no download or storage quota.
- **Running out of hours pauses recording, never the app** (flow 7).
- **Usage shows on the Overview and `/account` only.** The one exception is the listener count, which `/hosts` also shows because that's where listening is managed. Anywhere else, a limit appears only where it blocks something, saying why, with a link to the plan in `/account`. That page gets an Upgrade button once billing exists.

**Accounts**

- **Email is the account.** The same email signs in with Google or with a password.
- **Nothing works until the email is verified.** A signed-in but unverified user only sees `/verify-email`. Google sign-ins are verified already, and so is anyone who completes a password reset.
- **Google sign-in on an unverified account takes it over.** Google proves the address, so we verify the account and drop its unproven password. This stops someone from registering another person's email first and keeping a way in.

## Feedback: toast, notification, or status

A toast isn't a notification. Each kind of feedback has one job:

| Kind | When | Where it lives |
| --- | --- | --- |
| **Toast** | Result of something you just did: hosts added, a host started or stopped listening, recording removed (with Undo) | Pops up once and disappears. Nothing is stored |
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
    overview["/ Overview"]
    hosts["/hosts"]
    add(["Add hosts dialog"])
    recs["/recordings"]
    bin["/recordings/recycle-bin"]
    rec["/recordings/:id player and editor"]
    notifs["/notifications"]
    nsettings(["Notification settings dialog"])
    account["/account: profile, sign-in methods, password, plan, delete account"]
  end
  notfound["Not found: link to Overview"]

  login <--> register
  login --> forgot --> reset --> login
  register --> verify --> overview
  login -- "?redirect=" --> overview
  overview --> hosts & recs & account
  hosts --> add
  hosts -- "N recordings, filtered to the host" --> recs
  recs --> rec
  recs --> bin
  bin -- "Restore" --> recs
  notifs --> nsettings
  notifs -- "notification link" --> rec & hosts & account
```

- **Signed out:** every app route sends you to `/login?redirect=<path>`, and signing in returns you there.
- **Signed in, unverified:** every app route shows `/verify-email` until the email is verified, then continues to where you were going.
- **Sidebar:** Overview, Hosts, Recordings, Notifications (unread badge), Account.
- **Recordings filters:** which filters `/recordings` has, and their URL params, aren't decided yet.
- **Recordings that aren't there:** a removed, expired, or deleted recording at `/recordings/:id` opens a page that says what happened, when, and what you can do (Restore, or back to Recordings), not the generic not-found page (R16).
- **Removed from the reference:** `/add` and the export download route. Add hosts is a dialog on `/hosts`, and downloads start at once.

## Core flows

Flows 1 (Follow a host) and 2 (A host goes live and gets recorded) are in the hosts user flows.

### 3. Watch, cut, or download a recording

```mermaid
flowchart TD
  entry(["Notification, Overview latest recordings,<br/>/recordings, or a host's 'N recordings' link"]) --> list["/recordings, filtered to the host when opened from one"]
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

Flow 4 (Manage a host) is in the hosts user flows.

### 5. Remove and restore a recording

```mermaid
flowchart TD
  card(["Recording card or detail page: Remove"]) --> state{"Still recording?"}
  state -- yes --> disabled["Remove disabled: 'Still recording. You can remove it when the recording ends.'"]
  state -- no --> moved["Moved to the recycle bin<br/>Toast 'Moved to recycle bin' with Undo"]
  moved -- Undo --> back["Back in /recordings"]
  moved --> binlist["/recordings/recycle-bin: each row says 'Deleted for good on Nov 24'"]
  binlist -- Restore --> restored["Toast; back in /recordings with its original retention"]
  binlist -- "date reached" --> gone["Deleted for good<br/>Old links open 'Deleted on Nov 24: removed by you'"]
  moved -. "link opened while in the bin" .-> inbin["Page 'In the recycle bin since Oct 25' with Restore"]
```

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
  use["Hours used this month"] --> w80["80%: notification<br/>Usage forecast: 'At this pace your time runs out on Oct 28'"]
  w80 --> w100["100%: notification 'No recording time left'"]
  w100 --> stop["Recordings in progress stop at the limit, kept up to there"]
  stop --> pause["Recording pauses: listening hosts say<br/>'Recording resumes on Nov 1' with a link to the plan"]
  pause --> keep["Hosts keep listening and keep their listener; live status keeps updating"]
  keep --> resetday["Reset day: listening hosts record again"]
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

Each flow against **P4 no dead ends** and **P8 nothing disappears silently**, plus any other principle it leans on. Flows 1, 2, and 4 are checked in the hosts user flows.

| Flow | No dead ends (P4) | Nothing disappears silently (P8) | Other |
| --- | --- | --- | --- |
| 3. Watch, cut, download | Expired and in-progress cards say why they can't play; playback errors offer Retry and Download | Sections that span a gap say so before download | P6 timeline works by touch |
| 5. Remove a recording | Undo, Restore, and a page for links to removed recordings | Every bin row shows the day it's deleted for good | P7 removal affects only you |
| 6. Expires | Expired links open a page with a way back | Retention line, warning 3 days before, page says when and why (R16) | P7 only followers see it |
| 7. Time runs out | Paused hosts say when recording resumes and link to the plan | Warnings at 80% and 100% before anything stops, plus a forecast | P1 live status keeps updating |
| 8. Sign up and verify | Resend, and 'Use a different email' for a typo | — | — |
| 9. Sign in | Wrong password links to Forgot password; unverified goes to the verify page; redirect returns you | — | — |
| 10. Reset password | Expired link offers a new one | Other sessions are signed out, and the page says so | — |
