import type { Context } from "@opencode/plugin/tui/context";
export type TuiClient = Context["client"];
export declare const DEFAULT_BASE_URL = "https://api.commandcode.ai";
export declare const CC_VERSION = "1.54.0";
export declare const USER_AGENT = "cli";
export declare const PLAN_CREDITS: Record<string, number>;
export declare const PLAN_NAMES: Record<string, string>;
export type CCWindow = {
    used: number | null;
    cap: number | null;
    resetAt: number | null;
};
export type CommandCodeUsage = {
    plan: string | null;
    status: string | null;
    daysLeft: number | null;
    monthlyRemaining: number | null;
    extraRemaining: number | null;
    totalRemaining: number | null;
    usagePercent: number | null;
    periodCount: number | null;
    periodCost: number | null;
    fiveHour: CCWindow | null;
    weekly: CCWindow | null;
    monthly: CCWindow | null;
    error?: string;
};
export declare const emptyCommandCodeUsage: (error: string) => CommandCodeUsage;
export declare const planInfo: (planId: string | null) => {
    name: string;
    monthly: number;
} | null;
export declare const parseCommandCodeWindow: (value: unknown) => CCWindow | null;
/**
 * Credential candidates in trial order: the explicit usage key, then preferred
 * keys such as the live OpenCode V2 credential, then the local fallbacks.
 */
export declare const commandCodeAuthCandidates: (preferred?: readonly string[]) => Promise<string[]>;
export declare const commandCodeBaseUrl: () => string;
export declare const commandCodeHeaders: (key: string) => Record<string, string>;
export type CommandCodeUsageDependencies = {
    fetcher?: typeof fetch;
    authCandidates?: readonly string[];
    preferredAuth?: readonly string[];
    client?: TuiClient;
};
export declare const parseCommandCodeUsage: (creditsRaw: unknown, subRaw: unknown, summaryRaw: unknown) => CommandCodeUsage;
export declare const getCommandCodeUsage: (dependencies?: CommandCodeUsageDependencies) => Promise<CommandCodeUsage>;
//# sourceMappingURL=commandcode.d.ts.map