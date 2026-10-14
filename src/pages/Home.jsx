import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Arrow, BlobField, MorphBlob, Reveal } from '../components/Blobs.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { COURSES } from '../data/catalog.js';

const HERO_BLOBS = [
  { x: '52%', y: '6%', size: 420, duration: 16, dx1: -80, dy1: 60, dx2: 40, dy2: -30 },
  { x: '68%', y: '30%', size: 300, duration: 12, delay: -3, dx1: -120, dy1: -40, dx2: 60, dy2: 70 },
  { x: '40%', y: '42%', size: 240, duration: 18, delay: -6, dx1: 140, dy1: -60, dx2: -30, dy2: 40 },
  { x: '78%', y: '62%', size: 180, duration: 10, delay: -2, dx1: -60, dy1: -90, dx2: -20, dy2: 30 },
  { x: '10%', y: '70%', size: 140, duration: 14, delay: -8, dx1: 80, dy1: -50, dx2: 50, dy2: 20 },
];

const STEPS = [
  { t: 'Order online', d: 'Pick a plan, we check your VAT number in VIES while you type. Promo codes apply right away.' },
  { t: 'Invoice in your inbox', d: 'A PDF invoice with a structured payment reference arrives within a minute.' },
  { t: 'Pay by transfer', d: 'Use the +++ reference. Our bank matching recognises your payment the same day.' },
  { t: 'Start learning', d: 'Your account is created automatically. You get a link to set your own password.' },
];

export default function Home() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  return (
    <>
      <section className="hero">
        <BlobField blobs={HERO_BLOBS} />
        <div className="hero-content">
          <div className="hero-meta label" style={{ color: '#fff' }}>
            <span>Video courses · Gent, BE</span>
            <span>40+ courses · EN / NL subtitles</span>
          </div>
          <h1 className="h-display">
            <span style={{ display: 'block' }}>Learn it.</span>
            <span style={{ display: 'block' }}>Loop <span className="accent-word">it.</span></span>
          </h1>
        </div>
        <div className="hero-foot">
          <p>Practical video courses for small teams. Order in two minutes, get your invoice instantly, start the day you pay.</p>
          <Link to="/order" className="btn-mega">Start learning <span className="arrow"><Arrow /></span></Link>
          <div className="right">
            <Link to="/courses" className="link">Browse the catalog</Link>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} style={{ display: 'inline-flex', gap: 56 }}>
              {['Power Query', 'Video editing', 'GDPR', 'n8n', 'Presenting', 'Bookkeeping'].map((w) => (
                <span key={w}>{w} <span className="dot">●</span></span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <Reveal className="between" style={{ marginBottom: 48 }}>
            <h2 className="h-1">From order to<br /><span className="serif">first lesson</span> in one day.</h2>
            <p className="lead">No more emails back and forth, no waiting until Friday. Everything below happens automatically.</p>
          </Reveal>
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} className="step" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="step-n">0{i + 1}</span>
                <div>
                  <h3 className="h-3" style={{ marginBottom: 8 }}>{s.t}</h3>
                  <p className="dim" style={{ margin: 0, fontSize: 15 }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="between" style={{ marginBottom: 40 }}>
            <h2 className="h-2">Popular courses</h2>
            <Link to="/courses" className="link">All courses</Link>
          </div>
          <div className="grid-3">
            {COURSES.slice(0, 3).map((c, i) => <Reveal key={c.slug}><CourseCard course={c} i={i} /></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="card card-ink" style={{ padding: 'clamp(28px, 5vw, 72px)', overflow: 'hidden' }}>
            <MorphBlob size={460} color="var(--accent)" style={{ position: 'absolute', right: -120, top: -140 }} />
            <div style={{ position: 'relative', maxWidth: 760 }} className="stack">
              <div className="label">Search inside every video</div>
              <h2 className="h-1">“In which video was <span className="serif">that</span> again?”</h2>
              <p style={{ color: '#bdbdb8', maxWidth: 520 }}>Every lesson is transcribed. Search a word and jump to the exact second.</p>
              <form className="search-big" onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`); }} style={{ borderColor: '#fff' }}>
                <input placeholder="Try “reverse charge” or “webhook”" value={q} onChange={(e) => setQ(e.target.value)} style={{ color: '#fff' }} aria-label="Search videos" />
                <button className="btn btn-accent">Search</button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-2">
          <Reveal className="card card-soft stack">
            <div className="label">For companies</div>
            <h3 className="h-2">Team licence with your <span className="serif">PO number</span> on every invoice.</h3>
            <p className="dim">VAT reverse charge for EU companies, seat management in your account, one invoice a year.</p>
            <Link to="/order?plan=team" className="btn btn-ink" style={{ alignSelf: 'flex-start' }}>Order for my team</Link>
          </Reveal>
          <Reveal className="card card-soft stack">
            <div className="label">Help</div>
            <h3 className="h-2">Questions? We answer within <span className="serif">one business day.</span></h3>
            <p className="dim">Use the support form, not email. Every request gets a ticket number so nothing gets lost.</p>
            <Link to="/support" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>Contact support</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
