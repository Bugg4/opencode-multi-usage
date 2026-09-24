import { createComponent as _$createComponent } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { Show } from "solid-js";
import { Empty, pct, QuotaRow, remaining, Section } from "../ui.js";
function GoView(props) {
  const shortSummary = () => {
    const usage = props.usage();
    if (!usage && props.loading()) return "(loading)";
    if (!usage || usage.error) return "(unavailable)";
    for (const [label, value] of [["5h", remaining(usage.rolling?.percent ?? null)], ["1w", remaining(usage.weekly?.percent ?? null)], ["1mo", remaining(usage.monthly?.percent ?? null)]]) {
      if (value !== null) return `(${label} ${pct(value)} left)`;
    }
    return "(unavailable)";
  };
  const WindowRow = (row) => {
    const parsedReset = row.window.resetsAt === null ? Number.NaN : Date.parse(row.window.resetsAt);
    const resetAt = row.window.percent === 0 || Number.isNaN(parsedReset) ? null : parsedReset;
    return _$createComponent(QuotaRow, {
      get label() {
        return row.label;
      },
      get remainingPercent() {
        return remaining(row.window.percent);
      },
      resetAt,
      get status() {
        return _$memo(() => row.window.status !== "ok")() ? row.window.status : null;
      },
      get unavailable() {
        return _$memo(() => !!(row.window.status !== null && row.window.status !== "ok"))() && row.window.percent === null;
      },
      get theme() {
        return props.theme;
      },
      get requestRender() {
        return props.requestRender;
      }
    });
  };
  return _$createComponent(Section, {
    title: "OpenCode Go Usage",
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
          return _$createComponent(Show, {
            get when() {
              return props.usage().rolling ?? props.usage().weekly ?? props.usage().monthly;
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
                  return props.usage().rolling;
                },
                children: (window) => _$createComponent(WindowRow, {
                  label: "5h",
                  get window() {
                    return window();
                  }
                })
              }), _$createComponent(Show, {
                get when() {
                  return props.usage().weekly;
                },
                children: (window) => _$createComponent(WindowRow, {
                  label: "1w",
                  get window() {
                    return window();
                  }
                })
              }), _$createComponent(Show, {
                get when() {
                  return props.usage().monthly;
                },
                children: (window) => _$createComponent(WindowRow, {
                  label: "1mo",
                  get window() {
                    return window();
                  }
                })
              })];
            }
          });
        }
      });
    }
  });
}
export {
  GoView
};
//# sourceMappingURL=opencode-go-view.js.map