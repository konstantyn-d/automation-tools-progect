import { useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import '../styles/capabilities.css'

// --- three small "software compositions": pale panels that overlap -----------------------

function LessonArt() {
  return (
    <div className="art art--lessons">
      <div className="pane pane--back">
        <span className="pane__title">Webhooks from zero</span>
        <ul className="lessons lessons--plain">
          {[
            ['01', 'Polling versus being told', '04:40'],
            ['02', 'Your first webhook', '07:12'],
            ['03', 'Test URL and production URL', '05:03'],
            ['04', 'Reading headers, query and body', '06:30'],
            ['05', 'Answering the caller', '05:44'],
            ['06', 'Checking a signature', '08:02'],
          ].map(([nr, title, time]) => (
            <li key={nr}>
              <span className="mono">{nr}</span>
              <span className="lessons__title">{title}</span>
              <span className="mono">{time}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pane pane--front">
        <span className="pane__title">Comes with this lesson</span>
        <div className="invoice__row"><span>The workflow from the video</span><span className="mono">.json</span></div>
        <div className="invoice__row"><span>Sample data to test with</span><span className="mono">.csv</span></div>
        <div className="invoice__row"><span>Transcript</span><span className="mono">EN · NL</span></div>
        <div className="invoice__foot invoice__foot--top">
          <i className="chip chip--info">07:12</i>
          <i className="chip">4 chapters</i>
        </div>
      </div>
    </div>
  )
}

function MembersArt() {
  return (
    <div className="art art--members">
      <div className="pane pane--back">
        <span className="pane__title">n8n error handling</span>
        <ul className="lessons">
          {[
            ['01', 'Why workflows fail', '08:12', 100],
            ['02', 'The error trigger', '11:40', 100],
            ['03', 'Retry on fail', '09:05', 60],
            ['04', 'An error workflow that tells you', '12:31', 0],
            ['05', 'Idempotency in practice', '10:18', 0],
          ].map(([nr, title, time, done]) => (
            <li key={nr}>
              <span className="mono">{nr}</span>
              <span className="lessons__title">{title}</span>
              <span className="lessons__bar"><b style={{ width: `${done}%` }} /></span>
              <span className="mono">{time}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pane pane--front">
        <span className="pane__title">Your subscription</span>
        <div className="sub__date">
          <span className="sub__big">14 Mar 2027</span>
          <span>end date · we remind you 30 days before</span>
        </div>
        <div className="seats">
          {['HW', 'JS', 'AM', 'LD'].map((s) => <span key={s} className="seat">{s}</span>)}
          <span className="seat seat--empty">+</span>
          <span className="seats__label">4 of 5 seats used</span>
        </div>
        <div className="invoice__foot">
          <i className="chip">Invoices (3)</i>
          <i className="chip">Reset password</i>
        </div>
      </div>
    </div>
  )
}

function HelpArt() {
  return (
    <div className="art art--help">
      <div className="pane pane--back">
        <span className="pane__title">Question under lesson 6</span>
        <p className="draft">
          My webhook works with the test URL, but nothing arrives on the production URL. What am I
          missing?
        </p>
        <div className="invoice__foot">
          <i className="chip">Ruben</i>
          <i className="chip">Tuesday 21:14</i>
        </div>
      </div>
      <div className="pane pane--front">
        <div className="invoice__head">
          <span className="pane__title">Lotte, teacher</span>
          <i className="chip chip--ok">Wednesday 09:30</i>
        </div>
        <p className="draft">
          Hi Ruben, the production URL only listens once the workflow is switched to active. Flip the
          toggle top right and send your test again. Minute 02:10 of lesson 3 shows it.
        </p>
      </div>
    </div>
  )
}

const CHAPTERS = [
  {
    label: 'The lessons',
    title: 'Short lessons.',
    soft: 'Each one builds something that works.',
    text: 'A lesson is a screen recording of five to ten minutes. You watch, pause, and build the same thing next to it.',
    rows: [
      ['Five to ten minutes each', 'Long enough to finish something, short enough for a lunch break.'],
      ['Build along', 'Every lesson comes with the workflow or script from the video, ready to import and change.'],
      ['From zero to useful', 'Courses run from beginner to advanced. Each one says at the top what you should already know.'],
      ['Two new lessons every week', 'On Tuesday and Friday. A subscription includes all of them.'],
    ],
    Art: LessonArt,
  },
  {
    label: 'Your account',
    title: 'Pick up',
    soft: 'where you stopped.',
    text: 'Your account remembers what you watched. Your invoices, team seats and password are there too, so you never have to mail us for them.',
    rows: [
      ['Your progress per course', 'See which lessons you finished and continue with the next one in one click.'],
      ['Every invoice, any time', 'Download a copy whenever your bookkeeper asks for it.'],
      ['Seats for your team', 'A team licence has five seats. Invite a colleague, replace one who left.'],
      ['A clear end date', 'We remind you 30 and 7 days before. Nothing renews behind your back.'],
    ],
    Art: MembersArt,
  },
  {
    label: 'Help',
    title: 'Stuck?',
    soft: 'A person answers within a working day.',
    text: 'Ask your question under any lesson or by e-mail. The people who answer are the people who recorded the course.',
    rows: [
      ['Teachers who do this for a living', 'They build workflows for real companies during the week and know where it usually goes wrong.'],
      ['In English or Dutch', 'Write in the language you think in. The videos are in English with subtitles in both.'],
      ['Answers point to the minute', 'You get an explanation and the exact place in a lesson where it is shown.'],
    ],
    Art: HelpArt,
  },
]

function Rows({ rows }) {
  const [open, setOpen] = useState(0)
  return (
    <ul className="rows">
      {rows.map(([title, text], i) => (
        <li key={title} className={`row ${open === i ? 'row--open' : ''}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="row__nr">0{i + 1}</span>
            <span className="row__title">{title}</span>
            <span className="row__plus" aria-hidden="true" />
          </button>
          <div className="row__body">
            <p>{text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Capabilities() {
  return (
    <div className="caps" id="learn">
      {CHAPTERS.map(({ label, title, soft, text, rows, Art }, i) => (
        <section key={label} className={`cap ${i % 2 ? 'cap--flip' : ''}`}>
          <div className="container cap__inner">
            <Reveal className="cap__text">
              <p className="eyebrow">{label}</p>
              <h2 className="h-cap">
                {title} <span className="soft">{soft}</span>
              </h2>
              <p className="cap__lede">{text}</p>
              <Rows rows={rows} />
            </Reveal>
            <Reveal className="cap__art" delay={120}>
              <Art />
            </Reveal>
          </div>
        </section>
      ))}
    </div>
  )
}
