import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseColor } from "@opentui/core"
import { testRender } from "@opentui/solid"
import { createComponent, createSignal } from "solid-js"
import { CodexView } from "../dist/providers/codex-view.js"

describe("Codex view", () => {
  it("renders usage without orphan text nodes", async () => {
    const now = Math.floor(Date.now() / 1000)
    const [usage] = createSignal({
      plan: "plus",
      allowed: true,
      limitReached: false,
      primary: {
        usedPercent: 30,
        remainingPercent: 70,
        windowSeconds: 18_000,
        resetAt: now + 3_600,
      },
      secondary: {
        usedPercent: 10,
        remainingPercent: 90,
        windowSeconds: 604_800,
        resetAt: now + 86_400,
      },
    })
    const [loading] = createSignal(false)
    const [open] = createSignal(true)
    const text = parseColor("#ffffff")
    const muted = parseColor("#888888")
    const theme = () => ({
      text,
      muted,
      primary: text,
      error: text,
      warning: text,
      success: text,
    })
    const setup = await testRender(
      () =>
        createComponent(CodexView, {
          usage,
          loading,
          open,
          theme,
          toggleOpen() {},
          requestRender() {},
        }),
      { width: 42, height: 15 },
    )

    try {
      await setup.renderOnce()
      await setup.flush()
      const frame = setup.captureCharFrame()
      assert.match(frame, /Codex Usage/)
      assert.match(frame, /Plan: plus/)
      assert.match(frame, /▶ 5h: 70% left/)
      assert.match(frame, /▶ 1w: 90% left/)
      assert.doesNotMatch(frame, /Resets:/)
      assert.match(frame, /Status: Allowed/)

      const primary = setup.renderer.root.findDescendantById("usage-quota-5h")
      assert.ok(primary)
      assert.equal(typeof primary._mouseListeners.down, "function")
      primary._mouseListeners.down()
      await setup.renderOnce()
      await setup.flush()
      const expanded = setup.captureCharFrame()
      assert.match(expanded, /▼ 5h: 70% left/)
      assert.match(expanded, /Resets:/)
    } finally {
      setup.renderer.destroy()
    }
  })
})
