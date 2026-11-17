import { seeded } from '../lib/random.js'

// The whole catalogue. The first six are the courses shown first on the home page.
// The first lesson of every course is free to watch.

export const TOPICS = [
  { id: 'n8n', label: 'n8n' },
  { id: 'apis', label: 'APIs and webhooks' },
  { id: 'ai', label: 'AI and agents' },
  { id: 'data', label: 'Data and spreadsheets' },
  { id: 'scripting', label: 'Scripting' },
  { id: 'ops', label: 'Running it reliably' },
  { id: 'business', label: 'Business processes' },
]

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const FEATURED = [
  {
    slug: 'n8n-basics', students: 1380, added: '2019-03-04', topic: 'n8n', title: 'n8n basics', level: 'Beginner', art: 'nodes',
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
    slug: 'webhooks-from-zero', students: 1105, added: '2020-02-10', topic: 'apis', title: 'Webhooks from zero', level: 'Beginner', art: 'dish',
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
    slug: 'rest-apis-for-data-people', students: 980, added: '2019-09-16', topic: 'apis', title: 'REST APIs for data people', level: 'Beginner', art: 'stack',
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
    slug: 'shell-scripting', students: 640, added: '2020-11-02', topic: 'scripting', title: 'Shell scripting that saves your week', level: 'Intermediate', art: 'terminal',
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
    slug: 'cron-and-schedulers', students: 520, added: '2021-05-17', topic: 'ops', title: 'Cron and schedulers', level: 'Intermediate', art: 'clock',
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
    slug: 'ai-agents-with-n8n', students: 1240, added: '2026-09-22', topic: 'ai', title: 'AI agents with n8n', level: 'Advanced', art: 'robot',
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
  }
]

// [title, topic, level, teacher, art, tone, summary, outcomes, lessons]
const MORE = [
  ['n8n error handling', 'n8n', 'Intermediate', 'Pieter De Smet', 'bell', 'rose',
    'Workflows fail. Make sure you hear about it first, and that a second try does no harm.',
    ['Catch every failed run in one error workflow', 'Retry safely without doing things twice', 'Send alerts people actually read'],
    ['Why workflows fail', 'The error trigger', 'Retry on fail', 'An error workflow that tells you', 'Idempotency in practice', 'Alerts without noise', 'Testing failure on purpose', 'A checklist before go-live']],
  ['Self-hosting n8n with Docker', 'n8n', 'Intermediate', 'Wout Claes', 'box', 'sky',
    'Run n8n on your own server, keep your data with you, and update without losing a thing.',
    ['Start n8n with Docker Compose', 'Keep data and credentials safe across updates', 'Put n8n behind HTTPS'],
    ['Why host it yourself', 'Docker in ten minutes', 'A Compose file for n8n', 'Persistent data and backups', 'Environment variables and secrets', 'Updating without losing work', 'Behind a reverse proxy', 'Queue mode for heavier loads']],
  ['Sub-workflows and reuse', 'n8n', 'Intermediate', 'Lotte Maes', 'nodes', 'mint',
    'Stop copying the same ten nodes into every workflow. Build them once and call them everywhere.',
    ['Split a long workflow into parts', 'Pass data in and out of a sub-workflow', 'Keep shared parts versioned and documented'],
    ['When a workflow gets too long', 'The Execute Workflow node', 'Passing data in and out', 'A shared "send notification" workflow', 'Versioning shared pieces', 'Errors across workflows', 'Naming and folders']],
  ['The Code node for non-programmers', 'n8n', 'Beginner', 'Sara El Amrani', 'terminal', 'night',
    'Just enough JavaScript to do what the other nodes cannot, and to know when to stop.',
    ['Write small pieces of JavaScript with confidence', 'Work with dates and items in code', 'Debug code inside n8n'],
    ['When the built-in nodes are not enough', 'JavaScript in five minutes', 'Working with items in code', 'Dates with Luxon', 'Small helpers you will reuse', 'Debugging with console output', 'When to stop writing code']],
  ['Forms and approvals in n8n', 'n8n', 'Beginner', 'Lotte Maes', 'doc', 'green',
    'Collect information with a form and let a person approve it, without a single spreadsheet.',
    ['Build a form people can fill in', 'Wait for an approval before continuing', 'Remind people who forget to answer'],
    ['The Form trigger', 'Validating what people type', 'Waiting for an approval', 'Approve with an e-mail link', 'Reminders when nobody answers', 'A holiday request flow']],
  ['n8n for teams', 'n8n', 'Advanced', 'Wout Claes', 'branch', 'slate',
    'Work on workflows with several people without breaking each other\'s work.',
    ['Separate test and production', 'Share credentials without sharing passwords', 'Keep workflows in Git'],
    ['Users and roles', 'Sharing credentials safely', 'Test and production environments', 'Workflow history and rollback', 'Source control with Git', 'Documentation people read', 'Handing over a workflow']],
  ['Files, PDFs and images in n8n', 'n8n', 'Intermediate', 'Sara El Amrani', 'doc', 'sand',
    'Read, create and move files: invoices as PDF, photos from a form, exports from another tool.',
    ['Download and store files', 'Create a PDF from a template', 'Read text out of a PDF'],
    ['What binary data is', 'Downloading files', 'Reading PDFs', 'Creating a PDF from HTML', 'Images: resize and convert', 'Zip and unzip', 'Storing files in the cloud']],
  ['Loops and big data sets', 'n8n', 'Advanced', 'Pieter De Smet', 'stack', 'violet',
    'Process fifty thousand rows without running out of memory or patience.',
    ['Choose between automatic looping and batches', 'Merge results back together', 'Keep long runs stable'],
    ['How n8n loops by itself', 'Loop Over Items', 'Splitting into batches', 'Merging results back', 'Memory and long runs', 'Pagination at scale', 'A 50,000-row import']],

  ['OAuth2 explained with drawings', 'apis', 'Intermediate', 'Jonas Verbeke', 'lock', 'night',
    'The login dance behind "Connect your Google account", drawn out step by step.',
    ['Explain the authorization code flow', 'Pick the right scopes', 'Fix a failing token refresh'],
    ['Why passwords are not enough', 'The authorization code flow', 'Scopes', 'Refresh tokens', 'Client credentials', 'Debugging a failed login', 'OAuth in n8n']],
  ['GraphQL for automators', 'apis', 'Intermediate', 'Jonas Verbeke', 'nodes', 'rose',
    'Ask an API for exactly the fields you need, in one request instead of ten.',
    ['Write queries and mutations', 'Page through results with cursors', 'Call GraphQL from n8n'],
    ['Why GraphQL exists', 'Queries and fields', 'Variables', 'Mutations', 'Pagination with cursors', 'GraphQL in the HTTP node', 'Shopify as an example']],
  ['Building your own small API', 'apis', 'Advanced', 'Wout Claes', 'stack', 'amber',
    'Give other systems a clean way in: validated input, clear errors and documentation.',
    ['Design endpoints others can use', 'Validate input and return clear errors', 'Document the API with OpenAPI'],
    ['What an API needs', 'A webhook as an endpoint', 'Validating input', 'Status codes you return', 'API keys', 'Rate limiting', 'Documentation with OpenAPI', 'Versioning']],
  ['Online payments with Stripe and Mollie', 'apis', 'Intermediate', 'Ines Janssens', 'card', 'violet',
    'Take payments online and let the webhooks tell your systems what happened.',
    ['Create payment links', 'Handle paid, failed and refunded payments', 'Match payments to invoices'],
    ['How online payments work', 'Test mode', 'Payment links', 'Webhooks for paid and failed', 'Refunds', 'Matching payments to invoices', 'Month-end reconciliation']],
  ['Google Workspace APIs', 'apis', 'Beginner', 'Lotte Maes', 'mail', 'sky',
    'Gmail, Sheets, Drive and Calendar, driven from your own workflows.',
    ['Connect with OAuth or a service account', 'Read and send Gmail', 'Use a Sheet as a small database'],
    ['Service accounts or OAuth', 'Gmail: read and send', 'Google Sheets as a database', 'Drive: folders and files', 'Calendar events', 'Quotas and limits']],
  ['Microsoft 365 and Graph', 'apis', 'Intermediate', 'Ines Janssens', 'mail', 'slate',
    'Outlook, Teams and SharePoint from one API, and what your IT admin will ask you.',
    ['Register an app in Azure', 'Send mail and Teams messages', 'Read and write SharePoint lists'],
    ['Registering an app in Azure', 'Outlook mail', 'Teams messages', 'SharePoint lists', 'OneDrive files', 'Permissions your admin will ask about']],
  ['Slack and Discord bots', 'apis', 'Beginner', 'Jonas Verbeke', 'chat', 'violet',
    'Small bots that post updates, answer commands and ask for a click when needed.',
    ['Post messages with a webhook', 'Add slash commands', 'Use buttons for approvals'],
    ['Incoming webhooks', 'A bot user', 'Slash commands', 'Interactive buttons', 'Threads and replies', 'A daily stand-up bot']],
  ['Testing APIs with Postman and curl', 'apis', 'Beginner', 'Sara El Amrani', 'terminal', 'teal',
    'Try an API before you build on it, and keep the requests for next time.',
    ['Send and save requests', 'Use environments for test and live', 'Check responses automatically'],
    ['Your first request', 'Collections', 'Environments and variables', 'Tests on responses', 'curl for quick checks', 'Sharing with colleagues']],

  ['Prompt writing for workflows', 'ai', 'Beginner', 'Jonas Verbeke', 'chat', 'amber',
    'Prompts that give the same good answer on the hundredth run as on the first.',
    ['Write prompts as specifications', 'Ask for JSON you can rely on', 'Test a prompt on real cases'],
    ['A prompt is a specification', 'Roles and instructions', 'Examples in the prompt', 'Asking for JSON', 'Temperature and other knobs', 'Testing prompts on 50 cases', 'Keeping prompts in one place']],
  ['Document extraction with AI', 'ai', 'Intermediate', 'Sara El Amrani', 'doc', 'violet',
    'Turn invoices and forms into clean data, with a person checking the doubtful ones.',
    ['Extract fields from PDFs', 'Check that the numbers add up', 'Send unsure cases to a review queue'],
    ['From PDF to text', 'Invoices: pulling out the fields', 'Checking the numbers add up', 'When the model is unsure', 'A human review queue', 'Costs per document']],
  ['Let AI answer from your documents', 'ai', 'Advanced', 'Jonas Verbeke', 'stack', 'night',
    'Retrieval in plain words: answers from your own handbook, with the source next to them.',
    ['Split documents into useful chunks', 'Search by meaning with embeddings', 'Measure whether answers are right'],
    ['Why models make things up', 'Embeddings in plain words', 'Chunking documents', 'A vector store', 'Retrieval in n8n', 'Citing the source', 'Measuring answer quality', 'Keeping the index fresh']],
  ['Running models locally with Ollama', 'ai', 'Intermediate', 'Wout Claes', 'robot', 'green',
    'A language model on your own machine: no data leaves the building.',
    ['Install and run a local model', 'Call it from n8n', 'Choose a model that fits your hardware'],
    ['Why run a model yourself', 'Installing Ollama', 'Choosing a model', 'Calling it from n8n', 'Speed and hardware', 'What stays on your machine']],
  ['Speech, transcripts and subtitles', 'ai', 'Beginner', 'Ines Janssens', 'chat', 'teal',
    'From recording to transcript, summary and subtitles, in English and Dutch.',
    ['Transcribe meetings and videos', 'Create subtitles automatically', 'Summarise long calls'],
    ['Speech to text', 'Transcribing meetings', 'Subtitles from a video', 'Summaries of long calls', 'Translation', 'Storage and privacy']],
  ['Evaluating AI output', 'ai', 'Advanced', 'Sara El Amrani', 'chart', 'slate',
    '"It looks good" is not a test. Build one that tells you when quality drops.',
    ['Build a test set from real cases', 'Score answers with rules and with a model', 'Track quality over time'],
    ['Why "it looks good" is not a test', 'Building a test set', 'Scoring with rules', 'Scoring with a second model', 'Tracking quality over time', 'When to switch models']],
  ['AI for support teams', 'ai', 'Intermediate', 'Jonas Verbeke', 'mail', 'rose',
    'Sort the inbox, draft answers with the facts in them, and keep a person in charge.',
    ['Classify incoming mail by topic and language', 'Draft replies a person approves', 'Spot phishing before anyone clicks'],
    ['Sorting the inbox', 'Language and tone', 'Drafting replies with facts', 'Approval before sending', 'Spotting phishing', 'Measuring response time']],

  ['From Excel to a real database', 'data', 'Beginner', 'Lotte Maes', 'sheet', 'sand',
    'For the day your spreadsheet has four versions and nobody knows which one is right.',
    ['Recognise when a sheet has outgrown itself', 'Design simple tables with keys', 'Move the data without losing any'],
    ['Why the spreadsheet stopped working', 'Tables, keys and types', 'Cleaning the data first', 'Importing into Postgres', 'Keeping a sheet as the front', 'What changes for the team']],
  ['Cleaning messy data', 'data', 'Beginner', 'Ines Janssens', 'sheet', 'mint',
    'Duplicates, typos and five date formats in one column. Clean it once, and keep it clean.',
    ['Remove duplicates reliably', 'Normalise dates, phones and e-mail addresses', 'Rerun the same cleaning every week'],
    ['Spaces, cases and typos', 'Duplicates', 'Dates in five formats', 'Phone numbers and e-mail addresses', 'Validation rules', 'A cleaning workflow you rerun']],
  ['SQL for automators', 'data', 'Beginner', 'Pieter De Smet', 'stack', 'sky',
    'The handful of SQL that covers nearly everything a workflow needs from a database.',
    ['Query, join and total data', 'Change data safely', 'Use SQL inside n8n'],
    ['SELECT and WHERE', 'Sorting and limits', 'Joins', 'Grouping and totals', 'INSERT, UPDATE and DELETE safely', 'SQL in n8n', 'Transactions']],
  ['Postgres in practice', 'data', 'Intermediate', 'Wout Claes', 'stack', 'night',
    'Run Postgres yourself and let the database refuse bad data for you.',
    ['Run Postgres in Docker', 'Use constraints and indexes', 'Back up and restore'],
    ['Installing with Docker', 'Schemas and migrations', 'Indexes', 'Constraints that stop bad data', 'Backups and restore', 'Users and permissions', 'JSON columns']],
  ['Reports that build themselves', 'data', 'Intermediate', 'Lotte Maes', 'chart', 'peach',
    'The Monday report, ready in everyone\'s inbox before they have had coffee.',
    ['Pull numbers from several sources', 'Build a PDF report with a chart', 'Notice when the numbers look wrong'],
    ['What people really read', 'Pulling the numbers', 'A chart as an image', 'A PDF report', 'Sending on Monday morning', 'When the numbers look wrong']],
  ['CSV files without pain', 'data', 'Beginner', 'Pieter De Smet', 'sheet', 'green',
    'Semicolons, quotes and strange characters. Read any CSV, bank exports included.',
    ['Read CSV with any delimiter and encoding', 'Write CSV other tools accept', 'Handle a real bank export'],
    ['What CSV is and is not', 'Delimiters and quotes', 'Encoding and strange characters', 'Reading CSV in n8n', 'Writing CSV', 'Bank exports as a case']],
  ['Dashboards with Metabase', 'data', 'Intermediate', 'Sara El Amrani', 'chart', 'teal',
    'Let colleagues answer their own questions with a dashboard instead of asking you.',
    ['Connect Metabase to a database', 'Build questions and dashboards', 'Share safely and set alerts'],
    ['Connecting a database', 'Questions and charts', 'Dashboards', 'Filters', 'Sharing safely', 'Alerts']],
  ['Data privacy for automators', 'data', 'Beginner', 'Ines Janssens', 'lock', 'mint',
    'GDPR in plain language, for people who move personal data between systems every day.',
    ['Recognise personal data in your workflows', 'Keep only what you need, as long as needed', 'Make a data map of your automations'],
    ['GDPR in plain language', 'What personal data is', 'Keeping only what you need', 'Retention and deletion', 'Logs that leak', 'A data map of your workflows']],

  ['Python for automation', 'scripting', 'Beginner', 'Sara El Amrani', 'terminal', 'amber',
    'From zero to small scripts that call APIs and tidy files while you do something else.',
    ['Write and run Python scripts', 'Call an API with requests', 'Work with CSV and JSON'],
    ['Installing Python', 'Variables and lists', 'Reading files', 'Calling an API with requests', 'CSV and JSON', 'Running on a schedule', 'Packaging a small tool']],
  ['Regular expressions', 'scripting', 'Intermediate', 'Pieter De Smet', 'terminal', 'violet',
    'Find and check patterns in text: e-mail addresses, IBANs, dates and payment references.',
    ['Read and write regular expressions', 'Validate e-mail, IBAN and dates', 'Know when regex is the wrong tool'],
    ['Why regex', 'Characters and classes', 'Repeats', 'Groups', 'E-mail, IBAN and dates', 'Regex in n8n and Python', 'When not to use regex']],
  ['Git for people who are not developers', 'scripting', 'Beginner', 'Wout Claes', 'branch', 'peach',
    'Version control for workflow files, scripts and documents. Undo any mistake.',
    ['Commit, branch and merge', 'Work with GitHub', 'Undo mistakes without panic'],
    ['Why version control', 'Commits', 'Branches', 'GitHub', 'Pull requests', 'Undoing mistakes', 'Git for workflow files']],
  ['PowerShell for Windows admins', 'scripting', 'Intermediate', 'Wout Claes', 'terminal', 'sky',
    'Automate the Windows side of the office: users, files and scheduled tasks.',
    ['Use cmdlets and the pipeline', 'Script Active Directory tasks', 'Schedule and log scripts'],
    ['Cmdlets and pipelines', 'Files and folders', 'Active Directory tasks', 'Scheduled tasks', 'Remote sessions', 'Error handling']],
  ['jq: JSON on the command line', 'scripting', 'Intermediate', 'Pieter De Smet', 'dish', 'slate',
    'Slice and reshape JSON from any API in one line in the terminal.',
    ['Filter and map JSON', 'Build new JSON from old', 'Combine jq with curl'],
    ['Reading JSON', 'Filters', 'Arrays and maps', 'Building new JSON', 'jq with curl', 'Real-world recipes']],
  ['Node.js scripts', 'scripting', 'Intermediate', 'Jonas Verbeke', 'terminal', 'green',
    'Small JavaScript tools for the terminal, from reading files to calling APIs.',
    ['Read and write files', 'Use fetch and async code', 'Build and package a CLI tool'],
    ['Installing Node', 'Reading and writing files', 'fetch', 'Async without confusion', 'npm packages', 'A CLI tool', 'Running in Docker']],

  ['Docker for automators', 'ops', 'Beginner', 'Wout Claes', 'box', 'teal',
    'Containers in plain words, and how to run your tools the same way everywhere.',
    ['Run and stop containers', 'Keep data in volumes', 'Describe a setup with Compose'],
    ['Containers in plain words', 'Images and containers', 'Volumes', 'Ports', 'Docker Compose', 'Logs', 'Cleaning up disk space']],
  ['Monitoring your automations', 'ops', 'Intermediate', 'Pieter De Smet', 'bell', 'amber',
    'Know that things ran, and hear about it when they did not.',
    ['Add heartbeats to scheduled jobs', 'Send alerts that matter', 'Write a weekly health report'],
    ['What fails silently', 'Heartbeats', 'Logs you can search', 'Alerts to Slack', 'Uptime checks', 'A weekly health report']],
  ['Backups you can restore', 'ops', 'Beginner', 'Wout Claes', 'box', 'sand',
    'A backup you never restored is a hope. Make it a plan.',
    ['Apply the 3-2-1 rule', 'Automate and encrypt backups', 'Test a restore regularly'],
    ['The 3-2-1 rule', 'What to back up', 'Automating backups', 'Encrypting backups', 'Testing a restore', 'Retention']],
  ['Secrets and credentials', 'ops', 'Intermediate', 'Ines Janssens', 'lock', 'rose',
    'Keep API keys and passwords out of code, chats and screenshots.',
    ['Store secrets outside your code', 'Rotate keys without downtime', 'Clean a secret out of Git'],
    ['Why secrets leak', 'Environment variables', 'Credential stores', 'Rotating keys', 'Secrets in Git: cleaning up', 'Least privilege']],
  ['Idempotency and retries', 'ops', 'Advanced', 'Pieter De Smet', 'nodes', 'night',
    'The same event twice should never mean two invoices. Design for it.',
    ['Recognise duplicate events', 'Use idempotency keys', 'Retry with backoff and dead letters'],
    ['What idempotent means', 'Duplicate events', 'Idempotency keys', 'Retries with backoff', 'Dead letter queues', 'Exactly once is a myth']],
  ['Queues and events', 'ops', 'Advanced', 'Wout Claes', 'stack', 'peach',
    'Let systems talk through queues so one slow part does not stop the rest.',
    ['Explain producers, consumers and queues', 'Run a queue with Redis or RabbitMQ', 'Scale workers safely'],
    ['Why queues', 'RabbitMQ basics', 'Redis queues', 'Producers and consumers', 'Ordering', 'Scaling workers', 'Events between systems']],
  ['From Zapier and Make to n8n', 'ops', 'Beginner', 'Lotte Maes', 'nodes', 'sky',
    'Move your existing automations over without a weekend of downtime.',
    ['Map Zapier concepts to n8n', 'Rebuild a Zap step by step', 'Plan a safe migration'],
    ['What carries over', 'Triggers and actions', 'Rebuilding a Zap', 'Costs compared', 'A migration plan', 'Running both for a while']],

  ['Automating invoices', 'business', 'Intermediate', 'Ines Janssens', 'doc', 'peach',
    'Invoice numbers without gaps, the right VAT every time, and a PDF in the customer\'s inbox.',
    ['Number invoices without gaps or doubles', 'Apply Belgian and EU VAT rules', 'Send reminders for unpaid invoices'],
    ['Invoice numbers without gaps', 'VAT in Belgium and the EU', 'PDF invoices', 'Sending and storing', 'Payment references', 'Reminders for unpaid invoices', 'Credit notes']],
  ['Bank statements and payment matching', 'business', 'Intermediate', 'Ines Janssens', 'card', 'teal',
    'Read the bank export, match each payment to its invoice, and see the leftovers at a glance.',
    ['Read a bank export', 'Match by structured reference and amount', 'Handle partial and double payments'],
    ['Reading a bank export', 'Structured references', 'Matching rules', 'Partial and double payments', 'A queue for the leftovers', 'Month-end check']],
  ['CRM automation with HubSpot', 'business', 'Beginner', 'Lotte Maes', 'chart', 'rose',
    'Let forms, mails and deals update the CRM by themselves.',
    ['Send form entries to the CRM', 'Move deals through stages automatically', 'Create follow-up tasks'],
    ['Contacts and companies', 'Deals and stages', 'Forms to CRM', 'Follow-up tasks', 'Syncing with your mail', 'Reports']],
  ['E-mail people do not hate', 'business', 'Beginner', 'Jonas Verbeke', 'mail', 'peach',
    'Transactional mails that arrive, read well and respect people\'s inbox.',
    ['Tell transactional from marketing mail', 'Build templates with personal fields', 'Keep your mail out of spam'],
    ['Transactional or marketing', 'Templates', 'Personal fields', 'Unsubscribe and GDPR', 'Deliverability', 'Bounces and complaints']],
  ['Newsletters with clean lists', 'business', 'Beginner', 'Lotte Maes', 'mail', 'mint',
    'Double opt-in, no duplicates, no dead addresses, and an unsubscribe that works.',
    ['Set up double opt-in', 'Clean duplicates and invalid addresses', 'Segment without tracking everyone'],
    ['Double opt-in', 'Removing duplicates', 'Invalid addresses', 'Segments', 'Sending with Brevo or Mailchimp', 'Measuring without tracking everything']],
  ['Onboarding new employees', 'business', 'Intermediate', 'Sara El Amrani', 'doc', 'sky',
    'Accounts, laptop and welcome mails ready on day one, and everything closed on the last.',
    ['Turn the paper checklist into a workflow', 'Create accounts in several tools', 'Offboard without forgotten access'],
    ['The checklist on paper', 'Accounts in five tools', 'Welcome mails', 'Laptop and access', 'Offboarding', 'An audit trail']],
  ['E-commerce order flows', 'business', 'Intermediate', 'Wout Claes', 'box', 'amber',
    'From order to warehouse, label and track-and-trace, without copy and paste.',
    ['Send orders to the warehouse', 'Create shipping labels', 'Handle returns'],
    ['From order to warehouse', 'Stock updates', 'Shipping labels', 'Track and trace mails', 'Returns', 'Accounting export']],
  ['Approval flows for finance', 'business', 'Advanced', 'Ines Janssens', 'card', 'slate',
    'Who may approve what, up to which amount, with a trail an auditor will like.',
    ['Model approval rules and thresholds', 'Escalate when nobody answers', 'Keep a complete audit trail'],
    ['Who approves what', 'Purchase requests', 'Thresholds and escalation', 'An audit trail', 'Integrating with accounting', 'Reporting']],
  ['Calendar and booking automation', 'business', 'Beginner', 'Sara El Amrani', 'clock', 'mint',
    'Bookings, reminders and reschedules that run without a person in between.',
    ['Set up a booking page', 'Send confirmations and reminders', 'Reduce no-shows'],
    ['Booking pages', 'Confirmations and reminders', 'No-shows', 'Rescheduling', 'Syncing calendars', 'Payments with bookings']],
  ['Social media scheduling', 'business', 'Beginner', 'Lotte Maes', 'chat', 'sand',
    'Plan posts once a week and let them go out on time, within each platform\'s rules.',
    ['Plan and schedule posts', 'Post through platform APIs', 'Report on what worked'],
    ['Planning content', 'Posting through APIs', 'Images and captions', 'Reusing content', 'Reporting', 'Platform rules']],
]

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function hash(text) {
  let h = 7
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

function clock(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function toSeconds(time) {
  const [m, s] = time.split(':').map(Number)
  return m * 60 + s
}

function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}

const ART_TONE = { nodes: 'peach', dish: 'night', stack: 'teal', terminal: 'green', clock: 'amber', robot: 'violet' }

const fromTuple = ([title, topic, level, teacher, art, tone, summary, outcomes, lessons]) => {
  const rand = seeded(hash(title))
  return {
    slug: slugify(title),
    title,
    topic,
    level,
    teacher,
    art,
    tone,
    summary,
    outcomes,
    lessons: lessons.map((t) => [t, clock(240 + Math.floor(rand() * 390))]),
  }
}

export const COURSES = [...FEATURED, ...MORE.map(fromTuple)].map((course, i) => {
  const rand = seeded(hash(course.slug) + 11)
  const seconds = course.lessons.reduce((sum, [, time]) => sum + toSeconds(time), 0)
  return {
    ...course,
    nr: String(i + 1).padStart(2, '0'),
    tone: course.tone || ART_TONE[course.art],
    videos: course.lessons.length,
    seconds,
    duration: formatDuration(seconds),
    // demo numbers for sorting; the newest courses are the AI ones and the last few added
    students: course.students ?? 140 + Math.floor(rand() * 1200),
    added: course.added ?? `20${course.topic === 'ai' ? 25 + Math.floor(rand() * 2) : 19 + Math.floor(rand() * 7)}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-15`,
    lessons: course.lessons.map(([title, time], j) => ({ nr: j + 1, title, time, free: j === 0 })),
  }
})

export function findCourse(slug) {
  return COURSES.find((c) => c.slug === slug)
}

export function topicLabel(id) {
  return TOPICS.find((t) => t.id === id)?.label || id
}
