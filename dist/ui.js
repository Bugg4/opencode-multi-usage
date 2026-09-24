import { createComponent as _$createComponent } from "@opentui/solid";
import { memo as _$memo } from "@opentui/solid";
import { effect as _$effect } from "@opentui/solid";
import { insert as _$insert } from "@opentui/solid";
import { createTextNode as _$createTextNode } from "@opentui/solid";
import { insertNode as _$insertNode } from "@opentui/solid";
import { setProp as _$setProp } from "@opentui/solid";
import { createElement as _$createElement } from "@opentui/solid";
import { createSignal, Show } from "solid-js";
const pct = (value) => value === null ? "--%" : `${Math.round(value)}%`;
const remaining = (value) => value === null ? null : Math.max(0, Math.min(100, 100 - value));
function Row(props) {
  return (() => {
    var _el$ = _$createElement("box"), _el$2 = _$createElement("text"), _el$4 = _$createElement("text");
    _$insertNode(_el$, _el$2);
    _$insertNode(_el$, _el$4);
    _$setProp(_el$, "flexDirection", "row");
    _$setProp(_el$, "gap", 1);
    _$insertNode(_el$2, _$createTextNode(`\u2022`));
    _$setProp(_el$2, "flexShrink", 0);
    _$setProp(_el$4, "wrapMode", "word");
    _$insert(_el$4, () => props.children);
    _$effect((_p$) => {
      var _v$ = props.theme().muted, _v$2 = props.theme().text;
      _v$ !== _p$.e && (_p$.e = _$setProp(_el$2, "fg", _v$, _p$.e));
      _v$2 !== _p$.t && (_p$.t = _$setProp(_el$4, "fg", _v$2, _p$.t));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
}
function Empty(props) {
  return _$createComponent(Row, {
    get theme() {
      return props.theme;
    },
    get children() {
      var _el$5 = _$createElement("span");
      _$insert(_el$5, () => props.message ?? "(unavailable)");
      _$effect((_$p) => _$setProp(_el$5, "style", {
        fg: props.theme().muted
      }, _$p));
      return _el$5;
    }
  });
}
function PlanRow(props) {
  return _$createComponent(Row, {
    get theme() {
      return props.theme;
    },
    get children() {
      return ["Plan: ", (() => {
        var _el$6 = _$createElement("b");
        _$insert(_el$6, () => props.plan ?? "unknown");
        return _el$6;
      })()];
    }
  });
}
function QuotaRow(props) {
  const [resetOpen, setResetOpen] = createSignal(false);
  const hasReset = () => props.resetAt !== null && props.resetAt !== void 0 && props.resetAt > Date.now();
  const toggleReset = () => {
    setResetOpen((value) => !value);
    props.requestRender();
  };
  const resetLabel = () => new Date(props.resetAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const SummaryText = () => (() => {
    var _el$7 = _$createElement("text"), _el$8 = _$createTextNode(`: `);
    _$insertNode(_el$7, _el$8);
    _$setProp(_el$7, "wrapMode", "word");
    _$insert(_el$7, () => props.label, _el$8);
    _$insert(_el$7, _$createComponent(Show, {
      get when() {
        return !props.unavailable;
      },
      get fallback() {
        return (() => {
          var _el$13 = _$createElement("span");
          _$insertNode(_el$13, _$createTextNode(`(unavailable)`));
          _$effect((_$p) => _$setProp(_el$13, "style", {
            fg: props.theme().muted
          }, _$p));
          return _el$13;
        })();
      },
      get children() {
        return [(() => {
          var _el$0 = _$createElement("span"), _el$1 = _$createTextNode(` left`);
          _$insertNode(_el$0, _el$1);
          _$insert(_el$0, () => pct(props.remainingPercent), _el$1);
          _$effect((_$p) => _$setProp(_el$0, "style", {
            fg: props.theme().primary
          }, _$p));
          return _el$0;
        })(), _$createComponent(Show, {
          get when() {
            return props.status;
          },
          get children() {
            var _el$10 = _$createElement("span"), _el$11 = _$createTextNode(` (`), _el$12 = _$createTextNode(`)`);
            _$insertNode(_el$10, _el$11);
            _$insertNode(_el$10, _el$12);
            _$insert(_el$10, () => props.status, _el$12);
            _$effect((_$p) => _$setProp(_el$10, "style", {
              fg: props.theme().warning
            }, _$p));
            return _el$10;
          }
        })];
      }
    }), null);
    _$effect((_$p) => _$setProp(_el$7, "fg", props.theme().text, _$p));
    return _el$7;
  })();
  const SummaryRow = () => (() => {
    var _el$15 = _$createElement("box"), _el$16 = _$createElement("text");
    _$insertNode(_el$15, _el$16);
    _$setProp(_el$15, "flexDirection", "row");
    _$setProp(_el$15, "gap", 1);
    _$insertNode(_el$16, _$createTextNode(`\u2022`));
    _$setProp(_el$16, "flexShrink", 0);
    _$insert(_el$15, _$createComponent(SummaryText, {}), null);
    _$effect((_$p) => _$setProp(_el$16, "fg", props.theme().muted, _$p));
    return _el$15;
  })();
  if (!hasReset()) return _$createComponent(SummaryRow, {});
  return (() => {
    var _el$18 = _$createElement("box"), _el$19 = _$createElement("box"), _el$20 = _$createElement("text"), _el$21 = _$createElement("box");
    _$insertNode(_el$18, _el$19);
    _$insertNode(_el$18, _el$21);
    _$insertNode(_el$19, _el$20);
    _$setProp(_el$19, "flexDirection", "row");
    _$setProp(_el$19, "gap", 1);
    _$setProp(_el$19, "onMouseDown", toggleReset);
    _$setProp(_el$20, "flexShrink", 0);
    _$insert(_el$20, () => resetOpen() ? "\u25BC" : "\u25B6");
    _$insert(_el$19, _$createComponent(SummaryText, {}), null);
    _$setProp(_el$21, "paddingLeft", 2);
    _$insert(_el$21, _$createComponent(Row, {
      get theme() {
        return props.theme;
      },
      get children() {
        return ["Resets: ", _$memo(() => resetLabel())];
      }
    }));
    _$effect((_p$) => {
      var _v$3 = `usage-quota-${props.label}`, _v$4 = props.theme().muted, _v$5 = resetOpen() ? "auto" : 0, _v$6 = resetOpen();
      _v$3 !== _p$.e && (_p$.e = _$setProp(_el$19, "id", _v$3, _p$.e));
      _v$4 !== _p$.t && (_p$.t = _$setProp(_el$20, "fg", _v$4, _p$.t));
      _v$5 !== _p$.a && (_p$.a = _$setProp(_el$21, "height", _v$5, _p$.a));
      _v$6 !== _p$.o && (_p$.o = _$setProp(_el$21, "visible", _v$6, _p$.o));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
    return _el$18;
  })();
}
function Section(props) {
  return (() => {
    var _el$22 = _$createElement("box"), _el$23 = _$createElement("box"), _el$24 = _$createElement("text"), _el$25 = _$createElement("text"), _el$26 = _$createElement("b");
    _$insertNode(_el$22, _el$23);
    _$insertNode(_el$23, _el$24);
    _$insertNode(_el$23, _el$25);
    _$setProp(_el$23, "flexDirection", "row");
    _$setProp(_el$23, "gap", 1);
    _$insert(_el$24, () => props.open() ? "\u25BC" : "\u25B6");
    _$insertNode(_el$25, _el$26);
    _$insert(_el$26, () => props.title);
    _$insert(_el$25, _$createComponent(Show, {
      get when() {
        return !props.open();
      },
      get children() {
        var _el$27 = _$createElement("span"), _el$28 = _$createTextNode(` `);
        _$insertNode(_el$27, _el$28);
        _$insert(_el$27, () => props.shortSummary(), null);
        _$effect((_$p) => _$setProp(_el$27, "style", {
          fg: props.theme().muted
        }, _$p));
        return _el$27;
      }
    }), null);
    _$insert(_el$22, _$createComponent(Show, {
      get when() {
        return props.open();
      },
      get children() {
        return _$createComponent(Show, {
          get when() {
            return props.available();
          },
          get fallback() {
            return (() => {
              var _el$29 = _$createElement("text");
              _$insert(_el$29, () => props.loading() ? "Loading usage..." : "Usage unavailable");
              _$effect((_$p) => _$setProp(_el$29, "fg", props.theme().muted, _$p));
              return _el$29;
            })();
          },
          get children() {
            return props.children;
          }
        });
      }
    }), null);
    _$effect((_p$) => {
      var _v$7 = props.toggleOpen, _v$8 = props.theme().text, _v$9 = props.theme().text;
      _v$7 !== _p$.e && (_p$.e = _$setProp(_el$23, "onMouseDown", _v$7, _p$.e));
      _v$8 !== _p$.t && (_p$.t = _$setProp(_el$24, "fg", _v$8, _p$.t));
      _v$9 !== _p$.a && (_p$.a = _$setProp(_el$25, "fg", _v$9, _p$.a));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$22;
  })();
}
export {
  Empty,
  PlanRow,
  QuotaRow,
  Row,
  Section,
  pct,
  remaining
};
//# sourceMappingURL=ui.js.map