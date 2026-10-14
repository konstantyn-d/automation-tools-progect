import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageHead } from '../components/ui.jsx';
import { fmtTime, searchTranscripts } from '../data/catalog.js';

function highlight(text, q) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0 || !q) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const active = params.get('q') || '';
  const hits = useMemo(() => searchTranscripts(active), [active]);

  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 980 }}>
        <PageHead label="Search in video transcripts" title={<>Find the <span className="serif">exact second.</span></>} />
        <form className="search-big" onSubmit={(e) => { e.preventDefault(); setParams(q ? { q } : {}); }}>
          <input autoFocus placeholder="password, VAT, webhook, subtitles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <button className="btn btn-ink">Search</button>
        </form>
        <p className="hint" style={{ marginTop: 12 }}>Mock: searches the sample transcripts in the browser. Production: full-text index over Whisper transcripts of all videos.</p>

        <div style={{ marginTop: 40 }}>
          {active && <div className="label" style={{ marginBottom: 16 }}>{hits.length} result{hits.length === 1 ? '' : 's'} for “{active}”</div>}
          {hits.map((h, i) => (
            <Link key={i} to={`/courses/${h.course.slug}/${h.lesson.slug}?t=${h.line.start}`} className="card card-hover" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 18, textDecoration: 'none', marginBottom: 12, padding: 22 }}>
              <span className="chip chip-accent" style={{ justifyContent: 'center' }}>{fmtTime(h.line.start)}</span>
              <span className="stack" style={{ gap: 4 }}>
                <span style={{ fontSize: 18 }}>“{highlight(h.line.text, active)}”</span>
                <span className="label">{h.course.title} · {h.lesson.title}</span>
              </span>
            </Link>
          ))}
          {active && hits.length === 0 && (
            <div className="notice">
              <span>Nothing found. Did you mean a course idea? <Link to="/support?topic=idea" className="link">Suggest a course</Link></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
