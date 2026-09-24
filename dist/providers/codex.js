import { MultiUsageRpc } from "../rpc.js";
import {
  opencodeDataFile,
  booleanOrNull,
  numberOrNull,
  readJson,
  record,
  stringOrNull
} from "../shared.js";
const USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const emptyCodexUsage = (error) => ({
  plan: null,
  allowed: null,
  limitReached: null,
  primary: null,
  secondary: null,
  error
});
const accountIdFromToken = (token) => {
  const payload = token.split(".")[1];
  if (!payload) return void 0;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!record(claims)) return void 0;
    const direct = stringOrNull(claims.chatgpt_account_id);
    if (direct) return direct;
    const authClaims = record(claims["https://api.openai.com/auth"]) ? claims["https://api.openai.com/auth"] : void 0;
    const nested = record(authClaims) ? stringOrNull(authClaims.chatgpt_account_id) : null;
    if (nested) return nested;
    const organizations = Array.isArray(claims.organizations) ? claims.organizations : [];
    const organization = organizations.find((item) => record(item) && stringOrNull(item.id));
    return record(organization) ? stringOrNull(organization.id) ?? void 0 : void 0;
  } catch {
    return void 0;
  }
};
const parseWindow = (value) => {
  if (!record(value)) return null;
  const usedPercent = numberOrNull(value.used_percent);
  return {
    usedPercent,
    remainingPercent: usedPercent === null ? null : Math.max(0, Math.min(100, 100 - usedPercent)),
    windowSeconds: numberOrNull(value.limit_window_seconds),
    resetAt: numberOrNull(value.reset_at)
  };
};
const parseCodexUsage = (value) => {
  const data = record(value) ? value : {};
  const rateLimit = record(data.rate_limit) ? data.rate_limit : {};
  return {
    plan: stringOrNull(data.plan_type),
    allowed: booleanOrNull(rateLimit.allowed),
    limitReached: booleanOrNull(rateLimit.limit_reached),
    primary: parseWindow(rateLimit.primary_window),
    secondary: parseWindow(rateLimit.secondary_window)
  };
};
const fetchCodexUsage = async (access, accountId) => {
  const headers = new Headers({
    Authorization: `Bearer ${access}`,
    Accept: "application/json"
  });
  if (accountId) headers.set("ChatGPT-Account-ID", accountId);
  const response = await fetch(USAGE_URL, {
    headers,
    signal: AbortSignal.timeout(1e4)
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error("ChatGPT session expired; reconnect from /connect");
  }
  if (!response.ok) throw new Error(`Usage request failed (${response.status})`);
  return parseCodexUsage(await response.json());
};
const readAuth = async () => {
  const environmentToken = stringOrNull(process.env.CHATGPT_ACCESS_TOKEN);
  if (environmentToken) {
    return {
      access: environmentToken,
      accountId: stringOrNull(process.env.CHATGPT_ACCOUNT_ID) ?? accountIdFromToken(environmentToken)
    };
  }
  const data = process.env.OPENCODE_AUTH_CONTENT ? JSON.parse(process.env.OPENCODE_AUTH_CONTENT) : await readJson(opencodeDataFile("auth.json"));
  const openai = record(data) && record(data.openai) ? data.openai : {};
  const access = stringOrNull(openai.access);
  return {
    access: access ?? void 0,
    accountId: stringOrNull(openai.accountId) ?? (access ? accountIdFromToken(access) : void 0)
  };
};
const getLocalCodexUsage = async () => {
  const auth = await readAuth();
  if (!auth.access) throw new Error("Connect ChatGPT from /connect first");
  return fetchCodexUsage(auth.access, auth.accountId);
};
const isRpcMethodError = (error) => record(error) && typeof error.type === "string" && !error.type.startsWith("rpc.");
const getCodexUsage = async (client) => {
  if (client) {
    try {
      return await client.rpc(MultiUsageRpc).codexUsage({});
    } catch (error) {
      if (isRpcMethodError(error)) throw error;
    }
  }
  return getLocalCodexUsage();
};
export {
  USAGE_URL,
  accountIdFromToken,
  emptyCodexUsage,
  fetchCodexUsage,
  getCodexUsage,
  parseCodexUsage
};
//# sourceMappingURL=codex.js.map