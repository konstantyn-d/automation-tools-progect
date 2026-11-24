import { useEffect, useRef } from 'react'
import park from '../assets/hero-park.webp'

// The first screen: a laptop on a bench under a big tree, the city and the sea behind it.
// The picture (assets/hero-park.webp, 1392 × 768) covers the hero like background-size: cover.
// On narrow screens it slides so the laptop stays in view. Children are placed in picture
// coordinates (--px is one picture pixel on screen), so the notices stay above the laptop.
const W = 1392
const H = 768

export default function HeroScene({ children }) {
  const boxRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    const hero = box.parentElement
    const place = () => {
      const pw = hero.clientWidth
      const ph = hero.clientHeight
      const scale = Math.max(pw / W, ph / H)
      const width = W * scale
      // picture x that should sit in the middle: the whole view on wide screens, the laptop on narrow ones
      const focus = pw >= 1200 ? 720 : pw > 760 ? 940 : 1110
      const left = Math.min(0, Math.max(pw - width, pw / 2 - focus * scale))
      box.style.width = `${width}px`
      box.style.height = `${H * scale}px`
      box.style.left = `${left}px`
      box.style.setProperty('--px', `${scale}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(hero)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="hero-scene" ref={boxRef}>
      <img className="hero-scene__img" src={park} width={W} height={H} alt="A laptop on a wooden bench under a big tree, with a city and the sea in the distance" fetchPriority="high" />
      <div className="hero-scene__rays" aria-hidden="true" />
      {children}
    </div>
  )
}
