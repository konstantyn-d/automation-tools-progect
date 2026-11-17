import { seeded } from '../lib/random.js'
import { Sprite } from './pixel.jsx'

// One small pixel scene per course: a coloured sky, a few specks, a ground strip and a 16 px sprite.

const ART = {
  nodes: {
    sky: ['#ffb38a', '#ffc9a3', '#ffe0c2'], ground: '#e8845c', speck: '#fff3e6',
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
    sky: ['#14244d', '#1d3470', '#2a4a96'], ground: '#0d1836', speck: '#ffffff',
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
    sky: ['#0f8f8a', '#19a79f', '#4cc7bb'], ground: '#0a6a66', speck: '#c8f5ee',
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
    sky: ['#2f8a38', '#49a845', '#7ccf5a'], ground: '#1e6a2c', speck: '#d6f5c8',
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
    sky: ['#f59e0b', '#fbbf24', '#fde68a'], ground: '#c2410c', speck: '#fff7d6',
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
    sky: ['#5b3cc4', '#7c5ce0', '#a78bfa'], ground: '#3b2485', speck: '#e9e1ff',
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
}

export default function CourseArt({ name }) {
  const art = ART[name]
  const rand = seeded(name.length * 97 + name.charCodeAt(0))
  const specks = Array.from({ length: 14 }, () => ({ x: Math.floor(rand() * 32) * 2, y: Math.floor(rand() * 22) * 2 }))
  const spriteH = art.rows.length * 3
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
        <Sprite rows={art.rows} palette={art.palette} x={8} y={54 - spriteH} size={3} />
      </g>
    </svg>
  )
}
