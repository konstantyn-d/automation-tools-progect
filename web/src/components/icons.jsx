// Tiny pixel icons, drawn the same way as the sprites: one character is one pixel.
function PixelIcon({ rows, size = 2, className = '' }) {
  const rects = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  })
  return (
    <svg
      className={`pixel icon ${className}`}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      width={rows[0].length * size}
      height={rows.length * size}
      fill="currentColor"
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

const LOCK = ['.#####.', '.#...#.', '.#...#.', '#######', '###.###', '###.###', '#######']
const CHECK = ['.....##', '....##.', '##.##..', '.###...', '..#....']
const PLAY = ['##...', '###..', '####.', '#####', '####.', '###..', '##...']
const PAUSE = ['##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##']

export const LockIcon = (props) => <PixelIcon rows={LOCK} {...props} />
export const CheckIcon = (props) => <PixelIcon rows={CHECK} {...props} />
export const PlayIcon = (props) => <PixelIcon rows={PLAY} {...props} />
export const PauseIcon = (props) => <PixelIcon rows={PAUSE} {...props} />
