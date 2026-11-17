import { useEffect, useRef, useState } from 'react'
import { useInView } from '../lib/useInView.js'
import { STEPS, playRun } from '../lib/pipeline.js'
import '../styles/pipeline.css'

const CUSTOMER_VIEW = {
  idle: { title: 'Waiting for an order', text: 'Press the button to send a test order through the chain.' },
  order: { title: 'Thanks, Hanne', text: 'We got your order for a yearly subscription.' },
  validate: { title: 'Details checked', text: 'Belgian address, 21% VAT. Nothing to mail back and forth about.' },
  invoice: { title: 'Invoice 2026-0143', text: '€ 180.29 incl. VAT. The PDF is in your inbox.' },
  payment: { title: 'Payment received', text: 'Matched to your invoice by its reference.' },
  access: { title: 'Welcome to LoopCasts', text: 'Your account is ready. Choose your password and start watching.' },
}

function StatusMark({ status }) {
  if (status === 'done') {
    return (
      <svg className="pixel node__mark" viewBox="0 0 7 6" width="14" height="12" aria-hidden="true">
        <path fill="currentColor" d="M5 0h2v2H5zM4 2h2v1H4zM3 3h2v1H3zM0 2h2v2H0zM1 4h3v1H1zM2 5h1v1H2z" />
      </svg>
    )
  }
  if (status === 'error') return <span className="node__mark node__mark--x">!</span>
  return <span className="node__dot" />
}

// One order run, step by step. Used in the admin panel.
// Today it plays lib/pipeline.js; later it listens to real events from n8n.
export default function Pipeline() {
  const [ref, inView] = useInView({ threshold: 0.35 })
  const [status, setStatus] = useState({})
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)
  const [fail, setFail] = useState(false)
  const [current, setCurrent] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef(null)
  const startedRef = useRef(false)

  const run = (withFailure) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus({})
    setLog([])
    setElapsed(0)
    setRunning(true)
    const startedAt = Date.now()
    const ticker = setInterval(() => setElapsed(Date.now() - startedAt), 100)
    const stamp = () => ((Date.now() - startedAt) / 1000).toFixed(1).padStart(4, '0')

    playRun({
      fail: withFailure,
      signal: controller.signal,
      emit: (event) => {
        if (event.type === 'step') {
          setStatus((s) => ({ ...s, [event.id]: event.status }))
          if (event.status === 'running') setCurrent(event.id)
        } else if (event.type === 'log') {
          setLog((l) => [...l.slice(-7), { ...event, t: stamp(), key: `${Date.now()}-${l.length}` }])
        } else if (event.type === 'finished') {
          setRunning(false)
        }
      },
    }).finally(() => clearInterval(ticker))
  }

  // play once by itself when the panel scrolls into view
  useEffect(() => {
    if (inView && !startedRef.current) {
      startedRef.current = true
      run(false)
    }
  }, [inView])

  useEffect(() => () => abortRef.current?.abort(), [])

  const view = CUSTOMER_VIEW[current]
  const finished = status.access === 'done'

  return (
    <div className="instrument" ref={ref}>
      <div className="instrument__bar">
        <span className="eyebrow">
          <span className={`live ${running ? 'live--on' : ''}`} /> Test order · yearly subscription
        </span>
        <div className="instrument__controls">
          <label className="switch">
            <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} />
            <span className="switch__track" />
            Mail server is down
          </label>
          <button className="key key--dark key--sm" onClick={() => run(fail)}>
            {running ? 'Restart' : 'Run a test order'} <span className="arrow">→</span>
          </button>
        </div>
      </div>

      <ol className="flow">
        {STEPS.map((step, i) => {
          const st = status[step.id] || 'idle'
          return (
            <li key={step.id} className={`node node--${st}`}>
              {i > 0 && <span className={`wire ${status[STEPS[i - 1].id] === 'done' ? 'wire--on' : ''}`} />}
              <div className="node__card">
                <div className="node__top">
                  <span className="node__nr">0{i + 1}</span>
                  <StatusMark status={st} />
                </div>
                <span className="node__label">{step.label}</span>
                <span className="node__detail">{st === 'retry' ? 'Retrying…' : st === 'error' ? 'Failed' : step.detail}</span>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="instrument__lower">
        <div className="console" aria-live="polite">
          <span className="eyebrow">Event log</span>
          <ul>
            {log.length === 0 && <li className="console__empty">No events yet</li>}
            {log.map((line) => (
              <li key={line.key} className={`console__line console__line--${line.level}`}>
                <span className="console__t">{line.t}</span>
                {line.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="customer">
          <span className="eyebrow">What the customer sees</span>
          <div className="customer__card" key={current}>
            <strong>{view.title}</strong>
            <p>{view.text}</p>
          </div>
          <div className="metric">
            <span className="metric__value">{(elapsed / 1000).toFixed(1)} s</span>
            <span className="metric__label">
              {finished ? 'from order to access' : 'running'}
              <em>by hand this took up to 5 days</em>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
