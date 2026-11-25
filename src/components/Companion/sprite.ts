/**
 * Original 24 × 32 pixel companion of Clive, drawn for this site from his
 * formal portrait (`public/profile.jpg`): thick dark hair with a parted
 * fringe, ears showing, dark suit, white shirt and tie; no mouth, by Clive's
 * choice. The tie is
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
  '.....ossssssSssssSo.....',
  '.....osssssssssssSo.....',
  '......osssssssssSo......',
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

/* ---------- Actions: a few strong poses, reused with small props ---------- */

type Edit = [number, number, string]

/** His right arm (viewer's right) raised from the shoulder: the shared pose for thumbs-up, wave, and inspect. */
const raisedArm: Edit[] = [
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
]
const fist: Edit[] = [
  [19, 11, 'osSo'],
  [19, 12, 'oSSo'],
]
/** Both hands raised to the chest (polish, document, notes): the hanging hands become cuffs. */
const handsToChest: Edit[] = [
  [4, 20, 'jj'],
  [4, 21, 'JJ'],
  [18, 20, 'JJ'],
  [18, 21, 'JJ'],
]
const eyes = (dx: number): Edit[] => [
  [8, 7, ['oss', 'sos', 'sso'][dx + 1]],
  [13, 7, ['oss', 'sos', 'sso'][dx + 1]],
  [8, 8, ['oss', 'sos', 'sso'][dx + 1]],
  [13, 8, ['oss', 'sos', 'sso'][dx + 1]],
]

/** Sidebar pose, and the reply to a download or an external link: a thumbs-up beside the shoulder. */
const thumbsUp = paint(front, [[21, 9, 'o'], [20, 10, 'oso'], ...fist, ...raisedArm])

/** Hero and contact: a wave with an open hand, tilting out and back. */
const waveA = paint(front, [[19, 9, 'oooo'], [19, 10, 'osso'], [19, 11, 'osso'], [19, 12, 'oSSo'], ...raisedArm])
const waveB = paint(front, [[20, 9, 'oooo'], [20, 10, 'osso'], [19, 11, 'oosso'], [19, 12, 'oSSo'], ...raisedArm])

/** Projects: a magnifying glass held up (cyan lens), then a look at the card. */
const lens = (glint: Edit[] = []): Edit[] => [
  [20, 7, '.oo.'],
  [20, 8, 'occo'],
  [20, 9, 'occo'],
  [20, 10, '.oo.'],
  ...glint,
  ...fist,
  ...raisedArm,
]
const inspectRaise = paint(front, lens())
const inspectLook = paint(front, [...lens([[21, 8, 'y']]), ...eyes(1)])
const inspectLook2 = paint(front, [...lens([[22, 9, 'y']]), ...eyes(1)])

/** Skills: a hip pouch; he lifts out a small yellow gem (a tool, simply drawn) and it sparkles. */
const pouch: Edit[] = [
  [3, 22, 'oooo'],
  [3, 23, 'oRRo'],
  [3, 24, 'oRRo'],
  [3, 25, 'oooo'],
]
/** Raise his left arm by drawing the raised right arm on the mirror image. */
const leftRaised = (extra: Edit[]) => mirror(paint(mirror(front), [...extra, ...fist, ...raisedArm]))
const gem: Edit[] = [
  [21, 6, 'o'],
  [20, 7, 'oyo'],
  [19, 8, 'oyyyo'],
  [20, 9, 'oyo'],
  [21, 10, 'o'],
]
const pouchReach = paint(front, pouch)
const pouchShow = paint(leftRaised(gem), pouch)
const pouchShine = sparks(pouchShow, [[5, 5, 'y'], [0, 4, 'y'], [5, 11, 'y']])

/** About: sitting cross-legged on the card edge (the body drops 8 pixels; feet stay on the bottom row). */
const sitLegs = [
  '...ossojjjjjjjjJJosSo...',
  '...oSSoJJJJJJJJJJoSSo...',
  '..oojjjjjjjjjjjjjjJJoo..',
  '.ojjjjjJjjjjjjjjJjjjJJo.',
  '..ooLJJojjjjjjjjoJJLoo..',
  '....oooooooooooooooo....',
]
const sit = [...lower(front, 8, 26).slice(0, 26), ...sitLegs]
const sitBlink = paint(sit, [[9, 15, 's'], [14, 15, 's'], [9, 16, 'o'], [14, 16, 'o']])

/** Certifications: holding an emblem at the chest, polishing it, then a short approving nod. */
const emblem: Edit[] = [
  [10, 15, 'oooo'],
  [10, 16, 'oyyo'],
  [10, 17, 'oyyo'],
  [10, 18, 'oooo'],
]
const polishA = paint(front, [...handsToChest, ...emblem, [8, 16, 'os'], [8, 17, 'oS'], [14, 16, 'so'], [14, 17, 'So']])
const polishB = sparks(
  paint(front, [...handsToChest, ...emblem, [8, 16, 'os'], [8, 17, 'oS'], [14, 17, 'so'], [14, 18, 'So'], [12, 16, 'w']]),
  [[16, 13, 'y']],
)
const nod = happy(lower(polishA, 1, 13), 8)

/** Résumé: a rolled scroll, the unrolled page, then pointing to the side (toward the résumé action). */
const page: Edit[] = [
  [9, 13, 'oooooo'],
  [9, 14, 'owwwwo'],
  [9, 15, 'oJJJwo'],
  [9, 16, 'owwwwo'],
  [9, 17, 'oJJwwo'],
  [9, 18, 'owwwwo'],
  [9, 19, 'oJJJwo'],
  [9, 20, 'oooooo'],
]
const scroll = paint(front, [...handsToChest, [8, 15, 'oooooooo'], [8, 16, 'swwwwwws'], [8, 17, 'oooooooo']])
const pageHeld = paint(front, [...handsToChest, ...page, [7, 16, 'os'], [7, 17, 'oS'], [15, 16, 'so'], [15, 17, 'So']])
const pagePoint = paint(front, [
  ...handsToChest,
  ...page,
  [7, 16, 'os'],
  [7, 17, 'oS'],
  [20, 14, 'ooo'],
  [17, 15, 'oJJJJso'],
  [17, 16, 'oJJJJSo'],
  [17, 17, 'ooooooo'],
  [18, 18, '...'],
  [18, 19, '...'],
  [18, 20, '...'],
  [18, 21, '...'],
  [18, 22, '..'],
])

/** Case-study dialog: a clipboard and a pen that moves along the line. */
const clipboard = (pen: number): Edit[] => [
  ...handsToChest,
  ...page,
  [11, 12, 'LL'],
  [7, 18, 'os'],
  [7, 19, 'oS'],
  [13 + pen, 16, 'o'],
  [14 + pen, 17, 'sS'],
]
const notesA = paint(front, clipboard(0))
const notesB = paint(front, clipboard(1))

/** Day: a hand over the brow against the new light, then a squint. */
const brow: Edit[] = [
  [12, 5, 'oooooooooo'],
  [12, 6, 'osssssssSo'],
  [19, 7, 'ojJo'],
  [19, 8, 'ojJo'],
  [19, 9, 'ojJo'],
  [19, 10, 'ojJo'],
  [19, 11, 'ojJo'],
  [19, 12, 'ojJo'],
  ...raisedArm,
]
const shield = paint(front, brow)
const shieldSquint = paint(front, [...brow, [8, 7, 'sss'], [13, 7, 'sss'], [8, 8, 'ooo'], [13, 8, 'ooo']])

/** Night: a small lantern switched on at his side, its glow flickering. */
const lantern: Edit[] = [
  [3, 22, 'oo'],
  [2, 23, 'ooooo'],
  [2, 24, 'oyyyo'],
  [2, 25, 'oyyyo'],
  [2, 26, 'ooooo'],
]
const lanternA = paint(front, lantern)
const lanternB = sparks(lanternA, [[0, 24, 'y'], [1, 22, 'y'], [0, 27, 'y'], [7, 23, 'y']])

/** Sound turned on: two small notes (cobalt, so they read on Day cream). */
const note = (x: number, y: number): Edit[] => [
  [x + 1, y, 'bb'],
  [x + 1, y + 1, 'b'],
  [x, y + 2, 'bb'],
]
const musicA = paint(front, note(20, 1))
const musicB = paint(front, [...note(20, 0), ...note(0, 4)])

/** Idle: looking around. */
const lookLeft = paint(front, eyes(-1))
const lookRight = paint(front, eyes(1))

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
  '........ooooo...........',
  '......ooHhhhhoo.........',
  '.....oHHhhhhhho.........',
  '....oHhhhhHhhhho........',
  '....ohHhhhhhHhhho.......',
  '....ohhhhhhhhhhhho......',
  '....ohhhhhshhhhso.......',
  '....ohhSSssssosso.......',
  '....ohhSsssssossso......',
  '....ohhhsssssssSo.......',
  '....ohhSssssssSo........',
  '.....oSsssssSo..........',
  '......oSSSSooo..........',
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

  /* Section actions: played once he stands still on an anchor and scrolling has paused. */
  wave: clip([waveA, waveB, waveA, waveB], 220, false),
  inspect: clip([inspectRaise, inspectLook, inspectLook2, inspectRaise], [200, 500, 500, 200], false),
  pouch: clip([pouchReach, pouchShow, pouchShine, pouchShow], [250, 300, 600, 200], false),
  sit: clip([sit, sitBlink, sit], [900, 120, 900], false),
  polish: clip([polishA, polishB, polishA, polishB, nod], [200, 200, 200, 200, 500], false),
  document: clip([scroll, pageHeld, pagePoint], [250, 400, 900], false),
  notes: clip([notesA, notesB, notesA, notesB], 300, false),
  /* Reactions to the page: theme switch, sound on, a download or external link. */
  shield: clip([shield, shieldSquint, shield], [500, 600, 300], false),
  lantern: clip([lanternA, lanternB, lanternA, lanternB], 400, false),
  music: clip([musicA, musicB, musicA, musicB], 300, false),
  thumbsUp: clip([thumbsUp], 900, false),
  /* Idle variety when he has been still a while. */
  look: clip([lookLeft, front, lookRight], [600, 200, 600], false),
} satisfies Record<string, Clip>

export type ClipName = keyof typeof animations
