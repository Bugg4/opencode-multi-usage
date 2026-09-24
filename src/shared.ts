import { readFile } from "node:fs/promises"
import path from "node:path"

export const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value)

export const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null

export const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null

export const booleanOrNull = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null

export const dataHome = (): string =>
  process.env.XDG_DATA_HOME ?? path.join(process.env.HOME ?? "", ".local", "share")

export const readJson = async (file: string): Promise<unknown> =>
  JSON.parse(await readFile(file, "utf8")) as unknown

export const opencodeDataFile = (name: string): string => path.join(dataHome(), "opencode", name)

export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (record(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message
  }
  return "Usage request failed"
}
