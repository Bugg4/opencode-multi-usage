import type { Context } from "@opencode/plugin/tui/context";
export declare const USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
export type WindowUsage = {
    usedPercent: number | null;
    remainingPercent: number | null;
    windowSeconds: number | null;
    resetAt: number | null;
};
export type CodexUsage = {
    plan: string | null;
    allowed: boolean | null;
    limitReached: boolean | null;
    primary: WindowUsage | null;
    secondary: WindowUsage | null;
    error?: string;
};
export type TuiClient = Context["client"];
export declare const emptyCodexUsage: (error: string) => CodexUsage;
export declare const accountIdFromToken: (token: string) => string | undefined;
export declare const parseCodexUsage: (value: unknown) => CodexUsage;
export declare const fetchCodexUsage: (access: string, accountId?: string) => Promise<CodexUsage>;
export declare const getCodexUsage: (client?: TuiClient) => Promise<CodexUsage>;
//# sourceMappingURL=codex.d.ts.map