import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import vm from "node:vm"

const source = await readFile(
  new URL("../scripts/sync-activity.scripting.js", import.meta.url),
  "utf8"
)
async function run({
  summary = true,
  goal = 600,
  response = { ok: true, status: 200 },
  endpoint = "https://portfolio.example/api/activity",
  timezone = "America/Chicago",
} = {}) {
  const uploads = []
  const now = new Date("2026-09-09T20:00:00Z")
  class FixedDate extends Date {
    constructor(value = now) {
      super(value)
    }
  }
  const fakeSummary = {
    dateComponents: { date: new FixedDate() },
    activeEnergyBurned: () => 900,
    activeEnergyBurnedGoal: () => goal,
    appleExerciseTime: () => 30,
    appleExerciseTimeGoal: () => 60,
    appleStandHours: () => 8,
    appleStandHoursGoal: () => 12,
  }
  const context = vm.createContext({
    Date: FixedDate,
    URL,
    console: { log() {} },
    Intl: {
      DateTimeFormat: class {
        constructor(locale, options) {
          this.options = options
        }
        format() {
          return "2026-09-09"
        }
        resolvedOptions() {
          return { timeZone: timezone }
        }
      },
    },
    Keychain: {
      get: (key) => (key.endsWith("endpoint") ? endpoint : "t".repeat(32)),
    },
    Health: {
      queryActivitySummaries: async () => (summary ? [fakeSummary] : []),
    },
    HealthUnit: {
      kilocalorie: () => null,
      minute: () => null,
      count: () => null,
    },
    DateComponents: { fromDate: (date) => date },
    fetch: async (url, options) => {
      uploads.push({ url, options })
      return response
    },
  })
  return {
    uploads,
    promise: vm.runInContext(`(async()=>{${source}\n})()`, context),
  }
}

test("sender uploads only ring totals/goals and rejects redirects", async () => {
  const { uploads, promise } = await run()
  await promise
  assert.equal(uploads.length, 1)
  const { url, options } = uploads[0]
  assert.equal(url, "https://portfolio.example/api/activity")
  assert.deepEqual(JSON.parse(options.body), {
    date: "2026-09-09",
    updatedAt: "2026-09-09T20:00:00.000Z",
    move: { value: 900, goal: 600 },
    exercise: { value: 30, goal: 60 },
    stand: { value: 8, goal: 12 },
  })
  assert.equal(await options.handleRedirect(), null)
  assert.equal(options.timeout, 15)
})

test("missing summaries and missing goals do not upload made-up progress", async () => {
  for (const options of [
    { summary: false },
    { goal: 0 },
    { goal: NaN },
    { timezone: "Europe/London" },
  ]) {
    const { uploads, promise } = await run(options)
    await assert.rejects(promise)
    assert.equal(uploads.length, 0)
  }
})

test("failed uploads report a status without echoing credentials", async () => {
  const { promise } = await run({ response: { ok: false, status: 401 } })
  await assert.rejects(promise, {
    message: "Activity upload failed (401). Check the setup guide.",
  })
})
