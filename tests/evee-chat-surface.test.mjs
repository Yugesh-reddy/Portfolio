import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/evee/lib/chat-surface.ts",
  import.meta.url
)

test("makes only the active Search or Evee panel interactive", async () => {
  const { getPanelPresentation } = await import(modulePath.href)

  assert.deepEqual(getPanelPresentation("chat", "chat", false), {
    ariaHidden: false,
    inert: false,
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    filter: "blur(0px)",
  })
  assert.deepEqual(getPanelPresentation("chat", "command", false), {
    ariaHidden: true,
    inert: true,
    opacity: 0,
    transform: "translate3d(-4px, 0, 0)",
    filter: "blur(1px)",
  })
})

test("keeps the panel transition still when reduced motion is requested", async () => {
  const { getPanelPresentation } = await import(modulePath.href)

  assert.deepEqual(getPanelPresentation("command", "chat", true), {
    ariaHidden: true,
    inert: true,
    opacity: 0,
    transform: "translate3d(0, 0, 0)",
    filter: "blur(0px)",
  })
})

test("uses one composer control for send and stop states", async () => {
  const { getComposerControl } = await import(modulePath.href)

  assert.deepEqual(getComposerControl("idle", "  "), {
    action: "send",
    disabled: true,
  })
  assert.deepEqual(getComposerControl("idle", "Tell me about MediCS"), {
    action: "send",
    disabled: false,
  })
  assert.deepEqual(getComposerControl("streaming", ""), {
    action: "stop",
    disabled: false,
  })
})

test("keeps the suggestion state compact and expands for conversation", async () => {
  const { getEveeSurfaceSize } = await import(modulePath.href)

  assert.equal(getEveeSurfaceSize(0), "compact")
  assert.equal(getEveeSurfaceSize(1), "conversation")
})

test("contains command-palette keys inside Evee while allowing dialog keys through", async () => {
  const { shouldContainEveeKey } = await import(modulePath.href)

  for (const key of ["Enter", "ArrowUp", "ArrowDown", "Home", "End"]) {
    assert.equal(shouldContainEveeKey(key), true)
  }

  for (const key of ["Escape", "Tab", "a"]) {
    assert.equal(shouldContainEveeKey(key), false)
  }

  for (const key of ["n", "j", "p", "k"]) {
    assert.equal(shouldContainEveeKey({ key, ctrlKey: true }), true)
    assert.equal(shouldContainEveeKey({ key, ctrlKey: false }), false)
  }
})

test("preserves an active request on Back and aborts for explicit exits", async () => {
  const { getEveeRequestDisposition } = await import(modulePath.href)

  assert.equal(getEveeRequestDisposition("back"), "preserve")
  assert.equal(getEveeRequestDisposition("stop"), "abort")
  assert.equal(getEveeRequestDisposition("clear"), "abort")
  assert.equal(getEveeRequestDisposition("unmount"), "abort")
})

test("waits to consume a new Search query until the current answer finishes", async () => {
  const { consumePendingInitialEveeQuery, shouldSubmitInitialEveeQuery } =
    await import(modulePath.href)

  assert.equal(
    shouldSubmitInitialEveeQuery({
      active: true,
      status: "streaming",
      initialQuery: "What are his interests?",
      lastInitialQuery: "",
    }),
    false
  )
  assert.equal(
    shouldSubmitInitialEveeQuery({
      active: true,
      status: "idle",
      initialQuery: "What are his interests?",
      lastInitialQuery: "",
    }),
    true
  )
  assert.equal(
    shouldSubmitInitialEveeQuery({
      active: true,
      status: "idle",
      initialQuery: "What are his interests?",
      lastInitialQuery: "What are his interests?",
    }),
    false
  )

  const clearedQueryMarker = consumePendingInitialEveeQuery(
    "What are his interests?"
  )
  assert.equal(
    shouldSubmitInitialEveeQuery({
      active: true,
      status: "idle",
      initialQuery: "What are his interests?",
      lastInitialQuery: clearedQueryMarker,
    }),
    false
  )
})
