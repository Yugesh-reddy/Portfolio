import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { lerp, stepTrail } from "./cursor-trail.ts"

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
