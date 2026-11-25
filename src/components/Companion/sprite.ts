/**
 * Original 16 × 16 pixel sprite of Clive, drawn for this site from his
 * formal portfolio photo (public/profile.jpg): swept black hair with a
 * curtain fringe, warm skin, a moustache and smile, white collar, black suit,
 * and a dark striped tie. Colours were sampled from the photo.
 *
 * Style: general conventions of handheld 16-bit-era RPG overworld sprites —
 * coloured (selective) outlines, three-tone shading lit from the top left,
 * two-pixel eyes, a facing-down walk. Drawn by hand; not traced from the photo
 * and not copied or adapted from any existing game sprite.
 *
 * Each frame is 16 rows of 16 characters; each character is a colour role,
 * `.` is transparent. The art is identical in Day and Night; Night only adds a
 * light outline around the silhouette (see the companion styles). No imports,
 * so Node's test runner can check the frames directly.
 */

export const SPRITE_GRID = 16

export const palette = {
  o: '#14161f', // outline next to hair and suit
  k: '#6f4535', // outline next to skin
  h: '#1f2232', // hair (photo #171a26)
  H: '#454e6b', // hair highlight
  s: '#c99478', // skin (photo #bf9074)
  S: '#a06a56', // skin shadow (photo #946458)
  e: '#1d1520', // eyes (photo #301e26)
  m: '#fff6d8', // teeth: site cream
  w: '#f3eee5', // shirt (photo #dbd5cf, lifted)
  j: '#2c313f', // jacket (photo #202021)
  J: '#1b1e28', // jacket shadow
  K: '#48506a', // jacket highlight
  t: '#4b4754', // tie (photo #3e3937)
  T: '#a29eac', // tie stripe
  p: '#23262f', // trousers
  b: '#0f1016', // shoes
  c: '#25b7d3', // teleport beam: site cyan
  y: '#f3c847', // teleport spark: site yellow
} as const

export type Role = keyof typeof palette

/** Facing down, standing. Rows 0–10 head, 11–15 body. */
const head = [
  '.....oooooo.....',
  '....oHHhhhhho...',
  '...oHHhhhhhhho..',
  '...ohHhhhhhhhho.',
  '...ohhhsshhhhho.',
  '...ohhsssssshho.',
  '...ohsesssesho..',
  '...kssesssesk...',
  '...kSssSSSsSk...',
  '....kSsmmmSk....',
  '.....kSSSSk.....',
]

const body = ['...oKjwtTwjJo...', '..oKjjjtTjjjJo..', '..osjjjTtjjJso..']

const idle = [...head, ...body, '....opppJpppo...', '....obbo.obbo...']

/** Idle blink: eyes closed for one frame. */
const blink = idle.map((row, y) => (y === 6 ? '...ohsSsssSsho..' : y === 7 ? '...kssSsssSsk...' : row))

/** Facing down: step with the left foot, stand, step with the right foot, stand. */
const walkDown = [
  [...head, '...oKjwtTwjJo...', '..oKjjjtTjjjJo..', '..ojjjjTtjjJso..', '...osppJpppo....', '...obbbo..oo....'],
  idle,
  [...head, '...oKjwtTwjJo...', '..oKjjjtTjjjJo..', '..osjjjTtjjjjo..', '.....opppJpps...', '.....oo..obbbo..'],
  idle,
]

/** Side view (facing right), shared by the sideways walk. */
const sideHead = [
  '.....oooooo.....',
  '....oHHhhhhoo...',
  '...oHHhhhhhhhoo.',
  '...ohHhhhhhhhhho',
  '...ohhhhhhhhshho',
  '...ohhhhsssssso.',
  '...ohhSssssesk..',
  '...ohhSsssssssk.',
  '....ohSssssSSk..',
  '....kSsssmmk....',
  '.....kSSSSk.....',
]

const sideBody = ['....oKjjwwo.....', '....oKjjjwto....']

/** Facing right: stride, pass, stride with legs swapped, pass. Mirrored for left. */
const walkSide = [
  [...sideHead, ...sideBody, '....osjjjjto....', '...oJpo.oppo....', '..obbo...obbbo..'],
  [...sideHead, ...sideBody, '....ojjsjjjo....', '.....opppJo.....', '.....obbbbbo....'],
  [...sideHead, ...sideBody, '....ojjjjsto....', '...oppo.oJpo....', '..obbo...obbbo..'],
  [...sideHead, ...sideBody, '....ojjsjjjo....', '.....oJJppo.....', '.....obbbbbo....'],
]

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather at the feet. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((row, y) => (y === 15 ? '.y..obbo.obbo.y.' : y === 13 ? 'y.osjjjTtjjJso.y' : row)),
  idle.map((row, y) => (y % 2 ? row.replace(/[^.]/g, 'c') : row)),
  [
    '.......y........', '.......cc.......', '......cccc......', '.......cc.......',
    '......cccc......', '.......cc.......', '......cccc......', '.......cc.......',
    '......cccc......', '.......cc.......', '......cccc......', '.......cc.......',
    '......cccc......', '.......cc.......', '.....cccccc.....', '....y.cccc.y....',
  ],
  [
    '................', '.......y........', '................', '....c......c....',
    '................', '........y.......', '..y.............', '...........c....',
    '................', '......c.........', '..........y.....', '................',
    '....y...........', '........c.......', '.....c....y.....', '................',
  ],
]

export const frames = { idle, blink, walkDown, walkSide, teleport }

/** One SVG path per colour role: each horizontal run of a role becomes a rectangle. */
export function toRuns(rows: readonly string[]): Partial<Record<Role, string>> {
  const paths: Partial<Record<Role, string>> = {}
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const role = row[x] as Role
      if (role === ('.' as Role)) {
        x += 1
        continue
      }
      const start = x
      while (row[x] === role) x += 1
      paths[role] = `${paths[role] ?? ''}M${start} ${y}h${x - start}v1h-${x - start}z`
    }
  })
  return paths
}
