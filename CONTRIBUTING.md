# Contributing

Thanks for contributing to `opencode-multi-usage`.

## Adding a new provider

A provider is two modules plus registration:

1. `src/providers/<name>.ts`: auth, fetching, and parsing.
2. `src/providers/<name>-view.tsx`: sidebar rendering.
3. Registration in `src/options.ts` and `src/tui.tsx`.
4. Tests and docs.

Look at an existing small provider first. `src/providers/opencode-go.ts` plus
`src/providers/opencode-go-view.tsx` is the best template; `src/providers/codex.ts`
shows JWT account-ID extraction, and `src/providers/commandcode.ts` shows a
multi-endpoint provider.

### 1. Create `src/providers/<name>.ts`

Export the same shape the existing providers use:

- `export const USAGE_URL` (or `BASE_URL` / endpoint constants).
- `export type <Name>Usage = { ...; error?: string }`.
- `export const empty<Name>Usage = (error: string): <Name>Usage => (...)`.
- Pure, exported parse helpers, e.g. `parse<Name>Usage()` and window parsers.
  Keep them total: unknown JSON in, typed usage out, `null` for missing values.
  Use the helpers in `src/shared.ts` (`record`, `numberOrNull`, `stringOrNull`,
  `booleanOrNull`, `readJson`, `opencodeDataFile`).
- `export const get<Name>Usage = async (): Promise<<Name>Usage>`.

Auth and fetch conventions:

- Providers are opt-in. Make no network requests unless the provider is enabled.
- Check credentials in this order: dedicated env var(s) first, then OpenCode's
  `auth.json` / `account.json` entry, then the vendor CLI auth file if one exists.
- OAuth-based providers should prefer the live credential from OpenCode V2's
  integration API through the server plugin RPC (see `src/index.ts` and
  `src/rpc.ts`) and fall back to env vars / local auth files only when the RPC is
  unavailable. OpenCode V2 refreshes integration credentials in its own store,
  not in `auth.json`.
- If no credential is found, `throw new Error("Connect <Name> from /connect first")`
  (or a similarly actionable message).
- Use `AbortSignal.timeout(10_000)` for requests.
- Map auth failures to actionable errors, e.g. `401` → session expired / key
  rejected, reconnect from `/connect`. Do not leak tokens or keys in error messages.
- Document any env vars and auth-file fallbacks you support; they become part of
  the README contract.

### 2. Create `src/providers/<name>-view.tsx`

- Start the file with `/** @jsxImportSource @opentui/solid */`.
- Export `export function <Name>View(props: UsageViewProps<<Name>Usage>)`.
- Build the UI from `src/ui.tsx`: `Section`, `Row`, `PlanRow`, `QuotaRow`, `Empty`,
  plus `pct` / `remaining` where applicable.
- Use `title="<Name> Usage"` for the `Section`.
- Implement `shortSummary` for the collapsed sidebar state: `(loading)`,
  `(unavailable)` on missing data / `usage.error`, otherwise one compact
  remaining-quota fragment such as `(5h 70% left)`.
- Show every field the provider exposes when expanded (plan, windows/quotas,
  credits, status, reset times). Missing data should render as `(unavailable)`,
  not crash or render blank rows.
- Never render secrets, keys, tokens, account IDs, or raw API dumps.

### 3. Register the provider

- Add the new ID to `PROVIDER_IDS` in `src/options.ts`.
- In `src/tui.tsx`:
  - Import the new `getUsage`, `emptyUsage`, and `View`.
  - Add an entry to the `providers` record with `id`, `defaultRefreshInterval`
    (`"30s"` for fast-moving quotas, `"5m"` otherwise), `getUsage`, `errorUsage`,
    and `View`.
  - Add the provider to the `mount()` enable loop.
- `parseProviders()` in `src/options.ts` already filters unknown IDs and keeps
  stable display order, so no changes are needed there.

### 4. Add tests

- Add parser tests to `test/usage.test.js`: happy-path parsing plus missing /
  malformed payloads. Do not add tests that hit the real API.
- If you touch option parsing or entrypoints, extend `test/options.test.js` /
  `test/entrypoint.test.js` accordingly.
- Run before submitting:
  ```bash
  npm install
  npm run typecheck
  npm test
  ```

### 5. Update docs

- `README.md`: provider list at the top, `providers` array examples, the
  `Options` section if defaults change, a new `Authentication` subsection with
  the credential lookup order, and a `Stability` note if you call an undocumented
  endpoint.

## Testing and screenshot requirement

The maintainer cannot buy a subscription for every service, so the contributor
must prove the provider works against a real account. PRs for new providers are
not reviewed without both items below.

1. Test against a real subscription and state that in the PR:
   - Enabled only the new provider and restarted OpenCode.
   - Verified loading, populated, collapsed-summary, missing-credential, and
     rejected-credential / expired-session states (or explain which ones you
     covered and how).
   - Verified refresh behavior; only add a custom `refreshInterval` override if
     the default is wrong.
   - Ran `npm run typecheck` and `npm test` cleanly.
2. Attach a screenshot to the PR showing the new sidebar section expanded, so it
   is clear what the section looks like and which fields it exposes. A collapsed
   one-line screenshot is not enough. Redact any personal data, keys, or account
   identifiers before uploading.
