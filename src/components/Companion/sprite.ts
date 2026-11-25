/**
 * Original 16 × 16 pixel sprite of Clive, drawn for this site. Likeness from
 * two of his own photos: a casual photo he provided (hair swept up and to the
 * right, thin glasses, smile, white mock-neck sweater) and his formal portrait
 * (skin and hair tones). Jeans and shoes are invented; the casual photo is
 * cropped at the waist.
 *
 * Style follows a chibi pixel-character reference Clive supplied (one dark
 * outline, flat colours, short legs), with a smaller head — half the height
 * and eight pixels wide — and subtle browline glasses, at Clive's request.
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
  g: '#7b818e', // thin browline glasses (casual photo frame #586061, lightened to stay subtle)
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

/**
 * Facing down. Rows 0–6 head (quiff; eyes on rows 4–5 with a thin glasses
 * bridge and frame ticks), rows 7–15 body.
 */
const head = [
  '.....oooooo.....',
  '....ohhhHHHo....',
  '...ohhhhhhhho...',
  '...ohsssssshho..',
  '...ogesggsego...',
  '...osesssseso...',
  '....ossmmsso....',
]

const body = [
  '.....owWWwo.....',
  '....owwwwwwo....',
  '...owwwwwwwwo...',
  '...owowwwwowo...',
  '...osowwwwoso...',
  '....onnnnnno....',
  '....onnoonno....',
]

const idle = [...head, ...body, '....onnoonno....', '....obboobbo....']

/** Idle blink: eyes closed for one frame. */
const blink = idle.map((row, y) => (y === 4 ? '...ogSsggsSgo...' : y === 5 ? '...osssssssso...' : row))

/**
 * Facing down: left step, stand, right step, stand. The stepping foot is
 * lifted one pixel while the other stays planted, so both legs stay visible.
 */
const walkDown = [
  [...head, ...body, '....onnoobbo....', '....obbo........'],
  idle,
  [...head, ...body, '....obboonno....', '........obbo....'],
  idle,
]

/** Side view (facing right): the glasses arm runs from the ear to the frame. */
const sideHead = [
  '.....oooooo.....',
  '....ohhhHHHo....',
  '...ohhhhhhhho...',
  '...ohhhhhhssso..',
  '...ohhSgggegso..',
  '...ohhSsssesso..',
  '....ohssssmmo...',
]

const sideTop = ['.....owWWwo.....', '.....owwwwwo....', '.....owwwwwo....']
const waist = ['.....owwwwwo....', '.....onnnnno....']
const strideFeet = '...obbo...obbo..'
const passFeet = '.....obbbbo.....'

/**
 * Facing right: stride, pass, stride with the legs swapped, pass. The back
 * leg is the darker shade, so the swap reads. Mirrored for walking left.
 */
const walkSide = [
  [...sideHead, ...sideTop, '....oswwwwwo....', ...waist, '....oNNoonno....', '...oNNo..onno...', strideFeet],
  [...sideHead, ...sideTop, '.....owwswwo....', ...waist, '.....onnNo......', '.....onnNo......', passFeet],
  [...sideHead, ...sideTop, '.....owwwwwso...', ...waist, '....onnooNNo....', '...onno..oNNo...', strideFeet],
  [...sideHead, ...sideTop, '.....owwswwo....', ...waist, '.....oNnno......', '.....oNnno......', passFeet],
]

/**
 * Teleport departure, four frames; arrival plays them in reverse.
 * 1: sparks gather. 2: every other row turns to cyan light.
 * 3: a narrow column of light. 4: a few fading sparks.
 */
const teleport = [
  idle.map((row, y) => (y === 15 ? '.y..obboobbo..y.' : y === 11 ? 'y..osowwwwoso..y' : row)),
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
