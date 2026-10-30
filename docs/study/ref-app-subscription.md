# Reference app: Subscription

How the reference app shows a user's plan and billing: `/settings/subscription` with its two tabs, Subscription settings and Payment history, what each plan state shows, and how a subscription is cancelled. The [reference app study](./ref-app-study.md) covers the whole app at overview level, including the upgrade page and plan prices. Our plan and usage rules are in the [user flows](../flows/user-flows.md).

Studied on 2026-10-28 with the Free Trial account the overview was studied on: its trial ended on 2026-10-22, and its only transaction is a Pay as you go checkout abandoned on 2026-10-17. Methods: using both tabs in Chrome at 1720 px and in a 390 px frame, reading the JavaScript bundle for the states this account can't reach (Pay as you go, paid, cancelled, past due), timing the page's requests, and making requests fail in the browser to see the error states. No payments: the only step toward checkout was opening the upgrade page from **Upgrade plan**.

## Answers

**What can a free user do here?** Read the plan name and its end date, and press **Upgrade plan**. The page shows nothing about usage, and six days after the trial ended it still says "Free Trial" with "Access until Oct 22, 2026", as if that date were still ahead (R5).

**What can a subscriber do here?** From the code: see the plan, billing cycle, payment method, status, and renewal date, and cancel automatic renewal after a confirmation. When a renewal fails, the only fix is a fresh checkout. They can't undo a cancellation (Reactivate is a disabled button that says to contact support), update a card, get a receipt or invoice, ask for a refund, or change plan from this page (R40, R41).

**What's in Payment history?** Every checkout, paid or not, 10 per page. Ours from Oct 17 is still "Pending" 11 days later (R24). A row shows what was bought, its status, amount, payment method, and date, and nothing opens.

## The page

- `/settings/subscription` and `/settings/subscription/history` are the two tabs. `/subscription` and `/subscription/history` redirect to them; `/settings` alone goes to `/`. The sidebar calls the page "Subscription".
- The tabs are links styled as a pill switch, with `aria-current="page"` on the active one. Each tab has its own header card (badge, title, subtitle, **Refresh**), so the heading changes with the tab.
- The browser tab's title is "AutoRecord Live" here, as on every page.

### Subscription settings

What our Free Trial account showed, top to bottom:

| Part | Shows |
| --- | --- |
| Header card | Badge "Subscription settings", "Manage your current plan and billing status.", "Review your current plan, renewal state, billing status, and payment history without stepping back into the upgrade flow.", **Refresh** |
| Current plan card | "Current plan: Free Trial", "You are currently on the Free Trial plan." |
| Billing status card | "Free Trial", "No active paid subscription." |
| Subscription details | "Billing details", "Subscription details", "Keep this page focused on your current plan, billing state, and account history.", **Upgrade plan**, and four tiles: Plan "Current plan: Free Trial", Paid subscription "No active paid subscription", Status "Free Trial", Access until "Oct 22, 2026" |
| Hint | "Upgrade from this page when you are ready to move beyond the Free Trial plan." |

- "Free Trial" appears six times in the page's content, plus in the sidebar card and the header's account button. The details section repeats the two cards above it.
- The trial ended on Oct 22 (`plan_expires_at` 2026-10-21T23:55Z), and nothing says so. The date has no "ended" state and the status stays "Free Trial" (R5).
- Recording time, listeners, and downloads aren't on the page; only the sidebar card shows them.
- **Upgrade plan** opens `/upgrade?reason=subscription_settings&source=subscription_settings&return_to=%2F`, which starts with "Choose a plan when you're ready to scale up". The page asks to come back to itself, but the app refuses `return_to` paths under `/settings/subscription`, `/upgrade`, and `/payment/success`, so after checkout you land on the streamer list.
- **Refresh** keeps the cards on screen and reloads the plan and subscription.

### Other plan states (from the code)

The page picks its state from the quota's `level` and `effective_entitlement` and from `GET /payments/subscription`:

| State | Current plan card | Billing status card | Details tiles | Actions |
| --- | --- | --- | --- | --- |
| Free Trial (seen) | "Current plan: Free Trial" | "Free Trial", "No active paid subscription." | Paid subscription: none; Access until: the quota's `plan_expires_at` | **Upgrade plan** and the hint |
| Pay as you go | "Current plan: PAYG", "PAYG is a one-time credit package and does not renew automatically." | "No active paid subscription", "Your subscription is active and set to renew automatically." (R39) | Paid subscription: none; "Renews on --" | **Add credits**: "Need more recording time or download traffic? Add another one-time credit package." |
| Paid, renewing | Plan name (Starter, Standard, Premium), "Your current paid plan bills on a Monthly schedule." (or Yearly) | "Active", "Your subscription is active and set to renew automatically." | Payment gateway (Card or PayPal); Renews on: `current_period_end` | **Cancel auto-renew** |
| Paid, cancellation scheduled | Same | "Cancellation scheduled", "Your subscription is cancelled and will remain active until {date}." | Access until: `current_period_end` | "Automatic renewal is already turned off" with a disabled **Reactivate Subscription**, **Contact support**, and "Self-serve reactivation is not available yet." (R40) |
| Paid, past due | Same | "Past due", "A renewal payment failed. Please update billing by starting a fresh checkout." | Renews on | "Billing needs attention" with **Update billing** (the upgrade page, for a new checkout) and **View payment history** |

- Subscription statuses: `pending`, `active`, `past_due`, `cancelled`, `expired`, and `unspecified` ("Unknown"). Any status but past due or a scheduled cancellation gets "set to renew automatically", Cancelled and Expired included (R39).
- The billing cycle comes from the plan ID: `-yearly` means yearly, anything else monthly.
- Only Free Trial gets **Upgrade plan**. Subscribers have no change-plan button here, only the sidebar's **Upgrade Now**, and the upgrade page refuses downgrades and monthly/yearly switches on the same level (R41).
- **Contact support** opens the marketing site's contact page in a new tab.

### Cancel auto-renew

From the code:

1. **Cancel auto-renew** opens a box on the page, not a dialog: "Cancel automatic renewal?", "Your current plan will stay active until {date}.", and "After the billing period ends, listeners may stop again if the Free Trial plan or a lower plan cannot cover your usage." with **Keep Subscription** and **Confirm cancellation**.
2. Confirming calls `POST /payments/subscription/cancel` with the subscription ID; the button says "Cancelling..." meanwhile. On success a toast and a line under the box say "Auto-renew has been cancelled. Your plan stays active until the current period ends." and the page switches to the cancellation-scheduled state. On failure the toast and line show the server's message, or "Unable to cancel auto-renew right now. Please try again."
3. There's no undo: Reactivate is disabled and points to support (R40).

The upgrade page has its own "Manage your active subscription" section with the same **Cancel auto-renew**, and there one click cancels, with no confirmation (R40). The upgrade page also calls the cancel endpoint by itself to close an unfinished subscription checkout ("Close unfinished order").

## Payment history

- **Header card:** badge "Billing history", "Review transactions, refund states, and billing results.", "This page shows your recent subscription transactions, final payment status, and refund processing results.", **Refresh**.
- **List:** 10 per page from `GET /payments/transactions?page=1&page_size=10`, one card per transaction:

| Part | Shows |
| --- | --- |
| Title | `plan_name`, or "Subscription transaction" |
| Status badge | Pending (amber clock), Succeeded or Refunded (green check), Partially refunded (amber), Failed or Unknown (red) |
| Refund badge | A second badge from `refund_status`, once a refund exists |
| Line under the title | "{level} · {cycle}" for a subscription. Anything without a plan level, which means every Pay as you go purchase, gets "Plan details are not available for this transaction." (R24) |
| Amount | `final_amount` in its currency, e.g. "$2.99" |
| Gateway | "Card" (Stripe) or "PayPal" |
| Created at | Local date and time, e.g. "Oct 17, 2026, 08:59 AM" |

- **Footer:** "Page 1 of 1 · 1 transactions" with **Previous** and **Next**, disabled at the ends. The page number isn't in the URL, so a reload returns to page 1.
- **Our account** had one row: the $2.99 Pay as you go checkout by card from Oct 17, still Pending (R24).
- **Rows don't open.** There's no receipt or invoice, no refund button, and nothing says whether a row can be refunded, although the API sends `refundable` and `refund_unavailable_reason`. The upgrade page says "Contact support if you need a refund." (R41)
- **Empty:** "No payment history yet", "Once you complete a checkout, your billing history and refund status will appear here.", and **Back to subscription settings**.
- **Refresh** replaces the list with "Loading payment history..." until the reply arrives.

## Loading and errors

We made the requests fail in the browser to see these:

| Situation | What happens |
| --- | --- |
| First load | A spinner in place of the page: "Loading subscription settings..." or "Loading payment history..." |
| Settings fail to load | The whole page, tabs included, becomes "Unable to load subscription settings" with the error text and **Retry**. The text was the raw "Network Error" (R42) |
| Settings Refresh fails | The old cards stay, and a red toast says "Network Error" |
| Payment history fails | A red box with "Network Error" and no Retry; the header's **Refresh** still works |
| The quota fails | Ignored: the plan falls back to the account's level, and Access until shows "--" |

The code's own messages, such as "Unable to load subscription settings right now. Please try again.", show only when an error has no text, which a network error always has (R42).

## Requests and timing

Opening `/settings/subscription` on 2026-10-28:

| Request | Calls | Time |
| --- | --- | --- |
| `GET /auth/quota` | 4 | 0.26–1.0 s |
| `GET /payments/subscription` | 2 | 0.43–0.69 s |
| `GET /notifications?limit=8&status=all` (header bell) | 1 | 0.43 s |
| `GET /public/system-notice` | 1 | 0.25 s |

**Refresh** sends one quota and one subscription request, about 0.28 s each. Payment history sends one `/payments/transactions` request, 0.3 s. The page is ready in about a second; the extra calls are R7's.

## Phone width

At 390 px everything stacks in one column: the header card with **Refresh** under the text, the tab pills, the two cards, then the details with a full-width **Upgrade plan** and four stacked tiles. Nothing overflows sideways, but the plan starts about 570 px down, below the fold, and a free account's page is 1,620 px tall. History cards put Amount and Gateway side by side with Created at below them, and **Previous** and **Next** fill the width.

## Around the page

- **The sidebar usage card** repeats the plan and "Access until" (see the dashboard study).
- **The upgrade page** (`/upgrade`, in the overview study) repeats this page's subscription details and cancel button in "Manage your active subscription", and links back to Payment history.
- **`/payment/success`**, where checkout returns, trusts its URL: opened directly, without paying, it said "Payment completed successfully. We're waiting for your subscription and quota snapshot to fully catch up before marking everything ready." with Plan status "Processing".

## API

```jsonc
// GET /payments/subscription → { "subscription": null } on our account. A 404 or the code
// payment.subscription_not_found also mean "no subscription". Fields the page reads (from the code):
{ "subscription_id": "…", "plan_id": "…-monthly", "level": "…", "status": "active",
  "cancel_at_period_end": false, "current_period_end": "…", "payment_gateway": "stripe" }

// POST /payments/subscription/cancel { subscription_id } → { subscription } with cancel_at_period_end: true

// GET /payments/transactions?page=1&page_size=10 → { transactions: [...], total }
{
  "transaction_id": "9209…", "transaction_type": "credit_purchase", "purchase_type": "recording_credits",
  "product_id": "recording-credits-10h", "plan_id": "recording-credits-10h", "plan_name": "Pay as you go",
  "plan_level": "", "billing_cycle": "unspecified", "subscription_id": "",
  "status": "pending", "amount": 299, "discount_amount": 0, "final_amount": 299, "currency": "USD",
  "payment_gateway": "stripe", "gateway_invoice_id": "",
  "idempotency_key": "dashboard-recording-credits-<ms>-<uuid>", // names where checkout started
  "refund_status": "unspecified", "refund_id": "", "refundable": false,
  "refund_unavailable_reason": "only succeeded transactions can be refunded",
  "resume_status": "", "resume_result": "", "grant_status": "", "grant_result": "", // the after-payment resume and credit grant
  "created_at": "2026-10-17T01:59:41Z", "updated_at": "2026-10-17T01:59:41Z"
}
// POST /payments/refunds is in the app's API client, but no screen calls it
```

## Issues

From the reference app study's known issues, the ones these screens show:

| # | In short |
| --- | --- |
| R5 | Six days after the trial ended, the page still says "Free Trial" and "Access until Oct 22, 2026" |
| R7 | Refresh on both tabs, and four quota requests per load |
| R12 | Paged by `page` and `page_size`, while the streamer list sends `pageSize` |
| R24 | An unpaid checkout is still "Pending" 11 days later, and every Pay as you go row says "Plan details are not available" |
| R39 | "Set to renew automatically" under Pay as you go, Cancelled, and Expired |
| R40 | Cancel is one click on the upgrade page and can't be undone without support |
| R41 | No receipts, card updates, refund requests, downgrades, or monthly/yearly switches |
| R42 | Errors show the raw "Network Error", and a failed load hides the whole page |

## What this means for us

Our plan lives in `/account`, and billing comes later (the roadmap's Later section). The ones this study tests:

- **Say the plan once, in a sentence with its date:** "Free trial · ends Nov 2", "Trial ended Oct 22", "Starter · renews Nov 28", "Starter · ends Nov 28, auto-renew is off", "Payment failed on Nov 28". Usage sits next to it ("Used 12h of 50h · resets Nov 1", "3 of 5 listeners in use"), and below it the one action that fits. No second section that repeats the first (R5, R39).
- **When billing comes, let the payment provider's hosted billing page do the work.** Stripe's customer portal handles cards, invoices, cancelling and resuming, and plan changes, so we don't half-build them as the reference did (R40, R41).
- **Cancelling asks once, says the end date and what stops after it, and can be undone until then** (R40).
- **Payment history names what was bought** ("Pay as you go · 10 hours", "Starter · monthly") and links each paid row's receipt. Unpaid checkouts expire and show as "Canceled" (R24).
- **After checkout, come back to where you started**, `/account` included, as part of resume after upgrade.
- **Errors use our words and cover only the part that failed.** If billing can't load, `/account` still shows the plan and usage from the quota and says "Couldn't load payment history · Retry" for that part (R42).
