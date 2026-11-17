import { Link } from 'react-router-dom'
import { Fringe } from '../components/pixel.jsx'
import '../styles/order.css'

// Placeholder for the parts of the platform that are built in the next milestones.
export default function ComingSoon({ label, title, text }) {
  return (
    <main className="soon">
      <div className="soon__body">
        <p className="eyebrow">{label}</p>
        <h1 className="h-section">{title}</h1>
        <p className="lede">{text}</p>
        <Link to="/" className="key key--dark">
          <span aria-hidden="true">←</span> Back to the site
        </Link>
      </div>
      <Fringe color="#58b245" seed={12} height={56} />
      <div className="soon__ground" />
    </main>
  )
}
