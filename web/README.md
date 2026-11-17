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
| `/courses/:slug` | One course: summary, what you learn, all lessons |
| `/courses/:slug/:nr` | One lesson: player, chapters, transcript. Locked lessons show the offer instead |
| `/order` | Order form with validation and VAT |
| `/login` | Sign in and "forgot password" |
| `/account` | Member area: progress per course, subscription, invoices, profile |
| `/admin` | Admin panel, first screen: order runs and recent orders |

```
src/
  main.jsx            entry point: fonts, global styles, router, session
  App.jsx             routes and the navigation bar
  pages/              one file per page
  sections/           the blocks of the landing page, top to bottom
  components/         shared pieces: navigation, course cover, lesson list, player, pipeline, pixel art
  data/site.js        courses with their lessons, plans, FAQ
  data/member.js      the sample member and sample orders
  lib/session.jsx     who is signed in, and the rule that decides if a lesson plays
  lib/vat.js          VAT rules from the finance handbook
  lib/pipeline.js     the order chain as data (see below)
  styles/             CSS per section or page, global.css holds the design tokens
```

## What is still pretend

This is the front end. Three things are stand-ins until the back end and n8n are connected:

- **Accounts.** Any e-mail and password sign you in as a sample member (`data/member.js`).
  The session is kept in the browser. `lib/session.jsx` is the only file that has to change.
- **Payment.** After an order the button "Demo: the payment arrived" creates the account, so the
  whole journey can be shown. In the real flow n8n does this when the bank transfer is matched.
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

**2. The admin panel (`/admin`) shows a run, using `src/lib/pipeline.js`.**
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
