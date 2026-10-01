/** @jsxImportSource @opentui/solid */
import { Show } from "solid-js"
import { codexSummary, windowLabel, type CodexUsage, type WindowUsage } from "./codex.js"
import { Empty, PlanRow, QuotaRow, Row, Section, type UsageViewProps } from "../ui.js"

export function CodexView(props: UsageViewProps<CodexUsage>) {
  const shortSummary = () => {
    const usage = props.usage()
    if (!usage && props.loading()) return "(loading)"
    if (!usage) return "(unavailable)"
    return codexSummary(usage)
  }
  const statusColor = () => {
    const usage = props.usage()
    return usage?.allowed === false || usage?.limitReached === true
      ? props.theme().error
      : props.theme().success
  }
  const statusText = () => {
    const usage = props.usage()!
    const allowed =
      usage.allowed === true
        ? "Allowed"
        : usage.allowed === false
          ? "Not allowed"
          : "Allowed unknown"
    return usage.limitReached === true ? `${allowed} - limit reached` : allowed
  }
  const WindowRow = (row: { label: string; window: WindowUsage }) => (
    <QuotaRow
      label={windowLabel(row.window, row.label)}
      remainingPercent={row.window.remainingPercent}
      resetAt={row.window.resetAt === null ? null : row.window.resetAt * 1000}
      theme={props.theme}
      requestRender={props.requestRender}
    />
  )

  return (
    <Section
      title="Codex Usage"
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
          when={props.usage()!.primary ?? props.usage()!.secondary}
          fallback={
            <Empty
              message={props.usage()!.limitReached === true ? "Limit reached" : undefined}
              theme={props.theme}
            />
          }
        >
          <Show when={props.usage()!.primary}>
            {(window) => <WindowRow label="Primary" window={window()} />}
          </Show>
          <Show when={props.usage()!.secondary}>
            {(window) => <WindowRow label="Secondary" window={window()} />}
          </Show>
        </Show>
        <Row theme={props.theme}>
          Status: <span style={{ fg: statusColor() }}>{statusText()}</span>
        </Row>
      </Show>
    </Section>
  )
}
