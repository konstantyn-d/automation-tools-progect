// Tiny pixel icons, drawn the same way as the sprites: one character is one pixel.
export function PixelIcon({ rows, size = 2, className = '' }) {
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

// admin sidebar
const GRID = ['###.###', '###.###', '###.###', '.......', '###.###', '###.###', '###.###']
const CART = ['#......', '######.', '.#...#.', '.#####.', '.......', '.#..#..']
const DOC = ['#####.', '#...##', '#.##.#', '#....#', '#.###.#'.slice(0, 6), '#....#', '######']
const BANK = ['...#...', '..###..', '#######', '.#.#.#.', '.#.#.#.', '.#.#.#.', '#######']
const PEOPLE = ['.##..##', '.##..##', '.......', '####.##', '####.##', '####...']
const CHAT = ['#######', '#.....#', '#.###.#', '#.....#', '#######', '.##....', '.#.....']
const X = ['#...#', '.#.#.', '..#..', '.#.#.', '#...#']
const SEARCH = ['.###..', '#...#.', '#...#.', '#...#.', '.####.', '....##']
const ARROW = ['..#..', '...#.', '#####', '...#.', '..#..']
const WARN = ['...#...', '..###..', '..#.#..', '.##.##.', '.#####.', '###.###', '#######']

export const GridIcon = (props) => <PixelIcon rows={GRID} {...props} />
export const CartIcon = (props) => <PixelIcon rows={CART} {...props} />
export const DocIcon = (props) => <PixelIcon rows={DOC} {...props} />
export const BankIcon = (props) => <PixelIcon rows={BANK} {...props} />
export const PeopleIcon = (props) => <PixelIcon rows={PEOPLE} {...props} />
export const ChatIcon = (props) => <PixelIcon rows={CHAT} {...props} />
export const CloseIcon = (props) => <PixelIcon rows={X} {...props} />
export const SearchIcon = (props) => <PixelIcon rows={SEARCH} {...props} />
export const ArrowIcon = (props) => <PixelIcon rows={ARROW} {...props} />
export const WarnIcon = (props) => <PixelIcon rows={WARN} {...props} />
