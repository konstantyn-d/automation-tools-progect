import { useMemo } from 'react'
import Reveal from '../components/Reveal.jsx'
import { useInView } from '../lib/useInView.js'
import { seeded } from '../lib/random.js'
import { WORDS } from '../data/site.js'
import '../styles/wordgrid.css'

const COLS = 21
const ROWS = 9
// where each word starts: [row, column]
const PLACES = [
  [0, 2], [1, 12], [2, 5], [3, 13], [4, 1], [4, 9], [5, 14], [6, 3], [7, 11], [8, 4],
]

function buildGrid() {
  const rand = seeded(42)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const cells = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ ch: alphabet[Math.floor(rand() * 26)], word: -1 })),
  )
  WORDS.forEach((word, w) => {
    const [row, col] = PLACES[w]
    ;[...word].forEach((ch, i) => {
      cells[row][col + i] = { ch, word: w }
    })
  })
  return cells
}

export default function WordGrid() {
  const cells = useMemo(buildGrid, [])
  const [ref, inView] = useInView({ threshold: 0.35 })

  return (
    <section className="grid-section">
      <div className="container">
        <Reveal className="grid-section__head">
          <h2 className="grid-section__title">
            One subscription, <span className="soft">every tool you will run into.</span>
          </h2>
          <p className="lede">Somewhere in here is the thing you are stuck on this week.</p>
        </Reveal>

        {/* desktop: a letter field with the topics hidden in it */}
        <div ref={ref} className={`letters ${inView ? 'letters--found' : ''}`} style={{ '--cols': COLS }} aria-hidden="true">
          {cells.map((row, r) =>
            row.map((cell, c) => (
              <span key={`${r}-${c}`} className={cell.word >= 0 ? 'hit' : ''} style={{ '--w': cell.word }}>
                {cell.ch}
              </span>
            )),
          )}
          {WORDS.map((word, w) => {
            const [row, col] = PLACES[w]
            return (
              <i
                key={word}
                className="capsule"
                style={{ '--row': row, '--col': col, '--len': word.length, '--w': w }}
              />
            )
          })}
        </div>

        {/* small screens (and screen readers): the same topics as a plain list */}
        <ul className="topics">
          {WORDS.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
