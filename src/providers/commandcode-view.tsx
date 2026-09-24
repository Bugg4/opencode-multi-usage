/** @jsxImportSource @opentui/solid */
import { Show } from "solid-js"
import type { CCWindow, CommandCodeUsage } from "./commandcode.js"
import { Empty, pct, PlanRow, QuotaRow, Row, Section, type UsageViewProps } from "../ui.js"

const money = (value: number | null): string => (value === null ? "--" : `$${value.toFixed(2)}`)

const windowPct = (window: CCWindow): number | null =>
  window.used === null || window.cap === null || window.cap <= 0
    ? null
    : Math.min(100, (window.used / window.cap) * 100)

const blankWindow: CCWindow = { used: null, cap: null, resetAt: null }

export function CommandCodeView(props: UsageViewProps<CommandCodeUsage>) {
  const shortSummary = () => {
    const usage = props.usage()
    if (!usage && props.loading()) return "(loading)"
    if (!usage || usage.error) return "(unavailable)"
    const fiveHour = windowPct(usage.fiveHour ?? blankWindow)
    if (fiveHour !== null) return `(5h ${pct(100 - fiveHour)} left)`
    const weekly = windowPct(usage.weekly ?? blankWindow)
    if (weekly !== null) return `(1w ${pct(100 - weekly)} left)`
    const monthly = windowPct(usage.monthly ?? blankWindow)
    return monthly === null ? "(unavailable)" : `(1mo ${pct(100 - monthly)} left)`
  }
  const WindowRow = (row: { label: string; window: CCWindow }) => {
    const used = () => windowPct(row.window)
    return (
      <QuotaRow
        label={row.label}
        remainingPercent={used() === null ? null : 100 - used()!}
        resetAt={row.window.resetAt}
        theme={props.theme}
        requestRender={props.requestRender}
      />
    )
  }

  return (
    <Section
      title="CommandCode Usage"
      shortSummary={shortSummary}
      loading={props.loading}
      available={() => props.usage() !== null}
      theme={props.theme}
      open={props.open}
      toggleOpen={props.toggleOpen}
    >
      <Show
        when={!props.usage()!.error}
        fallback={<Empty message={props.usage()!.error} theme={props.theme} />}
      >
        <PlanRow plan={props.usage()!.plan} theme={props.theme} />
        <Show
          when={props.usage()!.fiveHour ?? props.usage()!.weekly ?? props.usage()!.monthly}
          fallback={<Empty theme={props.theme} />}
        >
          <Show when={props.usage()!.fiveHour}>
            {(window) => <WindowRow label="5h" window={window()} />}
          </Show>
          <Show when={props.usage()!.weekly}>
            {(window) => <WindowRow label="1w" window={window()} />}
          </Show>
          <Show when={props.usage()!.monthly}>
            {(window) => <WindowRow label="1mo" window={window()} />}
          </Show>
        </Show>
        <Row theme={props.theme}>
          Credits:{" "}
          <span style={{ fg: props.theme().primary }}>
            {money(props.usage()!.totalRemaining)} left
          </span>
        </Row>
        <Show when={props.usage()!.periodCount !== null || props.usage()!.daysLeft !== null}>
          <Row theme={props.theme}>
            <Show when={props.usage()!.periodCount !== null}>
              {props.usage()!.periodCount!.toLocaleString()} requests -{" "}
              {money(props.usage()!.periodCost)} spent
            </Show>
            <Show when={props.usage()!.daysLeft !== null}>
              <span style={{ fg: props.theme().muted }}>
                {" "}
                -{" "}
                {props.usage()!.daysLeft === 0
                  ? "renews today"
                  : `${props.usage()!.daysLeft}d to renew`}
              </span>
            </Show>
            <Show when={(props.usage()!.extraRemaining ?? 0) > 0}>
              <span style={{ fg: props.theme().muted }}>
                {" "}
                - Extra: {money(props.usage()!.extraRemaining)}
              </span>
            </Show>
          </Row>
        </Show>
      </Show>
    </Section>
  )
}
