import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { PageHead, Spinner } from '../components/ui.jsx';
import { fmtTime, lessonLabel } from '../data/catalog.js';
import { searchVideos } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const active = params.get('q') || '';
  const [q, setQ] = useState(active);
  const { data: hits, loading } = useApi(() => (active ? searchVideos(active) : Promise.resolve([])), [active]);

  return (
    <div className="page">
      <div className="wrap" style={{ maxWidth: 980 }}>
        <PageHead label="Search in all videos" title={<>Find the <span className="serif">right lesson.</span></>} />
        <form className="search-big" onSubmit={(e) => { e.preventDefault(); setParams(q ? { q } : {}); }}>
          <input autoFocus placeholder="webhook, docker, invoices, RAG…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <button className="btn btn-ink">Search</button>
        </form>
        <p className="hint" style={{ marginTop: 12 }}>
          Postgres full-text search over all 599 videos. Today it searches course and video titles; once transcripts exist it searches every spoken word with the same query.
        </p>

        <div style={{ marginTop: 40 }}>
          {loading && active && <Spinner />}
          {!loading && active && <div className="label" style={{ marginBottom: 16 }}>{hits.length} result{hits.length === 1 ? '' : 's'} for “{active}”</div>}
          {!loading && hits?.map((h) => (
            <Link key={`${h.course_slug}-${h.position}`} to={`/courses/${h.course_slug}/${h.position}`} className="card card-hover"
              style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 18, textDecoration: 'none', marginBottom: 12, padding: 22 }}>
              <span className="chip chip-accent" style={{ justifyContent: 'center' }}>{fmtTime(h.duration_s)}</span>
              <span className="stack" style={{ gap: 4 }}>
                <span style={{ fontSize: 18 }}>{h.course_title} · {lessonLabel(h)}</span>
                {h.snippet && <span className="dim" dangerouslySetInnerHTML={{ __html: h.snippet.replace(/<(?!\/?b>)/g, '&lt;') }} />}
              </span>
            </Link>
          ))}
          {!loading && active && hits?.length === 0 && (
            <div className="notice">
              <span>Nothing found. Is this a course you would like? <Link to="/support?topic=idea" className="link">Suggest a course</Link></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
