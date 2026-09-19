import path from "node:path";
import { numberOrNull, opencodeDataFile, readJson, record, stringOrNull } from "../shared.js";
const DEFAULT_BASE_URL = "https://api.commandcode.ai";
const CC_VERSION = "1.54.0";
const USER_AGENT = "cli";
const PLAN_CREDITS = {
  "individual-go": 10,
  "individual-goat": 70,
  "individual-pro": 30,
  "individual-pro-v1": 80,
  "individual-provider": 15,
  "individual-max": 150,
  "individual-ultra": 300,
  "teams-pro": 40
};
const PLAN_NAMES = {
  "individual-go": "Go",
  "individual-goat": "GOAT",
  "individual-pro": "Pro",
  "individual-pro-v1": "Pro",
  "individual-provider": "Provider",
  "individual-max": "Max",
  "individual-ultra": "Ultra",
  "teams-pro": "Teams Pro"
};
const emptyCommandCodeUsage = (error) => ({
  plan: null,
  status: null,
  daysLeft: null,
  monthlyRemaining: null,
  extraRemaining: null,
  totalRemaining: null,
  usagePercent: null,
  periodCount: null,
  periodCost: null,
  fiveHour: null,
  weekly: null,
  monthly: null,
  error
});
const planInfo = (planId) => {
  if (!planId) return null;
  const key = planId.toLowerCase().replace(/_/g, "-");
  const match = Object.keys(PLAN_CREDITS).sort((a, b) => b.length - a.length).find((candidate) => key.startsWith(candidate));
  if (!match) return null;
  return { name: PLAN_NAMES[match] ?? match, monthly: PLAN_CREDITS[match] };
};
const parseCommandCodeWindow = (value) => {
  if (!record(value)) return null;
  return {
    used: numberOrNull(value.used),
    cap: numberOrNull(value.cap),
    resetAt: numberOrNull(value.resetAt)
  };
};
const readAuth = async () => {
  const keys = [];
  const add = (value) => {
    const key = stringOrNull(value);
    if (key && !keys.includes(key)) keys.push(key);
  };
  add(process.env.COMMANDCODE_USAGE_API_KEY);
  add(process.env.COMMANDCODE_API_KEY);
  add(process.env.COMMAND_CODE_API_KEY);
  add(process.env.CMD_API_KEY);
  try {
    const data = await readJson(path.join(process.env.HOME ?? "", ".commandcode", "auth.json"));
    if (record(data)) add(data.apiKey);
  } catch {
  }
  try {
    const data = process.env.OPENCODE_AUTH_CONTENT ? JSON.parse(process.env.OPENCODE_AUTH_CONTENT) : void 0;
    if (record(data) && record(data.commandcode)) {
      add(data.commandcode.key);
    }
  } catch {
  }
  try {
    const data = await readJson(opencodeDataFile("auth.json"));
    if (record(data) && record(data.commandcode)) add(data.commandcode.key);
  } catch {
  }
  return keys;
};
const commandCodeBaseUrl = () => stringOrNull(process.env.COMMANDCODE_API_URL) ?? DEFAULT_BASE_URL;
const commandCodeHeaders = (key) => ({
  Authorization: `Bearer ${key}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": USER_AGENT,
  "x-command-code-version": CC_VERSION,
  "x-cli-environment": "production"
});
class CommandCodeKeyRejectedError extends Error {
}
const fetchJson = async (key, suffix, fetcher) => {
  const response = await fetcher(`${commandCodeBaseUrl()}${suffix}`, {
    headers: commandCodeHeaders(key),
    signal: AbortSignal.timeout(1e4)
  });
  if (response.status === 401 || response.status === 403) {
    throw new CommandCodeKeyRejectedError(
      `CommandCode usage key rejected (${response.status}); run \`cmd auth login\` or set COMMANDCODE_USAGE_API_KEY`
    );
  }
  if (!response.ok) throw new Error(`Usage request failed (${response.status})`);
  return response.json();
};
const parseCommandCodeUsage = (creditsRaw, subRaw, summaryRaw) => {
  const credits = record(creditsRaw) && record(creditsRaw.credits) ? creditsRaw.credits : {};
  const sub = record(subRaw) && record(subRaw.data) ? subRaw.data : {};
  const summary = record(summaryRaw) ? summaryRaw : {};
  const monthly = numberOrNull(credits.monthlyCredits);
  const purchased = numberOrNull(credits.purchasedCredits) ?? 0;
  const free = numberOrNull(credits.freeCredits) ?? 0;
  const extra = Math.max(0, purchased) + Math.max(0, free);
  const totalRemaining = monthly === null ? null : Math.max(0, monthly) + extra;
  const plan = planInfo(stringOrNull(sub.planId));
  const periodCost = numberOrNull(summary.totalMonthlyCredits) ?? numberOrNull(summary.totalCost);
  const pool = plan && totalRemaining !== null ? plan.monthly + extra : periodCost !== null && totalRemaining !== null ? periodCost + totalRemaining : null;
  const usagePercent = pool !== null && pool > 0 && totalRemaining !== null ? Math.min(100, Math.max(0, (pool - totalRemaining) / pool * 100)) : null;
  const periodEnd = stringOrNull(sub.currentPeriodEnd);
  const end = periodEnd ? Date.parse(periodEnd) : Number.NaN;
  const windows = record(creditsRaw) && record(creditsRaw.windowLimits) ? creditsRaw.windowLimits : {};
  return {
    plan: plan?.name ?? stringOrNull(sub.planId),
    status: stringOrNull(sub.status),
    daysLeft: Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - Date.now()) / 864e5)),
    monthlyRemaining: monthly,
    extraRemaining: extra,
    totalRemaining,
    usagePercent,
    periodCount: numberOrNull(summary.totalCount),
    periodCost,
    fiveHour: parseCommandCodeWindow(windows.fiveHour),
    weekly: parseCommandCodeWindow(windows.weekly),
    monthly: parseCommandCodeWindow(windows.monthly)
  };
};
const getCommandCodeUsageWithKey = async (key, fetcher) => {
  const whoami = await fetchJson(key, "/alpha/whoami?limits=1", fetcher);
  const orgId = record(whoami) && record(whoami.org) ? stringOrNull(whoami.org.id) : null;
  const suffix = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
  const [creditsRaw, subRaw] = await Promise.all([
    fetchJson(key, `/alpha/billing/credits${suffix}`, fetcher),
    fetchJson(key, `/alpha/billing/subscriptions${suffix}`, fetcher)
  ]);
  const sub = record(subRaw) && record(subRaw.data) ? subRaw.data : {};
  const since = stringOrNull(sub.currentPeriodStart);
  const summaryRaw = await fetchJson(
    key,
    `/alpha/usage/summary${suffix ? `${suffix}&` : "?"}${since ? `since=${encodeURIComponent(since)}` : ""}`,
    fetcher
  );
  return parseCommandCodeUsage(creditsRaw, subRaw, summaryRaw);
};
const getCommandCodeUsage = async (dependencies = {}) => {
  const fetcher = dependencies.fetcher ?? fetch;
  const keys = dependencies.authCandidates ?? await readAuth();
  if (keys.length === 0) {
    throw new Error("Run `cmd auth login` or set COMMANDCODE_USAGE_API_KEY first");
  }
  let rejected;
  for (const candidate of keys) {
    try {
      return await getCommandCodeUsageWithKey(candidate, fetcher);
    } catch (error) {
      if (!(error instanceof CommandCodeKeyRejectedError)) throw error;
      rejected = error;
    }
  }
  throw rejected ?? new Error("No CommandCode credential can access usage; run `cmd auth login` first");
};
export {
  CC_VERSION,
  DEFAULT_BASE_URL,
  PLAN_CREDITS,
  PLAN_NAMES,
  USER_AGENT,
  commandCodeBaseUrl,
  commandCodeHeaders,
  emptyCommandCodeUsage,
  getCommandCodeUsage,
  parseCommandCodeUsage,
  parseCommandCodeWindow,
  planInfo
};
//# sourceMappingURL=commandcode.js.map