import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  accountIdFromToken,
  fetchCodexUsage,
  getCodexUsage,
  parseCodexUsage,
} from "../dist/providers/codex.js"
import { parseGoUsage, parseGoWindow } from "../dist/providers/opencode-go.js"
import {
  getCommandCodeUsage,
  parseCommandCodeUsage,
  parseCommandCodeWindow,
  planInfo,
} from "../dist/providers/commandcode.js"

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url")

describe("Codex usage", () => {
  it("parses plan, allowance, and both windows", () => {
    const usage = parseCodexUsage({
      plan_type: "plus",
      rate_limit: {
        allowed: true,
        limit_reached: false,
        primary_window: {
          used_percent: 30,
          limit_window_seconds: 10800,
          reset_at: 1789000000,
        },
        secondary_window: {
          used_percent: 10,
          limit_window_seconds: 604800,
          reset_at: 1789600000,
        },
      },
    })
    assert.equal(usage.plan, "plus")
    assert.equal(usage.allowed, true)
    assert.equal(usage.primary?.remainingPercent, 70)
    assert.equal(usage.secondary?.remainingPercent, 90)
  })

  it("tolerates missing limits", () => {
    const usage = parseCodexUsage({ plan_type: "team" })
    assert.equal(usage.primary, null)
    assert.equal(usage.secondary, null)
  })

  it("extracts direct and nested account IDs", () => {
    assert.equal(accountIdFromToken(`h.${b64url({ chatgpt_account_id: "acc-123" })}.s`), "acc-123")
    assert.equal(
      accountIdFromToken(
        `h.${b64url({ "https://api.openai.com/auth": { chatgpt_account_id: "acc-456" } })}.s`,
      ),
      "acc-456",
    )
    assert.equal(accountIdFromToken("not-a-jwt"), undefined)
  })

  it("uses the server RPC when the server plugin is available", async () => {
    const client = {
      rpc: () => ({
        codexUsage: async () => ({
          plan: "team",
          allowed: true,
          limitReached: false,
          primary: {
            usedPercent: 0,
            remainingPercent: 100,
            windowSeconds: 18_000,
            resetAt: 1_789_000_000,
          },
          secondary: null,
        }),
      }),
    }
    const usage = await getCodexUsage(client)
    assert.equal(usage.plan, "team")
    assert.equal(usage.primary?.remainingPercent, 100)
  })

  it("propagates declared RPC errors instead of stale local credentials", async () => {
    const client = {
      rpc: () => ({
        codexUsage: async () => {
          throw { type: "unavailable", message: "Connect ChatGPT from /connect first" }
        },
      }),
    }
    await assert.rejects(getCodexUsage(client), (error) => {
      assert.equal(error.type, "unavailable")
      assert.match(error.message, /Connect ChatGPT from \/connect first/)
      return true
    })
  })

  it("falls back to local credentials when the RPC is missing", async () => {
    const client = {
      rpc: () => ({
        codexUsage: async () => {
          throw { type: "rpc.method_not_found", message: "Method not found" }
        },
      }),
    }
    const previousToken = process.env.CHATGPT_ACCESS_TOKEN
    const previousFetch = globalThis.fetch
    process.env.CHATGPT_ACCESS_TOKEN = "test-token"
    globalThis.fetch = async (_url, init) => {
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer test-token")
      return Response.json({
        plan_type: "plus",
        rate_limit: { allowed: true, limit_reached: false },
      })
    }
    try {
      const usage = await getCodexUsage(client)
      assert.equal(usage.plan, "plus")
    } finally {
      if (previousToken === undefined) delete process.env.CHATGPT_ACCESS_TOKEN
      else process.env.CHATGPT_ACCESS_TOKEN = previousToken
      globalThis.fetch = previousFetch
    }
  })

  it("maps rejected ChatGPT sessions to an actionable error", async () => {
    const previousFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(null, { status: 401 })
    try {
      await assert.rejects(fetchCodexUsage("expired"), /session expired; reconnect from \/connect/)
    } finally {
      globalThis.fetch = previousFetch
    }
  })
})

describe("OpenCode Go usage", () => {
  it("parses all windows", () => {
    const usage = parseGoUsage({
      usage: {
        rolling: { percent: 5, resetsAt: "2026-09-14T10:00:00Z", status: "ok" },
        weekly: { percent: 20, resetsAt: "2026-09-21T00:00:00Z", status: "ok" },
        monthly: {
          percent: 40,
          resetsAt: "2026-10-01T00:00:00Z",
          status: "warn",
        },
      },
    })
    assert.equal(usage.rolling?.percent, 5)
    assert.equal(usage.weekly?.percent, 20)
    assert.equal(usage.monthly?.status, "warn")
  })

  it("tolerates missing or invalid windows", () => {
    assert.equal(parseGoUsage({}).rolling, null)
    assert.equal(parseGoWindow(null), null)
    assert.equal(parseGoWindow(42), null)
  })
})

describe("CommandCode usage", () => {
  it("normalizes known plans", () => {
    assert.deepEqual(planInfo("individual-goat"), { name: "GOAT", monthly: 70 })
    assert.deepEqual(planInfo("individual_pro_v1"), {
      name: "Pro",
      monthly: 80,
    })
    assert.equal(planInfo("mystery-plan"), null)
  })

  it("computes pool usage and parses windows", () => {
    const usage = parseCommandCodeUsage(
      {
        credits: { monthlyCredits: 69.1, purchasedCredits: 0, freeCredits: 0 },
        windowLimits: {
          fiveHour: { used: 0.06, cap: 14, resetAt: Date.now() + 3_600_000 },
          weekly: { used: 0.9, cap: 35, resetAt: Date.now() + 86_400_000 },
          monthly: { used: 3.06, cap: 70, resetAt: Date.now() + 2_592_000_000 },
        },
      },
      {
        data: {
          planId: "individual-goat",
          status: "active",
          currentPeriodStart: "2026-09-12T19:51:37.000Z",
          currentPeriodEnd: new Date(Date.now() + 28 * 86_400_000).toISOString(),
        },
      },
      { totalCount: 336, totalMonthlyCredits: 0.84 },
    )
    assert.equal(usage.plan, "GOAT")
    assert.ok(Math.abs(usage.usagePercent - 1.29) < 0.05)
    assert.equal(usage.periodCount, 336)
    assert.ok(usage.fiveHour !== null && usage.weekly !== null && usage.monthly !== null)
  })

  it("tolerates missing data", () => {
    const usage = parseCommandCodeUsage({}, {}, {})
    assert.equal(usage.plan, null)
    assert.equal(usage.usagePercent, null)
    assert.equal(parseCommandCodeWindow(null), null)
  })

  it("falls back when a Provider API key cannot access subscription usage", async () => {
    const credentials = []
    const fetcher = async (input, init) => {
      const url = new URL(input)
      const authorization = new Headers(init?.headers).get("authorization")
      credentials.push({ path: url.pathname, authorization })

      if (url.pathname === "/alpha/whoami" && authorization === "Bearer provider-key") {
        return new Response(null, { status: 401 })
      }
      if (url.pathname === "/alpha/whoami") {
        return Response.json({ org: { id: "org-1" } })
      }
      if (url.pathname === "/alpha/billing/credits") {
        return Response.json({ credits: { monthlyCredits: 12 } })
      }
      if (url.pathname === "/alpha/billing/subscriptions") {
        return Response.json({ data: { planId: "individual-pro" } })
      }
      if (url.pathname === "/alpha/usage/summary") {
        return Response.json({ totalCount: 7 })
      }
      return new Response(null, { status: 404 })
    }

    const usage = await getCommandCodeUsage({
      authCandidates: ["provider-key", "cli-key"],
      fetcher,
    })

    assert.equal(usage.plan, "Pro")
    assert.equal(usage.totalRemaining, 12)
    assert.deepEqual(credentials.slice(0, 2), [
      { path: "/alpha/whoami", authorization: "Bearer provider-key" },
      { path: "/alpha/whoami", authorization: "Bearer cli-key" },
    ])
    assert.ok(credentials.slice(2).every(({ authorization }) => authorization === "Bearer cli-key"))
  })
})
