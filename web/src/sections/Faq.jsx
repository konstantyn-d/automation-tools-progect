import { useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import { FAQ } from '../data/site.js'

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq" id="faq">
      <div className="container">
        <Reveal className="pricing__head">
          <p className="eyebrow">Questions</p>
          <h2 className="h-section">
            The things people ask us <span className="soft">every week.</span>
          </h2>
        </Reveal>
        <Reveal as="ul" className="faq__list">
          {FAQ.map((item, i) => (
            <li key={item.q} className={open === i ? 'is-open' : ''}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{item.q}</span>
                <span className="faq__toggle" aria-hidden="true" />
              </button>
              <div className="faq__answer">
                <p>{item.a}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
