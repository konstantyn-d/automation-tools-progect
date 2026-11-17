import { seeded } from '../lib/random.js'

// --- helpers that turn simple descriptions into lists of <rect> pixels -----------------

// A sprite is drawn as text: every character is one pixel, the palette maps characters to colours.
// "." (or any character missing from the palette) is transparent.
export function Sprite({ rows, palette, x = 0, y = 0, size = 1 }) {
  const rects = []
  rows.forEach((row, r) => {
    let c = 0
    while (c < row.length) {
      const ch = row[c]
      const fill = palette[ch]
      if (!fill) {
        c += 1
        continue
      }
      let run = 1
      while (row[c + run] === ch) run += 1 // merge neighbours of the same colour into one rect
      rects.push(
        <rect key={`${r}-${c}`} x={x + c * size} y={y + r * size} width={run * size} height={size} fill={fill} />,
      )
      c += run
    }
  })
  return <g>{rects}</g>
}

// Rows of a stepped (pixelated) ellipse. half = true gives only the upper half (used for clouds).
export function ellipseRects(cx, cy, rx, ry, { step = 2, half = false } = {}) {
  const out = []
  const end = half ? 0 : ry
  for (let dy = -ry; dy < end; dy += step) {
    const mid = dy + step / 2
    const w = Math.round((rx * Math.sqrt(Math.max(0, 1 - (mid * mid) / (ry * ry)))) / step) * step
    if (w > 0) out.push({ x: cx - w, y: cy + dy, w: w * 2, h: step })
  }
  return out
}

export function Rects({ list, fill, opacity }) {
  return (
    <g fill={fill} opacity={opacity}>
      {list.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
    </g>
  )
}

export function Cloud({ x, y, s = 1, className, style }) {
  const bumps = [
    ...ellipseRects(x + 10 * s, y, 10 * s, 8 * s, { half: true }),
    ...ellipseRects(x + 23 * s, y, 13 * s, 14 * s, { half: true }),
    ...ellipseRects(x + 35 * s, y, 9 * s, 7 * s, { half: true }),
  ]
  return (
    <g className={className} style={style}>
      <Rects list={bumps} fill="#ffffff" />
      <rect x={x} y={y} width={46 * s} height={4} fill="#ffffff" />
      <rect x={x + 2} y={y + 4} width={46 * s - 4} height={2} fill="#d5e9fb" />
    </g>
  )
}

// --- pixel fringe: the ragged edge between a coloured scene and the paper ---------------

function fringeSvg({ color, seed, cols = 120, rows = 12 }) {
  const rand = seeded(seed)
  let rects = ''
  let h = 3
  for (let c = 0; c < cols; ) {
    const run = 1 + Math.floor(rand() * 4)
    h = Math.max(1, Math.min(rows - 5, h + Math.floor(rand() * 5) - 2))
    rects += `<rect x="${c}" y="${rows - h}" width="${run}" height="${h}"/>`
    // a few loose squares floating above the edge
    if (rand() < 0.3) rects += `<rect x="${c}" y="${rows - h - 2 - Math.floor(rand() * 3)}" width="1" height="1"/>`
    c += run
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols} ${rows}" shape-rendering="crispEdges" fill="${color}">${rects}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

// direction "up": colour grows upward out of the bottom edge. "down": hangs from the top edge.
export function Fringe({ color, seed = 7, height = 48, direction = 'up', className = '', style }) {
  const rows = 12
  const cols = 120
  return (
    <div
      aria-hidden="true"
      className={`fringe ${className}`}
      style={{
        height,
        backgroundImage: fringeSvg({ color, seed, cols, rows }),
        backgroundSize: `${(cols / rows) * height}px ${height}px`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center bottom',
        imageRendering: 'pixelated',
        transform: direction === 'down' ? 'scaleY(-1)' : undefined,
        ...style,
      }}
    />
  )
}
