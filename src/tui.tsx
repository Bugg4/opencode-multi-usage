/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui"
import { createSignal, type Accessor, type JSX } from "solid-js"
import { parseRefreshInterval } from "./refresh.js"
import { parseProviders, type ProviderId } from "./options.js"
import { errorMessage, record } from "./shared.js"
import type { UsageTheme, UsageViewProps } from "./ui.js"
import { CodexView } from "./providers/codex-view.js"
import { emptyCodexUsage, getCodexUsage } from "./providers/codex.js"
import { GoView } from "./providers/opencode-go-view.js"
import { emptyGoUsage, getGoUsage } from "./providers/opencode-go.js"
import { CommandCodeView } from "./providers/commandcode-view.js"
import { emptyCommandCodeUsage, getCommandCodeUsage } from "./providers/commandcode.js"

type UsageResult = { error?: string }

type Provider<Usage extends UsageResult> = {
  id: ProviderId
  defaultRefreshInterval: string
  getUsage: () => Promise<Usage>
  errorUsage: (message: string) => Usage
  View: (props: UsageViewProps<Usage>) => JSX.Element
}

type Runtime = {
  render: () => JSX.Element
  dispose: () => void
}

const providers = {
  codex: {
    id: "codex",
    defaultRefreshInterval: "30s",
    getUsage: getCodexUsage,
    errorUsage: emptyCodexUsage,
    View: CodexView,
  } satisfies Provider<Awaited<ReturnType<typeof getCodexUsage>>>,
  "opencode-go": {
    id: "opencode-go",
    defaultRefreshInterval: "5m",
    getUsage: getGoUsage,
    errorUsage: emptyGoUsage,
    View: GoView,
  } satisfies Provider<Awaited<ReturnType<typeof getGoUsage>>>,
  commandcode: {
    id: "commandcode",
    defaultRefreshInterval: "5m",
    getUsage: getCommandCodeUsage,
    errorUsage: emptyCommandCodeUsage,
    View: CommandCodeView,
  } satisfies Provider<Awaited<ReturnType<typeof getCommandCodeUsage>>>,
}

const createRuntime = <Usage extends UsageResult>(
  provider: Provider<Usage>,
  refreshInterval: unknown,
  theme: Accessor<UsageTheme>,
  requestRender: () => void,
): Runtime => {
  const interval = parseRefreshInterval(
    refreshInterval,
    parseRefreshInterval(provider.defaultRefreshInterval).milliseconds,
  )
  const [usage, setUsage] = createSignal<Usage | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [open, setOpen] = createSignal(true)
  let refreshing: Promise<void> | undefined

  const toggleOpen = () => {
    setOpen((value) => !value)
    requestRender()
  }

  const refresh = (): Promise<void> => {
    if (refreshing) return refreshing
    refreshing = (async () => {
      setLoading(true)
      try {
        const next = await provider.getUsage()
        setUsage(() => next)
      } catch (error) {
        const next = provider.errorUsage(errorMessage(error))
        setUsage(() => next)
      } finally {
        setLoading(false)
        requestRender()
      }
    })().finally(() => {
      refreshing = undefined
    })
    return refreshing
  }

  void refresh()
  const timer = setInterval(() => void refresh(), interval.milliseconds)
  return {
    render: () => (
      <provider.View
        usage={usage}
        loading={loading}
        theme={theme}
        open={open}
        toggleOpen={toggleOpen}
        requestRender={requestRender}
      />
    ),
    dispose: () => clearInterval(timer),
  }
}

const mount = (
  rawOptions: unknown,
  theme: Accessor<UsageTheme>,
  requestRender: () => void,
  register: (render: () => JSX.Element) => () => void,
): (() => void) => {
  const options = record(rawOptions) ? rawOptions : {}
  const enabled = parseProviders(options.providers)
  const runtimes: Runtime[] = []
  for (const id of enabled) {
    if (id === "codex")
      runtimes.push(createRuntime(providers.codex, options.refreshInterval, theme, requestRender))
    if (id === "opencode-go")
      runtimes.push(
        createRuntime(providers["opencode-go"], options.refreshInterval, theme, requestRender),
      )
    if (id === "commandcode")
      runtimes.push(
        createRuntime(providers.commandcode, options.refreshInterval, theme, requestRender),
      )
  }

  const unregister = register(() => (
    <box flexDirection="column">
      {runtimes.length > 0 ? (
        runtimes.map((runtime) => runtime.render())
      ) : (
        <text fg={theme().warning}>
          Enable usage providers in the opencode-multi-usage plugin config.
        </text>
      )}
    </box>
  ))
  return () => {
    for (const runtime of runtimes) runtime.dispose()
    unregister()
  }
}

const plugin = Plugin.define({
  id: "opencode.multi-usage.tui",
  setup(context) {
    return mount(
      context.options,
      () => ({
        text: context.theme.text.default,
        muted: context.theme.text.subdued,
        primary: context.theme.text.action.primary.default,
        error: context.theme.text.feedback.error.default,
        warning: context.theme.text.feedback.warning.default,
        success: context.theme.text.feedback.success.default,
      }),
      () => context.renderer.requestRender(),
      (render) => context.ui.slot({ append: "sidebar.content", render }),
    )
  },
})

export default plugin
