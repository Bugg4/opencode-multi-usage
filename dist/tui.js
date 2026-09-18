import { effect as _$effect } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { Plugin } from "@opencode/plugin/tui";
import { createSignal } from "solid-js";
import { parseRefreshInterval } from "./refresh.js";
import { parseProviders } from "./options.js";
import { errorMessage, record } from "./shared.js";
import { CodexView } from "./providers/codex-view.js";
import { emptyCodexUsage, getCodexUsage } from "./providers/codex.js";
import { GoView } from "./providers/opencode-go-view.js";
import { emptyGoUsage, getGoUsage } from "./providers/opencode-go.js";
import { CommandCodeView } from "./providers/commandcode-view.js";
import { emptyCommandCodeUsage, getCommandCodeUsage } from "./providers/commandcode.js";
const providers = {
  codex: {
    id: "codex",
    defaultRefreshInterval: "30s",
    getUsage: getCodexUsage,
    errorUsage: emptyCodexUsage,
    View: CodexView
  },
  "opencode-go": {
    id: "opencode-go",
    defaultRefreshInterval: "5m",
    getUsage: getGoUsage,
    errorUsage: emptyGoUsage,
    View: GoView
  },
  commandcode: {
    id: "commandcode",
    defaultRefreshInterval: "5m",
    getUsage: getCommandCodeUsage,
    errorUsage: emptyCommandCodeUsage,
    View: CommandCodeView
  }
};
const createRuntime = (provider, refreshInterval, theme, requestRender) => {
  const interval = parseRefreshInterval(refreshInterval, parseRefreshInterval(provider.defaultRefreshInterval).milliseconds);
  const [usage, setUsage] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [open, setOpen] = createSignal(true);
  let refreshing;
  const toggleOpen = () => {
    setOpen((value) => !value);
    requestRender();
  };
  const refresh = () => {
    if (refreshing) return refreshing;
    refreshing = (async () => {
      setLoading(true);
      try {
        const next = await provider.getUsage();
        setUsage(() => next);
      } catch (error) {
        const next = provider.errorUsage(errorMessage(error));
        setUsage(() => next);
      } finally {
        setLoading(false);
        requestRender();
      }
    })().finally(() => {
      refreshing = void 0;
    });
    return refreshing;
  };
  void refresh();
  const timer = setInterval(() => void refresh(), interval.milliseconds);
  return {
    render: () => _$createComponent(provider.View, {
      usage,
      loading,
      theme,
      open,
      toggleOpen,
      requestRender
    }),
    dispose: () => clearInterval(timer)
  };
};
const mount = (rawOptions, theme, requestRender, register) => {
  const options = record(rawOptions) ? rawOptions : {};
  const enabled = parseProviders(options.providers);
  const runtimes = [];
  for (const id of enabled) {
    if (id === "codex") runtimes.push(createRuntime(providers.codex, options.refreshInterval, theme, requestRender));
    if (id === "opencode-go") runtimes.push(createRuntime(providers["opencode-go"], options.refreshInterval, theme, requestRender));
    if (id === "commandcode") runtimes.push(createRuntime(providers.commandcode, options.refreshInterval, theme, requestRender));
  }
  const unregister = register(() => (() => {
    var _el$ = _$createElement("box");
    _$setProp(_el$, "flexDirection", "column");
    _$insert(_el$, (() => {
      var _c$ = _$memo(() => runtimes.length > 0);
      return () => _c$() ? runtimes.map((runtime) => runtime.render()) : (() => {
        var _el$2 = _$createElement("text");
        _$insertNode(_el$2, _$createTextNode(`Enable usage providers in the opencode-multi-usage plugin config.`));
        _$effect((_$p) => _$setProp(_el$2, "fg", theme().warning, _$p));
        return _el$2;
      })();
    })());
    return _el$;
  })());
  return () => {
    for (const runtime of runtimes) runtime.dispose();
    unregister();
  };
};
const plugin = Plugin.define({
  id: "opencode.multi-usage.tui",
  setup(context) {
    return mount(context.options, () => ({
      text: context.theme.text.default,
      muted: context.theme.text.subdued,
      primary: context.theme.text.action.primary.default,
      error: context.theme.text.feedback.error.default,
      warning: context.theme.text.feedback.warning.default,
      success: context.theme.text.feedback.success.default
    }), () => context.renderer.requestRender(), (render) => context.ui.slot({
      append: "sidebar.content",
      render
    }));
  }
});
var tui_default = plugin;
export {
  tui_default as default
};
//# sourceMappingURL=tui.js.map