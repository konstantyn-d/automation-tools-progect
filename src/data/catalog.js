// Mock catalog. In production courses, lessons and transcripts come from one catalog
// database (filled when a video is uploaded to Vimeo), so pages are never copy-pasted.

export const PLANS = [
  {
    id: 'monthly', name: 'All access · monthly', price: 15, unit: '/ month',
    blurb: 'Every course, every new lesson. Cancel any month.',
    features: ['All 40+ courses', 'Subtitles EN / NL', 'Invoice every 1st of the month'],
  },
  {
    id: 'yearly', name: 'All access · yearly', price: 149, unit: '/ year', badge: 'Best value',
    blurb: 'Two months free compared to monthly.',
    features: ['Everything in monthly', 'One invoice a year', 'Certificate per course'],
  },
  {
    id: 'team', name: 'Team licence', price: 129, unit: '/ seat / year', perSeat: true, minSeats: 3,
    blurb: 'For companies. Manage seats yourself, PO number on every invoice.',
    features: ['Min. 3 seats', 'Seat management in your account', 'VAT reverse charge for EU companies'],
  },
];

export const PROMOS = {
  LOOP10: { code: 'LOOP10', percent: 10, label: '10% off' },
  BLACKFRIDAY: { code: 'BLACKFRIDAY', percent: 25, label: '25% off' },
  TEAM20: { code: 'TEAM20', percent: 20, label: '20% off team licences' },
};

const t = (start, text) => ({ start, text });

export const COURSES = [
  {
    slug: 'excel-power-query',
    title: 'Power Query without fear',
    tag: 'Data', level: 'Beginner', minutes: 184, lessonsCount: 14,
    teacher: 'Lotte Janssens',
    summary: 'Clean messy exports in minutes instead of hours. From the first import to a refreshable report.',
    lessons: [
      { slug: 'import-csv', title: 'Importing a CSV the right way', minutes: 11, free: true,
        transcript: [t(0, 'Welcome. Today we import a bank export into Power Query.'), t(42, 'Notice the semicolon delimiter, Belgian exports use it a lot.'), t(95, 'Set the data type of the amount column to decimal number.'), t(160, 'Now remove the empty rows with one click.')] },
      { slug: 'merge-queries', title: 'Merging two tables', minutes: 14,
        transcript: [t(0, 'A merge is like VLOOKUP, but it never breaks.'), t(70, 'We match invoices with payments on the invoice number.'), t(140, 'Payments without a match go to a separate table to check by hand.')] },
      { slug: 'refresh', title: 'One-click refresh', minutes: 9,
        transcript: [t(0, 'Your report should refresh without copy and paste.'), t(55, 'Right click, refresh all, done.')] },
    ],
  },
  {
    slug: 'premiere-for-teams',
    title: 'Video editing for marketing teams',
    tag: 'Video', level: 'Intermediate', minutes: 246, lessonsCount: 18,
    teacher: 'Tom Peeters',
    summary: 'Shoot on a phone, edit in Premiere, publish everywhere. Workflows that a small team can keep up.',
    lessons: [
      { slug: 'project-setup', title: 'Project setup and proxies', minutes: 13, free: true,
        transcript: [t(0, 'Before we cut anything, set up proxies so the laptop stays fast.'), t(80, 'Export presets save you the same ten clicks every time.')] },
      { slug: 'subtitles', title: 'Automatic subtitles in two languages', minutes: 16,
        transcript: [t(0, 'Subtitles are not optional, most people watch muted.'), t(64, 'We generate Dutch and English captions from the transcript.')] },
    ],
  },
  {
    slug: 'gdpr-small-business',
    title: 'GDPR for small businesses',
    tag: 'Legal', level: 'Beginner', minutes: 98, lessonsCount: 8,
    teacher: 'Marieke De Smet',
    summary: 'What you really need: a processing register, unsubscribe links and no password sheets.',
    lessons: [
      { slug: 'newsletter-consent', title: 'Newsletter consent and unsubscribe', minutes: 12, free: true,
        transcript: [t(0, 'Every newsletter needs a working unsubscribe link.'), t(48, 'Double opt-in proves the person really asked for it.'), t(110, 'Never put customers in CC, always use a mailing service.')] },
      { slug: 'passwords', title: 'Passwords and shared logins', minutes: 10,
        transcript: [t(0, 'A spreadsheet with passwords is a data breach waiting to happen.'), t(66, 'Use a password manager and personal accounts.')] },
    ],
  },
  {
    slug: 'n8n-automation',
    title: 'Automating admin with n8n',
    tag: 'Automation', level: 'Advanced', minutes: 212, lessonsCount: 16,
    teacher: 'Lotte Janssens',
    summary: 'Webhooks, error workflows and no secrets in the workflow. Automate invoices and payment matching.',
    lessons: [
      { slug: 'webhooks', title: 'Your first webhook', minutes: 15, free: true,
        transcript: [t(0, 'A webhook is a URL that starts a workflow.'), t(90, 'Our order form posts to this webhook.')] },
      { slug: 'bank-matching', title: 'Matching bank payments to invoices', minutes: 19,
        transcript: [t(0, 'Match on the structured reference first.'), t(75, 'Then amount plus name, and unsure matches go to a person.')] },
    ],
  },
  {
    slug: 'presenting-online',
    title: 'Presenting online with confidence',
    tag: 'Soft skills', level: 'Beginner', minutes: 121, lessonsCount: 10,
    teacher: 'Tom Peeters',
    summary: 'Camera, light and a story that holds attention for fifteen minutes.',
    lessons: [
      { slug: 'light', title: 'Light with one lamp', minutes: 8, free: true,
        transcript: [t(0, 'One lamp at forty-five degrees beats any ring light.')] },
    ],
  },
  {
    slug: 'accounting-basics',
    title: 'Bookkeeping basics for freelancers',
    tag: 'Finance', level: 'Beginner', minutes: 140, lessonsCount: 12,
    teacher: 'Marieke De Smet',
    summary: 'Invoices without gaps, correct VAT and reverse charge explained without jargon.',
    lessons: [
      { slug: 'invoice-numbers', title: 'Invoice numbers without gaps', minutes: 9, free: true,
        transcript: [t(0, 'Your accountant wants invoice numbers without gaps or duplicates.'), t(52, 'A structured reference makes bank matching automatic.')] },
      { slug: 'reverse-charge', title: 'When is VAT reverse charged?', minutes: 13,
        transcript: [t(0, 'Reverse charge applies to EU companies with a valid VAT number.'), t(81, 'Always check the number in VIES first.')] },
    ],
  },
];

export const TAGS = ['All', ...new Set(COURSES.map((c) => c.tag))];

export const fmtDuration = (min) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;
export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// Transcript search. In production this is a full-text index built from Whisper transcripts.
export function searchTranscripts(q) {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const hits = [];
  for (const c of COURSES) {
    for (const l of c.lessons) {
      for (const line of l.transcript) {
        if (line.text.toLowerCase().includes(query)) hits.push({ course: c, lesson: l, line });
      }
    }
  }
  return hits;
}
