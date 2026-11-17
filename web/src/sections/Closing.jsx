import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { Wordmark } from '../components/Nav.jsx'
import { Fringe, Rects, ellipseRects } from '../components/pixel.jsx'
import '../styles/closing.css'

// Evening version of the landscape for the closing card.
function DuskArt() {
  const hillBack = ellipseRects(40, 190, 120, 60)
  const hillFront = ellipseRects(150, 214, 130, 64)
  const sun = ellipseRects(116, 92, 22, 22)
  const fireflies = [[14, 150], [70, 146], [96, 160], [128, 150], [146, 164], [84, 138], [112, 144], [50, 152]]
  return (
    <svg className="pixel dusk" viewBox="0 0 163 226" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="163" height="40" fill="#27356e" />
      <rect y="40" width="163" height="30" fill="#5a4a8f" />
      <rect y="70" width="163" height="26" fill="#c2608f" />
      <rect y="96" width="163" height="22" fill="#f08a6b" />
      <rect y="118" width="163" height="108" fill="#f9bf7a" />
      <Rects list={sun} fill="#ffe9a8" />
      {[[14, 14], [40, 30], [76, 10], [120, 22], [146, 44], [98, 46], [24, 56]].map(([x, y], i) => (
        <rect key={i} className="star" style={{ animationDelay: `${i * -0.7}s` }} x={x} y={y} width="2" height="2" fill="#fff" />
      ))}
      <Rects list={hillBack} fill="#2a6b46" />
      <Rects list={hillFront} fill="#1d5235" />
      <rect y="206" width="163" height="20" fill="#163f2a" />
      {/* a small house with a lit window: somebody is still learning */}
      <g transform="translate(-8 -30)">
        <rect x="34" y="150" width="26" height="18" fill="#3b2a3f" />
        <path fill="#2a1d2e" d="M32 150h30v-2h-2v-2h-2v-2h-2v-2h-2v-2H40v2h-2v2h-2v2h-2v2h-2z" />
        <rect className="window" x="42" y="155" width="6" height="7" fill="#ffd66b" />
        <rect x="51" y="158" width="5" height="10" fill="#2a1d2e" />
      </g>
      {fireflies.map(([x, y], i) => (
        <rect key={i} className="firefly" style={{ animationDelay: `${i * -0.9}s` }} x={x} y={y} width="2" height="2" fill="#ffe97a" />
      ))}
    </svg>
  )
}

export default function Closing({ onNav }) {
  return (
    <footer className="closing">
      <div className="closing__grid-bg" aria-hidden="true" />
      <div className="container closing__inner">
        <Reveal className="closing__left">
          <h2 className="h-section">
            Keep the work you like. <span className="soft">Automate the rest, one lesson at a time.</span>
          </h2>

          <div className="closing__links">
            <p className="closing__inline">
              <button onClick={() => onNav('courses')}>Courses</button>
              <button onClick={() => onNav('learn')}>How it works</button>
              <button onClick={() => onNav('pricing')}>Pricing</button>
              <button onClick={() => onNav('faq')}>FAQ</button>
            </p>
            <div className="closing__cols">
              <ul>
                <li className="eyebrow">Account</li>
                <li><Link to="/login">Sign in</Link></li>
                <li><Link to="/account">My courses</Link></li>
                <li><Link to="/order">Order</Link></li>
              </ul>
              <ul>
                <li className="eyebrow">LoopCasts BV</li>
                <li><a href="mailto:support@loopcasts.example">support@loopcasts.example</a></li>
                <li>Ghent, Belgium</li>
                <li><Link to="/admin">Staff</Link></li>
              </ul>
            </div>
          </div>

          <p className="closing__fine">
            Your data stays in the EU. We keep invoices for seven years because the law asks us to, and
            nothing else longer than needed.
          </p>
        </Reveal>

        <Reveal className="closing-card" delay={140}>
          <DuskArt />
          <div className="closing-card__caption">
            <p>Start with one lesson tonight.</p>
            <Link to="/courses/n8n-basics/1" className="key key--light">
              Watch a free lesson <span className="arrow">→</span>
            </Link>
          </div>
        </Reveal>
      </div>

      <Fringe color="#58b245" seed={12} height={56} />
      <div className="closing__ground">
        <Wordmark />
        <span>© 2026 LoopCasts BV · made above a bike shop in Ghent</span>
      </div>
    </footer>
  )
}
