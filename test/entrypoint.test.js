import { describe, it } from "node:test"
import assert from "node:assert/strict"
import server from "../dist/index.js"
import tui from "../dist/tui.js"

describe("plugin entrypoints", () => {
  it("exposes the native v2 server lifecycle at the package root", () => {
    assert.equal(server.id, "opencode.multi-usage")
    assert.equal(typeof server.setup, "function")
    assert.equal("tui" in server, false)
  })

  it("exposes the v2 CLI lifecycle from ./tui", () => {
    assert.equal(tui.id, "opencode.multi-usage.tui")
    assert.equal(typeof tui.setup, "function")
  })
})
