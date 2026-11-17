import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { seeded } from '../lib/random.js'
import { PLANS } from '../data/site.js'
import '../styles/pricing.css'

// A strip of pixel flowers on top of the main plan.
function FlowerBanner() {
  const flowers = useMemo(() => {
    const rand = seeded(77)
    return Array.from({ length: 34 }, (_, i) => ({
      x: 4 + i * 7 + Math.floor(rand() * 3),
      h: 6 + Math.floor(rand() * 9),
      color: ['#ffffff', '#ffd23f', '#ff9fb3', '#ffe066', '#c9b6ff'][Math.floor(rand() * 5)],
    }))
  }, [])
  return (
    <svg className="pixel flower-banner" viewBox="0 0 244 40" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="244" height="40" fill="#6fb8f5" />
      <rect y="14" width="244" height="26" fill="#93cdf9" />
      <rect y="30" width="244" height="10" fill="#58b245" />
      <rect y="34" width="244" height="6" fill="#439d39" />
      {flowers.map((f, i) => (
        <g key={i}>
          <rect x={f.x + 1} y={34 - f.h} width="1" height={f.h} fill="#2f7d2e" />
          <rect x={f.x} y={32 - f.h} width="3" height="3" fill={f.color} />
          <rect x={f.x + 1} y={33 - f.h} width="1" height="1" fill="#f59e0b" />
        </g>
      ))}
    </svg>
  )
}

function Check() {
  return (
    <svg className="pixel check" viewBox="0 0 9 9" width="18" height="18" aria-hidden="true">
      <path fill="var(--ok)" d="M2 0h5v1h1v1h1v5H8v1H7v1H2V8H1V7H0V2h1V1h1z" />
      <path fill="#fff" d="M6 2h1v2H6zM5 4h1v1H5zM4 5h1v1H4zM2 4h1v1H2zM3 5h1v1H3z" />
    </svg>
  )
}

export default function Pricing() {
  const featured = PLANS.find((p) => p.featured)
  const others = PLANS.filter((p) => !p.featured)

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <Reveal className="pricing__head">
          <p className="eyebrow">Pricing</p>
          <h2 className="h-section">
            One price for everything. <span className="soft">Or only the course you need.</span>
          </h2>
        </Reveal>

        <div className="pricing__layout">
          <Reveal className="plan">
            <div className="plan__label">
              <span>{featured.name}</span>
              <i className="chip chip--ok">most chosen</i>
            </div>
            <FlowerBanner />
            <div className="plan__price">
              <span className="plan__currency">€</span>
              <span className="plan__amount">{featured.price}</span>
              <span className="plan__unit">{featured.unit}, excl. VAT</span>
            </div>
            <p className="plan__blurb">{featured.blurb}</p>
            <ul className="plan__list">
              {featured.includes.map((line) => (
                <li key={line}>
                  <Check />
                  {line}
                </li>
              ))}
            </ul>
            <Link to={`/order?product=${featured.id}`} className="key key--dark plan__cta">
              Order the yearly subscription <span className="arrow">→</span>
            </Link>
          </Reveal>

          <div className="plans">
            {others.map((p, i) => (
              <Reveal key={p.id} className="plan-row" delay={i * 80}>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                </div>
                <div className="plan-row__price">
                  <span className="plan-row__amount">€{p.price}</span>
                  <span>{p.unit}</span>
                </div>
                <Link to={`/order?product=${p.id}`} className="key key--light key--sm">
                  Order
                </Link>
              </Reveal>
            ))}
            <Reveal as="p" className="pricing__note" delay={240}>
              Prices without VAT. Belgian customers pay 21%. EU companies with a valid VAT number pay
              0%, reverse charged. You pay by bank transfer with the reference on your invoice.
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
