import Reveal from '../components/Reveal.jsx'
import '../styles/proof.css'

const STATS = [
  { value: '60', label: 'courses, from first webhook to AI agents' },
  { value: '2', label: 'new videos every week, Tuesday and Friday' },
  { value: '9,000', label: 'minutes of lessons with chapters' },
  { value: '1 day', label: 'to get an answer from a real person' },
]

export default function Proof() {
  return (
    <section className="proof">
      <div className="container">
        <Reveal as="p" className="proof__line">
          1,400 developers, data people and small agencies learn here
        </Reveal>
        <div className="proof__grid">
          {STATS.map((s, i) => (
            <Reveal key={s.label} className="proof__cell" delay={i * 70}>
              <span className="proof__value">{s.value}</span>
              <span className="proof__label">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
