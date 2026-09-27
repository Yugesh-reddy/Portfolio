// Run inside Scripting on iPhone, not Node. See docs/activity-setup.md.
// These globals are supplied by Scripting's documented native APIs.
/* global Keychain, Dialog, Health, HealthUnit, DateComponents */
import { Script } from "scripting"

// The script's own Keychain, on this device only.
const options = {
  accessibility: "first_unlock_this_device",
  synchronizable: false,
}

async function syncActivity() {
  let endpoint = Keychain.get("portfolio.activity.endpoint")
  let token = Keychain.get("portfolio.activity.token")
  if (!endpoint || !token) {
    endpoint = await Dialog.prompt({
      title: "Portfolio activity endpoint",
      message: "Your website's full HTTPS /api/activity URL.",
      placeholder: "https://your-site.com/api/activity",
    })
    if (!endpoint) return
    const url = new URL(endpoint.trim())
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/api/activity"
    ) {
      throw Error(
        "Use the exact HTTPS /api/activity URL, without query parameters."
      )
    }
    endpoint = url.href
    token = await Dialog.prompt({
      title: "Activity sync token",
      message:
        "Paste ACTIVITY_SYNC_TOKEN from your website settings. It stays in this script's Keychain.",
      obscureText: true,
    })
    if (!token) return
    token = token.trim()
    if (token.length < 32)
      throw Error("The token must have at least 32 characters.")
    if (
      !Keychain.set("portfolio.activity.endpoint", endpoint, options) ||
      !Keychain.set("portfolio.activity.token", token, options)
    ) {
      throw Error("Could not save the connection in Keychain.")
    }
  }

  const now = new Date()
  const chicagoDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
  const dayOf = ({ year, month, day }) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  if (
    new Intl.DateTimeFormat().resolvedOptions().timeZone !== "America/Chicago"
  ) {
    throw Error(
      "This sender uses Chicago daily goals. Sync while your phone is set to America/Chicago."
    )
  }
  // A single-day query comes back empty on device, so read the past week and
  // pick today; the listed days also tell missing access from a date mismatch.
  const summaries = await Health.queryActivitySummaries({
    start: DateComponents.fromDate(new Date(now.getTime() - 6 * 86400000)),
    end: DateComponents.fromDate(now),
  })
  const days = summaries.map((item) => dayOf(item.dateComponents))
  const summary = summaries[days.indexOf(chicagoDate)]
  if (!summary)
    throw Error(
      `No activity summary for ${chicagoDate}; Health returned ${days.length} recent days (${days.join(", ") || "none"}). Check Health access and Watch sync, then retry.`
    )
  const payload = {
    date: chicagoDate,
    updatedAt: now.toISOString(),
    move: {
      value: summary.activeEnergyBurned(HealthUnit.kilocalorie()),
      goal: summary.activeEnergyBurnedGoal(HealthUnit.kilocalorie()),
    },
    exercise: {
      value: summary.appleExerciseTime(HealthUnit.minute()),
      goal: summary.appleExerciseTimeGoal(HealthUnit.minute()),
    },
    stand: {
      value: summary.appleStandHours(HealthUnit.count()),
      goal: summary.appleStandHoursGoal(HealthUnit.count()),
    },
  }
  for (const metric of [payload.move, payload.exercise, payload.stand]) {
    if (
      !Number.isFinite(metric.value) ||
      metric.value < 0 ||
      !Number.isFinite(metric.goal) ||
      metric.goal <= 0
    ) {
      throw Error(
        "Today's activity totals or goals are missing. Nothing was uploaded."
      )
    }
  }
  // Shortcuts runs this on every app open, so skip uploads that would not
  // change the tile. An unchanged quarter hour still refreshes the sync time.
  const rings = [payload.move, payload.exercise, payload.stand]
    .map(({ value, goal }) => Math.round((value / goal) * 100))
    .join("/")
  const last = JSON.parse(Keychain.get("portfolio.activity.last") || "{}")
  if (
    last.date === chicagoDate &&
    last.rings === rings &&
    now.getTime() - last.at < 15 * 60000
  ) {
    console.log("Rings unchanged since the last sync.")
    return
  }
  let response
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      timeout: 15,
      // Never forward the bearer credential to another location.
      handleRedirect: async () => null,
    })
  } catch {
    throw Error("Could not reach the activity endpoint. Try again later.")
  }
  // Forget a rejected token so the next run asks for it again.
  if (response.status === 401) Keychain.remove("portfolio.activity.token")
  if (!response.ok)
    throw Error(
      `Activity upload failed (${response.status}). Check the setup guide.`
    )
  Keychain.set(
    "portfolio.activity.last",
    JSON.stringify({ date: chicagoDate, rings, at: now.getTime() }),
    options
  )
  console.log("Activity rings synced.")
}

// Scripting rejects top-level await, and scripts must end with Script.exit().
syncActivity()
  .catch((error) => console.error(String(error)))
  .finally(() => Script.exit())
