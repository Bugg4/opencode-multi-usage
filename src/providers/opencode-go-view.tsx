/** @jsxImportSource @opentui/solid */
import { Show } from "solid-js"
import type { GoUsage, GoWindow } from "./opencode-go.js"
import { Empty, pct, QuotaRow, remaining, Section, type UsageViewProps } from "../ui.js"

export function GoView(props: UsageViewProps<GoUsage>) {
  const shortSummary = () => {
    const usage = props.usage()
    if (!usage && props.loading()) return "(loading)"
    if (!usage || usage.error) return "(unavailable)"
    for (const [label, value] of [
      ["5h", remaining(usage.rolling?.percent ?? null)],
      ["1w", remaining(usage.weekly?.percent ?? null)],
      ["1mo", remaining(usage.monthly?.percent ?? null)],
    ] as const) {
      if (value !== null) return `(${label} ${pct(value)} left)`
    }
    return "(unavailable)"
  }
  const WindowRow = (row: { label: string; window: GoWindow }) => {
    const parsedReset = row.window.resetsAt === null ? Number.NaN : Date.parse(row.window.resetsAt)
    const resetAt = row.window.percent === 0 || Number.isNaN(parsedReset) ? null : parsedReset
    return (
      <QuotaRow
        label={row.label}
        remainingPercent={remaining(row.window.percent)}
        resetAt={resetAt}
        status={row.window.status !== "ok" ? row.window.status : null}
        unavailable={
          row.window.status !== null && row.window.status !== "ok" && row.window.percent === null
        }
        theme={props.theme}
        requestRender={props.requestRender}
      />
    )
  }

  return (
    <Section
      title="OpenCode Go Usage"
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
        <Show
          when={props.usage()!.rolling ?? props.usage()!.weekly ?? props.usage()!.monthly}
          fallback={<Empty theme={props.theme} />}
        >
          <Show when={props.usage()!.rolling}>
            {(window) => <WindowRow label="5h" window={window()} />}
          </Show>
          <Show when={props.usage()!.weekly}>
            {(window) => <WindowRow label="1w" window={window()} />}
          </Show>
          <Show when={props.usage()!.monthly}>
            {(window) => <WindowRow label="1mo" window={window()} />}
          </Show>
        </Show>
      </Show>
    </Section>
  )
}
