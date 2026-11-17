# LoopCasts automation project

Course project for *Automation Tools*. LoopCasts BV is a small company in Ghent that sells video
courses on automation. Almost everything behind the shop is done by hand: orders arrive by e-mail,
invoices are typed in Excel, payments are checked on the bank website and logins are created one by
one. This project automates that chain and gives the team an admin panel for the exceptions.

| Folder | What it is |
| --- | --- |
| `web/` | The website: course shop, member area and admin panel (React + Vite) |

Coming next: the back end (database, n8n workflows, local mail) running in Docker.

## Run the website

```bash
cd web
npm install
npm run dev
```

Then open http://localhost:5173. See `web/README.md` for details.

## Not real

LoopCasts, its customers and its numbers are invented for the course. Payments are simulated; no
bank or payment provider is connected.
