import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  FIRST_GREETING_HOLD_MS,
  GREETING_FADE_MS,
  GREETING_HOLD_MS,
  GREETINGS,
} from "../components/intro/intro-shared.ts"
import {
  getIntroTimeline,
  getMorphTransform,
  HOME_INTRO_SCRIPT,
  HOME_INTRO_SESSION_KEY,
  splitDisplayName,
} from "./home-intro-session.ts"

/** Runs the inline script against a fake page and reports what it decided. */
function runIntroScript({
  pathname = "/",
  hash = "",
  stored = null as string | null,
  reducedMotion = false,
} = {}) {
  const dataset: Record<string, string> = {}
  const store = new Map<string, string>()
  if (stored !== null) store.set(HOME_INTRO_SESSION_KEY, stored)
  const timers: { fn: () => void; ms: number }[] = []

  new Function(
    "document",
    "location",
    "sessionStorage",
    "matchMedia",
    "setTimeout",
    HOME_INTRO_SCRIPT
  )(
    { documentElement: { dataset } },
    { pathname, hash },
    {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
    () => ({ matches: reducedMotion }),
    (fn: () => void, ms: number) => timers.push({ fn, ms })
  )

  return { dataset, store, timers }
}

describe("HOME_INTRO_SCRIPT", () => {
  it("plays on the session's first visit to the home page", () => {
    const { dataset, store } = runIntroScript()
    assert.equal(dataset.homeIntro, "play")
    assert.equal(store.get(HOME_INTRO_SESSION_KEY), "true")
  })

  it("skips once the session has seen a page", () => {
    assert.equal(
      runIntroScript({ stored: "true" }).dataset.homeIntro,
      undefined
    )
  })

  it("marks the session when it lands somewhere else first", () => {
    const { dataset, store } = runIntroScript({ pathname: "/blog" })
    assert.equal(dataset.homeIntro, undefined)
    assert.equal(store.get(HOME_INTRO_SESSION_KEY), "true")
  })

  it("skips visitors who prefer reduced motion", () => {
    assert.equal(
      runIntroScript({ reducedMotion: true }).dataset.homeIntro,
      undefined
    )
  })
})

describe("getIntroTimeline", () => {
  it("fades each greeting in as the previous one fades out", () => {
    const { greetings, identityMs } = getIntroTimeline(3, 200, 80, 60)
    assert.deepEqual(greetings, [
      { inMs: 0, outMs: 260 },
      { inMs: 260, outMs: 400 },
      { inMs: 400, outMs: 540 },
    ])
    assert.equal(identityMs, 540)
  })

  it("shows every greeting for the live timings", () => {
    const { greetings, identityMs } = getIntroTimeline(
      GREETINGS.length,
      FIRST_GREETING_HOLD_MS,
      GREETING_HOLD_MS,
      GREETING_FADE_MS
    )
    assert.equal(greetings.length, GREETINGS.length)
    for (const { inMs, outMs } of greetings) {
      assert.ok(outMs - inMs >= GREETING_FADE_MS + GREETING_HOLD_MS)
    }
    assert.equal(identityMs, greetings.at(-1)?.outMs)
  })
})

describe("splitDisplayName", () => {
  it("splits Yugesh Reddy Sappidi after the first name", () => {
    assert.deepEqual(splitDisplayName("Yugesh Reddy Sappidi", "Yugesh"), {
      first: "Yugesh",
      remainder: "Reddy Sappidi",
    })
  })

  it("returns the whole string when first name is not a prefix", () => {
    assert.deepEqual(splitDisplayName("Ada Lovelace", "Yugesh"), {
      first: "Ada Lovelace",
      remainder: "",
    })
  })
})

describe("getMorphTransform", () => {
  it("moves and scales the avatar between centers", () => {
    assert.deepEqual(
      getMorphTransform(
        { x: 100, y: 100, width: 38, height: 38 },
        { x: 20, y: 60, width: 152, height: 152 },
        true
      ),
      { translateX: -23, translateY: 17, scale: 4 }
    )
  })

  it("keeps the scale at 1 when asked not to scale", () => {
    assert.equal(
      getMorphTransform(
        { x: 0, y: 0, width: 50, height: 20 },
        { x: 10, y: 10, width: 80, height: 30 },
        false
      ).scale,
      1
    )
  })
})
