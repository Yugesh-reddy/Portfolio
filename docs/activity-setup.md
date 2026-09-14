# Apple Watch activity rings

The website receiver and tile are implemented. A real iPhone sync and hosted Redis database still need to be connected. The browser cannot read Apple Health directly.

The connection follows this path: **Apple Watch → Apple Health on iPhone → Scripting → `/api/activity` → Redis → the website rings**. The website reads the last uploaded snapshot once a minute while the tile is visible. This is periodic sync, not a continuous Watch stream.

The redesigned tile uses three grayscale rings and matching Move, Exercise and Stand labels. Without a snapshot, it shows empty ring tracks and dashes rather than invented completion percentages. A connected snapshot fills the rings and displays its percentages and Chicago sync time; an old snapshot is labeled “Last activity.”

To finish connecting the existing implementation:

1. Add the three server environment values below to the website and local environment.
2. Deploy to your canonical HTTPS domain, then confirm `/api/activity` returns `empty`.
3. Run the included iPhone sender once and approve Health access on the phone.
4. Confirm the visible percentages match Fitness, then optionally add a Shortcuts automation.

## What appears publicly

Only Move, Exercise and Stand **percentages**, the activity date and a sync timestamp. The sender uploads the three totals and goals to your own endpoint; the server converts them before storage. Weight, heart rate, steps, routes and device identifiers are not requested or accepted. One snapshot is retained, expiring seven days after the last accepted upload.

The display says “Last activity” after three hours or when the Chicago calendar day changes. The timestamp means the phone read/upload time, not a guarantee that the Watch just synchronized with Health. Paused rings with missing/zero goals stop the upload.

## 1. Configure the website

Create or choose an Upstash Redis database. Copy its REST URL and write-capable REST token into your hosting environment, alongside a new random `ACTIVITY_SYNC_TOKEN` of at least 32 characters. Put the same values in ignored `.env.local` for local development; see `.env.example`. Never prefix them with `NEXT_PUBLIC_`.

You can generate a token using `openssl rand -hex 32`; store the result in your password manager and environment settings. The receiver uses [Upstash's REST command interface](https://upstash.com/docs/redis/features/restapi) with an atomic timestamp check, so delayed uploads cannot replace newer data.

Required variables:

- `ACTIVITY_SYNC_TOKEN`
- `UPSTASH_REDIS_REST_URL` (HTTPS)
- `UPSTASH_REDIS_REST_TOKEN`

Restart the dev server after environment changes. Deploy the configured website to obtain an HTTPS endpoint your phone can reach. Localhost on your phone refers to the phone itself. Use the final canonical domain to avoid redirects.

Opening `/api/activity` should return `{"status":"empty"}` before the first sync. `unconfigured` means configuration is missing; `unavailable` indicates a storage error. This implementation has not created cloud resources or deployed the site.

## 2. Connect the iPhone

This included sender uses the **Scripting** iPhone app. Its [Activity Summary API](https://scriptingapp.github.io/guide/Device%20Capabilities/Health/Reading%20Activity%20Summaries) is a PRO feature. Confirm the app's current subscription terms before choosing this route. A custom native HealthKit app could send the same payload instead.

1. Create a script in Scripting and copy `scripts/sync-activity.scripting.js` into its editor.
2. Run it manually while the phone is unlocked and set to America/Chicago. The script stops in other timezones to avoid publishing one timezone's daily rings under another day's label.
3. Enter your full `https://your-domain/api/activity` URL and sync token in the first-run prompts. The token is masked and stored in this script's [Keychain](https://scriptingapp.github.io/guide/Device%20Capabilities/Keychain), on this device only. It is never embedded in the source.
4. Allow Activity Summary reading when iOS/Scripting asks. HealthKit may return no data if access is denied; the script then stops without sending invented zeroes.
5. Check for “Activity rings synced.” Open the website and compare it with Fitness. The browser refreshes the visible tile every minute; the endpoint may cache a successful read for 30 seconds.

The sender uses Scripting's documented [fetch](https://scriptingapp.github.io/guide/Utilities/Request/fetch) API, stops redirects and times out after 15 seconds. It has been tested with mocked native APIs; real device permissions and background runs must be tested on your phone.

## 3. Optional periodic updates

After a successful manual sync, create an iPhone Shortcuts personal automation that invokes this Scripting script at a few chosen times or after a workout, using the actions available in your installed app. This is periodic publishing, not a live Watch connection. iOS scheduling, lock state and Watch-to-Health delay can postpone updates. Do not rely on a strict refresh interval. Run manually if the site shows stale activity.

## Receiver contract

`POST /api/activity`, `Content-Type: application/json`, `Authorization: Bearer <ACTIVITY_SYNC_TOKEN>`.

Body fields are `date` (`YYYY-MM-DD`, Chicago), `updatedAt` (ISO timestamp), and `move`, `exercise`, `stand`, each `{value, goal}`. Move uses matching energy units; exercise minutes; stand hours. All values must be finite and nonnegative, all goals positive, and stand values/goals whole numbers up to 24. Unknown fields are rejected. Maximum body size: 4096 bytes. Dates must match the timestamp's Chicago day, be no more than seven days old and no more than five minutes ahead.

Responses: 200 accepted, 400 invalid data, 401 incorrect token, 409 newer snapshot already stored, 413 oversized body, 415 incorrect content type, 503 configuration/storage unavailable. Only the normalized percentages can be read back publicly. Progress above 100% is preserved in accessible text; the visual ring closes at 100%.

## Rotate or disconnect

To rotate, replace the server sync token, then remove `portfolio.activity.token` from the same Scripting script's Keychain using `Keychain.remove("portfolio.activity.token")` and run again. To change endpoint, remove `portfolio.activity.endpoint` the same way. Keychain data is scoped to that script.

To disconnect, disable the phone automation and remove `ACTIVITY_SYNC_TOKEN` from the website environment, then redeploy/restart. The tile returns to its unconfigured state (allow up to 30 seconds for a previously cached GET). For immediate storage removal, delete `portfolio:activity:latest` in your Redis console. Otherwise it expires after seven days. Remove Health permission in iOS settings if you no longer want the app to read summaries.
