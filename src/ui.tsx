/** @jsxImportSource @opentui/solid */
import type { RGBA } from "@opentui/core"
import { createSignal, Show, type Accessor, type JSX } from "solid-js"

export type UsageTheme = {
  text: RGBA
  muted: RGBA
  primary: RGBA
  error: RGBA
  warning: RGBA
  success: RGBA
}

export type UsageViewProps<Usage extends { error?: string }> = {
  usage: Accessor<Usage | null>
  loading: Accessor<boolean>
  theme: Accessor<UsageTheme>
  open: Accessor<boolean>
  toggleOpen: () => void
  requestRender: () => void
}

export const pct = (value: number | null): string =>
  value === null ? "--%" : `${Math.round(value)}%`

export const remaining = (value: number | null): number | null =>
  value === null ? null : Math.max(0, Math.min(100, 100 - value))

export function Row(props: { theme: Accessor<UsageTheme>; children: JSX.Element }) {
  return (
    <box flexDirection="row" gap={1}>
      <text flexShrink={0} fg={props.theme().muted}>
        •
      </text>
      <text fg={props.theme().text} wrapMode="word">
        {props.children}
      </text>
    </box>
  )
}

export function Empty(props: { message?: string; theme: Accessor<UsageTheme> }) {
  return (
    <Row theme={props.theme}>
      <span style={{ fg: props.theme().muted }}>{props.message ?? "(unavailable)"}</span>
    </Row>
  )
}

export function PlanRow(props: { plan: string | null; theme: Accessor<UsageTheme> }) {
  return (
    <Row theme={props.theme}>
      Plan: <b>{props.plan ?? "unknown"}</b>
    </Row>
  )
}

export function QuotaRow(props: {
  label: string
  remainingPercent: number | null
  resetAt?: number | null
  status?: string | null
  unavailable?: boolean
  theme: Accessor<UsageTheme>
  requestRender: () => void
}) {
  const [resetOpen, setResetOpen] = createSignal(false)
  const hasReset = () =>
    props.resetAt !== null && props.resetAt !== undefined && props.resetAt > Date.now()
  const toggleReset = () => {
    setResetOpen((value) => !value)
    props.requestRender()
  }
  const resetLabel = () =>
    new Date(props.resetAt!).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const SummaryText = () => (
    <text fg={props.theme().text} wrapMode="word">
      {props.label}:{" "}
      <Show
        when={!props.unavailable}
        fallback={<span style={{ fg: props.theme().muted }}>(unavailable)</span>}
      >
        <span style={{ fg: props.theme().primary }}>{pct(props.remainingPercent)} left</span>
        <Show when={props.status}>
          <span style={{ fg: props.theme().warning }}> ({props.status})</span>
        </Show>
      </Show>
    </text>
  )
  const SummaryRow = () => (
    <box flexDirection="row" gap={1}>
      <text flexShrink={0} fg={props.theme().muted}>
        •
      </text>
      <SummaryText />
    </box>
  )

  if (!hasReset()) return <SummaryRow />
  return (
    <box>
      <box id={`usage-quota-${props.label}`} flexDirection="row" gap={1} onMouseDown={toggleReset}>
        <text flexShrink={0} fg={props.theme().muted}>
          {resetOpen() ? "▼" : "▶"}
        </text>
        <SummaryText />
      </box>
      <box paddingLeft={2} height={resetOpen() ? "auto" : 0} visible={resetOpen()}>
        <Row theme={props.theme}>Resets: {resetLabel()}</Row>
      </box>
    </box>
  )
}

export function Section(props: {
  title: string
  shortSummary: Accessor<string>
  loading: Accessor<boolean>
  available: Accessor<boolean>
  theme: Accessor<UsageTheme>
  open: Accessor<boolean>
  toggleOpen: () => void
  children: JSX.Element
}) {
  return (
    <box>
      <box flexDirection="row" gap={1} onMouseDown={props.toggleOpen}>
        <text fg={props.theme().text}>{props.open() ? "▼" : "▶"}</text>
        <text fg={props.theme().text}>
          <b>{props.title}</b>
          <Show when={!props.open()}>
            <span style={{ fg: props.theme().muted }}> {props.shortSummary()}</span>
          </Show>
        </text>
      </box>
      <Show when={props.open()}>
        <Show
          when={props.available()}
          fallback={
            <text fg={props.theme().muted}>
              {props.loading() ? "Loading usage..." : "Usage unavailable"}
            </text>
          }
        >
          {props.children}
        </Show>
      </Show>
    </box>
  )
}
