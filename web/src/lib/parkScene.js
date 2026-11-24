import { seeded } from './random.js'

// The hero landscape: a park on a summer afternoon, a laptop in the grass under a big tree.
// It is painted pixel by pixel into small canvases (480 x 270) and scaled up without smoothing.
// Painting is deterministic: the same seeds give the same picture on every load.
//
// Layers, back to front:
//   sky      gradient with ordered dithering
//   clouds   a 960 px wide strip that slides slowly (wraps around)
//   land     skyline, tree line, park, big tree, grass, laptop, notebook
//   live     redrawn every frame: laptop screen, flower, ladybug, leaves, birds

export const W = 480
export const H = 270
const CLOUD_W = 960

// --- colour helpers ------------------------------------------------------------------------

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const ramp = (list) => list.map(hex)

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)]

// Picks a colour from a ramp for a value 0..1, dithering between neighbours.
function pick(rampList, t, x, y) {
  const n = rampList.length - 1
  const v = Math.max(0, Math.min(0.9999, t)) * n
  const i = Math.floor(v)
  return v - i > bayer(x, y) ? rampList[Math.min(n, i + 1)] : rampList[i]
}

// --- noise ---------------------------------------------------------------------------------

function hash(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
function valueNoise(x, y, seed) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const s = (t) => t * t * (3 - 2 * t)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf)
}
function fbm(x, y, seed, octaves = 3) {
  let v = 0
  let amp = 0.5
  let f = 1
  for (let i = 0; i < octaves; i += 1) {
    v += amp * valueNoise(x * f, y * f, seed + i * 31)
    amp *= 0.5
    f *= 2
  }
  return v / (1 - 0.5 ** octaves)
}

// Calls fn(x, y) for every pixel inside a polygon (scanline fill).
export function scanPoly(points, fn) {
  const ys = points.map((p) => p[1])
  const y0 = Math.floor(Math.min(...ys))
  const y1 = Math.ceil(Math.max(...ys))
  for (let y = y0; y <= y1; y += 1) {
    const xs = []
    for (let i = 0; i < points.length; i += 1) {
      const [ax, ay] = points[i]
      const [bx, by] = points[(i + 1) % points.length]
      if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) {
        xs.push(ax + ((y + 0.5 - ay) / (by - ay)) * (bx - ax))
      }
    }
    xs.sort((a, b) => a - b)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x += 1) fn(x, y)
    }
  }
}

// --- a layer is an ImageData we paint into --------------------------------------------------

class Layer {
  constructor(w, h) {
    this.w = w
    this.h = h
    this.data = new Uint8ClampedArray(w * h * 4)
  }
  set(x, y, c, a = 255) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = (y * this.w + x) * 4
    this.data[i] = c[0]
    this.data[i + 1] = c[1]
    this.data[i + 2] = c[2]
    this.data[i + 3] = a
  }
  get(x, y) {
    const i = (y * this.w + x) * 4
    return this.data[i + 3] ? [this.data[i], this.data[i + 1], this.data[i + 2]] : null
  }
  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j += 1) for (let i = x; i < x + w; i += 1) this.set(i, j, c)
  }
  // fills a polygon; fn(x, y) returns the colour (or null to skip)
  poly(points, fn) {
    scanPoly(points, (x, y) => {
      const c = fn(x, y)
      if (c) this.set(x, y, c)
    })
  }
  toCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = this.w
    canvas.height = this.h
    canvas.getContext('2d').putImageData(new ImageData(this.data, this.w, this.h), 0, 0)
    return canvas
  }
}

// --- palettes ------------------------------------------------------------------------------

const SKY = ramp(['#1767c9', '#1d74d6', '#2783e0', '#3592e8', '#47a2ef', '#5db2f4', '#78c3f8', '#97d3fb', '#b4e0fd'])
const CLOUD = ramp(['#8fb8e4', '#a9cbee', '#c3dcf5', '#dbebfa', '#eef6fe', '#ffffff'])
const CITY = ramp(['#86b3dc', '#98c0e4', '#abcdeb', '#bfdaf1'])
const FAR_TREES = ramp(['#3f8a6a', '#4b9a70', '#5aab76', '#6fbb7d'])
const FIELD = ramp(['#5ea845', '#6bb64c', '#79c254', '#88cc5d', '#99d669'])
const PATH = ramp(['#b9a479', '#c9b68a', '#d7c69c', '#e3d5ad'])
const LEAVES = ramp(['#0f3a20', '#17502a', '#1f6631', '#2a7d37', '#3a933e', '#53a944', '#73c04f', '#98d65e'])
const TRUNK = ramp(['#3a2414', '#4f321c', '#664126', '#7c5332', '#95683f'])
const GRASS = ramp(['#1d5a22', '#256c27', '#2f7e2c', '#3b9132', '#4aa339', '#5cb443', '#72c450'])
const C = {
  white: hex('#ffffff'),
  black: hex('#14161a'),
  bezel: hex('#24272d'),
  bezelHi: hex('#3a3e46'),
  lid: hex('#aeb3ba'),
  deck: ramp(['#9ea3ab', '#b3b8bf', '#c7cbd1', '#d8dbe0']),
  key: hex('#41454d'),
  keyHi: hex('#5a5f69'),
  pad: hex('#bfc3c9'),
  edge: hex('#7d838c'),
  book: ramp(['#5a3518', '#6f4520', '#86562a', '#9d6935', '#b37d43']),
  paper: hex('#efe4c6'),
  paperShade: hex('#d6c79f'),
  band: hex('#3f2410'),
  pen: hex('#1f3e78'),
  penHi: hex('#3a62a8'),
  silver: hex('#d9dde2'),
  bench: ramp(['#5b3a1f', '#7a5130', '#946641']),
  iron: hex('#2e3238'),
  red: hex('#d7322b'),
  redHi: hex('#f0594a'),
  pink: hex('#f39ab0'),
  yellow: hex('#ffd23f'),
  orange: hex('#f0a020'),
  stem: hex('#7cc84f'),
  stemDark: hex('#2b6a22'),
}

// --- sky -----------------------------------------------------------------------------------

function paintSky() {
  const L = new Layer(W, H)
  for (let y = 0; y < H; y += 1) {
    const t = Math.min(1, y / 175)
    for (let x = 0; x < W; x += 1) L.set(x, y, pick(SKY, t * t * 0.55 + t * 0.45, x, y))
  }
  return L
}

// --- clouds --------------------------------------------------------------------------------

// A cumulus is a list of round puffs above a flat base. Puffs are painted from the top down,
// so lower puffs overlap higher ones and each keeps its own lit top and shaded bottom.
function cumulus(rand, cx, base, width, height) {
  const puffs = []
  const rows = 4
  const rowH = height / rows
  for (let r = 0; r < rows; r += 1) {
    const rowW = width * (1 - r * 0.24) * (0.85 + rand() * 0.25)
    const rowCx = cx + (rand() - 0.5) * width * 0.12 * r
    const rowY = base - rowH * (r + 0.55)
    const n = Math.max(2, Math.round(rowW / (rowH * 1.15)))
    for (let i = 0; i < n; i += 1) {
      const u = n === 1 ? 0 : i / (n - 1) - 0.5
      const edge = 1 - Math.abs(u) * 0.8
      puffs.push({
        x: rowCx + u * rowW + (rand() - 0.5) * rowH * 0.5,
        y: rowY + (rand() - 0.5) * rowH * 0.5 + Math.abs(u) * rowH * 0.6,
        r: rowH * (0.75 + rand() * 0.45) * (0.7 + edge * 0.4),
      })
    }
  }
  // painted from the back (higher) to the front (lower)
  return { puffs: puffs.sort((a, b) => a.y - b.y), base, top: base - height * 1.15, height }
}

function paintClouds() {
  const L = new Layer(CLOUD_W, H)
  const rand = seeded(717)
  const clouds = [
    cumulus(rand, 330, 166, 200, 104), // the big one behind the city
    cumulus(rand, 468, 150, 110, 70),
    cumulus(rand, 120, 118, 84, 38),
    cumulus(rand, 640, 92, 130, 46),
    cumulus(rand, 820, 140, 160, 76),
    cumulus(rand, 36, 60, 52, 18),
    cumulus(rand, 560, 40, 64, 18),
  ]
  for (const cloud of clouds) {
    for (const p of cloud.puffs) {
      for (let y = Math.floor(p.y - p.r); y <= Math.ceil(p.y + p.r); y += 1) {
        if (y >= cloud.base) continue
        for (let x = Math.floor(p.x - p.r - 1); x <= Math.ceil(p.x + p.r + 1); x += 1) {
          const dx = (x - p.x) / p.r
          const dy = (y - p.y) / p.r
          const edge = 1 + (fbm(x * 0.18, y * 0.18, 5) - 0.5) * 0.25
          const d = dx * dx + dy * dy
          if (d > edge * edge) continue
          // light comes from the upper left
          const nz = Math.sqrt(Math.max(0, 1 - d))
          let light = 0.62 - dy * 0.62 - dx * 0.22 + nz * 0.1
          light -= ((y - cloud.top) / (cloud.base - cloud.top)) * 0.42 // the lower part is in shade
          light += (fbm(x * 0.12, y * 0.12, 9) - 0.5) * 0.25
          const wx = ((x % CLOUD_W) + CLOUD_W) % CLOUD_W
          L.set(wx, y, pick(CLOUD, light, wx, y))
        }
      }
    }
  }
  return L
}

// --- the city on the horizon ---------------------------------------------------------------

const HORIZON = 152

function paintCity(L) {
  const rand = seeded(42)
  let x = 52
  const towerAt = 212
  while (x < 352) {
    const w = 6 + Math.floor(rand() * 4) * 3
    const h = 8 + Math.floor(rand() * 18) + (x > 160 && x < 290 ? 8 : 0)
    const top = HORIZON - h
    const shade = rand() < 0.5 ? 1 : 2
    L.rect(x, top, w, h, CITY[shade])
    L.rect(x, top, 1, h, CITY[shade + 1]) // lit left edge
    if (rand() < 0.4) L.rect(x + 1, top - 2, w - 2, 2, CITY[shade]) // roof step
    if (rand() < 0.25) L.rect(x + Math.floor(w / 2), top - 5, 1, 5, CITY[shade]) // antenna
    for (let wy = top + 2; wy < HORIZON - 2; wy += 3) {
      for (let wx = x + 2; wx < x + w - 1; wx += 2) if (rand() < 0.55) L.set(wx, wy, CITY[3])
    }
    x += w + (rand() < 0.3 ? 3 : 0)
  }
  // the belfry: a tall tower with a pointed top
  const b = HORIZON
  const t = towerAt
  L.rect(t, b - 64, 10, 64, CITY[1])
  L.rect(t, b - 64, 2, 64, CITY[2])
  L.rect(t - 1, b - 68, 12, 4, CITY[1])
  L.rect(t + 1, b - 78, 8, 10, CITY[1])
  L.rect(t + 2, b - 86, 6, 8, CITY[0])
  L.rect(t + 3, b - 92, 4, 6, CITY[0])
  L.rect(t + 4, b - 98, 2, 6, CITY[0])
  for (let wy = b - 60; wy < b - 4; wy += 6) L.rect(t + 4, wy, 2, 3, CITY[3])
}

// --- distant trees, the park and the path ---------------------------------------------------

const pathY = (x) => 176 - 18 * Math.sin(Math.min(1, x / 340) * Math.PI * 0.5) + (x > 340 ? (x - 340) * 0.02 : 0)
const pathHalf = (x) => Math.max(1.5, 7 - x / 60)

function paintPark(L) {
  // tree line: rounded crowns in a hazy green
  for (let x = 0; x < W; x += 1) {
    const top = HORIZON - 4 - Math.round(fbm(x * 0.06, 0, 12) * 12 + Math.abs(Math.sin(x * 0.11)) * 3)
    for (let y = top; y < HORIZON + 8; y += 1) {
      const light = 0.75 - (y - top) / 22 + (fbm(x * 0.2, y * 0.2, 13) - 0.5) * 0.5
      L.set(x, y, pick(FAR_TREES, light, x, y))
    }
  }
  // the lawn
  for (let y = HORIZON + 4; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const n = fbm(x * 0.05, y * 0.12, 21)
      const light = 0.7 - (y - HORIZON) / 140 + (n - 0.5) * 0.7
      L.set(x, y, pick(FIELD, light, x, y))
    }
  }
  // mowing stripes and grass flecks
  const rand = seeded(88)
  for (let i = 0; i < 900; i += 1) {
    const x = rand() * W
    const y = HORIZON + 6 + rand() * 60
    L.set(x, y, FIELD[rand() < 0.5 ? 4 : 1])
  }
  // the path
  for (let x = 0; x < 380; x += 1) {
    const cy = pathY(x)
    const half = pathHalf(x)
    for (let y = Math.floor(cy - half); y <= Math.ceil(cy + half * 0.6); y += 1) {
      const t = 0.75 - (y - (cy - half)) / (half * 1.6) * 0.5 + (fbm(x * 0.3, y * 0.3, 31) - 0.5) * 0.5
      L.set(x, y, pick(PATH, t, x, y))
    }
  }
}

// Leafy crowns, painted like clouds but with leaf texture.
function crown(L, rand, cx, cy, rx, ry, count, seed, { lightBias = 0 } = {}) {
  const puffs = []
  for (let i = 0; i < count; i += 1) {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand())
    puffs.push({ x: cx + Math.cos(a) * d * rx * 0.75, y: cy + Math.sin(a) * d * ry * 0.75, r: (0.28 + rand() * 0.22) * Math.min(rx, ry) * 1.1 })
  }
  puffs.sort((a, b) => a.y - b.y)
  for (const p of puffs) {
    for (let y = Math.floor(p.y - p.r - 2); y <= Math.ceil(p.y + p.r + 2); y += 1) {
      for (let x = Math.floor(p.x - p.r - 2); x <= Math.ceil(p.x + p.r + 2); x += 1) {
        const dx = (x - p.x) / p.r
        const dy = (y - p.y) / p.r
        const leafy = (fbm(x * 0.45, y * 0.45, seed) - 0.5) * 0.55
        const d = dx * dx + dy * dy
        if (d > (1 + leafy) * (1 + leafy)) continue
        let light = 0.55 - dy * 0.42 - dx * 0.12 + lightBias
        light += (fbm(x * 0.35, y * 0.35, seed + 7) - 0.5) * 0.9 // leaf clusters
        light -= (d > 0.75 ? 0.12 : 0) // a darker rim between clumps
        L.set(x, y, pick(LEAVES, light, x, y))
      }
    }
  }
}

function paintLeftTree(L) {
  const rand = seeded(5)
  // trunk
  for (let y = 136; y < 172; y += 1) {
    const w = y > 166 ? 7 : 5
    for (let x = 66 - Math.floor(w / 2); x < 66 + Math.ceil(w / 2); x += 1) L.set(x, y, pick(TRUNK, 0.35 + (x - 64) * 0.08, x, y))
  }
  crown(L, rand, 64, 120, 38, 26, 16, 101, { lightBias: 0.12 })
  // its shadow on the lawn
  for (let y = 170; y < 176; y += 1) {
    for (let x = 48; x < 96; x += 1) {
      const d = ((x - 72) / 24) ** 2 + ((y - 173) / 3) ** 2
      if (d < 1) L.set(x, y, pick(FIELD, 0.12, x, y))
    }
  }
}

function paintBench(L) {
  const x = 86
  const y = 164
  const wood = C.bench
  L.rect(x, y, 24, 2, wood[2]) // backrest
  L.rect(x, y + 2, 24, 1, wood[1])
  L.rect(x - 1, y + 5, 26, 2, wood[2]) // seat
  L.rect(x - 1, y + 7, 26, 1, wood[0])
  L.rect(x + 1, y + 1, 1, 10, C.iron)
  L.rect(x + 22, y + 1, 1, 10, C.iron)
  L.rect(x + 3, y + 8, 1, 3, C.iron)
  L.rect(x + 20, y + 8, 1, 3, C.iron)
}

// --- the big tree on the right --------------------------------------------------------------

function paintBigTree(L) {
  const rand = seeded(9)
  // bushes behind the laptop
  crown(L, rand, 400, 146, 80, 30, 26, 201, { lightBias: 0.02 })
  crown(L, rand, 470, 118, 40, 46, 14, 207)
  // the trunk: wide at the roots, leaning a little to the right
  for (let y = 0; y < 214; y += 1) {
    const t = y / 214
    const left = 418 + Math.sin(t * 3) * 4 - (t > 0.85 ? (t - 0.85) * 220 : 0)
    const right = 462 + (t > 0.8 ? (t - 0.8) * 90 : 0)
    for (let x = Math.floor(left); x < Math.ceil(right); x += 1) {
      const u = (x - left) / (right - left)
      const bark = fbm(x * 0.9, y * 0.12, 61)
      let light = 0.25 + u * 0.15 + (u < 0.35 ? 0.35 - u : 0) * 0.9 + (bark - 0.5) * 0.7
      if (u > 0.75) light -= 0.2
      L.set(x, y, pick(TRUNK, light, x, y))
    }
  }
  // roots
  for (const [sx, dir, len] of [[424, -1, 34], [440, -1, 18], [458, 1, 26]]) {
    for (let i = 0; i < len; i += 1) {
      const x = sx + dir * i
      const y = 206 + i * 0.28 + Math.sin(i * 0.3) * 1.5
      const th = Math.max(1, 4 - i / 9)
      for (let k = 0; k < th; k += 1) L.set(x, y + k, pick(TRUNK, 0.6 - k * 0.15, x, y + k))
    }
  }
  // a branch reaching left into the canopy
  for (let i = 0; i < 70; i += 1) {
    const x = 420 - i
    const y = 70 - i * 0.55 - Math.sin(i * 0.08) * 4
    const th = Math.max(2, 7 - i / 12)
    for (let k = 0; k < th; k += 1) L.set(x, y + k, pick(TRUNK, 0.55 - k / th * 0.4, x, y + k))
  }
  // the canopy: big and dark, filling the top right corner
  crown(L, rand, 430, 20, 110, 58, 34, 211, { lightBias: -0.05 })
  crown(L, rand, 352, 40, 52, 30, 14, 223, { lightBias: 0.05 })
  crown(L, rand, 470, 70, 40, 40, 12, 227, { lightBias: -0.1 })
  // red flowers in the grass under the tree
  const fr = seeded(31)
  for (let i = 0; i < 16; i += 1) {
    const x = 384 + fr() * 70
    const y = 176 + fr() * 16
    L.set(x, y + 1, C.stem)
    L.set(x, y, fr() < 0.7 ? C.red : C.pink)
    if (fr() < 0.5) L.set(x + 1, y, C.redHi)
  }
}

// --- foreground grass with clover ------------------------------------------------------------

function clover(L, x, y, size, shade) {
  const leaves = [-Math.PI / 2, Math.PI / 6, (Math.PI * 5) / 6]
  for (const a of leaves) {
    const lx = x + Math.cos(a) * size
    const ly = y + Math.sin(a) * size * 0.8
    for (let dy = -size; dy <= size; dy += 1) {
      for (let dx = -size; dx <= size; dx += 1) {
        const d = (dx * dx + dy * dy) / (size * size)
        if (d > 1) continue
        const light = shade + 0.35 - (dy / size) * 0.3 - d * 0.2
        L.set(lx + dx, ly + dy, pick(GRASS, light, Math.round(lx + dx), Math.round(ly + dy)))
      }
    }
  }
  L.set(x, y, GRASS[0])
}

function paintForeground(L) {
  const top = (x) => 196 + Math.sin(x * 0.02) * 4 + fbm(x * 0.08, 0, 41) * 5
  for (let x = 0; x < W; x += 1) {
    const t0 = top(x)
    for (let y = Math.floor(t0); y < H; y += 1) {
      const depth = (y - t0) / (H - t0)
      const n = fbm(x * 0.07, y * 0.09, 43)
      const light = 0.78 - depth * 0.55 + (n - 0.5) * 0.65 - (x > 380 ? 0.12 : 0)
      L.set(x, y, pick(GRASS, light, x, y))
    }
  }
  // blades of grass standing up along the edge and all over the front
  const rand = seeded(47)
  for (let i = 0; i < 1000; i += 1) {
    const x = Math.floor(rand() * W)
    const y = Math.floor(top(x) + rand() * (H - top(x)))
    const h = 2 + Math.floor(rand() * 4)
    const shade = rand() < 0.35 ? 5 : rand() < 0.5 ? 1 : 4
    for (let k = 0; k < h; k += 1) L.set(x + (k > 2 && rand() < 0.3 ? 1 : 0), y - k, GRASS[shade])
  }
  // clover patches, thickest in the front left corner
  for (let i = 0; i < 46; i += 1) {
    const left = rand() < 0.7
    const x = left ? rand() * 170 : 170 + rand() * 310
    const y = 226 + rand() * 44
    const size = 2 + Math.floor(rand() * 2) + (y > 250 ? 1 : 0)
    clover(L, x, y, size, rand() * 0.35 + (y - 226) / 200)
  }
}

// --- laptop and notebook ---------------------------------------------------------------------

// The laptop and notebook are drawn at a base size and scaled around a point in the grass.
const ZOOM = 1.28
const PIVOT = [300, 214]
const zoom = (points) => points.map(([x, y]) => [PIVOT[0] + (x - PIVOT[0]) * ZOOM, PIVOT[1] + (y - PIVOT[1]) * ZOOM])

// Laptop geometry in scene pixels (screen and keyboard deck as four corners each).
export const LAPTOP = {
  screen: zoom([[287, 133], [365, 139], [363, 199], [288, 193]]), // outer lid
  glass: zoom([[290, 136], [362, 141.5], [360.5, 196], [290.5, 190.5]]),
  deck: zoom([[288, 193], [363, 199], [336, 219], [238, 210]]),
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}
// point inside a quad from (u, v) in 0..1
export function quadPoint(q, u, v) {
  return lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v)
}

function shadowUnder(L, points, strength) {
  L.poly(points, (x, y) => {
    const c = L.get(x, y)
    if (!c) return null
    return bayer(x, y) < strength ? c.map((v) => v * 0.62) : c.map((v) => v * 0.8)
  })
}

function paintLaptop(L) {
  const { screen, glass, deck } = LAPTOP
  // soft shadow on the grass, offset to the lower right
  shadowUnder(L, zoom([[240, 212], [338, 221], [368, 204], [372, 198], [300, 196]]), 0.5)
  // lid back edge (silver rim visible on the right)
  L.poly(zoom([[365, 139], [368, 141], [366, 200], [363, 199]]), () => C.lid)
  // bezel
  L.poly(screen, (x, y) => (y < 136 ? C.bezelHi : C.bezel))
  // deck
  L.poly(deck, (x, y) => {
    const v = (y - 193) / 26
    return pick(C.deck, 0.85 - v * 0.5 + (x - 240) / 600, x, y)
  })
  // front edge of the deck
  L.poly(zoom([[238, 210], [336, 219], [336, 221], [239, 212]]), () => C.edge)
  L.poly(zoom([[336, 219], [363, 199], [363, 201], [336, 221]]), () => C.deck[0])
  // keys: a grid in deck space
  const rows = 5
  const cols = 13
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const u0 = 0.08 + (c / cols) * 0.84
      const u1 = u0 + 0.84 / cols - 0.015
      const v0 = 0.08 + (r / rows) * 0.46
      const v1 = v0 + 0.46 / rows - 0.03
      if (r === rows - 1 && c > 3 && c < 9) {
        if (c !== 4) continue // space bar
        const q = [quadPoint(deck, u0, v0), quadPoint(deck, 0.08 + (9 / cols) * 0.84 - 0.015, v0), quadPoint(deck, 0.08 + (9 / cols) * 0.84 - 0.015, v1), quadPoint(deck, u0, v1)]
        L.poly(q, (x, y) => C.key)
        continue
      }
      const q = [quadPoint(deck, u0, v0), quadPoint(deck, u1, v0), quadPoint(deck, u1, v1), quadPoint(deck, u0, v1)]
      L.poly(q, (x, y) => C.key)
    }
  }
  // trackpad
  const pad = [quadPoint(deck, 0.36, 0.64), quadPoint(deck, 0.64, 0.64), quadPoint(deck, 0.64, 0.92), quadPoint(deck, 0.36, 0.92)]
  L.poly(pad, () => C.pad)
  // the glass is painted live; reserve it
  L.poly(glass, () => C.black)
}

function paintNotebook(L) {
  const cover = zoom([[336, 206], [404, 214], [412, 232], [340, 226]])
  shadowUnder(L, zoom([[338, 227], [413, 233], [418, 222], [406, 214]]), 0.55)
  // page edges (front and right)
  L.poly(zoom([[340, 226], [412, 232], [412, 235], [341, 229]]), (x, y) => (y % 2 ? C.paper : C.paperShade))
  L.poly(zoom([[404, 214], [412, 232], [413, 234], [406, 215]]), () => C.paperShade)
  L.poly(cover, (x, y) => {
    const n = fbm(x * 0.4, y * 0.4, 71)
    return pick(C.book, 0.45 + (n - 0.5) * 0.6 - (y - 206) / 60, x, y)
  })
  // elastic band
  L.poly(zoom([[392, 213], [394, 213], [401, 230], [399, 230]]), () => C.band)
  // pen lying diagonally across the cover
  for (let i = 0; i < 46; i += 0.6) {
    const [x, y] = zoom([[348 + i, 222 - i * 0.22]])[0]
    L.set(x, y, C.pen)
    L.set(x, y - 1, Math.floor(i) % 9 === 0 ? C.penHi : C.pen)
    if (i > 38) L.set(x, y - 1, C.silver)
  }
  const [tipX, tipY] = zoom([[347, 222]])[0]
  L.set(tipX, tipY, C.silver)
}

// --- painting everything once -----------------------------------------------------------------

export function paintScene() {
  const sky = paintSky()
  const clouds = paintClouds()
  const land = new Layer(W, H)
  paintCity(land)
  paintPark(land)
  paintLeftTree(land)
  paintBench(land)
  paintBigTree(land)
  paintForeground(land)
  paintLaptop(land)
  paintNotebook(land)
  return {
    sky: sky.toCanvas(),
    clouds: clouds.toCanvas(),
    land: land.toCanvas(),
    // a small copy of the clouds for the laptop screen
    cloudData: clouds,
  }
}

// --- the live layer, redrawn on every frame ---------------------------------------------------

const DANDELION = { x: 182, y: 186, stemBase: [196, 232] }

function setPx(img, x, y, c, a = 255) {
  x = Math.round(x)
  y = Math.round(y)
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const i = (y * W + x) * 4
  img.data[i] = c[0]
  img.data[i + 1] = c[1]
  img.data[i + 2] = c[2]
  img.data[i + 3] = a
}

// t is seconds since start
export function paintLive(img, t, cloudData, { compact = false } = {}) {
  img.data.fill(0)

  // laptop screen: the same sky as outside, a slower cloud drift, and a video progress bar
  const { glass } = LAPTOP
  const [g0, g1, g2, g3] = glass
  const off = t * 3
  const progress = (t / 40) % 1
  scanPoly(glass, (x, y) => {
    const top = g0[1] + ((x - g0[0]) / (g1[0] - g0[0])) * (g1[1] - g0[1])
    const bottom = g3[1] + ((x - g3[0]) / (g2[0] - g3[0])) * (g2[1] - g3[1])
    const v = (y - top) / (bottom - top)
    const left = g0[0] + v * (g3[0] - g0[0])
    const right = g1[0] + v * (g2[0] - g1[0])
    const u = (x - left) / (right - left)
    let c = pick(SKY, 0.3 + v * 0.6, x, y)
    const cc = cloudData.get(Math.floor((u * 230 + 250 + off) % 960), Math.floor(48 + v * 140))
    if (cc) c = cc
    if (v > 0.86 && v < 0.9 && u > 0.05 && u < 0.95) c = (u - 0.05) / 0.9 < progress ? C.red : C.silver
    if (v > 0.86 && v < 0.94 && Math.abs((u - 0.05) / 0.9 - progress) < 0.012 && u > 0.05 && u < 0.95) c = C.white
    const glare = u + v * 0.35
    if (glare > 0.68 && glare < 0.74) c = c.map((ch) => ch + (255 - ch) * 0.3)
    setPx(img, x, y, c)
  })

  // dandelion, swaying in the breeze
  const sway = Math.sin(t * 1.3) * 2.2 + Math.sin(t * 2.9) * 0.6
  const [bx, by] = DANDELION.stemBase
  const hx = DANDELION.x + sway
  const hy = DANDELION.y
  for (let i = 0; i <= 40; i += 1) {
    const s = i / 40
    const x = bx + (hx - bx) * s + Math.sin(s * Math.PI) * -4
    const y = by + (hy - by) * s
    setPx(img, x, y, C.stem)
    setPx(img, x + 1, y, C.stemDark)
  }
  // leaves at the base
  for (let i = 0; i < 12; i += 1) {
    setPx(img, bx - i, by - i * 0.5 + (i % 3 === 0 ? -1 : 0), C.stem)
    setPx(img, bx - i, by - i * 0.5 + 1, C.stemDark)
    setPx(img, bx + 1 + i * 0.8, by - i * 0.6 + (i % 3 === 1 ? -1 : 0), C.stem)
  }
  // the flower head
  for (let dy = -5; dy <= 5; dy += 1) {
    for (let dx = -6; dx <= 6; dx += 1) {
      const d = (dx * dx) / 36 + (dy * dy) / 25
      if (d > 1) continue
      const c = d < 0.25 ? C.orange : (dx + dy) % 3 === 0 ? hex('#ffe36e') : C.yellow
      setPx(img, hx + dx, hy + dy, c)
    }
  }

  // a ladybug walking through the grass, stopping now and then
  const cycle = (t % 26) / 26
  const walking = cycle < 0.8
  const lx = 150 + (walking ? cycle / 0.8 : 1) * 110
  const ly = 252 + Math.sin(lx * 0.08) * 1.5
  const step = walking && Math.floor(t * 8) % 2
  const bug = [
    ['.', 'b', 'b', 'b', '.'],
    ['b', 'r', 'k', 'r', 'r'],
    ['b', 'r', 'r', 'k', 'r'],
    ['.', 'r', 'k', 'r', '.'],
  ]
  const pal = { b: C.black, r: C.red, k: C.black }
  bug.forEach((row, ry) => row.forEach((ch, rx) => pal[ch] && setPx(img, lx + rx, ly + ry, pal[ch])))
  setPx(img, lx + 1, ly + 1, C.redHi)
  setPx(img, lx + 1 + step, ly + 4, C.black)
  setPx(img, lx + 3 - step, ly + 4, C.black)

  // leaves drifting down from the big tree
  for (let i = 0; i < (compact ? 3 : 6); i += 1) {
    const period = 9 + i * 1.7
    const p = ((t + i * 3.1) % period) / period
    const x = 300 + i * 22 + Math.sin(p * 9 + i) * 8 - p * 30
    const y = 40 + p * 170
    const c = i % 3 === 0 ? hex('#98d65e') : i % 3 === 1 ? hex('#e8b04a') : hex('#53a944')
    setPx(img, x, y, c)
    if (Math.floor(p * 20) % 2) setPx(img, x + 1, y, c)
    else setPx(img, x, y + 1, c)
  }

  // two birds crossing the sky
  for (let i = 0; i < 2; i += 1) {
    const p = ((t + i * 7) % 48) / 48
    const x = -10 + p * 520
    const y = 52 + i * 9 + Math.sin(p * 20) * 2
    const flap = Math.floor(t * 4 + i) % 2
    const col = hex('#0f3f80')
    setPx(img, x, y, col)
    setPx(img, x - 1, y - 1 + flap, col)
    setPx(img, x + 1, y - 1 + flap, col)
    setPx(img, x - 2, y - flap, col)
    setPx(img, x + 2, y - flap, col)
  }
}

export const CLOUD_WIDTH = CLOUD_W
