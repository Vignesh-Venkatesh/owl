import type { AppEntry } from "../types"

// command has to fall in one of these categories
export type CommandCategory =
  | "core"
  | "utility"
  | "system"
  | "plugin"

export type CommandMode =
  | "instant" // immediately shows result
  | "action" // might take a while, so perhaps must require a loading state


export interface Command {
  apiVersion: 1
  id: string
  name: string
  aliases: string[]
  description: string
  category: CommandCategory
  mode: CommandMode
}


export type ResultItem =
  | {
      type: "app"
      id: string
      app: AppEntry
    }
