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
  passiveMatch?: (query: string) => boolean
}


export type ResultItem =
  | {
      type: "app"
      id: string
      app: AppEntry
    }
  | {
      type: "command"
      id: string
      command: Command
    }
  | {
      type: "calc"
      id: string
      expression: string
      value: string
    }


// represents what the search input is currently doing
// search: normal owl app search
// command-picker: user has started typing "!" but has not selected a command yet
// command-active: a specific command has been selected and now owns the input
export type InputMode =
  | {
      kind: "search"
      query : string
    }
  | {
      kind: "command-picker"
      filter : string
    }
  | {
      kind: "command-active"
      command : Command
      query : string
    }
