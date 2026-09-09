// Run inside Scripting on iPhone, not Node. See docs/activity-setup.md.
// These globals are supplied by Scripting's documented native APIs.
/* global Keychain, Dialog, Health, HealthUnit, DateComponents */

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
    const options = {
      accessibility: "first_unlock_this_device",
      synchronizable: false,
    }
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
  const localDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  if (
    new Intl.DateTimeFormat().resolvedOptions().timeZone !== "America/Chicago"
  ) {
    throw Error(
      "This sender uses Chicago daily goals. Sync while your phone is set to America/Chicago."
    )
  }
  const today = DateComponents.fromDate(now)
  const summaries = await Health.queryActivitySummaries({
    start: today,
    end: today,
  })
  const summary = summaries.find(
    (item) =>
      item.dateComponents.date &&
      localDate(item.dateComponents.date) === chicagoDate
  )
  if (!summary)
    throw Error(
      "No activity summary available today. Check Health access and Watch sync, then retry."
    )
  const payload = {
    date: localDate(summary.dateComponents.date),
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
  if (!response.ok)
    throw Error(
      `Activity upload failed (${response.status}). Check the setup guide.`
    )
  console.log("Activity rings synced.")
}

await syncActivity()
