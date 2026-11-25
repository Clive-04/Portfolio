/**
 * Original 16 × 16 pixel sprite of Clive, drawn for this site. Likeness from
 * two of his own photos: a casual photo he provided (hair swept up and to the
 * right, round thin-framed glasses, big smile, white mock-neck sweater) and his
 * formal portrait (skin and hair tones). Jeans and shoes are invented; the
 * casual photo is cropped at the waist.
 *
 * Style follows a chibi pixel-character reference Clive supplied: one dark
 * navy outline around everything, a wide head about as tall as the body,
 * flat colours with a single shade, 1 × 2 eyes, and short two-pixel legs.
 * Drawn by hand; nothing traced from the photos or copied from the reference
 * or any game's sprites.
 *
 * Each frame is 16 rows of 16 characters; each character is a colour role,
 * `.` is transparent. The art is identical in Day and Night; Night only adds a
 * light outline around the silhouette (see the companion styles). No imports,
 * so Node's test runner can check the frames directly.
 */

export const SPRITE_GRID = 16

export const palette = {
  o: '#1c2a44', // outline: dark navy, close to the site's #17324d
  h: '#24283a', // hair (formal photo #171a26, lifted so the highlight reads)
  H: '#4a5578', // hair highlight
  s: '#d29d80', // skin (formal photo #bf9074, lifted for flat shading)
  S: '#a86f59', // skin shade
  e: '#1c2a44', // eyes: same navy as the outline
  g: '#5d6370', // glasses frame (casual photo #586061)
  l: '#dfe8f2', // glasses lens: pale blue-grey, so the glasses read without hiding the eyes
  m: '#fff6d8', // smile: site cream
  w: '#f4f4f1', // sweater (casual photo, lifted from overcast light)
  W: '#c6c9d3', // sweater shade (casual photo #c7c9cf)
  n: '#3a4664', // jeans
  N: '#27304a', // jeans shade (the back leg in the side walk)
  b: '#5a3a2e', // shoes
  c: '#25b7d3', // teleport beam: site cyan
  y: '#f3c847', // teleport spark: site yellow
} as const

export type Role = keyof typeof palette

/** Facing down. Rows 0–8 head (glasses: rims on row 5, lenses and eyes rows 6–7), 9–15 body. */
const head = [
  '....oooooooo....',
  '...ohhhHHHhho...',
  '..ohhhhhhHHhho..',
  '..ohhhhhhhhhhho.',
  '..ohhssshhhhho..',
  '..osgggssgggso..',
  '..oslelgglelso..',
  '..oslelsslelso..',
  '...ossSmmSsso...',
]

const body = [
  '...owwWWWWwwo...',
  '..owwwwwwwwwwo..',
  '..oswwwwwwwwso..',
  '..oowwwwwwwwoo..',
  '...onnnnnnnno...',
]

const idle = [...head, ...body, '...onno..onno...', '...obbo..obbo...']

/** Idle blink: eyes closed behind the glasses for one frame. */
const blink = idle.map((row, y) => (y === 6 ? '..oslllgglllso..' : y === 7 ? '..oslSlsslSlso..' : row))

/**
 * Facing down: left step, stand, right step, stand. The stepping foot is
 * lifted one pixel while the other stays planted, so both legs stay visible.
 */
const walkDown = [
  [...head, ...body, '...onno..obbo...', '...obbo.........'],
  idle,
  [...head, ...body, '...obbo..onno...', '.........obbo...'],
  idle,
]

/** Side view (facing right): glasses temple runs back to the ear. */
const sideHead = [
  '....oooooooo....',
  '...ohhhHHHhho...',
  '..ohhhhhhHHhhho.',
  '..ohhhhhhhhhhhho',
  '..ohhhhhhhsssso.',
  '..ohhhhsssggggo.',
  '..ohhSsggglelso.',
  '..ohhSsssslelsso',
  '...ohssssssmmso.',
]

const sideTop = ['...owwWWwwo.....', '...owwwwwwWo....']
const hem = ['...oowwwwwoo....', '....onnnnno.....']

/**
 * Facing right: stride, pass, stride with the legs swapped, pass. The back
 * leg is the darker shade, so the swap reads. Mirrored for walking left.
 */
const walkSide = [
  [...sideHead, ...sideTop, '...oswwwwwWo....', ...hem, '...oNNo.onno....', '...obo...obbo...'],
  [...sideHead, ...sideTop, '...owwwswwWo....', ...hem, '.....onNno......', '.....obbbo......'],
  [...sideHead, ...sideTop, '...owwwwwsWo....', ...hem, '...onno.oNNo....', '...obo...obbo...'],
  [...sideHead, ...sideTop, '...owwwswwWo....', ...hem, '.....oNnno......', '.....obbbo......'],
]

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((row, y) => (y === 15 ? '.y.obbo..obbo.y.' : y === 11 ? 'y.oswwwwwwwwso.y' : row)),
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
