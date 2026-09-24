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
        unavailable: {
          type: "object",
          properties: { reason: { type: "string" } },
          required: ["reason"],
          additionalProperties: false,
        },
      },
    },
  },
  events: {},
})
