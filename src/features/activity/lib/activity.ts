import { timingSafeEqual } from "node:crypto"
import { z } from "zod"

const DAY = 86_400_000
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Chicago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
export function chicagoDate(date: Date) {
  return dateFormatter.format(date)
}
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`)
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    )
  })
const metric = z
  .object({
    value: z.number().finite().nonnegative().max(100_000),
    goal: z.number().finite().positive().max(100_000),
  })
  .strict()
const inputSchema = z
  .object({
    date: dateSchema,
    updatedAt: z.string().datetime({ offset: true }),
    move: metric,
    exercise: metric,
    stand: z
      .object({
        value: z.number().int().min(0).max(24),
        goal: z.number().int().min(1).max(24),
      })
      .strict(),
  })
  .strict()

export const snapshotSchema = z
  .object({
    date: dateSchema,
    updatedAt: z.string().datetime(),
    move: z.number().finite().nonnegative().max(10_000),
    exercise: z.number().finite().nonnegative().max(10_000),
    stand: z.number().finite().nonnegative().max(2400),
  })
  .strict()
export type ActivitySnapshot = z.infer<typeof snapshotSchema>
export type ActivityView =
  | { status: "unconfigured" | "unavailable" | "empty" }
  | { status: "current" | "stale"; snapshot: ActivitySnapshot }

export function parseActivity(
  input: unknown,
  now = new Date()
): ActivitySnapshot {
  const data = inputSchema.parse(input)
  const updated = new Date(data.updatedAt)
  const age = now.getTime() - updated.getTime()
  if (age < -300_000 || age > 7 * DAY || chicagoDate(updated) !== data.date)
    throw Error("Invalid activity date")
  const percent = ({ value, goal }: { value: number; goal: number }) =>
    Math.round((value / goal) * 100)
  return snapshotSchema.parse({
    date: data.date,
    updatedAt: updated.toISOString(),
    move: percent(data.move),
    exercise: percent(data.exercise),
    stand: percent(data.stand),
  })
}

export function activityState(
  snapshot: ActivitySnapshot | null,
  now = new Date()
): ActivityView {
  if (!snapshot) return { status: "empty" }
  const age = now.getTime() - new Date(snapshot.updatedAt).getTime()
  if (!Number.isFinite(age) || age > 7 * DAY || age < -300_000)
    return { status: "empty" }
  return {
    status:
      age > 3 * 3_600_000 || snapshot.date !== chicagoDate(now)
        ? "stale"
        : "current",
    snapshot,
  }
}

type Options = {
  token?: string
  read?: () => Promise<ActivitySnapshot | null>
  /** Returns false when an older upload loses the atomic compare-and-set. */
  write?: (snapshot: ActivitySnapshot) => Promise<boolean>
  now?: () => Date
}

function authorized(header: string | null, token: string) {
  const actual = Buffer.from(header || "")
  const expected = Buffer.from(`Bearer ${token}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

async function readBody(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw Error("Invalid body")
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 4096) {
        await reader.cancel()
        throw Error("Too large")
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown
}

export function createActivityHandlers(options: Options) {
  const now = options.now || (() => new Date())
  const configured =
    !!options.read && !!options.write && (options.token?.length || 0) >= 32
  const json = (data: unknown, status = 200, cache = "no-store") =>
    Response.json(data, { status, headers: { "Cache-Control": cache } })
  return {
    async GET() {
      if (!configured) return json({ status: "unconfigured" })
      try {
        const saved = await options.read!()
        const snapshot = saved ? snapshotSchema.parse(saved) : null
        return json(
          activityState(snapshot, now()),
          200,
          "public, max-age=0, s-maxage=30"
        )
      } catch {
        return json({ status: "unavailable" }, 503)
      }
    },
    async POST(request: Request) {
      if (!configured)
        return json({ error: "Activity sync is not configured." }, 503)
      if (!authorized(request.headers.get("Authorization"), options.token!))
        return json({ error: "Unauthorized." }, 401)
      if (!request.headers.get("Content-Type")?.startsWith("application/json"))
        return json({ error: "Expected JSON." }, 415)
      let snapshot: ActivitySnapshot
      try {
        snapshot = parseActivity(await readBody(request), now())
      } catch (error) {
        return json(
          { error: "Invalid activity summary." },
          error instanceof Error && error.message === "Too large" ? 413 : 400
        )
      }
      try {
        if (!(await options.write!(snapshot)))
          return json({ error: "A newer summary is already stored." }, 409)
        return json({ ok: true })
      } catch {
        return json({ error: "Activity sync is unavailable." }, 503)
      }
    },
  }
}
