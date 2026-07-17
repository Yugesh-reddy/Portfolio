#!/usr/bin/env node
/**
 * Converts the pixel YS mark into isometric SVG path data.
 *
 * Mirrors ncdai/chanhdai.com's CD mark detailing:
 * - External silhouette strokes only (no shared internal edges)
 * - Viewer-facing side fills, tops with hatch, strokes on top
 * - Iso-axis construction guides (dashed), same spacing family as CD
 *
 * Projection constants from chanhdai.com: 64px cells, 32px extrude, 16px press.
 */

import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const REF_CELL = 64
const EXTRUDE = 40
const PRESS = 20
const CELL = 64

// Keep in sync with src/features/portfolio/data/ys-pixel-mark.ts
const YS_RECTS = [
  [0, 0, 64, 128],
  [256, 0, 64, 128],
  [64, 128, 64, 64],
  [192, 128, 64, 64],
  [128, 192, 64, 256],
  [448, 0, 192, 64],
  [384, 64, 64, 128],
  [640, 64, 64, 64],
  [448, 192, 192, 64],
  [640, 256, 64, 128],
  [384, 320, 64, 64],
  [448, 384, 192, 64],
]

// First 5 rects draw the Y, the rest draw the S.
const Y_BLOCK_COUNT = 5

const isoX = CELL * Math.cos(Math.PI / 6)
const isoY = CELL * Math.sin(Math.PI / 6)
const extrude = (CELL / REF_CELL) * EXTRUDE
const press = (CELL / REF_CELL) * PRESS

const blocks = YS_RECTS.map(([x, y, w, h]) => ({
  c0: Math.round(x / CELL),
  r0: Math.round(y / CELL),
  c1: Math.round((x + w) / CELL),
  r1: Math.round((y + h) / CELL),
}))

// Rotate 90° CCW on the iso floor so Y/S sit side-by-side like CD.
const heroBlocks = blocks.map((block) => ({
  c0: block.r0,
  c1: block.r1,
  r0: -block.c1,
  r1: -block.c0,
}))

const maxRow = Math.max(...heroBlocks.map((b) => b.r1 - 1))

const occupied = new Set()
for (const b of heroBlocks) {
  for (let c = b.c0; c < b.c1; c++) {
    for (let r = b.r0; r < b.r1; r++) occupied.add(`${c},${r}`)
  }
}

function cellOccupied(c, r) {
  return occupied.has(`${c},${r}`)
}

/**
 * Unit-edge external flags along each side of a block.
 * Returns arrays of unit indices that are external (not shared with a neighbor).
 */
function externalUnitEdges(block) {
  const { c0, c1, r0, r1 } = block
  const north = []
  const south = []
  const east = []
  const west = []

  for (let c = c0; c < c1; c++) {
    if (!cellOccupied(c, r0 - 1)) north.push(c)
    if (!cellOccupied(c, r1)) south.push(c)
  }
  for (let r = r0; r < r1; r++) {
    if (!cellOccupied(c1, r)) east.push(r)
    if (!cellOccupied(c0 - 1, r)) west.push(r)
  }

  return { north, east, south, west }
}

function fmt(value) {
  return Number(value.toFixed(2)).toString()
}

function makeVertex(originX, originY) {
  return (c, r, dy = 0) => {
    const flipped = maxRow - r
    return [
      originX + (c + flipped + 1) * isoX,
      originY + (c - flipped - 1) * isoY + dy,
    ]
  }
}

const shift = ([x, y], dy) => [x, y + dy]

function polyline(points, close = false) {
  const [first, ...rest] = points
  const segments = [`M${fmt(first[0])} ${fmt(first[1])}`]
  for (const [x, y] of rest) segments.push(`L${fmt(x)} ${fmt(y)}`)
  if (close) segments.push("Z")
  return segments.join("")
}

function corners(vertex, block, dy = 0) {
  return {
    a: vertex(block.c0, block.r0, dy),
    b: vertex(block.c1, block.r0, dy),
    c: vertex(block.c1, block.r1, dy),
    d: vertex(block.c0, block.r1, dy),
  }
}

/** Collapse consecutive unit indices into inclusive [start, end) ranges. */
function runs(indices) {
  if (indices.length === 0) return []
  const sorted = [...indices].sort((a, b) => a - b)
  const out = []
  let start = sorted[0]
  let prev = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i]
      continue
    }
    out.push([start, prev + 1])
    start = sorted[i]
    prev = sorted[i]
  }
  out.push([start, prev + 1])
  return out
}

function buildMark(vertex) {
  const topFaces = []
  const sideFaces = { normal: [], pressed: [] }
  const strokesTop = { normal: [], pressed: [] }
  const strokesUnder = { normal: [], pressed: [] }
  const drawnVerticals = new Set()

  const order = heroBlocks
    .map((block, index) => ({ block, index }))
    .sort(
      (a, b) =>
        a.block.r0 + a.block.c0 - (b.block.r0 + b.block.c0) ||
        a.block.r0 - b.block.r0 ||
        a.block.c0 - b.block.c0
    )

  for (const { block } of order) {
    const top = corners(vertex, block)
    const edges = externalUnitEdges(block)

    topFaces.push(polyline([top.a, top.b, top.c, top.d], true))

    // East side (down-right face) — unit runs so shared edges stay open
    for (const [r0, r1] of runs(edges.east)) {
      const b = vertex(block.c1, r0)
      const c = vertex(block.c1, r1)
      sideFaces.normal.push(
        polyline([b, c, shift(c, extrude), shift(b, extrude)], true)
      )
      sideFaces.pressed.push(
        polyline(
          [shift(b, press), shift(c, press), shift(c, extrude), shift(b, extrude)],
          true
        )
      )
      const floor = polyline([shift(b, extrude), shift(c, extrude)])
      strokesUnder.normal.push(floor)
      strokesUnder.pressed.push(floor)
      strokesTop.normal.push(polyline([b, c]))
      strokesTop.pressed.push(polyline([shift(b, press), shift(c, press)]))
    }

    // South side (down-left face)
    for (const [c0, c1] of runs(edges.south)) {
      const c = vertex(c1, block.r1)
      const d = vertex(c0, block.r1)
      sideFaces.normal.push(
        polyline([c, d, shift(d, extrude), shift(c, extrude)], true)
      )
      sideFaces.pressed.push(
        polyline(
          [shift(c, press), shift(d, press), shift(d, extrude), shift(c, extrude)],
          true
        )
      )
      const floor = polyline([shift(c, extrude), shift(d, extrude)])
      strokesUnder.normal.push(floor)
      strokesUnder.pressed.push(floor)
      strokesTop.normal.push(polyline([c, d]))
      strokesTop.pressed.push(polyline([shift(c, press), shift(d, press)]))
    }

    // North + west top edges (no side face in isometric view)
    for (const [c0, c1] of runs(edges.north)) {
      const a = vertex(c0, block.r0)
      const b = vertex(c1, block.r0)
      strokesTop.normal.push(polyline([a, b]))
      strokesTop.pressed.push(
        polyline([shift(a, press), shift(b, press)])
      )
    }
    for (const [r0, r1] of runs(edges.west)) {
      const d = vertex(block.c0, r1)
      const a = vertex(block.c0, r0)
      strokesTop.normal.push(polyline([d, a]))
      strokesTop.pressed.push(
        polyline([shift(d, press), shift(a, press)])
      )
    }

    // Silhouette verticals at the three viewer-facing corners of every prism.
    // Always emit (deduped) — skipping diagonal-touch vertices left open corners
    // at Y/S junctions. CD draws a vertical at every visible brick corner.
    for (const [key, c, r] of [
      ["b", block.c1, block.r0],
      ["c", block.c1, block.r1],
      ["d", block.c0, block.r1],
    ]) {
      const id = `${c},${r}`
      if (drawnVerticals.has(id)) continue
      drawnVerticals.add(id)

      const [x, y] = top[key]
      strokesUnder.normal.push(`M${fmt(x)} ${fmt(y)}V${fmt(y + extrude)}`)
      strokesUnder.pressed.push(
        `M${fmt(x)} ${fmt(y + press)}V${fmt(y + extrude)}`
      )
    }
  }

  return { topFaces, sideFaces, strokesTop, strokesUnder }
}

function computeBounds(vertex) {
  const points = heroBlocks.flatMap((block) => {
    const top = corners(vertex, block)
    return [
      top.a,
      top.b,
      top.c,
      top.d,
      shift(top.b, extrude),
      shift(top.c, extrude),
      shift(top.d, extrude),
    ]
  })

  return {
    minX: Math.min(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    maxX: Math.max(...points.map(([x]) => x)),
    maxY: Math.max(...points.map(([, y]) => y)),
  }
}

/**
 * Iso-axis construction guides — same idea as chanhdai's CD mark, anchored
 * directly to the letterforms: one −30° rail tangent under the whole mark
 * (floors included), plus one +30° rail grazing the top-left "start" edge of
 * each letter, running off toward the upper-left like construction lines.
 */
function buildGuideLines(vertex) {
  const m = Math.tan(Math.PI / 6)
  const half = 1000

  const tops = heroBlocks.map((block) => corners(vertex, block))
  const allPoints = tops.flatMap((top) => [
    top.a,
    top.b,
    top.c,
    top.d,
    shift(top.b, extrude),
    shift(top.c, extrude),
    shift(top.d, extrude),
  ])
  // Westmost block of a letter range: min d.x, tie-broken toward the top.
  const westBlock = (from, to) =>
    tops
      .slice(from, to)
      .reduce((best, top) =>
        top.d[0] < best.d[0] - 1e-6 ||
        (Math.abs(top.d[0] - best.d[0]) <= 1e-6 && top.d[1] < best.d[1])
          ? top
          : best
      )

  function line(slope, b) {
    const x0 = width / 2
    const y0 = slope * x0 + b
    const norm = Math.hypot(1, slope)
    const dx = half / norm
    const dy = slope * dx
    return `M${fmt(x0 - dx)} ${fmt(y0 - dy)}L${fmt(x0 + dx)} ${fmt(y0 + dy)}`
  }

  // Bottom rail: −30° tangent below everything (max y + m·x intercept)
  const bottom = Math.max(...allPoints.map(([x, y]) => y + m * x))
  // Letter-start rails: +30° along the north edge of each letter's westmost
  // block, so each line grazes the letter's top-left "start" and runs off to
  // the left. (A min-intercept tangent over the whole letter would snap to
  // whichever block pokes furthest up-right — e.g. the Y stem — instead.)
  const startEdge = (top) => top.a[1] - m * top.a[0]
  const startY = startEdge(westBlock(0, Y_BLOCK_COUNT))
  const startS = startEdge(westBlock(Y_BLOCK_COUNT, tops.length))

  return [line(-m, bottom), line(m, startY), line(m, startS)]
}

const rawBounds = computeBounds(makeVertex(0, 0))
const vertex = makeVertex(-rawBounds.minX, -rawBounds.minY)
const width = Number(fmt(rawBounds.maxX - rawBounds.minX))
const height = Number(fmt(rawBounds.maxY - rawBounds.minY))
const mark = buildMark(vertex)
const guideLines = buildGuideLines(vertex)

const output = `// Generated by scripts/generate-iso-mark.mjs — do not edit by hand
export const YS_MARK_VIEWBOX = "0 0 ${fmt(width)} ${fmt(height)}" as const
export const YS_MARK_VIEW_WIDTH = ${fmt(width)}
export const YS_MARK_VIEW_HEIGHT = ${fmt(height)}
export const YS_MARK_PRESS = ${fmt(press)}

export const ysMarkPaths = ${JSON.stringify(
  {
    topFaces: mark.topFaces,
    sideFaces: mark.sideFaces,
    strokesTop: {
      normal: mark.strokesTop.normal.join(""),
      pressed: mark.strokesTop.pressed.join(""),
    },
    strokesUnder: {
      normal: mark.strokesUnder.normal.join(""),
      pressed: mark.strokesUnder.pressed.join(""),
    },
    guideLines,
  },
  null,
  2
)} as const
`

writeFileSync(
  join(__dirname, "../src/features/portfolio/data/ys-mark-paths.ts"),
  output
)

console.log("Generated YS mark:", {
  blocks: heroBlocks.length,
  viewBox: `${fmt(width)} x ${fmt(height)}`,
  topFaces: mark.topFaces.length,
  sideFaces: mark.sideFaces.normal.length,
  guideLines: guideLines.length,
  strokeTopSegs: mark.strokesTop.normal.length,
  strokeUnderSegs: mark.strokesUnder.normal.length,
})
