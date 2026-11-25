/**
 * Original 16 × 16 pixel sprite of Clive, drawn for this site from two of his
 * own photos as likeness references: a casual photo he provided (tousled hair
 * swept up and to the right, round thin-framed glasses, big smile, white
 * mock-neck sweater) and his formal portrait (skin and hair tones under
 * neutral light). The lower body (dark jeans and shoes) is not in the photo
 * and was chosen for contrast.
 *
 * Style: general conventions of handheld 16-bit-era RPG overworld sprites —
 * coloured (selective) outlines, three-tone shading lit from the top left,
 * a facing-down walk. Drawn by hand; not traced from the photos and not
 * copied or adapted from any existing game's sprites.
 *
 * Each frame is 16 rows of 16 characters; each character is a colour role,
 * `.` is transparent. The art is identical in Day and Night; Night only adds a
 * light outline around the silhouette (see the companion styles). No imports,
 * so Node's test runner can check the frames directly.
 */

export const SPRITE_GRID = 16

export const palette = {
  o: '#14161f', // outline beside hair, jeans, and shoes
  k: '#6f4535', // outline beside skin
  O: '#7c7f8c', // outline beside the white sweater
  h: '#1f2232', // hair (formal photo #171a26)
  H: '#454e6b', // hair highlight
  s: '#c99478', // skin (formal photo #bf9074)
  S: '#a06a56', // skin shadow (formal photo #946458)
  e: '#1d1520', // eyes
  g: '#4a4f55', // glasses frame (casual photo #586061)
  m: '#fff6d8', // teeth: site cream
  w: '#f4f4f1', // sweater (casual photo #d1d5e0 in overcast light, lifted)
  W: '#c6c9d3', // sweater shade (casual photo #c7c9cf)
  n: '#2e3649', // jeans
  N: '#1f2533', // jeans shade
  b: '#15171d', // shoes
  c: '#25b7d3', // teleport beam: site cyan
  y: '#f3c847', // teleport spark: site yellow
} as const

export type Role = keyof typeof palette

/** Facing down, standing. Rows 0–10 head (glasses rim and bridge on row 6), 11–15 body. */
const head = [
  '.....oooooo.....',
  '....oHHHhhhhoo..',
  '...oHHhhhhhhhhho',
  '...ohhhhhhhhhhho',
  '...ohhsshhhhhhho',
  '...khsssssshhho.',
  '...ksgggggggsk..',
  '..kSsgesssegsSk.',
  '...kssssSssssk..',
  '...kSsmmmmsSk...',
  '....kSssssSk....',
]

const body = ['...OwwWWWWwwO...', '..OwwwwwwwwwWO..', '..OswwwwwwwWsO..']

const idle = [...head, ...body, '....onnnNnnno...', '....obbo.obbo...']

/** Idle blink: eyes closed behind the glasses for one frame. */
const blink = idle.map((row, y) => (y === 7 ? '..kSsgSsssSgsSk.' : row))

/** Facing down: step with the left foot, stand, step with the right foot, stand. */
const walkDown = [
  [...head, ...body, '...onnnoNnno....', '...obbbo..oo....'],
  idle,
  [...head, ...body, '.....onnNonnno..', '.....oo..obbbo..'],
  idle,
]

/** Side view (facing right): glasses frame with the temple arm to the ear. */
const sideHead = [
  '.....oooooo.....',
  '....oHHHhhhoo...',
  '...oHHhhhhhhhoo.',
  '...ohhhhhhhhhhho',
  '...ohhhhhhhhhhho',
  '...ohhhhhssssso.',
  '...ohhSggggggsk.',
  '...ohhSssssegsk.',
  '....ohSssssssk..',
  '....kSssssmmk...',
  '.....kSSSSk.....',
]

const sideBody = ['....OwwWWwO.....', '....OwwwwwWO....']

/** Facing right: stride, pass, stride with legs swapped, pass. Mirrored for left. */
const walkSide = [
  [...sideHead, ...sideBody, '....OswwwwWO....', '...oNno.onno....', '..obbo...obbbo..'],
  [...sideHead, ...sideBody, '....OwwswwWO....', '.....onnNo......', '.....obbbbo.....'],
  [...sideHead, ...sideBody, '....OwwwwsWO....', '...onno.oNno....', '..obbo...obbbo..'],
  [...sideHead, ...sideBody, '....OwwswwWO....', '.....oNnno......', '.....obbbbo.....'],
]

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather at the feet. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((row, y) => (y === 15 ? '.y..obbo.obbo.y.' : y === 13 ? 'y.OswwwwwwwWsO.y' : row)),
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
