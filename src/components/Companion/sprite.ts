/**
 * Original 24 × 32 pixel sprite of Clive, drawn for this site. Likeness from
 * two of his own photos: a casual photo he provided (hair swept up and to the
 * right, thin glasses, smile, white mock-neck sweater) and his formal portrait
 * (skin and hair tones). Jeans and sneakers are invented; the casual photo is
 * cropped at the waist.
 *
 * Style: detailed pixel-character craft after a reference sheet Clive shared
 * (layered hair highlights, three-tone shading, glasses with a glint, folds,
 * shaded sneakers) — Clive's own outfit and features, nothing copied from the
 * reference, traced from the photos, or adapted from any game's sprites.
 *
 * Rows are run-length strings ("5. 1o 4k" = five transparent, one outline,
 * four sneaker-white) so each row is easy to edit; `.` is transparent. The art
 * is identical in Day and Night; Night only adds a light outline around the
 * silhouette. No imports, so Node's test runner can check the frames directly.
 */

export const SPRITE_W = 24
export const SPRITE_H = 32

export const palette = {
  o: '#1d1b26', // outline: near-black, slightly warm
  h: '#2a2433', // hair (formal photo #171a26, warmed)
  H: '#4e4762', // hair highlight
  s: '#d29d80', // skin (formal photo #bf9074)
  S: '#a86f59', // skin shade
  e: '#1d1b26', // eyes
  l: '#ffffff', // glint on the lenses
  g: '#2f2c3a', // glasses frame (casual photo #586061, darkened for a crisp line)
  m: '#fff6d8', // teeth: site cream
  w: '#eef0f4', // sweater (casual photo, lifted from overcast light)
  W: '#bcc2cf', // sweater shade (casual photo #c7c9cf)
  V: '#8e96a8', // sweater deep fold
  n: '#3b4660', // jeans
  N: '#28304a', // jeans shade, and the far leg in the side walk
  J: '#56648a', // jeans highlight
  k: '#f4f2ec', // sneakers
  r: '#b73d33', // sneaker soles: site vermilion
  c: '#25b7d3', // teleport beam: site cyan
  y: '#f3c847', // teleport spark: site yellow
} as const

export type Role = keyof typeof palette

/** "5. 1o 4k" → ".....okkkk": each token is a count and a colour role. */
function row(runs: string): string {
  return runs
    .trim()
    .split(/\s+/)
    .map((token) => token.slice(-1).repeat(Number(token.slice(0, -1))))
    .join('')
}

const rows = (list: string[]) => list.map(row)

/** Facing down. Rows 0–12 head (messy quiff, glasses rows 6–9), 13 collar, 14–21 sweater, 22 waist, 23–29 legs, 30–31 sneakers. */
const head = rows([
  '10. 2o 2. 1o 9.',
  '8. 2o 2h 2o 1h 1o 8.',
  '6. 1o 3h 2H 5h 1o 6.',
  '5. 1o 2h 2H 6h 1H 2h 1o 4.',
  '4. 1o 15h 1o 3.',
  '4. 1o 2h 2s 2h 4s 3h 2h 1o 3.',
  '5. 1o 1s 5g 1s 5g 1s 1o 4.',
  '5. 1o 1s 1g 1s 1e 1l 1g 1g 1g 1s 1e 1l 1g 1s 1o 4.',
  '5. 1o 1s 1g 1s 1e 1s 1g 1s 1g 1s 1e 1s 1g 1s 1o 4.',
  '5. 1o 1S 1g 3S 1g 1S 1g 3S 1g 1S 1o 4.',
  '5. 1o 1S 5s 1S 5s 1S 1o 4.',
  '6. 1o 1S 2s 1S 2m 1S 2s 1S 1o 6.',
  '7. 1o 1S 6s 1S 1o 7.',
])

const torso = rows([
  '8. 1o 1W 4w 1W 1o 8.',
  '5. 1o 12w 1W 1o 4.',
  '4. 1o 2w 1o 8w 1W 1o 2W 1o 3.',
  '4. 1o 2w 1o 7w 2W 1o 2W 1o 3.',
  '4. 1o 1w 1W 1o 7w 2W 1o 1W 1V 1o 3.',
  '4. 1o 1w 1W 1o 6w 3W 1o 1W 1V 1o 3.',
  '4. 1o 2W 1o 6w 3W 1o 2V 1o 3.',
  '4. 1o 2s 1o 1V 5w 3W 1o 2s 1o 3.',
  '4. 1o 2S 1o 1V 7W 1V 1o 2S 1o 3.',
  '6. 1o 1n 2J 6n 1N 1o 6.',
])

const leg = row('6. 1o 1J 2n 1N 2o 1n 2n 1N 1o 6.')
const cuffs = row('6. 1o 4N 2o 4N 1o 6.')
const legs = [leg, leg, leg, leg, leg, leg, cuffs]

const idle = [
  ...head,
  ...torso,
  ...legs,
  row('5. 1o 4k 1o 2. 1o 4k 1o 5.'),
  row('5. 1o 4r 1o 2. 1o 4r 1o 5.'),
]

/** Idle blink: eyes closed behind the glasses for one frame. */
const blink = idle.map((line, y) =>
  y === 7 ? row('5. 1o 1s 1g 1s 1S 1l 1g 1g 1g 1s 1S 1l 1g 1s 1o 4.') : y === 8 ? row('5. 1o 1s 1g 3s 1g 1s 1g 3s 1g 1s 1o 4.') : line,
)

/** Facing down: left step, stand, right step, stand. The stepping foot lifts two pixels; both legs stay visible. */
const above = [...head, ...torso, leg, leg, leg, leg, leg]
const walkDown = [
  [
    ...above,
    row('6. 1o 1J 2n 1N 2o 1o 4k 1o 5.'),
    row('6. 1o 4N 2o 1o 4r 1o 5.'),
    row('5. 1o 4k 1o 13.'),
    row('5. 1o 4r 1o 13.'),
  ],
  idle,
  [
    ...above,
    row('5. 1o 4k 1o 2o 1n 2n 1N 1o 6.'),
    row('5. 1o 4r 1o 2o 4N 1o 6.'),
    row('13. 1o 4k 1o 5.'),
    row('13. 1o 4r 1o 5.'),
  ],
  idle,
]

/** Side view (facing right): glasses arm from the ear to the lens, nose past the lens. */
const sideHead = rows([
  '9. 2o 1. 1o 11.',
  '7. 2o 2h 1o 1h 2o 9.',
  '6. 1o 3h 2H 4h 1o 7.',
  '5. 1o 2h 2H 6h 1H 1h 1o 5.',
  '4. 1o 15h 1o 3.',
  '4. 1o 8h 4s 3h 1o 3.',
  '4. 1o 5h 1S 7g 2s 1o 3.',
  '4. 1o 5h 1S 4s 1g 1e 1l 1g 2s 1o 2.',
  '4. 1o 5h 1S 4s 1g 1e 1s 1g 2s 1o 2.',
  '4. 1o 4h 1S 5s 4S 1s 1o 3.',
  '5. 1o 2h 1S 9s 1S 1o 4.',
  '5. 1o 1h 1S 7s 2m 1S 1o 5.',
  '6. 1o 1S 8s 1o 7.',
])

const sideCollar = rows(['8. 1o 1W 3w 1W 1o 9.', '7. 1o 7w 1W 1o 7.'])
/** The near arm is a shaded sleeve (no inner outlines) that swings back, hangs, or swings forward. */
const sleeve = row('7. 1o 2w 3W 2w 1W 1o 7.')
const hem = row('7. 1o 1V 6W 1V 1o 7.')
const arms = {
  back: rows([
    '7. 1o 2w 3W 2w 1W 1o 7.',
    '7. 1o 1w 3W 3w 1W 1o 7.',
    '7. 1o 3W 4w 1W 1o 7.',
    '6. 1o 3W 5w 1W 1o 7.',
    '5. 1o 3W 6w 1W 1o 7.',
    '4. 1o 2s 1o 7w 1W 1o 7.',
    '7. 1o 1V 6W 1V 1o 7.',
  ]),
  down: [sleeve, sleeve, sleeve, sleeve, sleeve, row('7. 1o 2w 1o 2s 1o 1w 1W 1o 7.'), hem],
  forward: rows([
    '7. 1o 2w 3W 2w 1W 1o 7.',
    '7. 1o 3w 3W 1w 1W 1o 7.',
    '7. 1o 4w 3W 1W 1o 7.',
    '7. 1o 5w 3W 1o 7.',
    '7. 1o 6w 3W 1o 6.',
    '7. 1o 7w 1o 2s 1o 5.',
    '7. 1o 1V 6W 1V 1o 7.',
  ]),
}

const waist = row('7. 1o 8n 1o 7.')

const strideLegs = rows([
  '6. 1o 3N 2o 3n 1o 8.',
  '6. 1o 3N 1o 1. 1o 3n 1o 7.',
  '5. 1o 3N 1o 3. 1o 3n 1o 6.',
  '5. 1o 3N 1o 4. 1o 3n 1o 5.',
  '4. 1o 3N 1o 6. 1o 3n 1o 4.',
  '4. 1o 3N 1o 6. 1o 3n 1o 4.',
  '3. 1o 3N 1o 8. 1o 3n 1o 3.',
  '2. 1o 4k 1o 8. 1o 5k 1o 1.',
  '2. 1o 4r 1o 8. 1o 5r 1o 1.',
])

const passLegs = rows([
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '8. 1o 2n 2N 1o 10.',
  '7. 1o 6k 1o 9.',
  '7. 1o 6r 1o 9.',
])

/** Swap which leg is the far (darker) one, so the second stride uses the other leg. */
const swapLegs = (list: string[]) => list.map((line) => line.replace(/[nN]/g, (c) => (c === 'n' ? 'N' : 'n')))

/** Facing right: stride, pass, stride with the other leg, pass. Mirrored for walking left. */
const walkSide = [
  [...sideHead, ...sideCollar, ...arms.back, waist, ...strideLegs],
  [...sideHead, ...sideCollar, ...arms.down, waist, ...passLegs],
  [...sideHead, ...sideCollar, ...arms.forward, waist, ...swapLegs(strideLegs)],
  [...sideHead, ...sideCollar, ...arms.down, waist, ...swapLegs(passLegs)],
]

const empty = '.'.repeat(SPRITE_W)
/** Place single-character marks (sparks) on an empty frame: [x, y, role]. */
const marks = (points: [number, number, Role][]) =>
  Array.from({ length: SPRITE_H }, (_, y) =>
    [...empty].map((dot, x) => points.find(([px, py]) => px === x && py === y)?.[2] ?? dot).join(''),
  )

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((line, y) => (y === 31 ? `y${line.slice(1, -1)}y` : y === 20 ? `.y${line.slice(2, -2)}y.` : line)),
  idle.map((line, y) => (y % 2 ? line.replace(/[^.]/g, 'c') : line)),
  Array.from({ length: SPRITE_H }, (_, y) =>
    y === 0 ? row('11. 1y 12.') : y === SPRITE_H - 1 ? row('7. 1y 1. 6c 1. 1y 7.') : y % 2 ? row('10. 4c 10.') : row('11. 2c 11.'),
  ),
  marks([
    [11, 2, 'y'], [6, 6, 'c'], [17, 7, 'c'], [12, 10, 'y'], [3, 13, 'y'], [19, 15, 'c'],
    [9, 18, 'c'], [15, 21, 'y'], [5, 24, 'y'], [13, 26, 'c'], [8, 29, 'c'], [16, 30, 'y'],
  ]),
]

export const frames = { idle, blink, walkDown, walkSide, teleport }

/** One SVG path per colour role: each horizontal run of a role becomes a rectangle. */
export function toRuns(lines: readonly string[]): Partial<Record<Role, string>> {
  const paths: Partial<Record<Role, string>> = {}
  lines.forEach((line, y) => {
    let x = 0
    while (x < line.length) {
      const role = line[x] as Role
      if (role === ('.' as Role)) {
        x += 1
        continue
      }
      const start = x
      while (line[x] === role) x += 1
      paths[role] = `${paths[role] ?? ''}M${start} ${y}h${x - start}v1h-${x - start}z`
    }
  })
  return paths
}
