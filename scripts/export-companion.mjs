// Exports the companion sprite (src/components/Companion/sprite.ts) as a
// transparent 4-bit indexed PNG sheet plus a JSON map of clips and timings.
// One clip per row, one 24 × 32 cell per frame, no padding.
// Usage: node scripts/export-companion.mjs   (writes next to the component)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { SPRITE_H, SPRITE_W, animations, palette } from '../src/components/Companion/sprite.ts'

const outDir = process.argv[2] ?? 'src/components/Companion'
const roles = Object.keys(palette)
if (roles.length > 15) throw new Error('A 4-bit PNG holds 15 colours plus transparency')

const clips = Object.entries(animations)
const columns = Math.max(...clips.map(([, clip]) => clip.frames.length))
const width = columns * SPRITE_W
const height = clips.length * SPRITE_H

// Index 0 is transparent; role n is index n + 1.
const pixels = new Uint8Array(width * height)
clips.forEach(([, clip], row) =>
  clip.frames.forEach((frame, col) =>
    frame.forEach((line, y) =>
      [...line].forEach((ch, x) => {
        if (ch !== '.') pixels[(row * SPRITE_H + y) * width + col * SPRITE_W + x] = roles.indexOf(ch) + 1
      }),
    ),
  ),
)

const stride = Math.ceil(width / 2)
const raw = Buffer.alloc((stride + 1) * height)
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++)
    raw[y * (stride + 1) + 1 + (x >> 1)] |= pixels[y * width + x] << (x % 2 ? 0 : 4)

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (bytes) => {
  let c = 0xffffffff
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc(body), body.length + 4)
  return out
}

const header = Buffer.alloc(13)
header.writeUInt32BE(width, 0)
header.writeUInt32BE(height, 4)
header[8] = 4 // bit depth
header[9] = 3 // indexed colour
const colours = Buffer.from([0, 0, 0, ...roles.flatMap((r) => [1, 3, 5].map((i) => parseInt(palette[r].slice(i, i + 2), 16)))])

mkdirSync(outDir, { recursive: true })
writeFileSync(
  join(outDir, 'companion-sprites.png'),
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('PLTE', colours),
    chunk('tRNS', Buffer.from([0])),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]),
)
writeFileSync(
  join(outDir, 'companion-sprites.json'),
  `${JSON.stringify(
    {
      image: 'companion-sprites.png',
      width,
      height,
      frameWidth: SPRITE_W,
      frameHeight: SPRITE_H,
      clips: Object.fromEntries(clips.map(([name, clip], row) => [name, { row, ms: clip.ms, loop: clip.loop }])),
    },
    null,
    2,
  )}\n`,
)
console.log(`${width} × ${height}, ${clips.length} clips, ${clips.reduce((n, [, c]) => n + c.frames.length, 0)} frames`)
