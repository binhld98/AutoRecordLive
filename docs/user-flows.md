# User flows and sitemap

How people move through AutoRecordLive, agreed before any screen is drawn (ARL-1). Every design card (ARL-2 to ARL-14) draws its screens from these flows. Routes come from [`fe-arch.md`](./fe-arch.md#application-routes); the principles (P1–P8) are the [product principles](./roadmap.md#product-principles).

## Decisions

- **One limit: recording hours per month.** It resets monthly. Downloads are unlimited (rate-limited against abuse), and storage is capped by hours and retention, so there's no download or storage quota flow. A host followed by several users counts its full length against each follower's hours.
- **Running out of hours pauses listening, it never dead-ends.** Warnings come at 80% and 100%. At the limit, hosts say "No recording time left. Listening resumes on Nov 1." and link to the plan section of `/account`. Its Upgrade button arrives with billing.
- **Removing a host keeps its recordings** until their retention ends. Adding the host again resumes listening.
- **Sign-up:** email + password with email verification, or Google. An unverified account can sign in and look around, but can't add hosts until it verifies.
- **Google and email accounts with the same address are one account.** Google has already verified the address.

## Sitemap

```mermaid
flowchart TD
  subgraph Public["Auth layout (signed out)"]
    login["/login"]
    register["/register"]
    verify["/verify-email?token="]
    forgot["/forgot-password"]
    reset["/reset-password?token="]
  end
  subgraph App["App layout (signed in): sidebar, header with ⌘K search, account menu"]
    overview["/ Overview"]
    hosts["/hosts"]
    add(["Add hosts dialog"])
    recs["/recordings?host="]
    rec["/recordings/:id"]
    notifs["/notifications"]
    nsettings(["Notification settings dialog"])
    account["/account: profile, password, plan & usage, delete account"]
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
  notifs --> nsettings
  notifs -- "notification link" --> rec & hosts & account
```

- Every app route sends a signed-out visitor to `/login?redirect=<path>`, and signing in returns them there.
- A deleted or unknown recording at `/recordings/:id` opens a page that says why it's gone (R16), not the generic not-found page.
- Removed from the reference: `/add` and the export download route. Add hosts is a dialog on `/hosts`, and downloads start at once.

## Core flows

### 1. Follow a host

```mermaid
flowchart TD
  start(["Overview, /hosts, or empty state: 'Add hosts'"]) --> verified{"Email verified?"}
  verified -- no --> needverify["'Verify your email to add hosts' + Resend link"]
  verified -- yes --> paste["Paste a link, @username, or many lines"]
  paste --> hint["Instant hint per line: platform or 'not a link'"]
  hint --> inspect["Pause in typing: server inspects every line"]
  inspect --> row{"Each row"}
  row -- "found" --> preview["Avatar, name, @username, live or not"]
  row -- "username on 2+ platforms" --> pick["Platform picker on the row"] --> preview
  row -- "not found / unsupported" --> err["Friendly reason, row skipped on Add"]
  preview --> will["Row says what Add will do:<br/>'Will start listening' / 'Already in your hosts' /<br/>'Saved, but paused: no recording time left'"]
  will --> addbtn["Add saves every valid row"]
  addbtn --> done["Toast + hosts appear in the list with their status"]
  done --> paused{"Hours left?"}
  paused -- no --> pausedcard["Host shows 'Paused: no recording time left' → /account plan"]
```

### 2. A host goes live and gets recorded

```mermaid
flowchart TD
  check["Monitor checks the host"] --> live{"Live?"}
  live -- no --> idle["'Offline · checked 2m ago'"]
  live -- "check overdue" --> unknown["'Last seen 8d ago' (never a stale 'live')"]
  live -- yes --> rec["Recording starts<br/>Host card: 'Recording', Overview: Live now strip"]
  rec --> notify1["Notification: '@host went live' (per settings)"]
  rec --> during{"During the stream"}
  during -- "stream drops, comes back" --> gap["Same recording continues, gap saved with reason"]
  gap --> during
  during -- "hours run out" --> cut["Recording stops at the limit, kept up to there<br/>'Stopped: no recording time left'"]
  during -- "recorder fails" --> fail["Notification + Overview 'Needs attention':<br/>what failed and what we kept"]
  during -- "stream ends" --> process["Processing: thumbnail, duration, chapters"]
  cut --> process
  process --> ready["Notification: 'Recording of @host is ready' → /recordings/:id"]
```

### 3. Watch or download a recording

```mermaid
flowchart TD
  entry(["Notification, Overview latest recordings,<br/>/recordings, or a host's 'N recordings' link"]) --> list["/recordings (host filter shows as a removable chip)"]
  list --> card{"Card state"}
  card -- "in progress" --> inprog["'Recording now · ready when the stream ends'"]
  card -- "ready" --> detail["/recordings/:id"]
  card -- "expired (hidden unless 'Show expired')" --> expired["Dimmed: 'Expired on Oct 3, plan keeps recordings 30 days'"]
  detail --> play["Player + chapters + coverage bar"]
  play --> gaps["Gaps marked: hover says why ('stream dropped 40 s')"]
  play -- "playback error" --> retry["Reload playlist, resume at same time"]
  retry -- "still failing" --> msg["Message with Retry and Download"]
  detail --> dl["Download: .mp4 starts at once"]
```

## Secondary flows

### 4. Stop, resume, or remove a host

```mermaid
flowchart TD
  card(["Host card or table row"]) --> act{"Action"}
  act -- Stop --> rec{"Recording right now?"}
  rec -- no --> stopped["Toast 'Stopped listening to @host'<br/>Badge 'Paused by you' + Resume"]
  rec -- yes --> confirm["Confirm: 'This ends the current recording. What's recorded so far is kept.'"] --> stopped
  act -- Resume --> hours{"Hours left?"}
  hours -- yes --> listening["Toast + badge back to 'Listening'"]
  hours -- no --> blocked["Resume disabled: 'No recording time left. Resumes on Nov 1.' → /account plan"]
  act -- Remove --> rm["Confirm: 'Remove @host? Its N recordings stay until they expire.'"]
  rm --> removed["Toast; host leaves the list<br/>Recordings still in /recordings, host chip keeps its name"]
```

### 5. A recording expires

```mermaid
flowchart TD
  ready["Recording ready"] --> line["Card and detail show one retention line: 'Expires Oct 3'"]
  line --> warn["3 days before: notification 'Recording of @host expires Oct 3. Download it to keep it.'"]
  warn --> exp["Expired: hidden from /recordings by default, dimmed under 'Show expired'<br/>Detail says why it can't play"]
  exp --> del["Files deleted"]
  del --> gone["Old links open 'Deleted on Oct 10: retention ended'<br/>with a link to /recordings"]
```

### 6. Recording time runs out

```mermaid
flowchart TD
  use["Hours used this month"] --> w80["80%: notification + sidebar usage card turns amber<br/>Overview: 'At this pace your time runs out on Oct 28'"]
  w80 --> w100["100%: notification 'No recording time left'"]
  w100 --> pause["Any recording in progress stops at the limit (flow 2)<br/>Listening pauses on every host"]
  pause --> hostmsg["Hosts: 'No recording time left. Listening resumes on Nov 1.'"]
  hostmsg --> plan["/account plan section: hours used, reset date, retention<br/>(Upgrade button once billing exists)"]
  plan --> resetday["Reset day: listening resumes on its own<br/>(hosts the user stopped stay stopped)"]
```

### 7. Sign up

```mermaid
flowchart TD
  reg(["/register"]) --> how{"How?"}
  how -- "Continue with Google" --> google["Google consent"] --> exists{"Email already has an account?"}
  exists -- yes --> signin["Signed in to that account"]
  exists -- no --> created["Account created, already verified"]
  signin --> app["/ (or the ?redirect= target)"]
  created --> app
  how -- "Email + password" --> form["Email, password (inline errors)"]
  form -- "email taken" --> taken["'This email has an account' + links to Sign in and Forgot password"]
  form --> sent["Signed in; banner 'Check your inbox to verify' + Resend"]
  sent --> app2["/ with Add hosts blocked until verified"]
  sent --> link["Email link → /verify-email?token="]
  link -- valid --> ok["'Email verified' → /"]
  link -- "expired / used" --> bad["'This link expired' + Resend"]
```

### 8. Sign in

```mermaid
flowchart TD
  visit(["Any app URL while signed out"]) --> login["/login?redirect=path"]
  login --> how{"How?"}
  how -- Google --> back["Back to the redirect target"]
  how -- "Email + password" --> check{"Correct?"}
  check -- yes --> back
  check -- no --> err["'Email or password is wrong' + Forgot password? link"]
  back --> start["App start: refresh session, show loading, then the page"]
```

### 9. Reset password

```mermaid
flowchart TD
  forgot(["/forgot-password"]) --> email["Enter email"]
  email --> sent["Always: 'If an account exists, we sent a link' (no account probing)"]
  sent --> link["Email link → /reset-password?token="]
  link -- valid --> newpw["New password"] --> done["'Password changed' → /login<br/>Other sessions signed out"]
  link -- "expired / used" --> bad["'This link expired' + Send a new link"]
```

A Google-only account can use this flow to add a password.

## Principles check

Each flow against **P4 no dead ends** and **P8 nothing disappears silently**, plus any other principle it leans on.

| Flow | No dead ends (P4) | Nothing disappears silently (P8) | Other |
| --- | --- | --- | --- |
| 1. Follow a host | Unverified users get Resend; bad rows say why; paused hosts link to the plan | Rows say exactly what Add will do (R22) | P3 paste anything |
| 2. Goes live, recorded | Failures land in Needs attention with a reason | Gaps, cut-offs, and failures say where, why, and what we kept | P1 status shows how old it is |
| 3. Watch or download | Expired and in-progress cards say why they can't play; playback errors offer Retry and Download | Expired recordings are hidden behind a filter, not removed | P2 lists update on their own |
| 4. Stop / resume / remove | Disabled Resume says why and when it comes back | Stopping mid-recording is confirmed; removing keeps recordings and says so | P5 icon buttons get labels |
| 5. Expires | Deleted links open a page with a way back | Retention line, warning 3 days before, deleted page says when and why (R16) | P7 only followers see it |
| 6. Time runs out | Paused hosts link to the plan and the reset date | Warnings at 80% and 100% before anything stops; forecast on Overview | — |
| 7. Sign up | Taken email links to Sign in and Forgot password; expired link offers Resend | — | — |
| 8. Sign in | Wrong password links to Forgot password; redirect returns you where you were | — | — |
| 9. Reset password | Expired link offers a new one | Other sessions are signed out, and the page says so | — |
