import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:net"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL("..", import.meta.url))

test("the homepage renders the standalone About this site footer", async (t) => {
  const runningSite = process.env.TEST_BASE_URL
  const site = runningSite ? null : await startSite(t)
  const response = await fetch(runningSite || site.url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, />About this site<\/h2>/)
  assert.match(html, />Deployed on</)
  assert.match(html, />Source code</)
  assert.match(html, />Typeface</)
  assert.match(html, />Stack</)
  assert.match(html, />Inspired by</)
  assert.match(html, /aria-label="Footer social links"/)
})

async function startSite(t) {
  const port = await availablePort()
  const next = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--webpack", "-p", `${port}`],
    {
      cwd: projectRoot,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    }
  )
  let output = ""
  next.stdout.on("data", (chunk) => (output += chunk))
  next.stderr.on("data", (chunk) => (output += chunk))
  t.after(async () => {
    next.kill("SIGTERM")
    await once(next, "exit").catch(() => {})
  })

  const url = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (next.exitCode !== null) {
      throw new Error(`Next.js exited before startup:\n${output}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) return { url }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Next.js did not start in time:\n${output}`)
}

async function availablePort() {
  const server = createServer()
  server.listen(0, "127.0.0.1")
  await once(server, "listening")
  const address = server.address()
  server.close()
  await once(server, "close")
  return address.port
}
