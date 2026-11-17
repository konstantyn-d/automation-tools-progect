import { useEffect, useState } from 'react'
import { PauseIcon, PlayIcon } from './icons.jsx'

const SPEEDS = [1, 1.5, 2]

export function toSeconds(time) {
  const [m, s] = time.split(':').map(Number)
  return m * 60 + s
}

export function toClock(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// The lesson player. There is no video file behind it yet: it shows an animated
// stand-in and keeps real time, so chapters, progress and "watched" already work.
// Later the stand-in screen is replaced by the embed of the video host.
export default function Player({ lesson, chapters, seek, onFinished }) {
  const duration = toSeconds(lesson.time)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [speed, setSpeed] = useState(1)

  // a click on a chapter jumps to its start
  useEffect(() => {
    if (seek) {
      setTime(seek.to)
      setPlaying(true)
    }
  }, [seek])

  useEffect(() => {
    if (!playing) return undefined
    const id = setInterval(() => setTime((t) => Math.min(duration, t + 0.25 * speed)), 250)
    return () => clearInterval(id)
  }, [playing, speed, duration])

  useEffect(() => {
    if (time >= duration) {
      setPlaying(false)
      onFinished()
    }
  }, [time, duration, onFinished])

  const toggle = () => {
    if (time >= duration) setTime(0)
    setPlaying((p) => !p)
  }
  const step = Math.min(3, Math.floor((time / duration) * 4)) // which of the four nodes is "live"

  return (
    <div className={`screen ${playing ? 'is-playing' : ''}`}>
      <button className="screen__stage" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        <span className="screen__badge">
          Lesson {lesson.nr} · {lesson.title}
        </span>
        <span className="screen__nodes" aria-hidden="true">
          {[0, 1, 2, 3].map((n) => (
            <i key={n} className={n < step ? 'is-done' : n === step && (playing || time > 0) ? 'is-live' : ''} />
          ))}
        </span>
        {!playing && (
          <span className="screen__big">
            <PlayIcon size={3} />
          </span>
        )}
      </button>

      <div className="screen__controls">
        <button className="screen__btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <PauseIcon size={1.5} /> : <PlayIcon size={1.5} />}
        </button>
        <span className="screen__time">
          {toClock(time)} / {lesson.time}
        </span>
        <div className="screen__scrub">
          <input
            type="range"
            min="0"
            max={duration}
            step="1"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            aria-label="Position in the lesson"
            style={{ '--p': `${(time / duration) * 100}%` }}
          />
          {chapters.slice(1).map((c) => (
            <span key={c.at} className="screen__tick" style={{ left: `${(c.at / duration) * 100}%` }} />
          ))}
        </div>
        <button className="screen__btn screen__btn--text" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}>
          {speed}×
        </button>
      </div>
    </div>
  )
}
