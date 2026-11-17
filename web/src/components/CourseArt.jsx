import { seeded } from '../lib/random.js'
import { Sprite } from './pixel.jsx'

// One small pixel scene per course: a coloured sky, a few specks, a ground strip and a 16 px sprite.

const SPRITES = {
  nodes: {
    palette: { a: '#e5534b', b: '#3a2a2a', c: '#ffffff', d: '#ffd23f' },
    rows: [
      '................',
      '.aaaa...........',
      '.a..a...........',
      '.a..abbbbb......',
      '.aaaa....b.cccc.',
      '.........bbc..c.',
      '.........b.c..c.',
      '.dddd....b.cccc.',
      '.d..dbbbbb......',
      '.d..d...........',
      '.dddd...........',
      '................',
    ],
  },
  dish: {
    palette: { y: '#ffd23f', o: '#f59e0b' },
    rows: [
      '.........yyyy...',
      '........yyyy....',
      '.......yyyy.....',
      '......yyyy......',
      '.....yyyyyyyy...',
      '.........yyyo...',
      '........yyyo....',
      '.......yyyo.....',
      '......yyoo......',
      '.....yyo........',
      '....yo..........',
      '................',
    ],
  },
  stack: {
    palette: { c: '#ffffff', d: '#bfe9e3', k: '#0a5753' },
    rows: [
      '....cccccccc....',
      '...cccccccccc...',
      '...dccccccccd...',
      '...dddddddddd...',
      '...kddddddddk...',
      '...cccccccccc...',
      '...dccccccccd...',
      '...dddddddddd...',
      '...kddddddddk...',
      '...cccccccccc...',
      '...dccccccccd...',
      '....dddddddd....',
    ],
  },
  terminal: {
    palette: { k: '#d9d9d4', e: '#161a16', g: '#5fe07f', r: '#e5534b', y: '#ffd23f' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kkrkykgkkkkkkkkk',
      'kkkkkkkkkkkkkkkk',
      'keeeeeeeeeeeeeek',
      'keggeeeeeeeeeeek',
      'keeeggeeeeeeeeek',
      'keeeeeggeeeeeeek',
      'keeeggeeeeeeeeek',
      'keggeeeeggggggek',
      'keeeeeeeeeeeeeek',
      'keeeeeeeeeeeeeek',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  clock: {
    palette: { w: '#ffffff', k: '#3a2a2a', s: '#e7e2d3' },
    rows: [
      '.....kkkkkk.....',
      '...kkwwkwwwkk...',
      '..kwwwwkwwwwwk..',
      '.kwwwwwkwwwwwwk.',
      '.kwwwwwkwwwwwwk.',
      'kwwwwwwkwwwwwwwk',
      'kkwwwwwkkkkkwwkk',
      'kwwwwwwwwwwwwwwk',
      '.kwwwwwwwwwwwwk.',
      '.kswwwwwwwwwwsk.',
      '..kswwwwkwwwsk..',
      '...kkssssssk....',
      '.....kkkkkk.....',
    ],
  },
  robot: {
    palette: { k: '#2a2140', w: '#ffffff', b: '#4ea8ff', r: '#ff6b6b', s: '#d9d4ea' },
    rows: [
      '.......rr.......',
      '.......kk.......',
      '...kkkkkkkkkk...',
      '..kwwwwwwwwwwk..',
      '..kwbbwwwwbbwk..',
      '..kwbbwwwwbbwk..',
      '..kwwwwwwwwwwk..',
      '..kwwkkkkkkwwk..',
      '..kssssssssssk..',
      '...kkkkkkkkkk...',
      '.....kk..kk.....',
      '...kkkkkkkkkk...',
      '...kwwswwswwk...',
      '...kkkkkkkkkk...',
    ],
  },
  mail: {
    palette: { k: '#2a2a3a', w: '#ffffff', r: '#e5534b' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kkwwwwwwwwwwwwkk',
      'kwkwwwwwwwwwwkwk',
      'kwwkwwwwwwwwkwwk',
      'kwwwkwwwwwwkwwwk',
      'kwwwwkwwwwkwwwwk',
      'kwwwwwkkkkwwwwwk',
      'kwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwrrwk',
      'kwwwwwwwwwwwrrwk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  sheet: {
    palette: { k: '#1f3a24', g: '#2fb457', w: '#ffffff', l: '#cfd8d0', b: '#4ea8ff' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kggggkggggkggggk',
      'kkkkkkkkkkkkkkkk',
      'kwwwwlwwwwlwwwwk',
      'kllllllllllllllk',
      'kwwwwlwwwwlwwwwk',
      'kllllllllllllllk',
      'kwwwwlwwwwlbbbwk',
      'kllllllllllllllk',
      'kwwwwlwwwwlwwwwk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  chart: {
    palette: { k: '#2a2a2a', y: '#ffd23f', b: '#4ea8ff', r: '#e5534b', w: '#ffffff' },
    rows: [
      'k...............',
      'k...........rr..',
      'k...........rr..',
      'k.......bb..rr..',
      'k.......bb..rr..',
      'k...ww..bb..rr..',
      'k...ww..bb..rr..',
      'k...ww..bb..rr..',
      'k...ww..bb..rr..',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  lock: {
    palette: { s: '#e2e2dc', k: '#3a2a1a', y: '#ffd23f' },
    rows: [
      '.....ssssss.....',
      '....ss....ss....',
      '....s......s....',
      '....s......s....',
      '..kkkkkkkkkkkk..',
      '..kyyyyyyyyyyk..',
      '..kyyyykkyyyyk..',
      '..kyyyykkyyyyk..',
      '..kyyyykkyyyyk..',
      '..kyyyyyyyyyyk..',
      '..kkkkkkkkkkkk..',
    ],
  },
  chat: {
    palette: { k: '#2a2140', w: '#ffffff', b: '#9aa3b5', y: '#fff3b0', d: '#c9a227' },
    rows: [
      'kkkkkkkkkkk.....',
      'kwwwwwwwwwk.....',
      'kwbbbbbbbwk.....',
      'kwbbbbbwwwk.....',
      'kwwwwwwwwwk.....',
      'kkwkkkkkkkk.....',
      '.kk...kkkkkkkkkk',
      '......kyyyyyyyyk',
      '......kyddddddyk',
      '......kyyyyyyyyk',
      '......kkkkkkkkkk',
      '.............kk.',
    ],
  },
  branch: {
    palette: { o: '#ff8a3d', k: '#ffffff' },
    rows: [
      '.oo.............',
      '.oo.............',
      '.kk.............',
      '.kk.......oo....',
      '.kk.......oo....',
      '.kk......kk.....',
      '.kk.....kk......',
      '.kk....kk.......',
      '.kkkkkkk........',
      '.kk.............',
      '.oo.............',
      '.oo.............',
    ],
  },
  card: {
    palette: { k: '#1b1b2a', b: '#4b6bfb', d: '#1b1b2a', y: '#ffd23f', w: '#dfe6ff' },
    rows: [
      'kkkkkkkkkkkkkkkk',
      'kbbbbbbbbbbbbbbk',
      'kddddddddddddddk',
      'kbbbbbbbbbbbbbbk',
      'kbyyybbbbbbbbbbk',
      'kbyyybbbbbbbbbbk',
      'kbbbbbbbbbbbbbbk',
      'kbwwwbwwwbwwbbbk',
      'kbbbbbbbbbbbbbbk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  box: {
    palette: { r: '#e5534b', b: '#4ea8ff', g: '#5fe07f', y: '#ffd23f', k: '#1b2a3a', w: '#ffffff' },
    rows: [
      '....rr.bb.gg....',
      '....rr.bb.gg....',
      '.bb.yy.rr.bb.yy.',
      '.bb.yy.rr.bb.yy.',
      'kkkkkkkkkkkkkkkk',
      '.kwwwwwwwwwwwwk.',
      '..kwwwwwwwwwwk..',
      '...kkkkkkkkkk...',
    ],
  },
  doc: {
    palette: { k: '#3a2a2a', w: '#ffffff', l: '#c9c9c9', r: '#e5534b' },
    rows: [
      '..kkkkkkkkkkk...',
      '..kwwwwwwwwwk...',
      '..kwlllllllwk...',
      '..kwwwwwwwwwk...',
      '..kwlllllwwwk...',
      '..kwwwwwwwwwk...',
      '..krrrrrwwwwk...',
      '..krrrrrwwwwk...',
      '..kwwwwwwwwwk...',
      '..kwllllllwwk...',
      '..kwwwwwwwwwk...',
      '..kkkkkkkkkkk...',
    ],
  },
  bell: {
    palette: { k: '#3a2a1a', y: '#ffd23f' },
    rows: [
      '.......kk.......',
      '.....kkyykk.....',
      '....kyyyyyyk....',
      '....kyyyyyyk....',
      '...kyyyyyyyyk...',
      '...kyyyyyyyyk...',
      '..kyyyyyyyyyyk..',
      '.kkkkkkkkkkkkkk.',
      '.......kk.......',
    ],
  },
}

// The sky behind the sprite: three bands, a ground strip and specks.
const TONES = {
  peach: { sky: ['#ffb38a', '#ffc9a3', '#ffe0c2'], ground: '#e8845c', speck: '#fff3e6' },
  night: { sky: ['#14244d', '#1d3470', '#2a4a96'], ground: '#0d1836', speck: '#ffffff' },
  teal: { sky: ['#0f8f8a', '#19a79f', '#4cc7bb'], ground: '#0a6a66', speck: '#c8f5ee' },
  green: { sky: ['#2f8a38', '#49a845', '#7ccf5a'], ground: '#1e6a2c', speck: '#d6f5c8' },
  amber: { sky: ['#f59e0b', '#fbbf24', '#fde68a'], ground: '#c2410c', speck: '#fff7d6' },
  violet: { sky: ['#5b3cc4', '#7c5ce0', '#a78bfa'], ground: '#3b2485', speck: '#e9e1ff' },
  sky: { sky: ['#1c72d2', '#3590e6', '#6fb8f5'], ground: '#12509a', speck: '#e4f1ff' },
  rose: { sky: ['#d9466f', '#ec6b8e', '#f7a3ba'], ground: '#9e2448', speck: '#ffe3ec' },
  slate: { sky: ['#334155', '#475569', '#64748b'], ground: '#1e293b', speck: '#e2e8f0' },
  mint: { sky: ['#4fbf96', '#7dd3b0', '#b5ebd3'], ground: '#2f8a68', speck: '#ffffff' },
  sand: { sky: ['#c9a66b', '#dcbf8e', '#efdcb8'], ground: '#9a7440', speck: '#fffaf0' },
}

export default function CourseArt({ name, tone }) {
  const sprite = SPRITES[name] || SPRITES.nodes
  const art = TONES[tone] || TONES.peach
  const rand = seeded(name.length * 97 + name.charCodeAt(0) + (tone ? tone.charCodeAt(0) * 13 : 0))
  const specks = Array.from({ length: 14 }, () => ({ x: Math.floor(rand() * 32) * 2, y: Math.floor(rand() * 22) * 2 }))
  const spriteH = sprite.rows.length * 3
  return (
    <svg className="pixel course-art" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="22" fill={art.sky[0]} />
      <rect y="22" width="64" height="18" fill={art.sky[1]} />
      <rect y="40" width="64" height="16" fill={art.sky[2]} />
      {specks.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="2" height="2" fill={art.speck} opacity={0.35 + (i % 3) * 0.25} />
      ))}
      <rect y="54" width="64" height="10" fill={art.ground} />
      <rect y="54" width="64" height="2" fill="#000" opacity="0.12" />
      <g className="course-art__sprite">
        <rect x="14" y="55" width="36" height="2" fill="#000" opacity="0.22" />
        <Sprite rows={sprite.rows} palette={sprite.palette} x={8} y={54 - spriteH} size={3} />
      </g>
    </svg>
  )
}
