import { setProp as _$setProp } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { Show } from "solid-js";
import { Empty, pct, PlanRow, QuotaRow, Row, Section } from "../ui.js";
const windowLabel = (window, fallback) => {
  if (window.windowSeconds === null) return fallback;
  const hours = Math.max(1, Math.round(window.windowSeconds / 3600));
  const days = Math.round(hours / 24);
  if (hours >= 24 && days % 7 === 0) return `${days / 7}w`;
  return hours >= 24 ? `${days}d` : `${hours}h`;
};
function CodexView(props) {
  const shortSummary = () => {
    const usage = props.usage();
    if (!usage && props.loading()) return "(loading)";
    if (!usage || usage.error) return "(unavailable)";
    if (usage.primary?.remainingPercent !== null && usage.primary?.remainingPercent !== void 0) {
      return `(5h ${pct(usage.primary.remainingPercent)} left)`;
    }
    return usage.secondary ? `(${windowLabel(usage.secondary, "wk")} ${pct(usage.secondary.remainingPercent)} left)` : "(unavailable)";
  };
  const statusColor = () => {
    const usage = props.usage();
    return usage?.allowed === false || usage?.limitReached === true ? props.theme().error : props.theme().success;
  };
  const statusText = () => {
    const usage = props.usage();
    const allowed = usage.allowed === true ? "Allowed" : usage.allowed === false ? "Not allowed" : "Allowed unknown";
    return usage.limitReached === true ? `${allowed} - limit reached` : allowed;
  };
  const WindowRow = (row) => _$createComponent(QuotaRow, {
    get label() {
      return windowLabel(row.window, row.label);
    },
    get remainingPercent() {
      return row.window.remainingPercent;
    },
    get resetAt() {
      return _$memo(() => row.window.resetAt === null)() ? null : row.window.resetAt * 1e3;
    },
    get theme() {
      return props.theme;
    },
    get requestRender() {
      return props.requestRender;
    }
  });
  return _$createComponent(Section, {
    title: "Codex Usage",
    shortSummary,
    get loading() {
      return props.loading;
    },
    available: () => props.usage() !== null,
    get theme() {
      return props.theme;
    },
    get open() {
      return props.open;
    },
    get toggleOpen() {
      return props.toggleOpen;
    },
    get children() {
      return _$createComponent(Show, {
        get when() {
          return !props.usage().error;
        },
        get fallback() {
          return _$createComponent(Empty, {
            get message() {
              return props.usage().error;
            },
            get theme() {
              return props.theme;
            }
          });
        },
        get children() {
          return [_$createComponent(PlanRow, {
            get plan() {
              return props.usage().plan;
            },
            get theme() {
              return props.theme;
            }
          }), _$createComponent(Show, {
            get when() {
              return props.usage().primary ?? props.usage().secondary;
            },
            get fallback() {
              return _$createComponent(Empty, {
                get theme() {
                  return props.theme;
                }
              });
            },
            get children() {
              return [_$createComponent(Show, {
                get when() {
                  return props.usage().primary;
                },
                children: (window) => _$createComponent(WindowRow, {
                  label: "Primary",
                  get window() {
                    return window();
                  }
                })
              }), _$createComponent(Show, {
                get when() {
                  return props.usage().secondary;
                },
                children: (window) => _$createComponent(WindowRow, {
                  label: "Secondary",
                  get window() {
                    return window();
                  }
                })
              })];
            }
          }), _$createComponent(Row, {
            get theme() {
              return props.theme;
            },
            get children() {
              return ["Status: ", (() => {
                var _el$ = _$createElement("span");
                _$insert(_el$, statusText);
                _$effect((_$p) => _$setProp(_el$, "style", {
                  fg: statusColor()
                }, _$p));
                return _el$;
              })()];
            }
          })];
        }
      });
    }
  });
}
export {
  CodexView
};
//# sourceMappingURL=codex-view.js.map