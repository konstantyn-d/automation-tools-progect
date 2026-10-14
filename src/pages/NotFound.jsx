import { Link } from 'react-router-dom';
import { MorphBlob } from '../components/Blobs.jsx';

export default function NotFound() {
  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div className="stack" style={{ position: 'relative' }}>
        <MorphBlob size={300} style={{ margin: '0 auto' }} />
        <h1 className="h-1">Lost in the <span className="serif">loop.</span></h1>
        <Link to="/" className="btn btn-ink" style={{ alignSelf: 'center' }}>Home</Link>
      </div>
    </div>
  );
}
