import type { Command, ResultItem, ActivationContext } from "../types";
import {applyTheme, THEMES } from "../../themes/theme";


function activateThemeResult(item: ResultItem,{ toast }: ActivationContext) {
  if (item.type !== "theme") {
    return
  }

  applyTheme(item.themeId)
  toast.success(`Theme set to ${item.name}`)
}

// theme command definition
export const themeCommand: Command = {
  apiVersion: 1,
  id: "theme",
  name: "Theme",
  aliases: ["theme", "themes"],
  description: "change owl's appearance",
  category: "system",
  mode: "instant",
  runOn: "query-change",
  handler: searchThemes,
  resultType: "theme",
  onActivate: activateThemeResult,
  footerHints: () => [
    { key: "↑↓", label: "Navigate", icon: "navigate" },
    { key: "Enter", label: "Apply", icon: "enter" },
    { key: "Esc", label: "Back" },
  ],
}


function searchThemes(query: string): ResultItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  return THEMES
     .filter((theme) =>
       theme.name.toLowerCase().includes(normalizedQuery)
     )
     .map((theme) => ({
       type: "theme" as const,
       id: `theme:${theme.id}`,
       themeId: theme.id,
       name: theme.name,
     }))
}
