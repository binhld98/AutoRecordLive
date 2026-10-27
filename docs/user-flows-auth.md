# User flows: accounts

How people sign up, sign in, verify their email, and reset a password on the auth layout pages: `/login`, `/register`, `/verify-email`, `/forgot-password`, and `/reset-password`. The rest of the app (sitemap, recordings) is in [user flows](./user-flows.md). Principles P1–P8 are the product principles in the roadmap.

Flow numbers (8, 9, 10) continue those in user flows.

## Rules

- **Email is the account.** The same email signs in with Google or with a password.
- **Register is email + password only.** Google is on `/login`, and a Google sign-in with an email that has no account creates one, already verified.
- **Nothing works until the email is verified.** A signed-in but unverified user only sees `/verify-email`. Google sign-ins are verified already, and so is anyone who completes a password reset.
- **Google sign-in on an unverified account takes it over.** Google proves the address, so we verify the account and drop its unproven password. This stops someone from registering another person's email first and keeping a way in.
- **Signed out:** every app route sends you to `/login?redirect=<path>`, and signing in returns you there.
- **Signed in, unverified:** every app route shows `/verify-email` until the email is verified, then continues to where you were going.

## Flows

### 8. Sign up and verify

```mermaid
flowchart TD
  reg(["/register"]) --> form["Email, password (inline errors)"]
  form -- "email has an account" --> taken["'This email has an account' + Sign in and Forgot password links"]
  form -- ok --> gate["/verify-email: 'Check your inbox for a link'<br/>Resend, 'Use a different email' (signs out → /register)"]
  gate --> link["Email link → /verify-email?token="]
  link -- valid --> app["/ (or the ?redirect= target)"]
  link -- "expired / used" --> bad["'This link expired' + Resend"]
```

### 9. Sign in

```mermaid
flowchart TD
  visit(["Any app URL while signed out"]) --> login["/login?redirect=path"]
  login --> how{"How?"}
  how -- "Continue with Google" --> google["Google consent"] --> exists{"Email has an account?"}
  exists -- yes --> verified["Signed in; verified now if it wasn't"]
  exists -- no --> created["Account created, already verified"]
  how -- "Email + password" --> check{"Correct?"}
  check -- no --> err["'Email or password is wrong' + Forgot password? link"]
  check -- yes --> isverified{"Email verified?"}
  isverified -- no --> gate["/verify-email (flow 8)"]
  isverified -- yes --> verified
  verified & created --> back["The ?redirect= target, or /"]
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

| Flow | No dead ends (P4) | Nothing disappears silently (P8) | Other |
| --- | --- | --- | --- |
| 8. Sign up and verify | Resend, and 'Use a different email' for a typo | — | — |
| 9. Sign in | Wrong password links to Forgot password; unverified goes to the verify page; redirect returns you | — | — |
| 10. Reset password | Expired link offers a new one | Other sessions are signed out, and the page says so | — |
