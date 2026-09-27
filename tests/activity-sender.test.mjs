import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import vm from "node:vm"

const source = await readFile(
  new URL("../scripts/sync-activity.scripting.js", import.meta.url),
  "utf8"
)
function run({
  summary = true,
  day = 9,
  goal = 600,
  response = { ok: true, status: 200 },
  endpoint = "https://portfolio.example/api/activity",
  timezone = "America/Chicago",
  last,
} = {}) {
  const keychain = new Map([
    ["portfolio.activity.endpoint", endpoint],
    ["portfolio.activity.token", "t".repeat(32)],
  ])
  if (last) keychain.set("portfolio.activity.last", JSON.stringify(last))
  const uploads = []
  const errors = []
  const removed = []
  let exit
  const exited = new Promise((resolve) => {
    exit = resolve
  })
  const now = new Date("2026-09-09T20:00:00Z")
  class FixedDate extends Date {
    constructor(value = now) {
      super(value)
    }
  }
  const fakeSummary = {
    dateComponents: { year: 2026, month: 9, day },
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
    console: { log() {}, error: (message) => errors.push(message) },
    Script: { exit: () => exit() },
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
      get: (key) => keychain.get(key) ?? null,
      set: (key, value) => Boolean(keychain.set(key, value)),
      remove: (key) => removed.push(key) && keychain.delete(key),
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
  // Scripting resolves the "scripting" import itself and rejects top-level await,
  // so run the rest as a classic script, where top-level await is a SyntaxError.
  const body = source.replace('import { Script } from "scripting"\n', "")
  assert.notEqual(body, source)
  vm.runInContext(body, context)
  return { uploads, errors, removed, exited, keychain }
}

test("sender uploads only ring totals/goals and rejects redirects", async () => {
  const { uploads, errors, exited } = run()
  await exited
  assert.deepEqual(errors, [])
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
    const { uploads, errors, exited } = run(options)
    await exited
    assert.equal(errors.length, 1)
    assert.equal(uploads.length, 0)
  }
})

test("a missing day reports which days Health returned", async () => {
  for (const [options, found] of [
    [{ summary: false }, "0 recent days (none)"],
    [{ day: 8 }, "1 recent days (2026-09-08)"],
  ]) {
    const { uploads, errors, exited } = run(options)
    await exited
    assert.deepEqual(errors, [
      `Error: No activity summary for 2026-09-09; Health returned ${found}. Check Health access and Watch sync, then retry.`,
    ])
    assert.equal(uploads.length, 0)
  }
})

test("failed uploads report a status without echoing credentials", async () => {
  const { errors, removed, exited } = run({
    response: { ok: false, status: 401 },
  })
  await exited
  assert.deepEqual(errors, [
    "Error: Activity upload failed (401). Check the setup guide.",
  ])
  assert.deepEqual(removed, ["portfolio.activity.token"])
})

test("only a rejected token is forgotten", async () => {
  const { errors, removed, exited } = run({
    response: { ok: false, status: 503 },
  })
  await exited
  assert.deepEqual(errors, [
    "Error: Activity upload failed (503). Check the setup guide.",
  ])
  assert.deepEqual(removed, [])
})

const synced = Date.parse("2026-09-09T20:00:00Z")

test("a successful upload records the rings it sent", async () => {
  const { keychain, exited } = run()
  await exited
  assert.deepEqual(JSON.parse(keychain.get("portfolio.activity.last")), {
    date: "2026-09-09",
    rings: "150/50/67",
    at: synced,
  })
})

test("unchanged rings skip the upload for a quarter hour", async () => {
  const last = { date: "2026-09-09", rings: "150/50/67" }
  for (const [ago, expected] of [
    [5 * 60000, 0],
    [16 * 60000, 1],
  ]) {
    const { uploads, errors, exited } = run({
      last: { ...last, at: synced - ago },
    })
    await exited
    assert.deepEqual(errors, [])
    assert.equal(uploads.length, expected)
  }
})

test("changed rings or a new day upload right away", async () => {
  for (const last of [
    { date: "2026-09-09", rings: "149/50/67", at: synced },
    { date: "2026-09-08", rings: "150/50/67", at: synced },
  ]) {
    const { uploads, exited } = run({ last })
    await exited
    assert.equal(uploads.length, 1)
  }
})

test("a failed upload is retried on the next run", async () => {
  const { keychain, exited } = run({ response: { ok: false, status: 503 } })
  await exited
  assert.equal(keychain.has("portfolio.activity.last"), false)
})
