import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  FIRST_GREETING_HOLD_MS,
  GREETING_DURATION_MS,
  GREETING_FADE_MS,
  GREETING_HOLD_MS,
  GREETINGS,
  IDENTITY_HOLD_MS,
} from "../components/intro/intro-shared.ts"
import * as introHelpers from "./home-intro-session.ts"
import {
  getIntroScheduleMs,
  getIntroTimeline,
  HOME_INTRO_SESSION_KEY,
  readHomeIntroStorage,
  resolveHomeIntroMode,
  SLOW_INTRO_LOAD_MS,
  splitDisplayName,
  writeHomeIntroStorage,
} from "./home-intro-session.ts"

type MorphHelpers = {
  getIntroPresentationState: (
    mode: "pending" | "play" | "skip",
    phase: "greetings" | "identity" | "morphing",
    hasMorphFinished: boolean,
    isIntroComplete: boolean,
    shouldReduceMotion: boolean
  ) => {
    showBackdrop: boolean
    showGreeting: boolean
    showIdentity: boolean
    showMorphTargets: boolean
    elevateMorphTargets: boolean
    detailsVisible: boolean
    shouldLockScroll: boolean
  }
  getMorphTransform: (
    source: { x: number; y: number; width: number; height: number },
    target: { x: number; y: number; width: number; height: number },
    shouldScale: boolean
  ) => {
    translateX: number
    translateY: number
    scale: number
  }
}

describe("resolveHomeIntroMode", () => {
  it("plays on a fresh session", () => {
    assert.equal(resolveHomeIntroMode(false, null), "play")
  })

  it("skips when the in-memory flag is set", () => {
    assert.equal(resolveHomeIntroMode(true, null), "skip")
  })

  it("skips when sessionStorage already recorded the intro", () => {
    assert.equal(resolveHomeIntroMode(false, "true"), "skip")
  })

  it("skips when the page has already been sitting there too long", () => {
    assert.equal(
      resolveHomeIntroMode(false, null, SLOW_INTRO_LOAD_MS + 1),
      "skip"
    )
  })
})

describe("home intro storage", () => {
  it("reads the session key", () => {
    const store = new Map<string, string>([[HOME_INTRO_SESSION_KEY, "true"]])
    assert.equal(
      readHomeIntroStorage((key) => store.get(key) ?? null),
      "true"
    )
  })

  it("returns null when getItem throws", () => {
    assert.equal(
      readHomeIntroStorage(() => {
        throw new Error("blocked")
      }),
      null
    )
  })

  it("writes true and swallows setItem errors", () => {
    const store = new Map<string, string>()
    writeHomeIntroStorage((key, value) => {
      store.set(key, value)
    })
    assert.equal(store.get(HOME_INTRO_SESSION_KEY), "true")
    writeHomeIntroStorage(() => {
      throw new Error("blocked")
    })
  })
})

describe("getIntroScheduleMs", () => {
  it("spaces greetings, identity, and the profile morph", () => {
    const schedule = getIntroScheduleMs(5, 120, 420)
    assert.deepEqual(schedule.greetingSwitchAtMs, [120, 240, 360, 480])
    assert.equal(schedule.identityAtMs, 600)
    assert.equal(schedule.profileAtMs, 1020)
  })

  it("uses the live greeting cadence", () => {
    const schedule = getIntroScheduleMs(
      GREETINGS.length,
      GREETING_DURATION_MS,
      IDENTITY_HOLD_MS
    )
    assert.equal(schedule.identityAtMs, GREETINGS.length * GREETING_DURATION_MS)
    assert.equal(
      schedule.profileAtMs,
      GREETINGS.length * GREETING_DURATION_MS + IDENTITY_HOLD_MS
    )
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
  it("moves and scales the avatar between element centers", () => {
    assert.equal(typeof introHelpers.getMorphTransform, "function")
    const { getMorphTransform } = introHelpers as unknown as MorphHelpers

    assert.deepEqual(
      getMorphTransform(
        { x: 500, y: 300, width: 40, height: 40 },
        { x: 80, y: 120, width: 160, height: 160 },
        true
      ),
      { translateX: -360, translateY: -120, scale: 4 }
    )
  })

  it("translates matching text without scaling the glyphs", () => {
    assert.equal(typeof introHelpers.getMorphTransform, "function")
    const { getMorphTransform } = introHelpers as unknown as MorphHelpers

    assert.deepEqual(
      getMorphTransform(
        { x: 580, y: 305, width: 110, height: 32 },
        { x: 250, y: 420, width: 110, height: 32 },
        false
      ),
      { translateX: -330, translateY: 115, scale: 1 }
    )
  })
})

describe("getIntroPresentationState", () => {
  it("keeps the header chrome behind the curtain during the morph", () => {
    assert.equal(typeof introHelpers.getIntroPresentationState, "function")
    const { getIntroPresentationState } =
      introHelpers as unknown as MorphHelpers

    assert.deepEqual(
      getIntroPresentationState("play", "morphing", false, false, false),
      {
        showBackdrop: true,
        showGreeting: false,
        showIdentity: true,
        showMorphTargets: false,
        elevateMorphTargets: false,
        detailsVisible: true,
        shouldLockScroll: true,
      }
    )
  })

  it("swaps to only the elevated destination targets after the flight", () => {
    assert.equal(typeof introHelpers.getIntroPresentationState, "function")
    const { getIntroPresentationState } =
      introHelpers as unknown as MorphHelpers

    assert.deepEqual(
      getIntroPresentationState("play", "morphing", true, false, false),
      {
        showBackdrop: true,
        showGreeting: false,
        showIdentity: false,
        showMorphTargets: true,
        elevateMorphTargets: true,
        detailsVisible: true,
        shouldLockScroll: true,
      }
    )
  })

  it("renders the settled profile immediately when motion is reduced", () => {
    assert.equal(typeof introHelpers.getIntroPresentationState, "function")
    const { getIntroPresentationState } =
      introHelpers as unknown as MorphHelpers

    assert.deepEqual(
      getIntroPresentationState("play", "greetings", false, false, true),
      {
        showBackdrop: false,
        showGreeting: false,
        showIdentity: false,
        showMorphTargets: true,
        elevateMorphTargets: false,
        detailsVisible: true,
        shouldLockScroll: false,
      }
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
