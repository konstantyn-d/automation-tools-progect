import { Link, useParams } from 'react-router-dom';
import { BlobField, Play } from '../components/Blobs.jsx';
import { Spinner } from '../components/ui.jsx';
import { fmtTime, lessonLabel } from '../data/catalog.js';
import { getCourse } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useApi } from '../lib/useApi.js';
import NotFound from './NotFound.jsx';

export default function Lesson() {
  const { slug, lesson } = useParams();
  const { user } = useAuth();
  const { data: c, loading } = useApi(() => getCourse(slug), [slug]);
  if (loading) return <div className="page"><div className="wrap"><Spinner /></div></div>;
  const l = c?.lessons.find((x) => String(x.position) === lesson);
  if (!c || !l) return <NotFound />;

  const locked = !l.free && !user;
  const next = c.lessons.find((x) => x.position === l.position + 1);

  return (
    <div className="page">
      <div className="wrap">
        <Link to={`/courses/${c.slug}`} className="link">← {c.title}</Link>
        <div className="grid-2" style={{ gridTemplateColumns: '1.6fr 1fr', marginTop: 28, alignItems: 'start' }}>
          <div className="stack">
            <div className="player">
              <BlobField blobs={[
                { x: '10%', y: '20%', size: 200, color: '#1d1d1d', duration: 14 },
                { x: '60%', y: '40%', size: 260, color: '#1d1d1d', duration: 17, delay: -5 },
              ]} />
              {locked ? (
                <div className="stack" style={{ textAlign: 'center', position: 'relative', padding: 24 }}>
                  <div className="label" style={{ color: '#aaa' }}>Members only</div>
                  <h2 className="h-2">This lesson is part of full access.</h2>
                  <div className="row" style={{ justifyContent: 'center' }}>
                    <Link to="/order" className="btn btn-accent">Get access</Link>
                    <Link to="/login" className="btn btn-ghost" style={{ color: '#fff', borderColor: '#444' }}>Log in</Link>
                  </div>
                </div>
              ) : (
                <div className="stack" style={{ textAlign: 'center', position: 'relative' }}>
                  <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto' }}><Play size={24} /></span>
                  <span className="mono" style={{ color: '#888', fontSize: 12 }}>
                    {l.vimeo_id ? `Vimeo video ${l.vimeo_id} · embed only on loopcasts domain` : 'Video unlocks with a real login (step 2)'} · {fmtTime(l.duration_s)}
                  </span>
                </div>
              )}
            </div>
            <div className="between">
              <h1 className="h-2">{lessonLabel(l)}</h1>
              {next && <Link to={`/courses/${c.slug}/${next.position}`} className="btn btn-ghost btn-sm">Next lesson</Link>}
            </div>
            <div className="row">
              <span className="chip">{l.has_chapters ? 'Chapters' : 'No chapters yet'}</span>
              <span className="chip">{l.has_captions ? 'Subtitles' : 'No subtitles yet'}</span>
            </div>
          </div>

          <div className="card">
            <span className="label">Transcript</span>
            <p className="hint" style={{ marginTop: 12 }}>
              None of the 599 videos has a transcript or subtitles yet. The Whisper step (plan step 7) fills this panel and makes every word searchable.
            </p>
            <hr className="divider" style={{ margin: '20px 0' }} />
            <div className="label" style={{ marginBottom: 8 }}>In this course</div>
            <div className="lesson-list transcript">
              {c.lessons.map((x) => (
                <Link key={x.position} to={`/courses/${c.slug}/${x.position}`} className={x.position === l.position ? 'active' : ''}>
                  <span>{lessonLabel(x)}{x.free && <span className="accent"> · free</span>}</span><span className="mono dim">{fmtTime(x.duration_s)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
