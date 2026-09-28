import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isTrailSettled, lerp, stepTrail, trailBounds } from "./cursor-trail.ts"

describe("lerp", () => {
  it("interpolates between endpoints", () => {
    assert.equal(lerp(0, 10, 0), 0)
    assert.equal(lerp(0, 10, 1), 10)
    assert.equal(lerp(0, 10, 0.5), 5)
  })
})

describe("stepTrail", () => {
  it("moves the head toward the target and pulls the tail", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    const next = stepTrail(points, { x: 100, y: 0 }, 0.5)
    assert.equal(next[0].x, 50)
    assert.equal(next[0].y, 0)
    assert.ok(next[1].x > 0)
    assert.ok(next[1].x < next[0].x)
  })

  it("does not mutate the input array", () => {
    const points = [{ x: 0, y: 0 }]
    const next = stepTrail(points, { x: 10, y: 0 }, 1)
    assert.equal(points[0].x, 0)
    assert.equal(next[0].x, 10)
  })
})

describe("isTrailSettled", () => {
  it("settles once the trail catches the pointer", () => {
    let points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    const target = { x: 300, y: 120 }
    assert.equal(isTrailSettled(points, target), false)
    let frames = 0
    while (!isTrailSettled(points, target) && frames < 200) {
      points = stepTrail(points, target, 0.55)
      frames++
    }
    assert.ok(frames < 30, `took ${frames} frames`)
  })
})

describe("trailBounds", () => {
  it("pads the box around every point", () => {
    const box = trailBounds(
      [
        { x: 10, y: 40 },
        { x: 30, y: 20 },
      ],
      5
    )
    assert.deepEqual(box, { x: 5, y: 15, width: 30, height: 30 })
  })
})
