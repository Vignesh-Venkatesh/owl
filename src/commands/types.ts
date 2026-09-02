import type { AppEntry } from "../types"
import type { ThemeID } from "../themes/theme"
import type { ToastApi } from "../components/toast/ToastProvider"

// command has to fall in one of these categories
export type CommandCategory =
  | "core"
  | "utility"
  | "system"
  | "plugin"

export type CommandMode =
  | "instant" // immediately shows result
  | "action" // might take a while, so perhaps must require a loading state

export type CommandRunOn =
  | "query-change"
  | "activation"

export type CommandResultType = Exclude<ResultItem["type"],"app" | "command">

export interface ActivationContext {
  toast: ToastApi
  copyToClipboard: (text: string) => Promise<void>
  hideWindow: () => Promise<void>
}

export interface Command {
  apiVersion: 1
  id: string
  name: string
  aliases: string[]
  description: string
  category: CommandCategory
  mode: CommandMode
  passiveMatch?: (query: string) => boolean
  handler: (query: string) => ResultItem[]
  runOn: CommandRunOn
  resultType: CommandResultType
  preserveLastResultOnEmpty?: boolean
  footerHints?: (mode: InputMode,results: ResultItem[]) => FooterHint[]
  onActivate?: (item: ResultItem,ctx: ActivationContext) => void | Promise<void>
  onTab?: (results: ResultItem[],ctx: ActivationContext) => ResultItem[] | void
}

export type ResultItem =
  | {
      type: "app" // application
      id: string
      app: AppEntry
    }
  | {
      type: "command" // represents a command that the user can select
      id: string
      command: Command
    }
  | {
      type: "calc" // calculator
      id: string
      expression: string
      value: string | null
      status: "valid" | "pending" | "error"
    }
  | {
      type: "uuid" // uuid generator
      id: string
      value: string
    }
  | {
      type: "theme"
      id: string
      themeId: ThemeID
      name: string
    }
  | {
      type: "color"
      id: string
      rgb: {
        r: number
        g: number
        b: number
        a: number
      } | null
      status: "valid" | "invalid"
      activeFormat: "hex" | "rgb" | "hsl"
    }
  | {
      type: "web"
      id: string
      query: string
      target: string
      kind: "url" | "search"
    }

// represents what the search input is currently doing
// search: normal owl app search
// command-picker: user has started typing "!" but has not selected a command yet
// command-active: a specific command has been selected and now owns the input
export type InputMode =
  | {
      kind: "search"
      query: string
    }
  | {
      kind: "command-picker"
      filter: string
    }
  | {
      kind: "command-active"
      command: Command
      query: string
      invocation: string
    }

export type FooterHintIcon =
  | "navigate"
  | "enter"

export interface FooterHint {
  key: string
  label: string
  icon?: FooterHintIcon
}
