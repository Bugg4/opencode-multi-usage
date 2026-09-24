import { readFile } from "node:fs/promises";
import path from "node:path";
const record = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const numberOrNull = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
const stringOrNull = (value) => typeof value === "string" && value.length > 0 ? value : null;
const booleanOrNull = (value) => typeof value === "boolean" ? value : null;
const dataHome = () => process.env.XDG_DATA_HOME ?? path.join(process.env.HOME ?? "", ".local", "share");
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const opencodeDataFile = (name) => path.join(dataHome(), "opencode", name);
const errorMessage = (error) => {
  if (error instanceof Error) return error.message;
  if (record(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }
  return "Usage request failed";
};
export {
  booleanOrNull,
  dataHome,
  errorMessage,
  numberOrNull,
  opencodeDataFile,
  readJson,
  record,
  stringOrNull
};
//# sourceMappingURL=shared.js.map