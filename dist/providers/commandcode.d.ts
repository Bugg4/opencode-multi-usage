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
export declare const commandCodeBaseUrl: () => string;
export declare const commandCodeHeaders: (key: string) => Record<string, string>;
export type CommandCodeUsageDependencies = {
    fetcher?: typeof fetch;
    authCandidates?: readonly string[];
};
export declare const parseCommandCodeUsage: (creditsRaw: unknown, subRaw: unknown, summaryRaw: unknown) => CommandCodeUsage;
export declare const getCommandCodeUsage: (dependencies?: CommandCodeUsageDependencies) => Promise<CommandCodeUsage>;
//# sourceMappingURL=commandcode.d.ts.map