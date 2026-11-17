import { useMemo } from 'react'
import { seeded } from '../lib/random.js'
import { Cloud, Rects, Sprite, ellipseRects } from '../components/pixel.jsx'

// The whole landscape is one SVG of 480 x 300 "pixels" that is scaled up to fill the first screen.
// Everything is built from rectangles, so it stays razor sharp at any size.

const W = 480
const HORIZON = 196

const SKY = [
  [0, '#1c72d2'],
  [42, '#2480dc'],
  [78, '#3590e6'],
  [110, '#4fa3ee'],
  [140, '#6fb8f5'],
  [166, '#93cdf9'],
  [184, '#b6dffc'],
]

// One stepped-gable house, the kind that lines the canals of Ghent.
function gable(x, w, h) {
  const top = HORIZON - h
  const out = [{ x, y: top, w, h }]
  for (let i = 1; w - 4 * i >= 2; i += 1) out.push({ x: x + 2 * i, y: top - 2 * i, w: w - 4 * i, h: 2 })
  return out
}

function belfry(x) {
  const b = HORIZON
  return [
    { x, y: b - 66, w: 12, h: 66 },
    { x: x - 2, y: b - 70, w: 16, h: 4 },
    { x: x - 2, y: b - 76, w: 2, h: 6 },
    { x: x + 12, y: b - 76, w: 2, h: 6 },
    { x: x + 2, y: b - 80, w: 8, h: 10 },
    { x: x + 4, y: b - 88, w: 4, h: 8 },
    { x: x + 5, y: b - 94, w: 2, h: 6 },
  ]
}

function church(x) {
  const b = HORIZON
  return [
    { x, y: b - 24, w: 36, h: 24 },
    { x: x + 2, y: b - 28, w: 32, h: 4 },
    { x: x + 6, y: b - 32, w: 24, h: 4 },
    { x: x + 13, y: b - 50, w: 10, h: 50 },
    { x: x + 14, y: b - 56, w: 8, h: 6 },
    { x: x + 16, y: b - 62, w: 4, h: 6 },
    { x: x + 17, y: b - 68, w: 2, h: 6 },
  ]
}

function buildSkyline(seed, { minH, maxH, start = -4 }) {
  const rand = seeded(seed)
  const houses = []
  const windows = []
  let x = start
  while (x < W + 10) {
    const w = [10, 12, 12, 14, 16][Math.floor(rand() * 5)]
    const h = Math.round(minH + rand() * (maxH - minH))
    houses.push(...gable(x, w, h))
    for (let wy = HORIZON - h + 4; wy < HORIZON - 4; wy += 6) {
      for (let wx = x + 2; wx < x + w - 3; wx += 4) {
        if (rand() < 0.62) windows.push({ x: wx, y: wy, w: 2, h: 3, lit: rand() < 0.16 })
      }
    }
    x += w + (rand() < 0.2 ? 2 : 0)
  }
  return { houses, windows }
}

function buildGrassEdge(seed, y, amplitude) {
  const rand = seeded(seed)
  const out = []
  let x = 0
  while (x < W) {
    const run = 6 + Math.floor(rand() * 14)
    const up = Math.floor(rand() * (amplitude / 2 + 1)) * 2
    out.push({ x, y: y - up, w: run, h: up + 2 })
    x += run
  }
  return out
}

const ITEM_PALETTE = {
  w: '#ffffff',
  g: '#b9c4cf',
  b: '#2f7fe0',
  k: '#2fb457',
  y: '#f4c430',
  o: '#c9941a',
  d: '#1d2b45',
}
// What travels over the belt: a video lesson, your notes, a finished exercise, a star.
const VIDEO = ['dddddddd', 'ddwddddd', 'ddwwdddd', 'ddwwwddd', 'ddwwdddd', 'ddwddddd', 'dddddddd']
const NOTES = ['.wwwwww.', '.wbbbbw.', '.wwwwww.', '.wggggw.', '.wwwwww.', '.wgggww.', '.wwwwww.']
const DONE = ['.wwwwww.', '.wbbbbw.', '.wwwwww.', '.wggkkk.', '.wwwkwk.', '.wggkkk.', '.wwwwww.']
const STAR = ['...yy...', '...yy...', 'yyyyyyyy', '.yyooyy.', '..yyyy..', '.yy..yy.', '.y....y.']

const BIKE_PALETTE = { k: '#2a2a2a', a: '#e5534b', s: '#8e8c8b' }
const BIKE = [
  '.....ss..........aa.....',
  '......a...........a.....',
  '......aaaaaaaaaaaaa.....',
  '.....a.a.........a.a....',
  '..kkka..a.......a..akkk.',
  '.k...ak..a.....a..ka...k',
  'k.....ak..a...a..ka.....',
  'k..aaaak...aaa...kaaa..k',
  'k......k.........k.....k',
  '.k....k...........k...k.',
  '..kkkk.............kkk..',
]

export default function HeroScene({ compact = false }) {
  const scene = useMemo(() => {
    const far = buildSkyline(11, { minH: 20, maxH: 36 })
    const near = buildSkyline(29, { minH: 10, maxH: 22, start: -9 })

    const rand = seeded(5)
    const ripples = Array.from({ length: 46 }, () => ({
      x: Math.floor(rand() * 240) * 2,
      y: HORIZON + 2 + Math.floor(rand() * 7) * 2,
      w: 4 + Math.floor(rand() * 5) * 2,
      h: 1,
      group: rand() < 0.5 ? 'a' : 'b',
    }))

    const flowers = Array.from({ length: 70 }, () => ({
      x: Math.floor(rand() * 240) * 2,
      y: 226 + Math.floor(rand() * 36) * 2,
      color: ['#ffffff', '#ffe066', '#ff9fb3', '#ffffff', '#ffd23f'][Math.floor(rand() * 5)],
    }))
    const tufts = Array.from({ length: 110 }, () => ({
      x: Math.floor(rand() * 240) * 2,
      y: 222 + Math.floor(rand() * 39) * 2,
      w: 2 + Math.floor(rand() * 2) * 2,
      h: 2,
      dark: rand() < 0.55,
    }))

    return {
      far,
      near,
      ripples,
      flowers,
      tufts,
      edgeMid: buildGrassEdge(3, 238, 4),
      edgeFront: buildGrassEdge(9, 268, 6),
    }
  }, [])

  const canopyDark = [
    ...ellipseRects(454, 122, 48, 52),
    ...ellipseRects(418, 144, 26, 24),
    ...ellipseRects(474, 92, 30, 34),
  ]
  const canopyMid = [...ellipseRects(446, 112, 34, 36), ...ellipseRects(416, 138, 18, 16), ...ellipseRects(470, 84, 20, 20)]
  const canopyLight = [...ellipseRects(434, 100, 18, 16), ...ellipseRects(464, 76, 12, 10), ...ellipseRects(412, 132, 8, 6)]

  return (
    <svg
      className="hero-scene pixel"
      viewBox={compact ? '278 40 140 260' : `0 0 ${W} 300`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        {SKY.map(([, color], i) => (
          <pattern key={i} id={`dither-${i}`} width="4" height="2" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill={color} />
          </pattern>
        ))}
        <clipPath id="belt-clip">
          <rect x="296" y="246" width="116" height="5" />
        </clipPath>
      </defs>

      {/* sky: flat bands with a dithered row between them */}
      {SKY.map(([y, color], i) => (
        <g key={y}>
          <rect x="0" y={y} width={W} height={(SKY[i + 1]?.[0] ?? HORIZON) - y} fill={color} />
          {i > 0 && <rect x="0" y={y - 2} width={W} height="2" fill={`url(#dither-${i})`} />}
        </g>
      ))}

      {/* clouds drift very slowly */}
      <Cloud x={236} y={84} s={1.5} className="drift drift--a" />
      <Cloud x={338} y={128} s={1} className="drift drift--b" />
      <Cloud x={220} y={156} s={0.8} className="drift drift--c" />
      <Cloud x={388} y={62} s={1.2} className="drift drift--b" />

      {/* two birds */}
      <g className="birds" fill="#1b4f8f">
        <path d="M0 0h2v2H0zM2 2h2v2H2zM4 0h2v2H4z" transform="translate(300 62)" />
        <path d="M0 0h2v2H0zM2 2h2v2H2zM4 0h2v2H4z" transform="translate(314 70)" />
      </g>

      {/* skyline: far row in haze, near row a little darker, with a belfry and a church */}
      <Rects list={[...scene.far.houses, ...belfry(236), ...church(266)]} fill="#86bdf0" />
      <rect x="240" y={HORIZON - 96} width="4" height="2" fill="#f4c430" />
      <Rects list={scene.near.houses} fill="#5c9ee2" />
      <g>
        {scene.near.windows.map((w, i) => (
          <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} fill={w.lit ? '#ffe9a3' : '#8cc0f3'} />
        ))}
      </g>

      {/* canal */}
      <rect x="0" y={HORIZON} width={W} height="18" fill="#2f86dc" />
      <Rects list={scene.ripples.filter((r) => r.group === 'a')} fill="#7dbcf3" />
      <g className="shimmer">
        <Rects list={scene.ripples.filter((r) => r.group === 'b')} fill="#b6dffc" />
      </g>
      <rect x="0" y={HORIZON + 16} width={W} height="3" fill="#ddd6c3" />
      <rect x="0" y={HORIZON + 19} width={W} height="2" fill="#b3ab95" />

      {/* grass in three planes with stepped edges */}
      <rect x="0" y="217" width={W} height="83" fill="#6fc552" />
      <Rects list={scene.edgeMid} fill="#58b245" />
      <rect x="0" y="240" width={W} height="60" fill="#58b245" />
      <Rects list={scene.edgeFront} fill="#439d39" />
      <rect x="0" y="270" width={W} height="30" fill="#439d39" />
      <g>
        {scene.tufts.map((t, i) => (
          <rect key={i} x={t.x} y={t.y} width={t.w} height={t.h} fill={t.dark ? '#3b9434' : '#8ad66a'} opacity="0.7" />
        ))}
        {scene.flowers.map((f, i) => (
          <g key={i}>
            <rect x={f.x} y={f.y + 2} width="2" height="2" fill="#2f7d2e" />
            <rect x={f.x} y={f.y} width="2" height="2" fill={f.color} />
          </g>
        ))}
      </g>

      {/* the big tree on the right (not on phones: there it would sit behind the text) */}
      {!compact && (
        <g>
          <rect x="446" y="166" width="12" height="88" fill="#7a5230" />
          <rect x="454" y="166" width="4" height="88" fill="#5c3c21" />
          <rect x="442" y="250" width="20" height="4" fill="#5c3c21" />
          <Rects list={canopyDark} fill="#1e6a2c" />
          <Rects list={canopyMid} fill="#2f8a38" />
          <Rects list={canopyLight} fill="#4cab46" />
        </g>
      )}

      {/* a bike against the tree: LoopCasts lives above a bike shop */}
      {!compact && <Sprite rows={BIKE} palette={BIKE_PALETTE} x={424} y={243} />}

      {/* --- the lesson machine: a video goes in, practice happens, a star comes out --- */}
      <g transform={compact ? undefined : 'translate(-408 -262) scale(2)'}>
      <rect x="300" y="261" width="110" height="2" fill="#000" opacity="0.16" />
        <g fill="#6f6f6c">
          <rect x="302" y="251" width="3" height="10" />
          <rect x="352" y="251" width="3" height="10" />
          <rect x="403" y="251" width="3" height="10" />
        </g>
        <rect x="294" y="245" width="120" height="7" fill="#262626" />
        <rect x="296" y="246" width="116" height="1" fill="#5a5a5a" />
        <g clipPath="url(#belt-clip)">
          <g className="belt-marks" fill="#6e6e6e">
            {Array.from({ length: 17 }, (_, i) => (
              <rect key={i} x={288 + i * 8} y="249" width="3" height="1" />
            ))}
          </g>
        </g>

        {[
          { x: 322, lamp: '#4ea8ff' },
          { x: 354, lamp: '#ffd23f' },
          { x: 386, lamp: '#5fe07f' },
        ].map((s, i) => (
          <g key={s.x}>
            <rect x={s.x} y="229" width="2" height="17" fill="#d9d9d4" />
            <rect x={s.x + 14} y="229" width="2" height="17" fill="#b9b9b3" />
            <rect x={s.x - 1} y="222" width="18" height="7" fill="#f5f5f2" />
            <rect x={s.x - 1} y="228" width="18" height="1" fill="#b9b9b3" />
            <rect x={s.x + 2} y="224" width="5" height="2" fill="#8e8c8b" />
            <rect className={`lamp lamp--${i}`} x={s.x + 11} y="224" width="3" height="2" fill={s.lamp} />
            {i === 0 && <rect className="stamp" x={s.x + 6} y="229" width="4" height="5" fill="#8e8c8b" />}
          </g>
        ))}

        {[0, 1, 2].map((n) => (
          <g key={n} className="parcel" style={{ animationDelay: `${n * -3}s` }}>
            <g className="parcel__stage parcel__stage--0" style={{ animationDelay: `${n * -3}s` }}>
              <Sprite rows={VIDEO} palette={ITEM_PALETTE} x={296} y={239} />
            </g>
            <g className="parcel__stage parcel__stage--1" style={{ animationDelay: `${n * -3}s` }}>
              <Sprite rows={NOTES} palette={ITEM_PALETTE} x={296} y={239} />
            </g>
            <g className="parcel__stage parcel__stage--2" style={{ animationDelay: `${n * -3}s` }}>
              <Sprite rows={DONE} palette={ITEM_PALETTE} x={296} y={239} />
            </g>
            <g className="parcel__stage parcel__stage--3" style={{ animationDelay: `${n * -3}s` }}>
              <Sprite rows={STAR} palette={ITEM_PALETTE} x={296} y={239} />
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}
