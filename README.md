# LoopCasts automation project

Course project for *Automation Tools*. LoopCasts BV is a small company in Ghent that sells video
courses on automation. Almost everything behind the shop is done by hand: orders arrive by e-mail,
invoices are typed in Excel, payments are checked on the bank website and logins are created one by
one. This project automates that chain and gives the team an admin panel for the exceptions.

| Folder | What it is |
| --- | --- |
| `web/` | The website: course catalogue, order form, member area and admin panel (React + Vite) |
| `n8n/workflows/` | The n8n workflows (imported into n8n automatically on the first start) |
| `db/` | PostgreSQL: schema (`migrations/`), first-start script (`init/`), data (`seed/`) |
| `scripts/clean_data.py` | Turns the messy LoopCasts export (Excel, CSV, SQL) into clean CSV files |
| `docs/` | Back-end plan and the data quality report |
| `docker-compose.yml` | Postgres, n8n and Mailpit in one command |

## The automations

| Workflow | Trigger | What it does |
| --- | --- | --- |
| **1. New order → invoice → e-mail** | Webhook (the order form on the site) | Checks the order again, checks the VAT number in **VIES**, applies the VAT rules, saves customer and order in **Postgres**, has the database hand out the invoice number (no gaps, no duplicates), e-mails the invoice with a structured reference (**SMTP**), answers the site. If VIES does not answer, the order still goes through and the team gets an e-mail |
| **2. Bank statement → payments → access** | n8n form: upload the KBC export (CSV) | Saves the bank lines (a file imported twice changes nothing), matches each payment: structured reference, invoice number in the message, amount and name. Paid invoices get an account and access with an end date, and the customer a welcome e-mail. Partial payments and unknown payments go to a person |
| **0. Error handler** | Any workflow that fails | Logs the failure in `automation_errors` and e-mails the team with a link to the failed run |
| 9. Demo: fake KBC bank export | `GET /webhook/demo-bank-export` | Only for the demo: there is no real bank connection, so this makes the CSV the bank would give for the newest open invoices |

Integrations: EU VIES (VAT check), PostgreSQL, SMTP (Mailpit locally). No secrets are stored in
the workflows: the credentials are created from `.env` on the first start.

## Run it

Needs Docker Desktop and Node.js 20 or newer.

```bash
cp .env.example .env              # put your own random values in it
docker compose up -d              # Postgres, n8n, Mailpit; the first start takes a minute
```

| Open | For |
| --- | --- |
| http://localhost:5678 | n8n. On the first visit you create your own login. The workflows are already there and published |
| http://localhost:8025 | Mailpit: every e-mail the workflows send |
| http://localhost:5678/form/bank-statement | Upload a bank statement (workflow 2) |
| http://localhost:5678/webhook/demo-bank-export | Download a demo bank statement for the open invoices |

The website sends orders to n8n when `web/.env.local` contains the webhook address:

```bash
cd web
echo VITE_ORDER_WEBHOOK_URL=http://localhost:5678/webhook/order > .env.local
npm install
npm run dev                       # http://localhost:5173
```

Without `.env.local` the site runs in demo mode and keeps everything in the browser.

### With the real LoopCasts data

Put the unzipped dataset in `data/raw/` (so that `data/raw/dropbox/` exists), then run
`python scripts/clean_data.py` (needs pandas and openpyxl) before the first `docker compose up`.
The database then starts with the 2,075 customers, 1,554 invoices and the bank history of 2026,
and new invoice numbers continue after the last one in `Facturen 2026.xlsx`. Without it the
database starts with products and prices only. Start again from zero with
`docker compose down -v && docker compose up -d`.

## Not real

LoopCasts, its customers and its numbers are invented for the course. Payments are simulated; no
bank or payment provider is connected.
