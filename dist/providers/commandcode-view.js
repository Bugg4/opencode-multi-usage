import { setProp as _$setProp } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { createComponent as _$createComponent } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { Show } from "solid-js";
import { Empty, pct, PlanRow, QuotaRow, Row, Section } from "../ui.js";
const money = (value) => value === null ? "--" : `$${value.toFixed(2)}`;
const windowPct = (window) => window.used === null || window.cap === null || window.cap <= 0 ? null : Math.min(100, window.used / window.cap * 100);
const blankWindow = {
  used: null,
  cap: null,
  resetAt: null
};
function CommandCodeView(props) {
  const shortSummary = () => {
    const usage = props.usage();
    if (!usage && props.loading()) return "(loading)";
    if (!usage || usage.error) return "(unavailable)";
    const fiveHour = windowPct(usage.fiveHour ?? blankWindow);
    if (fiveHour !== null) return `(5h ${pct(100 - fiveHour)} left)`;
    const weekly = windowPct(usage.weekly ?? blankWindow);
    if (weekly !== null) return `(1w ${pct(100 - weekly)} left)`;
    const monthly = windowPct(usage.monthly ?? blankWindow);
    return monthly === null ? "(unavailable)" : `(1mo ${pct(100 - monthly)} left)`;
  };
  const WindowRow = (row) => {
    const used = () => windowPct(row.window);
    return _$createComponent(QuotaRow, {
      get label() {
        return row.label;
      },
      get remainingPercent() {
        return _$memo(() => used() === null)() ? null : 100 - used();
      },
      get resetAt() {
        return row.window.resetAt;
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
    title: "CommandCode Usage",
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
              return props.usage().fiveHour ?? props.usage().weekly ?? props.usage().monthly;
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
                  return props.usage().fiveHour;
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
          }), _$createComponent(Row, {
            get theme() {
              return props.theme;
            },
            get children() {
              return ["Credits:", " ", (() => {
                var _el$ = _$createElement("span"), _el$2 = _$createTextNode(` left`);
                _$insertNode(_el$, _el$2);
                _$insert(_el$, () => money(props.usage().totalRemaining), _el$2);
                _$effect((_$p) => _$setProp(_el$, "style", {
                  fg: props.theme().primary
                }, _$p));
                return _el$;
              })()];
            }
          }), _$createComponent(Show, {
            get when() {
              return props.usage().periodCount !== null || props.usage().daysLeft !== null;
            },
            get children() {
              return _$createComponent(Row, {
                get theme() {
                  return props.theme;
                },
                get children() {
                  return [_$createComponent(Show, {
                    get when() {
                      return props.usage().periodCount !== null;
                    },
                    get children() {
                      return [_$memo(() => props.usage().periodCount.toLocaleString()), " requests -", " ", _$memo(() => money(props.usage().periodCost)), " spent"];
                    }
                  }), _$createComponent(Show, {
                    get when() {
                      return props.usage().daysLeft !== null;
                    },
                    get children() {
                      var _el$3 = _$createElement("span"), _el$4 = _$createTextNode(` - `);
                      _$insertNode(_el$3, _el$4);
                      _$insert(_el$3, (() => {
                        var _c$ = _$memo(() => props.usage().daysLeft === 0);
                        return () => _c$() ? "renews today" : `${props.usage().daysLeft}d to renew`;
                      })(), null);
                      _$effect((_$p) => _$setProp(_el$3, "style", {
                        fg: props.theme().muted
                      }, _$p));
                      return _el$3;
                    }
                  }), _$createComponent(Show, {
                    get when() {
                      return (props.usage().extraRemaining ?? 0) > 0;
                    },
                    get children() {
                      var _el$7 = _$createElement("span"), _el$8 = _$createTextNode(` - Extra: `);
                      _$insertNode(_el$7, _el$8);
                      _$insert(_el$7, () => money(props.usage().extraRemaining), null);
                      _$effect((_$p) => _$setProp(_el$7, "style", {
                        fg: props.theme().muted
                      }, _$p));
                      return _el$7;
                    }
                  })];
                }
              });
            }
          })];
        }
      });
    }
  });
}
export {
  CommandCodeView
};
//# sourceMappingURL=commandcode-view.js.map