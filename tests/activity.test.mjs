import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/activity/lib/activity.ts",
  import.meta.url
)
const now = new Date("2026-09-09T20:00:00Z")
const token = "a".repeat(48)
const input = {
  date: "2026-09-09",
  updatedAt: now.toISOString(),
  move: { value: 900, goal: 600 },
  exercise: { value: 30, goal: 60 },
  stand: { value: 8, goal: 12 },
}

function request(body, auth = `Bearer ${token}`) {
  return new Request("https://portfolio.test/api/activity", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

async function handlers(overrides = {}) {
  const { createActivityHandlers } = await import(modulePath.href)
  return createActivityHandlers({
    token,
    now: () => now,
    read: async () => null,
    write: async () => true,
    ...overrides,
  })
}

test("normalizes goal completion without storing raw health metrics", async () => {
  const { parseActivity } = await import(modulePath.href)
  assert.deepEqual(parseActivity(input, now), {
    date: "2026-09-09",
    updatedAt: now.toISOString(),
    move: 150,
    exercise: 50,
    stand: 67,
  })
})

test("rejects invalid goals, values, extra health data, dates and future timestamps", async () => {
  const { parseActivity } = await import(modulePath.href)
  for (const data of [
    { ...input, move: { value: 4, goal: 0 } },
    { ...input, move: { value: -1, goal: 100 } },
    { ...input, heartRate: 90 },
    { ...input, stand: { value: 25, goal: 12 } },
    { ...input, date: "2026-02-30" },
    { ...input, updatedAt: "2026-09-09T22:00:00Z" },
    { ...input, date: "2026-09-08" },
  ])
    assert.throws(() => parseActivity(data, now))
})

test("freshness uses Chicago calendar days, not UTC midnight", async () => {
  const { activityState, parseActivity } = await import(modulePath.href)
  const snapshot = parseActivity(input, now)
  assert.equal(activityState(snapshot, now).status, "current")
  assert.equal(
    activityState(snapshot, new Date("2026-09-10T00:00:00Z")).status,
    "stale"
  )
  const late = { ...snapshot, updatedAt: "2026-09-10T04:50:00Z" }
  assert.equal(
    activityState(late, new Date("2026-09-10T04:55:00Z")).status,
    "current"
  )
  assert.equal(
    activityState(late, new Date("2026-09-10T05:01:00Z")).status,
    "stale"
  )
  assert.deepEqual(activityState(snapshot, new Date("2026-09-18T20:00:00Z")), {
    status: "empty",
  })
})

test("unauthorized writes never access body or storage", async () => {
  let written = false
  const api = await handlers({
    write: async () => {
      written = true
      return true
    },
  })
  assert.equal((await api.POST(request(input, "Bearer wrong"))).status, 401)
  assert.equal(written, false)
})

test("persists normalized snapshots and exposes no credentials", async () => {
  let saved
  const api = await handlers({
    write: async (value) => {
      saved = value
      return true
    },
    read: async () => saved,
  })
  assert.equal((await api.POST(request(input))).status, 200)
  const payload = await (await api.GET()).json()
  assert.equal(payload.status, "current")
  assert.equal(payload.snapshot.move, 150)
  assert.equal(JSON.stringify(payload).includes("goal"), false)
  assert.equal(JSON.stringify(payload).includes(token), false)
})

test("handles malformed, oversized and out-of-order requests", async () => {
  const api = await handlers()
  assert.equal((await api.POST(request("{"))).status, 400)
  assert.equal((await api.POST(request(" ".repeat(5000)))).status, 413)
  const old = await handlers({ write: async () => false })
  assert.equal((await old.POST(request(input))).status, 409)
})

test("missing configuration and upstream failures are explicit and safe", async () => {
  const { createActivityHandlers } = await import(modulePath.href)
  const missing = createActivityHandlers({})
  assert.deepEqual(await (await missing.GET()).json(), {
    status: "unconfigured",
  })
  assert.equal((await missing.POST(request(input))).status, 503)
  const failed = await handlers({
    read: async () => {
      throw Error("secret")
    },
    write: async () => {
      throw Error("secret")
    },
  })
  const response = await failed.GET()
  assert.deepEqual(await response.json(), { status: "unavailable" })
  assert.match(response.headers.get("Cache-Control"), /no-store/)
  assert.equal((await failed.POST(request(input))).status, 503)
})
