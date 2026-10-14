import { useState } from 'react';
import { BlobField } from '../components/Blobs.jsx';
import CourseCard, { Skeleton } from '../components/CourseCard.jsx';
import { PageHead } from '../components/ui.jsx';
import { LEVELS } from '../data/catalog.js';
import { getCourses } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';

export default function Courses() {
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('popular');
  const { data, error, loading } = useApi(() => getCourses({ ...(level && { level }), sort }), [level, sort]);

  return (
    <div className="page">
      <BlobField blobs={[
        { x: '82%', y: '-6%', size: 260, duration: 15 },
        { x: '90%', y: '8%', size: 160, duration: 11, delay: -4, dx1: -70, dy1: 40 },
      ]} />
      <div className="wrap" style={{ position: 'relative' }}>
        <PageHead label="Catalog" title={<>All <span className="serif">courses</span></>}>
          <p className="lead">One catalog, one source of truth. Courses, lessons and durations come from the same database as the Vimeo videos.</p>
        </PageHead>
        <div className="between" style={{ marginBottom: 32 }}>
          <div className="row">
            <button className={`chip ${!level ? 'on' : ''}`} onClick={() => setLevel('')}>All levels</button>
            {LEVELS.map((l) => <button key={l} className={`chip ${level === l ? 'on' : ''}`} onClick={() => setLevel(l)}>{l}</button>)}
          </div>
          <div className="toggle" role="group" aria-label="Sort">
            <button className={sort === 'popular' ? 'on' : ''} onClick={() => setSort('popular')}>Popular</button>
            <button className={sort === 'new' ? 'on' : ''} onClick={() => setSort('new')}>Newest</button>
          </div>
        </div>
        {error && <div className="notice accent">Could not load the catalog: {error.message}. Is the API running (npm run dev)?</div>}
        <div className="grid-3">
          {loading ? <Skeleton n={6} /> : data?.map((c, i) => <CourseCard key={c.slug} course={c} i={i} />)}
        </div>
        {!loading && data && <p className="hint" style={{ marginTop: 24 }}>{data.length} live courses.</p>}
      </div>
    </div>
  );
}
