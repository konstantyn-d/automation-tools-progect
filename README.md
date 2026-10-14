# LoopCasts web (frontend)

New website for LoopCasts (video courses, Gent). This is the frontend only: it runs on mock data and every place where an n8n workflow will plug in is marked.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Demo login: any email and a password of 6+ characters.

## Pages

| Route | What | Automation behind it |
|---|---|---|
| `/` | Home | |
| `/courses`, `/courses/:slug`, `/courses/:slug/:lesson` | Catalog, course and lesson pages from one data source, transcript, EN/NL subtitles | catalog DB, Whisper transcripts |
| `/search` | Search inside video transcripts, jumps to the second | transcript index |
| `/pricing` | Plans | |
| `/order` | 3-step order: plan, details with live VIES VAT check, promo code | `vat/check`, `promo/check`, `order/create` |
| `/order/:id` | Payment pending: IBAN, structured reference (+++), invoice PDF, status timeline | `order/status`, bank matching |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth and self-service reset | `auth/*` |
| `/account/*` | Overview, invoices (PDF), billing details (VAT/PO), team seats, subscription with one-click renewal | `account`, `account/billing`, `account/seats`, `subscription/renew` |
| `/support` | Self-service shortcuts + support form | `support/create` (AI triage, human approves) |
| `/newsletter/confirm`, `/newsletter/unsubscribe` | Double opt-in and one-click unsubscribe | `newsletter/*` |
| `/flows` | User flows and the webhook map, for the team | |

User flows in text: [docs/user-flows.md](docs/user-flows.md).

## Connecting n8n later

All calls go through [`src/lib/api.js`](src/lib/api.js). Each exported function is one webhook. Copy `.env.example` to `.env` and set `VITE_N8N_BASE_URL`; the site then posts JSON to `BASE + path` instead of using mock data. No secrets belong in the frontend: credentials stay in n8n.

The VAT rule (`src/lib/vat.js`) and structured reference (`src/lib/ogm.js`) are mirrored in the browser only for the live price preview. n8n stays the source of truth.

Blue dashed tags on the pages show which webhook a form calls. Hide them with the button in the bottom-left demo bar.

## Design

White canvas, black liquid blobs (SVG goo filter + morphing paths + cursor blob), one accent colour `--accent` in `src/styles.css`. Type: Bricolage Grotesque, Instrument Serif italic accents, Geist Mono labels.

## Stack

Vite + React 18 + React Router. No UI library.
