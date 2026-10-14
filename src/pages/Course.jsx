import { Link, useParams } from 'react-router-dom';
import { MorphBlob, Play } from '../components/Blobs.jsx';
import { COURSES, fmtDuration } from '../data/catalog.js';
import { useAuth } from '../lib/auth.jsx';
import NotFound from './NotFound.jsx';

export default function Course() {
  const { slug } = useParams();
  const { user } = useAuth();
  const c = COURSES.find((x) => x.slug === slug);
  if (!c) return <NotFound />;

  return (
    <div className="page">
      <div className="wrap">
        <Link to="/courses" className="link">← All courses</Link>
        <div className="grid-2" style={{ marginTop: 32, alignItems: 'center' }}>
          <div className="stack">
            <div className="row"><span className="chip">{c.tag}</span><span className="chip">{c.level}</span></div>
            <h1 className="h-1">{c.title}</h1>
            <p className="lead">{c.summary}</p>
            <div className="row label">
              <span>{c.lessonsCount} lessons</span><span>·</span><span>{fmtDuration(c.minutes)}</span><span>·</span><span>with {c.teacher}</span>
            </div>
            <div className="row" style={{ marginTop: 24 }}>
              <Link to={`/courses/${c.slug}/${c.lessons[0].slug}`} className="btn btn-ink"><Play /> Watch free lesson</Link>
              {!user && <Link to="/order" className="btn btn-ghost">Get full access</Link>}
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
          {c.lessons.map((l, i) => (
            <Link key={l.slug} to={`/courses/${c.slug}/${l.slug}`}>
              <span><span className="mono dim">{String(i + 1).padStart(2, '0')}</span>&nbsp;&nbsp;{l.title}</span>
              <span className="row" style={{ gap: 8 }}>
                {l.free ? <span className="chip chip-accent">Free</span> : !user && <span className="chip">Members</span>}
                <span className="mono dim">{l.minutes} min</span>
              </span>
            </Link>
          ))}
          {c.lessonsCount > c.lessons.length && (
            <p className="dim" style={{ fontSize: 14 }}>+ {c.lessonsCount - c.lessons.length} more lessons (mock data shows a sample).</p>
          )}
        </div>
      </div>
    </div>
  );
}
