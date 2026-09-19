import path from "node:path"
import { numberOrNull, opencodeDataFile, readJson, record, stringOrNull } from "../shared.js"

export const DEFAULT_BASE_URL = "https://api.commandcode.ai"
export const CC_VERSION = "1.54.0"
export const USER_AGENT = "cli"

export const PLAN_CREDITS: Record<string, number> = {
  "individual-go": 10,
  "individual-goat": 70,
  "individual-pro": 30,
  "individual-pro-v1": 80,
  "individual-provider": 15,
  "individual-max": 150,
  "individual-ultra": 300,
  "teams-pro": 40,
}

export const PLAN_NAMES: Record<string, string> = {
  "individual-go": "Go",
  "individual-goat": "GOAT",
  "individual-pro": "Pro",
  "individual-pro-v1": "Pro",
  "individual-provider": "Provider",
  "individual-max": "Max",
  "individual-ultra": "Ultra",
  "teams-pro": "Teams Pro",
}

export type CCWindow = {
  used: number | null
  cap: number | null
  resetAt: number | null
}

export type CommandCodeUsage = {
  plan: string | null
  status: string | null
  daysLeft: number | null
  monthlyRemaining: number | null
  extraRemaining: number | null
  totalRemaining: number | null
  usagePercent: number | null
  periodCount: number | null
  periodCost: number | null
  fiveHour: CCWindow | null
  weekly: CCWindow | null
  monthly: CCWindow | null
  error?: string
}

export const emptyCommandCodeUsage = (error: string): CommandCodeUsage => ({
  plan: null,
  status: null,
  daysLeft: null,
  monthlyRemaining: null,
  extraRemaining: null,
  totalRemaining: null,
  usagePercent: null,
  periodCount: null,
  periodCost: null,
  fiveHour: null,
  weekly: null,
  monthly: null,
  error,
})

export const planInfo = (planId: string | null): { name: string; monthly: number } | null => {
  if (!planId) return null
  const key = planId.toLowerCase().replace(/_/g, "-")
  const match = Object.keys(PLAN_CREDITS)
    .sort((a, b) => b.length - a.length)
    .find((candidate) => key.startsWith(candidate))
  if (!match) return null
  return { name: PLAN_NAMES[match] ?? match, monthly: PLAN_CREDITS[match]! }
}

export const parseCommandCodeWindow = (value: unknown): CCWindow | null => {
  if (!record(value)) return null
  return {
    used: numberOrNull(value.used),
    cap: numberOrNull(value.cap),
    resetAt: numberOrNull(value.resetAt),
  }
}

const readAuth = async (): Promise<string[]> => {
  const keys: string[] = []
  const add = (value: unknown) => {
    const key = stringOrNull(value)
    if (key && !keys.includes(key)) keys.push(key)
  }

  add(process.env.COMMANDCODE_USAGE_API_KEY)
  add(process.env.COMMANDCODE_API_KEY)
  add(process.env.COMMAND_CODE_API_KEY)
  add(process.env.CMD_API_KEY)

  // The key saved by the CommandCode CLI can access the private billing API.
  // Prefer it over OpenCode's connection, which may contain a Provider-only key.
  try {
    const data = await readJson(path.join(process.env.HOME ?? "", ".commandcode", "auth.json"))
    if (record(data)) add(data.apiKey)
  } catch {
    // Continue with OpenCode's inline or persisted credentials.
  }

  try {
    const data: unknown = process.env.OPENCODE_AUTH_CONTENT
      ? JSON.parse(process.env.OPENCODE_AUTH_CONTENT)
      : undefined
    if (record(data) && record(data.commandcode)) {
      add(data.commandcode.key)
    }
  } catch {
    // Ignore malformed inline auth and try the persisted file.
  }

  try {
    const data = await readJson(opencodeDataFile("auth.json"))
    if (record(data) && record(data.commandcode)) add(data.commandcode.key)
  } catch {
    // No persisted OpenCode credential.
  }

  return keys
}

export const commandCodeBaseUrl = (): string =>
  stringOrNull(process.env.COMMANDCODE_API_URL) ?? DEFAULT_BASE_URL

export const commandCodeHeaders = (key: string): Record<string, string> => ({
  Authorization: `Bearer ${key}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": USER_AGENT,
  "x-command-code-version": CC_VERSION,
  "x-cli-environment": "production",
})

class CommandCodeKeyRejectedError extends Error {}

const fetchJson = async (key: string, suffix: string, fetcher: typeof fetch): Promise<unknown> => {
  const response = await fetcher(`${commandCodeBaseUrl()}${suffix}`, {
    headers: commandCodeHeaders(key),
    signal: AbortSignal.timeout(10_000),
  })
  if (response.status === 401 || response.status === 403) {
    throw new CommandCodeKeyRejectedError(
      `CommandCode usage key rejected (${response.status}); run \`cmd auth login\` or set COMMANDCODE_USAGE_API_KEY`,
    )
  }
  if (!response.ok) throw new Error(`Usage request failed (${response.status})`)
  return response.json()
}

export type CommandCodeUsageDependencies = {
  fetcher?: typeof fetch
  authCandidates?: readonly string[]
}

export const parseCommandCodeUsage = (
  creditsRaw: unknown,
  subRaw: unknown,
  summaryRaw: unknown,
): CommandCodeUsage => {
  const credits = record(creditsRaw) && record(creditsRaw.credits) ? creditsRaw.credits : {}
  const sub = record(subRaw) && record(subRaw.data) ? subRaw.data : {}
  const summary = record(summaryRaw) ? summaryRaw : {}
  const monthly = numberOrNull(credits.monthlyCredits)
  const purchased = numberOrNull(credits.purchasedCredits) ?? 0
  const free = numberOrNull(credits.freeCredits) ?? 0
  const extra = Math.max(0, purchased) + Math.max(0, free)
  const totalRemaining = monthly === null ? null : Math.max(0, monthly) + extra
  const plan = planInfo(stringOrNull(sub.planId))
  const periodCost = numberOrNull(summary.totalMonthlyCredits) ?? numberOrNull(summary.totalCost)
  const pool =
    plan && totalRemaining !== null
      ? plan.monthly + extra
      : periodCost !== null && totalRemaining !== null
        ? periodCost + totalRemaining
        : null
  const usagePercent =
    pool !== null && pool > 0 && totalRemaining !== null
      ? Math.min(100, Math.max(0, ((pool - totalRemaining) / pool) * 100))
      : null
  const periodEnd = stringOrNull(sub.currentPeriodEnd)
  const end = periodEnd ? Date.parse(periodEnd) : Number.NaN
  const windows =
    record(creditsRaw) && record(creditsRaw.windowLimits) ? creditsRaw.windowLimits : {}

  return {
    plan: plan?.name ?? stringOrNull(sub.planId),
    status: stringOrNull(sub.status),
    daysLeft: Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - Date.now()) / 86_400_000)),
    monthlyRemaining: monthly,
    extraRemaining: extra,
    totalRemaining,
    usagePercent,
    periodCount: numberOrNull(summary.totalCount),
    periodCost,
    fiveHour: parseCommandCodeWindow(windows.fiveHour),
    weekly: parseCommandCodeWindow(windows.weekly),
    monthly: parseCommandCodeWindow(windows.monthly),
  }
}

const getCommandCodeUsageWithKey = async (
  key: string,
  fetcher: typeof fetch,
): Promise<CommandCodeUsage> => {
  const whoami = await fetchJson(key, "/alpha/whoami?limits=1", fetcher)
  const orgId = record(whoami) && record(whoami.org) ? stringOrNull(whoami.org.id) : null
  const suffix = orgId ? `?orgId=${encodeURIComponent(orgId)}` : ""
  const [creditsRaw, subRaw] = await Promise.all([
    fetchJson(key, `/alpha/billing/credits${suffix}`, fetcher),
    fetchJson(key, `/alpha/billing/subscriptions${suffix}`, fetcher),
  ])
  const sub = record(subRaw) && record(subRaw.data) ? subRaw.data : {}
  const since = stringOrNull(sub.currentPeriodStart)
  const summaryRaw = await fetchJson(
    key,
    `/alpha/usage/summary${suffix ? `${suffix}&` : "?"}${since ? `since=${encodeURIComponent(since)}` : ""}`,
    fetcher,
  )
  return parseCommandCodeUsage(creditsRaw, subRaw, summaryRaw)
}

export const getCommandCodeUsage = async (
  dependencies: CommandCodeUsageDependencies = {},
): Promise<CommandCodeUsage> => {
  const fetcher = dependencies.fetcher ?? fetch
  const keys = dependencies.authCandidates ?? (await readAuth())
  if (keys.length === 0) {
    throw new Error("Run `cmd auth login` or set COMMANDCODE_USAGE_API_KEY first")
  }

  let rejected: CommandCodeKeyRejectedError | undefined
  for (const candidate of keys) {
    try {
      return await getCommandCodeUsageWithKey(candidate, fetcher)
    } catch (error) {
      if (!(error instanceof CommandCodeKeyRejectedError)) throw error
      rejected = error
    }
  }
  throw (
    rejected ?? new Error("No CommandCode credential can access usage; run `cmd auth login` first")
  )
}
