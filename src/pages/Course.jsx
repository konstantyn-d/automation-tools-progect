import { Link, useParams } from 'react-router-dom';
import { MorphBlob, Play } from '../components/Blobs.jsx';
import { Spinner } from '../components/ui.jsx';
import { fmtDuration, fmtTime, lessonLabel } from '../data/catalog.js';
import { getCourse } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useApi } from '../lib/useApi.js';
import { eur } from '../lib/vat.js';
import NotFound from './NotFound.jsx';

export default function Course() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: c, error, loading } = useApi(() => getCourse(slug), [slug]);
  if (loading) return <div className="page"><div className="wrap"><Spinner /></div></div>;
  if (error || !c) return <NotFound />;

  return (
    <div className="page">
      <div className="wrap">
        <Link to="/courses" className="link">← All courses</Link>
        <div className="grid-2" style={{ marginTop: 32, alignItems: 'center' }}>
          <div className="stack">
            <div className="row">{c.level && <span className="chip">{c.level}</span>}{c.status === 'retired' && <span className="chip">retired</span>}</div>
            <h1 className="h-1">{c.title}</h1>
            {c.summary && <p className="lead">{c.summary}</p>}
            <div className="row label">
              <span>{c.video_count} lessons</span><span>·</span><span>{fmtDuration(c.duration_min)}</span>
              {c.published_on && <><span>·</span><span>since {c.published_on.slice(0, 7)}</span></>}
            </div>
            <div className="row" style={{ marginTop: 24 }}>
              {c.lessons[0] && <Link to={`/courses/${c.slug}/${c.lessons[0].position}`} className="btn btn-ink"><Play /> Watch free lesson</Link>}
              {!user && <Link to={`/order?plan=single&course=${c.slug}`} className="btn btn-ghost">Buy this course · {eur(c.single_price)}</Link>}
            </div>
          </div>
          <div style={{ position: 'relative', height: 420 }}>
            <MorphBlob size={420} style={{ position: 'absolute', right: 0, top: 0, maxWidth: '100%' }} />
            <MorphBlob size={150} color="var(--accent)" speed={0.01} style={{ position: 'absolute', right: 20, bottom: 10 }} />
          </div>
        </div>

        <hr className="divider" />
        <h2 className="h-2" style={{ marginBottom: 16 }}>Lessons</h2>
        <div className="lesson-list">
          {c.lessons.map((l) => (
            <Link key={l.position} to={`/courses/${c.slug}/${l.position}`}>
              <span><span className="mono dim">{String(l.position).padStart(2, '0')}</span>&nbsp;&nbsp;{lessonLabel(l)}</span>
              <span className="row" style={{ gap: 8 }}>
                {l.free ? <span className="chip chip-accent">Free</span> : !user && <span className="chip">Members</span>}
                <span className="mono dim">{fmtTime(l.duration_s)}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
