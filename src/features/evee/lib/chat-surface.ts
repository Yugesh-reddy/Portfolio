export type CommandMenuMode = "command" | "chat"
export type EveeRequestStatus = "idle" | "submitting" | "streaming"
export type EveeRequestExit = "back" | "stop" | "clear" | "unmount"

export type PanelPresentation = {
  ariaHidden: boolean
  inert: boolean
  opacity: number
  transform: string
  filter: string
}

export function getPanelPresentation(
  mode: CommandMenuMode,
  panel: CommandMenuMode,
  reduceMotion: boolean
): PanelPresentation {
  const active = mode === panel
  const offset = panel === "command" ? -4 : 4

  return {
    ariaHidden: !active,
    inert: !active,
    opacity: active ? 1 : 0,
    transform:
      active || reduceMotion
        ? "translate3d(0, 0, 0)"
        : `translate3d(${offset}px, 0, 0)`,
    filter: active || reduceMotion ? "blur(0px)" : "blur(1px)",
  }
}

export function getComposerControl(status: EveeRequestStatus, input: string) {
  if (status !== "idle") {
    return { action: "stop" as const, disabled: false }
  }

  return { action: "send" as const, disabled: input.trim().length === 0 }
}

export function getEveeSurfaceSize(messageCount: number) {
  return messageCount === 0 ? ("compact" as const) : ("conversation" as const)
}

const COMMAND_PALETTE_KEYS = new Set([
  "Enter",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
])
const COMMAND_PALETTE_VIM_KEYS = new Set(["n", "j", "p", "k"])

export function shouldContainEveeKey(
  input: string | { key: string; ctrlKey?: boolean }
) {
  const key = typeof input === "string" ? input : input.key
  const ctrlKey = typeof input === "string" ? false : input.ctrlKey

  return (
    COMMAND_PALETTE_KEYS.has(key) ||
    Boolean(ctrlKey && COMMAND_PALETTE_VIM_KEYS.has(key))
  )
}

export function getEveeRequestDisposition(reason: EveeRequestExit) {
  return reason === "back" ? ("preserve" as const) : ("abort" as const)
}

export function shouldSubmitInitialEveeQuery({
  active,
  status,
  initialQuery,
  lastInitialQuery,
}: {
  active: boolean
  status: EveeRequestStatus
  initialQuery: string
  lastInitialQuery: string
}) {
  return (
    active &&
    status === "idle" &&
    initialQuery.length > 0 &&
    initialQuery !== lastInitialQuery
  )
}

export function consumePendingInitialEveeQuery(initialQuery: string) {
  return initialQuery
}
