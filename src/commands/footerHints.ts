import type { Command, FooterHint, InputMode } from "./types"

const SEARCH_HINTS: FooterHint[] = [
  { key: "↑↓", label: "Navigate", icon: "navigate" },
  { key: "Enter", label: "Launch", icon: "enter" },
  { key: "Esc", label: "Hide" },
]

const COMMAND_PICKER_HINTS: FooterHint[] = [
  { key: "↑↓", label: "Navigate", icon: "navigate" },
  { key: "Enter", label: "Select", icon: "enter" },
  { key: "Esc", label: "Back" },
]

const EMPTY_SEARCH_HINTS: FooterHint[] = [
  { key: "Esc", label: "Hide" },
]

const INSTANT_COMMAND_HINTS: FooterHint[] = [
  { key: "Enter", label: "Copy", icon: "enter" },
  { key: "Esc", label: "Back" },
]

const ACTION_COMMAND_HINTS: FooterHint[] = [
  { key: "Enter", label: "Run", icon: "enter" },
  { key: "Esc", label: "Back" },
]


export function resolveFooterHints(mode: InputMode, resultCount: number, passiveCommand?: Command): FooterHint[] {
  if (mode.kind === "search") {
    if (resultCount === 0) {
      return EMPTY_SEARCH_HINTS
    }

    if (passiveCommand) {
      const commmandHints =
        passiveCommand.footerHints?.(mode) ??
        (passiveCommand.mode === "instant"
        ? INSTANT_COMMAND_HINTS
        : ACTION_COMMAND_HINTS
        )

      return commmandHints.map((hint) =>
        hint.key === "Esc"
          ? { ...hint, label: "Hide" }
          : hint
      )
    }

    return SEARCH_HINTS
  }

  if (mode.kind === "command-picker") {
    return COMMAND_PICKER_HINTS
  }

  if (mode.command.footerHints) {
    return mode.command.footerHints(mode)
  }

  return mode.command.mode === "instant" ? INSTANT_COMMAND_HINTS : ACTION_COMMAND_HINTS
}
