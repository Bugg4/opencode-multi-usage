import { Rpc } from "@opencode/plugin/rpc"

const nullableNumber = {
  anyOf: [{ type: "number" }, { type: "null" }],
}

const nullableString = {
  anyOf: [{ type: "string" }, { type: "null" }],
}

const nullableBoolean = {
  anyOf: [{ type: "boolean" }, { type: "null" }],
}

const windowSchema = {
  type: "object",
  properties: {
    usedPercent: nullableNumber,
    remainingPercent: nullableNumber,
    windowSeconds: nullableNumber,
    resetAt: nullableNumber,
  },
  required: ["usedPercent", "remainingPercent", "windowSeconds", "resetAt"],
  additionalProperties: false,
}

const commandCodeWindowSchema = {
  type: "object",
  properties: {
    used: nullableNumber,
    cap: nullableNumber,
    resetAt: nullableNumber,
  },
  required: ["used", "cap", "resetAt"],
  additionalProperties: false,
}

const commandCodeUsageSchema = {
  type: "object",
  properties: {
    plan: nullableString,
    status: nullableString,
    daysLeft: nullableNumber,
    monthlyRemaining: nullableNumber,
    extraRemaining: nullableNumber,
    totalRemaining: nullableNumber,
    usagePercent: nullableNumber,
    periodCount: nullableNumber,
    periodCost: nullableNumber,
    fiveHour: { anyOf: [commandCodeWindowSchema, { type: "null" }] },
    weekly: { anyOf: [commandCodeWindowSchema, { type: "null" }] },
    monthly: { anyOf: [commandCodeWindowSchema, { type: "null" }] },
  },
  required: [
    "plan",
    "status",
    "daysLeft",
    "monthlyRemaining",
    "extraRemaining",
    "totalRemaining",
    "usagePercent",
    "periodCount",
    "periodCost",
    "fiveHour",
    "weekly",
    "monthly",
  ],
  additionalProperties: false,
}

const unavailableSchema = {
  type: "object",
  properties: { reason: { type: "string" } },
  required: ["reason"],
  additionalProperties: false,
}

export const MultiUsageRpc = Rpc.define({
  id: "multi-usage",
  methods: {
    codexUsage: {
      input: { type: "object", additionalProperties: false },
      output: {
        type: "object",
        properties: {
          plan: nullableString,
          allowed: nullableBoolean,
          limitReached: nullableBoolean,
          primary: { anyOf: [windowSchema, { type: "null" }] },
          secondary: { anyOf: [windowSchema, { type: "null" }] },
        },
        required: ["plan", "allowed", "limitReached", "primary", "secondary"],
        additionalProperties: false,
      },
      errors: {
        unavailable: unavailableSchema,
      },
    },
    commandCodeUsage: {
      input: { type: "object", additionalProperties: false },
      output: commandCodeUsageSchema,
      errors: {
        unavailable: unavailableSchema,
      },
    },
  },
  events: {},
})
