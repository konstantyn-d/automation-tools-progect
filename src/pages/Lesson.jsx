import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BlobField, Play } from '../components/Blobs.jsx';
import { COURSES, fmtTime } from '../data/catalog.js';
import { useAuth } from '../lib/auth.jsx';
import NotFound from './NotFound.jsx';

export default function Lesson() {
  const { slug, lesson } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const c = COURSES.find((x) => x.slug === slug);
  const l = c?.lessons.find((x) => x.slug === lesson);
  const [t, setT] = useState(Number(params.get('t')) || 0);
  const [cc, setCc] = useState('EN');

  useEffect(() => { setT(Number(params.get('t')) || 0); }, [params, lesson]);
  if (!c || !l) return <NotFound />;

  const locked = !l.free && !user;
  const current = [...l.transcript].reverse().find((x) => x.start <= t) || l.transcript[0];

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
                <>
                  <div className="stack" style={{ textAlign: 'center', position: 'relative' }}>
                    <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto' }}><Play size={24} /></span>
                    <span className="mono" style={{ color: '#888', fontSize: 12 }}>Vimeo player (private, embed only) · {fmtTime(t)}</span>
                  </div>
                  {cc !== 'Off' && <div className="cc">{current.text}</div>}
                </>
              )}
            </div>
            <div className="between">
              <h1 className="h-2">{l.title}</h1>
              <div className="toggle" role="group" aria-label="Subtitles">
                {['EN', 'NL', 'Off'].map((x) => <button key={x} className={cc === x ? 'on' : ''} onClick={() => setCc(x)}>{x}</button>)}
              </div>
            </div>
            <p className="hint">Subtitles and chapters are generated from the transcript when the video is uploaded. NL subtitles are mocked with the EN text.</p>
          </div>

          <div className="card">
            <div className="between" style={{ marginBottom: 12 }}>
              <span className="label">Transcript</span>
              <Link to={`/search?q=`} className="link">Search all videos</Link>
            </div>
            <div className="transcript">
              {l.transcript.map((line) => (
                <div key={line.start} className={`tline ${line === current ? 'on' : ''}`} onClick={() => !locked && setT(line.start)}>
                  <span className="mono">{fmtTime(line.start)}</span>
                  <span style={locked ? { filter: 'blur(4px)' } : undefined}>{line.text}</span>
                </div>
              ))}
            </div>
            <hr className="divider" style={{ margin: '20px 0' }} />
            <div className="label" style={{ marginBottom: 8 }}>More in this course</div>
            <div className="lesson-list">
              {c.lessons.map((x) => (
                <Link key={x.slug} to={`/courses/${c.slug}/${x.slug}`} className={x.slug === l.slug ? 'active' : ''}>
                  <span>{x.title}</span><span className="mono dim">{x.minutes}m</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
