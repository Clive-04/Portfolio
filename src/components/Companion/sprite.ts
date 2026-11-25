/**
 * Original 24 × 32 pixel companion of Clive, drawn for this site from his
 * formal portrait (`public/profile.jpg`): thick dark hair with a parted
 * fringe, ears showing, wide smile, dark suit, white shirt and tie. The tie is
 * the site's vermilion so it reads at actual size; the portrait's tie is a
 * grey stripe. Nothing is traced from the photo or adapted from a game sprite.
 *
 * Every frame is 24 columns × 32 rows; each character is one pixel and `.` is
 * transparent. Light comes from the top left. `animations` gives each clip its
 * frames, per-frame timing (ms), and whether it loops. No imports, so Node's
 * test runner and the PNG export script can read it directly.
 */

export const SPRITE_W = 24
export const SPRITE_H = 32

export const palette = {
  o: '#1a1824', // outline, eyes
  h: '#262233', // hair
  H: '#4a4462', // hair highlight
  s: '#d29d80', // skin
  S: '#a86f59', // skin shade
  t: '#fff6d8', // teeth: site cream
  j: '#323850', // suit
  J: '#22263a', // suit shade
  L: '#56608a', // suit light: lapels, shoe shine
  w: '#f4f1ea', // shirt
  r: '#b73d33', // tie: site vermilion
  R: '#7a2630', // tie stripe
  b: '#245aa5', // teleport edge: site cobalt
  c: '#25b7d3', // teleport light: site cyan
  y: '#f3c847', // spark: site yellow
} as const

export type Role = keyof typeof palette
type Frame = string[]

const EMPTY = '.'.repeat(SPRITE_W)

/** Overwrite text at column x of row y, e.g. [9, 7, 'o']. */
const paint = (frame: Frame, edits: [number, number, string][]): Frame =>
  frame.map((line, y) =>
    edits.filter(([, ey]) => ey === y).reduce((l, [x, , s]) => l.slice(0, x) + s + l.slice(x + s.length), line),
  )

/** Move rows 0…rows-1 down by n (the body settles onto the legs); rows below stay put. */
const lower = (frame: Frame, n = 1, rows = 24): Frame => [
  ...Array(n).fill(EMPTY),
  ...frame.slice(0, rows - n),
  ...frame.slice(rows),
]

const mirror = (frame: Frame): Frame => frame.map((line) => [...line].reverse().join(''))

/** Solid light shape of a frame: outline becomes cobalt, everything else cyan. */
const silhouette = (frame: Frame): Frame => frame.map((line) => line.replace(/[^.]/g, (c) => (c === 'o' ? 'b' : 'c')))

/** Single-pixel sparks: [x, y, role]. */
const sparks = (frame: Frame, points: [number, number, Role][]) => paint(frame, points)

/* ---------- Facing the viewer ---------- */

const front: Frame = [
  '........oooooooo........',
  '......ooHHHhhhhhoo......',
  '.....oHHHhhhhhhhhho.....',
  '....oHHhhhhhhHhhhhho....',
  '....ohHhhhhhhhHhhhho....',
  '....ohhhhhshhhhhhhho....',
  '....ohhshssshhhhhhho....',
  '....oShssossssoshhSo....',
  '....oSsssossssossSSo....',
  '.....ossssSSSSsssSo.....',
  '.....osssottttossSo.....',
  '......ossssSSsssSo......',
  '.......oooSSSSooo.......',
  '....oooojwwrrwwJoooo....',
  '...ojjjjLwwrrwwLJJJJo...',
  '...ojjJjjLwRrwLjJoJJo...',
  '...ojjJjjjLrRLjJJoJJo...',
  '...ojjJjjjLRrLjJJoJJo...',
  '...ojjJjjjjLJjjJJoJJo...',
  '...ojjJjjjjjLjjJJoJJo...',
  '...ossojjjjjjjjJJosSo...',
  '...oSSoJJJJJJJJJJoSSo...',
  '....ooojjjjjjjjJJooo....',
  '......ojjjjjjjjJJo......',
  '......ojjjJoojjJJo......',
  '......ojjJo..ojJJo......',
  '......ojjJo..ojJJo......',
  '......ojjJo..ojJJo......',
  '......ojjJo..ojJJo......',
  '......ojjJo..ojJJo......',
  '.....oLJJJo..oLJJJo.....',
  '.....oooooo..oooooo.....',
]

const blink = paint(front, [[9, 7, 's'], [14, 7, 's'], [9, 8, 'o'], [14, 8, 'o']])
/** Smiling eyes: each eye becomes a small arch. */
const happy = (frame: Frame, top = 7) =>
  paint(frame, [[8, top, 'sos'], [13, top, 'sos'], [8, top + 1, 'oso'], [13, top + 1, 'oso']])

/** Breathing out: the upper body settles one pixel; legs and feet stay planted. */
const exhale = lower(front)

/** Personality beat: straighten the tie, then a pleased squint. */
const tieHand = paint(front, [
  [3, 14, 'ojjjjLosss'],
  [3, 15, 'ojjJoLosSo'],
  [3, 16, 'ojjoLjoLrR'],
  [3, 17, 'oLjojjjLRr'],
  [3, 18, 'ojJojjjjLJ'],
  [3, 19, '.oooj'],
  [3, 20, '...o'],
  [3, 21, '...o'],
  [3, 22, '...o'],
])
const tieTug = sparks(happy(tieHand), [[20, 3, 'y'], [19, 4, 'y'], [21, 4, 'y'], [20, 5, 'y']])

/** Sidebar pose: a thumbs-up beside the shoulder. */
const thumbsUp = paint(front, [
  [21, 9, 'o'],
  [20, 10, 'oso'],
  [19, 11, 'osSo'],
  [19, 12, 'oSSo'],
  [19, 13, 'ojJo'],
  [19, 14, 'ojJo'],
  [17, 15, 'oJJjJo'],
  [17, 16, 'oJJJo'],
  [17, 17, 'oooo'],
  [18, 18, '...'],
  [18, 19, '...'],
  [18, 20, '...'],
  [18, 21, '...'],
  [18, 22, '..'],
])

/** Facing the viewer, the stepping foot lifts two pixels; between steps the body dips onto both feet. */
const liftLeft = (frame: Frame) =>
  paint(frame, [
    [5, 28, 'oLJJJo'],
    [5, 29, 'oooooo'],
    [5, 30, '......'],
    [5, 31, '......'],
  ])
const liftRight = (frame: Frame) =>
  paint(frame, [
    [13, 28, 'oLJJJo'],
    [13, 29, 'oooooo'],
    [13, 30, '......'],
    [13, 31, '......'],
  ])

/* ---------- Facing away ---------- */

const back = [
  ...front.slice(0, 5),
  '....ohhhhhhhhhhhhhho....',
  '....ohhhhhHhhhhhhhho....',
  '....oShhhhhhhhhhhhSo....',
  '....oShhhhhhhhhhhhSo....',
  '.....ohhhhhhhhhhhho.....',
  '.....ohHhhhhhhhhhho.....',
  '......ohhhhhhhhhho......',
  '.......oooSSSSooo.......',
  '....oooojjwwwwjJoooo....',
  '...ojjjjjjjjjjjjJJJJo...',
  '...ojjJjjjjjjjjJJoJJo...',
  '...ojjJjjjjjjjjJJoJJo...',
  '...ojjJjjjjJjjjJJoJJo...',
  '...ojjJjjjjJjjjJJoJJo...',
  '...ojjJjjjjJjjjJJoJJo...',
  '...ossojjjjJjjjJJosSo...',
  ...front.slice(21),
]

/* ---------- Side view, facing right (mirrored for left) ---------- */

const sideHead = [
  '........oooooo..........',
  '......ooHHHhhhoo........',
  '.....oHHHhhhhhhhoo......',
  '....oHHhhhhhHhhhhho.....',
  '....ohHhhhhhhhHhhhho....',
  '....ohhhhhhhhhhhhhhho...',
  '....ohhhhhhhhshhhhso....',
  '....ohHhhhSShsssosso....',
  '....ohhhhhSsssssossso...',
  '....ohhhhhhSssssssSo....',
  '.....ohhhhSsssssoto.....',
  '......ohhSsssssSo.......',
  '........oSSSSoooo.......',
  '......oojjjjLwro........',
  '.....ojjjjjjLwro........',
]

/** Near arm: hanging, swung back, or swung forward (rows 15–22). */
const arm = {
  down: [
    '.....ojjoLjjowRo........',
    '.....ojjoLjjoLro........',
    '.....ojjoLjjojJo........',
    '.....ojjoLjjojJo........',
    '.....ojjoLjjojJo........',
    '.....ojjosSsojJo........',
    '.....oJJoSSoJJJo........',
    '.....ojjjoojjJJo........',
  ],
  back: [
    '.....ojjoLjjowRo........',
    '.....ojoLjjojLro........',
    '....oLjjojjjjJJo........',
    '...oLjjojjjjjJJo........',
    '...ossojjjjjjJJo........',
    '...oSSojjjjjjJJo........',
    '....oooJJJJJJJJo........',
    '.....ojjjjjjjJJo........',
  ],
  forward: [
    '.....ojjoLjjowRo........',
    '.....ojjjoLjjoro........',
    '.....ojjjjoLjjoo........',
    '.....ojjjjjoLjjo........',
    '.....ojjjjjjJossSo......',
    '.....ojjjjjjJoSSo.......',
    '.....oJJJJJJJJoo........',
    '.....ojjjjjjjJJo........',
  ],
}

const sideUpper = (pose: keyof typeof arm): Frame => [...sideHead, ...arm[pose]]
const sideHip = '......ojjjjjJJo.........'

const standLegs = [
  ...Array(6).fill('.......ojjJJo...........'),
  '.......oLJJJJo..........',
  '.......ooooooo..........',
]

/** Contact pose: near leg forward, far (darker) leg back, heel of the back foot up. */
const strideLegs = [
  '......oJJjjjjo..........',
  '.....oJJo.ojjjo.........',
  '....oJJo...ojjjo........',
  '....oJJo....ojjjo.......',
  '...oJJo......ojjjo......',
  '...oJJo......ojjjo......',
  '..oLJJo.......oLjjjo....',
  '..ooooo.......oooooo....',
]

/** The other step: the far leg is now the forward one. */
const otherLeg = (rows: Frame) => rows.map((line) => line.replace(/[jJ]/g, (c) => (c === 'j' ? 'J' : 'j')))

/** Body one pixel lower on contact, so each step carries weight. */
const sideContact = (pose: keyof typeof arm, legs: Frame) => [EMPTY, ...sideUpper(pose), ...legs]
const sidePass = (pose: keyof typeof arm) => [...sideUpper(pose), sideHip, ...standLegs]

const walkRight = [
  sideContact('back', strideLegs),
  sidePass('down'),
  sideContact('forward', otherLeg(strideLegs)),
  sidePass('down'),
]

/** Hop between ledges: crouch, push off, tuck in the air, land. The runtime moves the sprite along the arc. */
const crouchLegs = [
  '.......ojjjjJo..........',
  '.......ojjjjjJo.........',
  '........ojjjJJo.........',
  '........ojjJJo..........',
  '.......ojjjJJo..........',
  '.......oLJJJJJo.........',
  '.......oooooooo.........',
]
const crouch = [EMPTY, EMPTY, ...sideUpper('back'), ...crouchLegs]
const pushOff = [
  ...sideUpper('forward'),
  sideHip,
  ...standLegs.slice(0, 6),
  '........oLJJo...........',
  '.........ooo............',
]
const tuck = [
  ...sideUpper('back'),
  '......ojjjjjjjo.........',
  '......ojjjjjjjJo........',
  '......ojjjjjjjJo........',
  '..........ojjJJo........',
  '.........oLJJJJo........',
  '.........ooooooo........',
  EMPTY,
  EMPTY,
  EMPTY,
]
const land = [EMPTY, EMPTY, ...sideUpper('down'), ...crouchLegs]

/* ---------- Teleport ---------- */

/** Pixels dissolve on an ordered checkerboard rather than random noise. */
const dissolve = (frame: Frame, fromRow: number) =>
  frame.map((line, y) => (y < fromRow ? line : [...line].map((c, x) => ((x + y) % 2 ? '.' : c)).join('')))

const column = (top = 0) =>
  Array.from({ length: SPRITE_H }, (_, y) =>
    y < top ? EMPTY : y % 2 ? '..........bccb..........' : '...........cc...........',
  )

const materialise = (fromRow: number) => [...front.slice(0, fromRow), ...silhouette(front).slice(fromRow)]

const teleportOut = [
  sparks(front, [[4, 30, 'y'], [19, 29, 'y'], [2, 24, 'c'], [21, 22, 'c']]),
  [...front.slice(0, 18), ...dissolve(silhouette(front), 0).slice(18)],
  dissolve(silhouette(front), 0),
  sparks(column(), [[11, 0, 'r'], [12, 0, 'y']]),
  sparks(Array(SPRITE_H).fill(EMPTY), [
    [11, 1, 'y'], [9, 4, 'c'], [14, 6, 'b'], [12, 9, 'c'], [10, 12, 'y'], [13, 15, 'c'], [11, 19, 'b'],
  ]),
]

const teleportIn = [
  sparks(column(22).map((l, y) => (y < 22 ? EMPTY : l)), [[11, 21, 'y'], [12, 21, 'r']]),
  sparks(column(), [[8, 31, 'y'], [15, 31, 'y']]),
  silhouette(front),
  materialise(16),
  sparks(front, [[20, 2, 'y'], [21, 1, 'y'], [22, 2, 'y'], [21, 3, 'y']]),
]

/* ---------- Clips ---------- */

type Clip = { frames: Frame[]; ms: number[]; loop: boolean }
const clip = (frames: Frame[], ms: number | number[], loop: boolean): Clip => ({
  frames,
  ms: Array.isArray(ms) ? ms : frames.map(() => ms),
  loop,
})

export const animations = {
  /** Standing still: slow breathing; a blink is swapped in every few seconds. */
  idle: clip([front, exhale], [900, 700], true),
  blink: clip([blink], 120, false),
  walkDown: clip([lower(front), liftLeft(front), lower(front), liftRight(front)], 140, true),
  walkUp: clip([lower(back), liftLeft(back), lower(back), liftRight(back)], 140, true),
  walkRight: clip(walkRight, 140, true),
  walkLeft: clip(walkRight.map(mirror), 140, true),
  hop: clip([crouch, pushOff, tuck, land], [90, 70, 180, 110], false),
  teleportOut: clip(teleportOut, [120, 80, 80, 70, 90], false),
  teleportIn: clip(teleportIn, [70, 70, 80, 80, 200], false),
  /** When scrolling stops for a while: straighten the tie, a pleased squint, back to idle. */
  settle: clip([tieHand, tieTug, tieHand], [180, 420, 140], false),
  /** Final pose in the sidebar brand slot, shown at 1×. */
  sidebar: clip([thumbsUp], 0, false),
} satisfies Record<string, Clip>

export type ClipName = keyof typeof animations
