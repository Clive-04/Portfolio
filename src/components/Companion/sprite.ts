/**
 * Original 16 × 16 pixel sprite of Clive, drawn for this site from his
 * formal portfolio photo (public/profile.jpg): swept black hair with a
 * curtain fringe, warm skin, a smile, white collar, black suit, and a dark
 * striped tie. Colours were sampled from the photo and fitted to the pixel
 * Day / Night palette. Not traced or adapted from any game sprite.
 *
 * Each frame is 16 rows of 16 characters; each character is a colour role
 * (see `palettes`), `.` is transparent. No imports, so Node's test runner can
 * check the frames directly.
 */

export const SPRITE_GRID = 16

/** Colour roles. Day and Night differ only where contrast needs it. */
export const palettes = {
  day: {
    o: '#17324d', // outline: site navy
    h: '#1a1d2b', // hair (photo #171a26)
    H: '#3b4258', // hair highlight
    s: '#c39176', // skin (photo #bf9074)
    S: '#9a6656', // skin shadow (photo #946458)
    e: '#2a1d26', // eyes (photo #301e26)
    m: '#fff6d8', // smile: site cream
    w: '#f4efe6', // shirt (photo #dbd5cf, lifted)
    j: '#262a35', // jacket (photo #202021, cooled)
    J: '#171a22', // jacket shade
    t: '#4a4652', // tie (photo #3e3937)
    T: '#9c98a6', // tie stripe
    p: '#1f222c', // trousers
    b: '#101218', // shoes
    c: '#25b7d3', // teleport beam: site cyan
    y: '#f3c847', // teleport spark: site yellow
  },
  night: {
    o: '#9fb3d6', // light outline so the dark suit and hair read on navy
    h: '#20243a',
    H: '#46507a',
    s: '#c39176',
    S: '#9a6656',
    e: '#2a1d26',
    m: '#fff6d8',
    w: '#f4efe6',
    j: '#30364a', // slightly lifted so the jacket separates from the background
    J: '#20243a',
    t: '#5a5666',
    T: '#b0acbb',
    p: '#272b3a',
    b: '#151826',
    c: '#51d2f0',
    y: '#ffd45a',
  },
} as const

export type Role = keyof typeof palettes.day

const idle = [
  '....oooooooo....',
  '...ohhhhHHhho...',
  '..ohhhHHhhhhho..',
  '..ohhhhhhhhhhho.',
  '..ohhssshhhhhho.',
  '..ohssssshhhhho.',
  '..osesssseshho..',
  '..osssSSssshho..',
  '..ossSmmSssSo...',
  '...oSssssSSo....',
  '..ojjwwtwwjjo...',
  '.ojjjjwtTwjjjo..',
  '.ojJjjjtTjjjJjo.',
  '.osjjjjTtjjjjso.',
  '..oopppoopppoo..',
  '...obbo..obbo...',
]

/** Idle blink: eyes closed for one frame. */
const blink = idle.map((row, y) => (y === 6 ? '..osSsssSsshho..' : row))

/** Side-view head (facing right), shared by the walk frames. */
const sideHead = [
  '.....oooooo.....',
  '....ohhhhHHoo...',
  '...ohhhHHhhhhoo.',
  '...ohhhhhhhhhhho',
  '...ohhhhhhhhshho',
  '...ohhhhsssssso.',
  '...ohhSsssssesso',
  '...ohhSsssssSSo.',
  '....ohsssssmmo..',
  '.....oSSSSSSo...',
]

const torso = ['....ojjjwwo.....', '....ojjjjwto....']

/** Four-step walk (facing right): stride, pass, stride with legs swapped, pass. */
const walk = [
  [...sideHead, ...torso, '....osjjjjto....', '....ojjjjjjo....', '...oJJo..oppo...', '..obbo....obbbo.'],
  [...sideHead, ...torso, '....ojjjjjto....', '....ojjsjjjo....', '.....oppppo.....', '.....obbbbbo....'],
  [...sideHead, ...torso, '....ojjjjsto....', '....ojjjjjjo....', '...oppo..oJJo...', '..obbo....obbbo.'],
  [...sideHead, ...torso, '....ojjjjjto....', '....ojjsjjjo....', '.....oJJJJo.....', '.....obbbbbo....'],
]

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather at the feet. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((row, y) => (y === 15 ? '.y.obbo..obbo.y.' : y === 13 ? 'yosjjjjTtjjjjsoy' : row)),
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

export const frames = { idle, blink, walk, teleport }

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
