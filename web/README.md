# LoopCasts web

Website for LoopCasts BV, the fictional video-course company from the *Automation Tools* case.
This repository holds the public site. The automations themselves (n8n) are added in the next
milestones and plug into the places that are already prepared here.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

`npm run build` makes the production version in `dist/`.

## What is in here

The site is a shop for video courses. Visitors browse courses, watch the first lesson of each one
for free, order, and then watch everything in their account. The automation stays behind the
scenes: customers never see it, the team sees it in the admin panel.

| Page | What it does |
| --- | --- |
| `/` | Landing page: courses, how learning works, prices, FAQ |
| `/courses` | Catalogue of all 60 courses: search (press `/`), topic, level, sort. Filters live in the URL |
| `/courses/:slug` | One course: summary, what you learn, all lessons, buy this course on its own |
| `/courses/:slug/:nr` | One lesson: player, chapters, transcript. Locked lessons show the offer instead |
| `/order` | Order form with validation and VAT |
| `/login` | Sign in and "forgot password" |
| `/account` | Member area: progress per course, subscription, invoices, profile |
| `/admin` | Admin panel overview: numbers, what needs a person, revenue, test run of the order chain |
| `/admin/orders` | Every order with its five steps. Approve an order that stopped, retry a failed step |
| `/admin/invoices` | Invoices with a gap and double check, invoice preview, reminders |
| `/admin/payments` | Import a bank export (CSV), run payment matching, match the rest by hand |
| `/admin/members` | Who has access until when, renew, close or open access |
| `/admin/support` | Support inbox: category, language, facts found, draft answer to approve |

```
src/
  main.jsx            entry point: fonts, global styles, router, session
  App.jsx             routes and the navigation bar
  pages/              one file per page
  sections/           the blocks of the landing page, top to bottom
  components/         shared pieces: navigation, course cover, lesson list, player, pipeline, pixel art
  pages/admin/        the six admin screens and their frame
  components/admin/   shared admin pieces: tabs, search, drawer, status labels
  components/DemoSwitch.jsx   TEMPORARY: view the site as visitor, member or staff
  data/courses.js     the 60 courses with their lessons
  data/site.js        plans, FAQ
  data/member.js      the sample member and the sample staff person
  data/admin.js       sample month for the admin: customers, orders, invoices, bank, members, mails
  lib/adminStore.jsx  admin data and every admin action (later: API calls)
  lib/matching.js     payment matching rules and the bank CSV reader
  lib/invoice.js      invoice numbers and Belgian structured references (mod 97)
  lib/search.jsx      catalogue search
  lib/session.jsx     who is signed in, and the rule that decides if a lesson plays
  lib/vat.js          VAT rules from the finance handbook
  lib/pipeline.js     the order chain as data (see below)
  styles/             CSS per section or page, global.css holds the design tokens
```

## What is still pretend

This is the front end. These things are stand-ins until the back end and n8n are connected:

- **Accounts.** Any e-mail and password sign you in as a sample member (`data/member.js`).
  The session is kept in the browser. `lib/session.jsx` is the only file that has to change.
- **Payment.** After an order the button "Demo: the payment arrived" creates the account, so the
  whole journey can be shown. In the real flow n8n does this when the bank transfer is matched.
- **Admin data.** `data/admin.js` builds a believable month of orders, invoices, bank lines,
  members and support mails, dated relative to today. Every button in the admin changes it through
  `lib/adminStore.jsx`, and the changes stay in the browser ("Reset sample data" starts over).
  A demo order on the site shows up in the admin as a new order with its own invoice.
- **Roles.** The dark switch bottom left (Visitor / Member / Staff) is temporary. It can be hidden
  and goes away when real accounts exist. `/admin` only opens for staff.
- **Video.** The player keeps time, chapters and "watched", but shows an animation instead of a
  video file. `components/Player.jsx` says where the real embed goes.

Who may watch what is decided in one place, `canWatch()` in `lib/session.jsx`: lesson 1 of every
course is free, a subscription or team licence opens everything until its end date, a single
course opens that one course for good.

Plain React with plain CSS. No UI kit and no animation library: the animations are CSS keyframes
and the pixel art is SVG rectangles drawn in code.

## How the site connects to the automation

The goal of the project is to automate the chain **order → invoice → payment → access**.
Two places in this code are the connection points.

**1. The order form (`src/pages/Order.jsx`) is the trigger.**
It collects exactly what an invoice needs, so no order arrives incomplete. On submit it builds one
JSON object and sends it with `POST` to the URL in `VITE_ORDER_WEBHOOK_URL`.

Copy `.env.example` to `.env` and fill in the n8n webhook URL to switch it on.
While the variable is empty the form runs in demo mode: it validates, sends nothing and shows the
JSON it would have sent.

If the webhook does not answer, the customer sees a clear message and keeps what was typed.

**2. The admin panel (`/admin`) handles the exceptions.**
Every action in `lib/adminStore.jsx` is one thing the back end or n8n will do: make the next
invoice number, send a reminder, match a bank line, give access. The screens call these actions
and do not know where the data comes from, so the swap to a real API stays in one file.

Payment matching (`lib/matching.js`) decides in this order:

1. The structured reference belongs to an open invoice and the amount is equal: matched.
   Too little, too much or paid twice: a person checks.
2. The message holds an invoice number and the amount is equal: matched.
3. No reference, but one open invoice has the same amount and the name fits: a suggestion
   for a person to confirm.
4. Nothing fits: a person looks. Nothing is matched by guessing.

The bank import reads CSV with `;` or `,` and finds the columns by name
(`date;amount;name;iban;message`, also Dutch headers such as `datum;bedrag;mededeling`).
The Payments screen can download a sample file.

**3. The overview shows a test run, using `src/lib/pipeline.js`.**
Right now `playRun()` plays the five steps with timers. Each step sends small events:

```js
{ type: 'step', id: 'invoice', status: 'running' } // or 'done', 'error', 'retry'
{ type: 'log', text: 'invoice 2026-0143 created', level: 'info' }
```

The visual part only listens to these events. Later n8n can send the same events for real orders,
without changing the component (`components/Pipeline.jsx`).

The switch "Mail server is down" plays the failure path: the step fails, the error workflow
reports it, the step is retried and the run still ends well.

## VAT rules (`src/lib/vat.js`)

| Customer | Rate |
| --- | --- |
| Belgium, private or company | 21% |
| Other EU country, private | 21% |
| Other EU country, company with VAT number | 0%, "VAT reverse charged" |
| Outside the EU | 0% |

The form only checks that a VAT number has the right shape. The real check against VIES belongs
in the n8n workflow.

## Not real

LoopCasts, its customers and its numbers are invented for the course. Payments are simulated,
no bank or payment provider is connected.

## Credits

Fonts: Inter, IBM Plex Mono and Departure Mono, all under the SIL Open Font License.

Course cover photos (`src/assets/covers/`, one file per course slug) come from
[Unsplash](https://unsplash.com) and are used under the [Unsplash License](https://unsplash.com/license).
The landing page picture (`src/assets/hero-park.webp`) is a generated illustration supplied by the project owner.
