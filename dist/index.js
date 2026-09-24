import { Plugin } from "@opencode/plugin";
import { accountIdFromToken, fetchCodexUsage } from "./providers/codex.js";
import { MultiUsageRpc } from "./rpc.js";
import { stringOrNull } from "./shared.js";
var src_default = Plugin.define({
  id: "opencode.multi-usage",
  async setup(ctx) {
    await ctx.rpc.register(MultiUsageRpc, {
      codexUsage: async (_input, context) => {
        const connection = await ctx.integration.connection.active("openai");
        const credential = connection ? await ctx.integration.connection.resolve(connection) : void 0;
        if (!credential || credential.type !== "oauth") {
          const reason = credential ? "OpenAI is connected with an API key; use a ChatGPT login for usage" : "Connect ChatGPT from /connect first";
          return context.error("unavailable", reason, { reason });
        }
        const metadata = credential.metadata ?? {};
        const accountId = stringOrNull(metadata.accountID) ?? stringOrNull(metadata.accountId) ?? accountIdFromToken(credential.access);
        try {
          return await fetchCodexUsage(credential.access, accountId);
        } catch (error) {
          const reason = error instanceof Error ? error.message : "Usage request failed";
          return context.error("unavailable", reason, { reason });
        }
      }
    });
  }
});
export {
  src_default as default
};
//# sourceMappingURL=index.js.map