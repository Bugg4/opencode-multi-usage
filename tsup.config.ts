import { solidPlugin } from "esbuild-plugin-solid"
import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/index.ts",
    tui: "src/tui.tsx",
    rpc: "src/rpc.ts",
    options: "src/options.ts",
    refresh: "src/refresh.ts",
    shared: "src/shared.ts",
    ui: "src/ui.tsx",
    "providers/codex": "src/providers/codex.ts",
    "providers/codex-view": "src/providers/codex-view.tsx",
    "providers/opencode-go": "src/providers/opencode-go.ts",
    "providers/opencode-go-view": "src/providers/opencode-go-view.tsx",
    "providers/commandcode": "src/providers/commandcode.ts",
    "providers/commandcode-view": "src/providers/commandcode-view.tsx",
  },
  format: "esm",
  bundle: false,
  clean: false,
  sourcemap: true,
  esbuildPlugins: [
    solidPlugin({
      solid: { moduleName: "@opentui/solid", generate: "universal" },
    }),
  ],
})
