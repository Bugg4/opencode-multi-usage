import type { Context } from "@opencode/plugin/tui/context"
import { MultiUsageRpc } from "../rpc.js"
import {
  opencodeDataFile,
  booleanOrNull,
  numberOrNull,
  readJson,
  record,
  stringOrNull,
} from "../shared.js"

export const USAGE_URL = "https://chatgpt.com/backend-api/wham/usage"

export type WindowUsage = {
  usedPercent: number | null
  remainingPercent: number | null
  windowSeconds: number | null
  resetAt: number | null
}

export type CodexUsage = {
  plan: string | null
  allowed: boolean | null
  limitReached: boolean | null
  primary: WindowUsage | null
  secondary: WindowUsage | null
  error?: string
}

export type TuiClient = Context["client"]

export const emptyCodexUsage = (error: string): CodexUsage => ({
  plan: null,
  allowed: null,
  limitReached: null,
  primary: null,
  secondary: null,
  error,
})

export const accountIdFromToken = (token: string): string | undefined => {
  const payload = token.split(".")[1]
  if (!payload) return undefined
  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (!record(claims)) return undefined
    const direct = stringOrNull(claims.chatgpt_account_id)
    if (direct) return direct
    const authClaims = record(claims["https://api.openai.com/auth"])
      ? claims["https://api.openai.com/auth"]
      : undefined
    const nested = record(authClaims) ? stringOrNull(authClaims.chatgpt_account_id) : null
    if (nested) return nested
    const organizations = Array.isArray(claims.organizations) ? claims.organizations : []
    const organization = organizations.find((item) => record(item) && stringOrNull(item.id))
    return record(organization) ? (stringOrNull(organization.id) ?? undefined) : undefined
  } catch {
    return undefined
  }
}

const parseWindow = (value: unknown): WindowUsage | null => {
  if (!record(value)) return null
  const usedPercent = numberOrNull(value.used_percent)
  return {
    usedPercent,
    remainingPercent: usedPercent === null ? null : Math.max(0, Math.min(100, 100 - usedPercent)),
    windowSeconds: numberOrNull(value.limit_window_seconds),
    resetAt: numberOrNull(value.reset_at),
  }
}

export const parseCodexUsage = (value: unknown): CodexUsage => {
  const data = record(value) ? value : {}
  const rateLimit = record(data.rate_limit) ? data.rate_limit : {}
  return {
    plan: stringOrNull(data.plan_type),
    allowed: booleanOrNull(rateLimit.allowed),
    limitReached: booleanOrNull(rateLimit.limit_reached),
    primary: parseWindow(rateLimit.primary_window),
    secondary: parseWindow(rateLimit.secondary_window),
  }
}

export const fetchCodexUsage = async (access: string, accountId?: string): Promise<CodexUsage> => {
  const headers = new Headers({
    Authorization: `Bearer ${access}`,
    Accept: "application/json",
  })
  if (accountId) headers.set("ChatGPT-Account-ID", accountId)
  const response = await fetch(USAGE_URL, {
    headers,
    signal: AbortSignal.timeout(10_000),
  })
  if (response.status === 401 || response.status === 403) {
    throw new Error("ChatGPT session expired; reconnect from /connect")
  }
  if (!response.ok) throw new Error(`Usage request failed (${response.status})`)
  return parseCodexUsage(await response.json())
}

const readAuth = async (): Promise<{ access?: string; accountId?: string }> => {
  const environmentToken = stringOrNull(process.env.CHATGPT_ACCESS_TOKEN)
  if (environmentToken) {
    return {
      access: environmentToken,
      accountId:
        stringOrNull(process.env.CHATGPT_ACCOUNT_ID) ?? accountIdFromToken(environmentToken),
    }
  }
  const data: unknown = process.env.OPENCODE_AUTH_CONTENT
    ? JSON.parse(process.env.OPENCODE_AUTH_CONTENT)
    : await readJson(opencodeDataFile("auth.json"))
  const openai = record(data) && record(data.openai) ? data.openai : {}
  const access = stringOrNull(openai.access)
  return {
    access: access ?? undefined,
    accountId: stringOrNull(openai.accountId) ?? (access ? accountIdFromToken(access) : undefined),
  }
}

const getLocalCodexUsage = async (): Promise<CodexUsage> => {
  const auth = await readAuth()
  if (!auth.access) throw new Error("Connect ChatGPT from /connect first")
  return fetchCodexUsage(auth.access, auth.accountId)
}

const isRpcMethodError = (error: unknown): boolean =>
  record(error) && typeof error.type === "string" && !error.type.startsWith("rpc.")

export const getCodexUsage = async (client?: TuiClient): Promise<CodexUsage> => {
  if (client) {
    try {
      return (await client.rpc(MultiUsageRpc).codexUsage({})) as CodexUsage
    } catch (error) {
      if (isRpcMethodError(error)) throw error
      // The server plugin is not loaded; fall back to local credentials.
    }
  }
  return getLocalCodexUsage()
}
