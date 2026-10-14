# LoopCasts user flows

Legend: **[U]** user on the site · **[n8n]** automation (webhook or scheduled workflow) · **[Team]** a person on the LoopCasts team.
The same flows are rendered on the site at `/flows`.

## 1. Visitor → order → payment pending → access (core chain)

| # | Who | Step | Screen / webhook |
|---|---|---|---|
| 1 | U | Browses the catalog, watches a free lesson | `/courses`, `/courses/:slug/:lesson` |
| 2 | U | Picks a plan (monthly, yearly, team seats) | `/order` step 1 |
| 3 | U | Enters details, private or company | `/order` step 2 |
| 4 | n8n | Checks the VAT number in VIES while typing. If VIES is down the order is kept as "VAT not checked" and the team verifies it | `POST /webhook/vat/check` |
| 5 | U | Reviews, applies a promo code, accepts terms, places order | `/order` step 3, `POST /webhook/promo/check` |
| 6 | n8n | Saves the order, takes the next invoice number atomically, applies the VAT rule, renders the PDF, emails it with the Belgian structured reference (+++xxx/xxxx/xxxxx+++) | `POST /webhook/order/create` |
| 7 | U | Sees "payment pending" with IBAN, amount and the reference; downloads the invoice | `/order/:id` (polls `POST /webhook/order/status`) |
| 8 | n8n | Daily bank import: match on reference, then amount + name | scheduled |
| 9 | Team | Only unsure matches go to a person | n8n task / email |
| 10 | n8n | Marks the invoice paid, creates the account, emails a set-password link | scheduled → email |
| 11 | U | Sets a password and starts learning | `/reset-password?token=…&welcome=1` → `/account` |
| 12 | n8n | Reminders for unpaid invoices after 7 / 14 / 30 days | scheduled |

## 2. Password reset

| # | Who | Step | Screen / webhook |
|---|---|---|---|
| 1 | U | Enters email | `/forgot-password` |
| 2 | n8n | Sends a one-time token (1 h). Same answer for every address, so the form never reveals who has an account | `POST /webhook/auth/reset-request` |
| 3 | U | Opens the link, sets a new password (10+ chars) | `/reset-password?token=…` |
| 4 | n8n | Validates and burns the token, stores the bcrypt hash | `POST /webhook/auth/reset-confirm` |
| 5 | U | Logs in | `/login` |

## 3. Support request (AI component)

| # | Who | Step | Screen / webhook |
|---|---|---|---|
| 1 | U | Tries self-service first: reset, invoices, order status | `/support` cards |
| 2 | U | Sends the form: email, topic, optional order or invoice number, message (EN/NL) | `/support` |
| 3 | n8n | Creates a ticket, AI classifies topic and language, pulls order data, writes a draft answer | `POST /webhook/support/create` |
| 4 | Team | Approves or edits the draft. Refunds and cancellations are always decided by a person | n8n approval step |
| 5 | n8n | Sends the reply from the ticket, tracks the 1-business-day SLA | |

## 4. Newsletter double opt-in

| # | Who | Step | Screen / webhook |
|---|---|---|---|
| 1 | U | Enters email and ticks consent | footer form |
| 2 | n8n | Sends a confirmation mail through the mailing service | `POST /webhook/newsletter/subscribe` |
| 3 | U | Clicks the link | `/newsletter/confirm?token=…` |
| 4 | n8n | Adds to the list, stores consent | `POST /webhook/newsletter/confirm` |
| 5 | U | Unsubscribes in one click from any mail | `/newsletter/unsubscribe?token=…` |

## 5. Renewal and team seats

| # | Who | Step | Screen / webhook |
|---|---|---|---|
| 1 | n8n | Reminder 30 and 7 days before the end | scheduled |
| 2 | U | Renews in one click | `/account/subscription`, `POST /webhook/subscription/renew` |
| 3 | n8n | New invoice, same chain as an order | |
| 4 | U | Invites or removes colleagues | `/account/team`, `POST /webhook/account/seats` |
| 5 | n8n | No payment after the end date: access paused, progress kept | scheduled |

## Out of scope for automation

Course creation and editing, workshop proposals, refund decisions.
