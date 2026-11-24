import { useEffect, useRef } from 'react'
import { CLOUD_WIDTH, H, W, paintLive, paintScene } from '../lib/parkScene.js'

// The first screen: a park on a summer afternoon, a laptop in the grass under a big tree.
// The picture is painted once into small canvases (lib/parkScene.js); this component scales it
// up to cover the hero and plays the small things that move: clouds, the laptop screen,
// a flower in the breeze, a ladybug, falling leaves and birds.
//
// The scene box always has the scene's own proportions (16:9) and covers the hero like
// background-size: cover. Children are placed in scene coordinates, so the notices stay
// above the laptop at every screen size.
export default function HeroScene({ compact = false, children }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)

  // size and position the box: cover the hero, keep the laptop in view on narrow screens
  useEffect(() => {
    const box = boxRef.current
    const hero = box.parentElement
    const focus = compact ? 330 : 250 // scene x that should sit near the middle
    // never zoom in so far that less than this share of the scene's width is visible;
    // the sky above is then continued by the hero's own background colour
    const share = compact ? 0.56 : 0.85
    const place = () => {
      const pw = hero.clientWidth
      const ph = hero.clientHeight
      const scale = Math.max(pw / W, Math.min(ph / H, pw / (W * share)))
      const width = W * scale
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
  }, [compact])

  // paint once, then animate at a calm pixel-art frame rate
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const layers = paintScene()
    const live = document.createElement('canvas')
    live.width = W
    live.height = H
    const liveCtx = live.getContext('2d')
    const img = liveCtx.createImageData(W, H)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()

    const draw = (t) => {
      ctx.drawImage(layers.sky, 0, 0)
      const shift = Math.floor((t * 1.6) % CLOUD_WIDTH)
      ctx.drawImage(layers.clouds, -shift, 0)
      ctx.drawImage(layers.clouds, CLOUD_WIDTH - shift, 0)
      ctx.drawImage(layers.land, 0, 0)
      paintLive(img, t, layers.cloudData, { compact })
      liveCtx.putImageData(img, 0, 0)
      ctx.drawImage(live, 0, 0)
    }

    draw(12)
    if (reduce) return undefined

    let frame = 0
    let last = 0
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)
    const tick = (now) => {
      frame = requestAnimationFrame(tick)
      if (!visible || document.hidden || now - last < 66) return // about 15 frames a second
      last = now
      draw(12 + (now - start) / 1000)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
    }
  }, [compact])

  return (
    <div className="hero-scene" ref={boxRef}>
      <canvas ref={canvasRef} width={W} height={H} className="hero-scene__canvas" aria-label="A laptop on the grass in a park, under a big tree, with the city in the distance" role="img" />
      <div className="hero-scene__rays" aria-hidden="true" />
      {children}
    </div>
  )
}
