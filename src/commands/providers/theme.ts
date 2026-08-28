import type { Command, ResultItem } from "../types";
import { THEMES } from "../../themes/theme";

// theme command definition
export const themeCommand: Command = {
  apiVersion: 1,
  id: "theme",
  name: "Theme",
  aliases: ["theme"],
  description: "change owl's appearance",
  category: "system",
  mode: "instant",
  runOn: "query-change",
  handler: searchThemes,
  resultType: "theme",
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
