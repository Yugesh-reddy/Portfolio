const MODELS_DEV_LOGO_BASE = "https://models.dev/logos"

const MODEL_PROVIDER_RULES: { match: RegExp; provider: string }[] = [
  { match: /^cursor-grok/u, provider: "xai" },
  { match: /^(composer|cursor)/u, provider: "cursor" },
  { match: /^(gpt|codex|o[134]|chatgpt|dall)/u, provider: "openai" },
  { match: /^claude/u, provider: "anthropic" },
  { match: /^(gemini|gemma|palm)/u, provider: "google" },
  { match: /^deepseek/u, provider: "deepseek" },
  { match: /^(qwen|qwq)/u, provider: "alibaba" },
  { match: /^(kimi|moonshot)/u, provider: "moonshotai" },
  { match: /^minimax/u, provider: "minimax" },
  { match: /^mimo/u, provider: "xiaomi" },
  { match: /^(hy|hunyuan)/u, provider: "tencent" },
  { match: /^nemotron/u, provider: "nvidia" },
  { match: /^llama/u, provider: "llama" },
  { match: /^grok/u, provider: "xai" },
  {
    match: /^(mistral|codestral|magistral|ministral|pixtral|devstral)/u,
    provider: "mistral",
  },
  { match: /^glm/u, provider: "zhipuai" },
  { match: /^command/u, provider: "cohere" },
]

const AGENT_PROVIDERS: Record<string, string> = {
  amp: "unknown",
  claude: "anthropic",
  codex: "openai",
  cursor: "cursor",
  opencode: "opencode",
}

function providerLogoUrl(provider: string) {
  return `${MODELS_DEV_LOGO_BASE}/${provider}.svg`
}

export function getModelLogoUrl(model: string): string {
  const normalized = model.trim().toLowerCase()
  const provider =
    MODEL_PROVIDER_RULES.find((entry) => entry.match.test(normalized))
      ?.provider ?? "unknown"
  return providerLogoUrl(provider)
}

export function getAgentLogoUrl(agent: string): string {
  const provider = AGENT_PROVIDERS[agent.trim().toLowerCase()] ?? "unknown"
  return providerLogoUrl(provider)
}
