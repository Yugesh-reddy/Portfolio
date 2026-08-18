import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  YS_MARK_PRESS,
  YS_MARK_VIEW_HEIGHT,
  YS_MARK_VIEW_WIDTH,
  ysMarkPaths,
} from "../data/ys-mark-paths.ts"
import * as isometricDetail from "./isometric-detail-scale.ts"

const CD_VIEW_WIDTH = 556
const YS_VIEW_WIDTH = 942.24
const SCREEN_WIDTH = 569
const here = dirname(fileURLToPath(import.meta.url))

test("preserves visible SVG detail density across different viewBox widths", () => {
  const referencePixels = (10 / CD_VIEW_WIDTH) * SCREEN_WIDTH
  const targetUnits = isometricDetail.scaleIsometricDetail(10, YS_VIEW_WIDTH)
  const targetPixels = (targetUnits / YS_VIEW_WIDTH) * SCREEN_WIDTH

  assert.ok(Math.abs(targetPixels - referencePixels) < 0.001)
})

test("hatch tile is CD's 10-unit pattern scaled into the YS viewBox", () => {
  const metrics = isometricDetail.getIsometricParityMetrics(YS_VIEW_WIDTH)
  const expected = isometricDetail.scaleIsometricDetail(10, YS_VIEW_WIDTH)

  assert.ok(Math.abs(metrics.patternSize - expected) < 0.001)
  assert.ok(Math.abs(metrics.patternSize - 17) < 0.1)
})

test("construction guides intersect a shared rail at real Y and S vertices", () => {
  const parseLine = (path: string) => {
    const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number)
    assert.equal(values?.length, 4)
    return values as [number, number, number, number]
  }

  const intersect = (
    [x1, y1, x2, y2]: [number, number, number, number],
    [x3, y3, x4, y4]: [number, number, number, number]
  ) => {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    assert.notEqual(denominator, 0)

    return [
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
        denominator,
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
        denominator,
    ] as const
  }

  const vertices = [
    ...ysMarkPaths.topFaces,
    ...ysMarkPaths.sideFaces.normal,
    ysMarkPaths.strokesUnder.normal,
  ].flatMap((path) => {
    const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
    return Array.from(
      { length: values.length / 2 },
      (_, index) => [values[index * 2], values[index * 2 + 1]] as const
    )
  })

  const [bottomRail, yRail, sRail] = ysMarkPaths.guideLines.map(parseLine)
  const intersections = [
    intersect(bottomRail, yRail),
    intersect(bottomRail, sRail),
  ]

  assert.notDeepEqual(intersections[0], intersections[1])
  for (const [x, y] of intersections) {
    const nearestVertexDistance = Math.min(
      ...vertices.map(([vertexX, vertexY]) =>
        Math.hypot(vertexX - x, vertexY - y)
      )
    )
    assert.ok(
      nearestVertexDistance < 0.05,
      `intersection ${x},${y} missed vertices by ${nearestVertexDistance}`
    )
  }
})

test("YS letterform geometry stays on the original 1-cell layout", () => {
  assert.equal(YS_MARK_VIEW_WIDTH, YS_VIEW_WIDTH)
  assert.equal(YS_MARK_VIEW_HEIGHT, 520)

  const shortestTopEdge = Math.min(
    ...ysMarkPaths.topFaces.flatMap((path) => {
      const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []
      const points = Array.from(
        { length: values.length / 2 },
        (_, index) => [values[index * 2], values[index * 2 + 1]] as const
      )

      return points.map(([x, y], index) => {
        const [nextX, nextY] = points[(index + 1) % points.length]
        return Math.hypot(nextX - x, nextY - y)
      })
    })
  )

  assert.ok(
    Math.abs(shortestTopEdge - 64) < 0.5,
    `expected 1-cell top-edge length ~64, received ${shortestTopEdge}`
  )
})

test("matches CD stroke, hatch, dash, spotlight, and press at the same rendered width", () => {
  const metrics = isometricDetail.getIsometricParityMetrics(YS_VIEW_WIDTH)
  const targetScale = SCREEN_WIDTH / YS_VIEW_WIDTH
  const referenceScale = SCREEN_WIDTH / CD_VIEW_WIDTH

  assert.ok(
    Math.abs(metrics.strokeWidth * targetScale - 1 * referenceScale) < 0.001
  )
  assert.ok(
    Math.abs(metrics.patternSize * targetScale - 10 * referenceScale) < 0.001
  )
  assert.ok(
    Math.abs(metrics.spotlightRadius * targetScale - 200 * referenceScale) <
      0.001
  )
  assert.ok(Math.abs(metrics.spotlightRadius - 339) < 1)
  assert.ok(
    Math.abs(metrics.pressDistance * targetScale - 16 * referenceScale) < 0.001
  )
  assert.deepEqual(
    metrics.guideDasharray.map((value) =>
      Number((value * targetScale).toFixed(6))
    ),
    [
      Number((4 * referenceScale).toFixed(6)),
      Number((2 * referenceScale).toFixed(6)),
    ]
  )

  const pressPixels = (YS_MARK_PRESS / YS_MARK_VIEW_WIDTH) * SCREEN_WIDTH
  const cdPressPixels = (16 / CD_VIEW_WIDTH) * SCREEN_WIDTH
  assert.ok(Math.abs(pressPixels - cdPressPixels) < 0.01)
})

test("SpotlightLogo copies CD color, stroke caps, and click sound", () => {
  const sources = [
    readFileSync(join(here, "../../../components/spotlight-logo.tsx"), "utf8"),
    readFileSync(join(here, "../components/ys-mark-isometric.tsx"), "utf8"),
  ]

  for (const source of sources) {
    assert.match(
      source,
      /\[--pattern:color-mix\(in_oklab,var\(--foreground\)_12%,var\(--background\)\)\]/
    )
    assert.match(
      source,
      /\[--stroke:color-mix\(in_oklab,var\(--foreground\)_16%,var\(--background\)\)\]/
    )
    assert.match(
      source,
      /dark:\[--pattern:color-mix\(in_oklab,var\(--foreground\)_22%,var\(--background\)\)\]/
    )
    assert.match(
      source,
      /dark:\[--stroke:color-mix\(in_oklab,var\(--foreground\)_28%,var\(--background\)\)\]/
    )
    assert.doesNotMatch(source, /strokeLinecap/)
    assert.doesNotMatch(source, /strokeLinejoin/)
    assert.doesNotMatch(source, /volume:\s*0\.5/)
    assert.match(source, /useSound\(metalClickSound\)/)
  }
})
