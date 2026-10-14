# LoopCasts web

New website for LoopCasts (video courses, Gent) with the automations built in.
Plan and reasoning per automation: [docs/backend-plan.md](docs/backend-plan.md).

| Part | Status |
|---|---|
| Frontend (React + Vite) | done, design and all pages |
| Database (PostgreSQL) with the real cleaned data | done (step 1) |
| API (Node + Fastify): products, catalog, search, live VIES VAT check | done (step 1) |
| Login, reset, account, orders, n8n workflows, support AI | next steps, still mocked in the UI |

## Run locally

Needs Docker Desktop, Node 22 and Python 3 (pandas, openpyxl).

```bash
cp .env.example .env            # then put real random values in it
npm install
docker compose up -d            # Postgres, n8n (localhost:5678), Mailpit (localhost:8025)
# put the dataset (LoopCasts.zip) unzipped in data/raw/, then:
npm run data:clean              # messy Excel/CSV/SQL -> data/clean/*.csv + docs/data-quality.md
npm run db:migrate              # create tables
npm run db:seed                 # load the clean data
npm run dev                     # site on http://localhost:5173 + API on :3001
```

Demo login (still mocked): any email and a password of 6+ characters.

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

## Data

`scripts/clean_data.py` turns the Dropbox export into tidy tables: dates in 4+ formats, countries written 37 ways,
prices like `€ 149` / `149,00`, levels like `easy`/`Beginner`, and paid status that only existed as a cell colour.
Findings are in [docs/data-quality.md](docs/data-quality.md). The raw dataset and `.env` are never committed.

## Connecting n8n later

All calls go through [`src/lib/api.js`](src/lib/api.js). Each exported function is one webhook. Copy `.env.example` to `.env` and set `VITE_N8N_BASE_URL`; the site then posts JSON to `BASE + path` instead of using mock data. No secrets belong in the frontend: credentials stay in n8n.

The VAT rule (`src/lib/vat.js`) and structured reference (`src/lib/ogm.js`) are mirrored in the browser only for the live price preview. n8n stays the source of truth.

Blue dashed tags on the pages show which webhook a form calls. Hide them with the button in the bottom-left demo bar.

## Design

White canvas, black liquid blobs (SVG goo filter + morphing paths + cursor blob), one accent colour `--accent` in `src/styles.css`. Type: Bricolage Grotesque, Instrument Serif italic accents, Geist Mono labels.

## Stack

Vite + React 18 + React Router. No UI library.
