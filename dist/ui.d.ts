/** @jsxImportSource @opentui/solid */
import type { RGBA } from "@opentui/core";
import { type Accessor, type JSX } from "solid-js";
export type UsageTheme = {
    text: RGBA;
    muted: RGBA;
    primary: RGBA;
    error: RGBA;
    warning: RGBA;
    success: RGBA;
};
export type UsageViewProps<Usage extends {
    error?: string;
}> = {
    usage: Accessor<Usage | null>;
    loading: Accessor<boolean>;
    theme: Accessor<UsageTheme>;
    open: Accessor<boolean>;
    toggleOpen: () => void;
    requestRender: () => void;
};
export declare const pct: (value: number | null) => string;
export declare const remaining: (value: number | null) => number | null;
export declare function Row(props: {
    theme: Accessor<UsageTheme>;
    children: JSX.Element;
}): JSX.Element;
export declare function Empty(props: {
    message?: string;
    theme: Accessor<UsageTheme>;
}): JSX.Element;
export declare function PlanRow(props: {
    plan: string | null;
    theme: Accessor<UsageTheme>;
}): JSX.Element;
export declare function QuotaRow(props: {
    label: string;
    remainingPercent: number | null;
    resetAt?: number | null;
    status?: string | null;
    unavailable?: boolean;
    theme: Accessor<UsageTheme>;
    requestRender: () => void;
}): JSX.Element;
export declare function Section(props: {
    title: string;
    shortSummary: Accessor<string>;
    loading: Accessor<boolean>;
    available: Accessor<boolean>;
    theme: Accessor<UsageTheme>;
    open: Accessor<boolean>;
    toggleOpen: () => void;
    children: JSX.Element;
}): JSX.Element;
//# sourceMappingURL=ui.d.ts.map