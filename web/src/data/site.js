// All editable content of the landing page lives in src/data, not inside the components.

// Every course: what it is, what you can do afterwards, and its lessons.
// The first lesson of every course is free to watch.
export const COURSES = [
  {
    slug: 'n8n-basics', nr: '01', title: 'n8n basics', level: 'Beginner', duration: '1 h 20', art: 'nodes',
    teacher: 'Lotte Maes',
    summary: 'Build your first working workflows. No programming needed, only curiosity and a browser.',
    outcomes: [
      'Build a workflow with a trigger, a decision and an action',
      'Read and reshape the data that flows between nodes',
      'Find out why a run failed, and fix it',
      'Keep passwords and API keys out of your workflow',
    ],
    lessons: [
      ['What n8n is, and what it is not', '05:10'], ['Your first workflow in ten minutes', '09:48'], ['Triggers: what starts a run', '06:02'],
      ['Items, JSON and the data between nodes', '08:15'], ['If and Switch: letting data decide', '07:21'], ['Edit Fields: shaping data', '06:40'],
      ['Reading a spreadsheet', '06:55'], ['Sending an e-mail', '05:30'], ['Credentials, the safe way', '04:58'],
      ['When a node fails', '07:05'], ['Running on a schedule', '05:12'], ['Putting it together: a daily report', '07:04'],
    ],
  },
  {
    slug: 'webhooks-from-zero', nr: '02', title: 'Webhooks from zero', level: 'Beginner', duration: '55 min', art: 'dish',
    teacher: 'Jonas Verbeke',
    summary: 'Let other systems tell you when something happens, instead of asking them every five minutes.',
    outcomes: [
      'Explain what a webhook is to a colleague',
      'Receive data from a form or another app',
      'Check that a call really comes from who it claims',
      'Answer fast and do the slow work afterwards',
    ],
    lessons: [
      ['Polling versus being told', '04:40'], ['Your first webhook', '07:12'], ['Test URL and production URL', '05:03'],
      ['Reading headers, query and body', '06:30'], ['Answering the caller', '05:44'], ['Checking a signature', '08:02'],
      ['When the same call arrives twice', '06:21'], ['Connecting a web form', '06:48'], ['Debugging a webhook that stays silent', '04:40'],
    ],
  },
  {
    slug: 'rest-apis-for-data-people', nr: '03', title: 'REST APIs for data people', level: 'Beginner', duration: '1 h 45', art: 'stack',
    teacher: 'Lotte Maes',
    summary: 'Get data out of the tools your company already pays for, and put it where you need it.',
    outcomes: [
      'Read API documentation without getting lost',
      'Call an API with keys, tokens or OAuth',
      'Fetch thousands of records page by page',
      'Stay inside rate limits and handle errors',
    ],
    lessons: [
      ['What an API promises', '05:20'], ['GET, POST and the other verbs', '07:45'], ['Status codes worth knowing', '06:10'],
      ['Reading API docs', '08:30'], ['The HTTP Request node', '09:02'], ['API keys and bearer tokens', '06:48'],
      ['OAuth without tears', '10:15'], ['Pagination', '08:40'], ['Rate limits and waiting politely', '07:05'],
      ['Sending data: JSON bodies', '07:30'], ['Dates, time zones and other traps', '06:25'], ['From API to spreadsheet', '08:12'],
      ['From API to database', '07:38'], ['A small sync you can trust', '05:40'],
    ],
  },
  {
    slug: 'shell-scripting', nr: '04', title: 'Shell scripting that saves your week', level: 'Intermediate', duration: '1 h 10', art: 'terminal',
    teacher: 'Pieter De Smet',
    summary: 'The small scripts that rename, move, clean and back up files while you do something else.',
    outcomes: [
      'Write a script that is safe to run twice',
      'Process a folder full of files in one go',
      'Search and clean text with grep, sed and awk',
      'Know when a script went wrong, and why',
    ],
    lessons: [
      ['Why the shell is still worth it', '04:30'], ['Variables and quoting', '07:10'], ['Loops over files', '06:45'],
      ['Pipes: small tools in a row', '06:20'], ['grep, sed and awk in practice', '09:15'], ['Exit codes and set -e', '06:02'],
      ['Arguments and usage messages', '05:48'], ['Working with CSV', '07:25'], ['curl and jq', '07:40'],
      ['Logging what happened', '04:55'], ['A backup script you can trust', '04:10'],
    ],
  },
  {
    slug: 'cron-and-schedulers', nr: '05', title: 'Cron and schedulers', level: 'Intermediate', duration: '50 min', art: 'clock',
    teacher: 'Pieter De Smet',
    summary: 'Make things happen on time, every time, and find out when they did not.',
    outcomes: [
      'Read and write cron expressions',
      'Avoid the classic time zone mistakes',
      'Stop two runs from tripping over each other',
      'Get a message when a job did not run',
    ],
    lessons: [
      ['Five stars: reading cron', '05:35'], ['Your first cron job', '06:10'], ['Time zones and summer time', '06:48'],
      ['Overlapping runs and locks', '06:30'], ['Schedules in n8n', '05:42'], ['Catching up after downtime', '06:15'],
      ['Knowing that it ran', '06:40'], ['Monthly and "last working day" jobs', '06:20'],
    ],
  },
  {
    slug: 'ai-agents-with-n8n', nr: '06', title: 'AI agents with n8n', level: 'Advanced', duration: '1 h 35', art: 'robot',
    teacher: 'Jonas Verbeke',
    summary: 'Put a language model to work inside a workflow, with a person still in charge.',
    outcomes: [
      'Classify and summarise text with a model',
      'Get structured output you can rely on',
      'Give an agent tools, and limits',
      'Keep a human approval step where it matters',
    ],
    lessons: [
      ['What a model is good and bad at', '06:20'], ['Your first model call', '06:45'], ['Prompts that give the same answer twice', '08:10'],
      ['Structured output', '07:32'], ['Classifying incoming mail', '08:48'], ['Drafting a reply', '07:15'],
      ['Human in the loop', '07:40'], ['Tools: letting an agent look things up', '08:25'], ['Memory and context', '06:50'],
      ['Guardrails and prompt injection', '08:05'], ['Costs and when not to use AI', '05:30'], ['Testing an agent', '07:10'],
      ['A support assistant, end to end', '06:30'],
    ],
  },
].map((course) => ({
  ...course,
  videos: course.lessons.length,
  lessons: course.lessons.map(([title, time], i) => ({ nr: i + 1, title, time, free: i === 0 })),
}))

export function findCourse(slug) {
  return COURSES.find((c) => c.slug === slug)
}

export const PLANS = [
  {
    id: 'yearly',
    name: 'Yearly subscription',
    price: 149,
    unit: 'per year',
    featured: true,
    blurb: 'Everything we make, for a full year. The one most people pick.',
    includes: [
      'All 60 courses and every new lesson',
      'Two new videos every week',
      'Chapters, transcripts and search',
      'Invoice with your VAT and PO number',
    ],
  },
  { id: 'monthly', name: 'Monthly subscription', price: 15, unit: 'per month', blurb: 'Access to everything. Stop whenever you like.' },
  { id: 'team', name: 'Team licence', price: 599, unit: 'per year', blurb: 'Five seats. Swap colleagues in and out yourself.' },
  { id: 'single', name: 'Single course', price: 39, unit: 'once', blurb: 'Lifetime access to the one course you need.' },
]

export const FAQ = [
  {
    q: 'Can I try before I pay?',
    a: 'Yes. The first lesson of every course is free to watch, without an account. That is usually enough to know whether the teacher and the pace suit you.',
  },
  {
    q: 'Do I need to know how to program?',
    a: 'Not for the beginner courses. They start from zero and you build along in the browser. Intermediate and advanced courses say at the top what you should already know.',
  },
  {
    q: 'Subscription or a single course?',
    a: 'A subscription opens everything, including the two new lessons that appear every week. A single course is a one-time payment and stays yours.',
  },
  {
    q: 'How do I pay, and when do I get access?',
    a: 'You order, receive an invoice by e-mail and pay by bank transfer. As soon as your payment is in, your login arrives by e-mail.',
  },
  {
    q: 'Can I get an invoice with our VAT or PO number?',
    a: 'Yes. Fill them in when you order and they are on the invoice from the start. Every invoice stays available in your account.',
  },
  {
    q: 'Does my subscription renew by itself?',
    a: 'No. We remind you 30 and 7 days before the end date. If you do not renew, access simply stops on the end date.',
  },
  {
    q: 'How do team seats work?',
    a: 'A team licence has five seats. The person who ordered can invite colleagues and replace a seat when somebody leaves.',
  },
]

export const WORDS = ['WEBHOOK', 'CRON', 'N8N', 'AGENTS', 'API', 'JSON', 'RETRY', 'OAUTH', 'DOCKER', 'REGEX']
