export interface OwlTheme {
  id: string;
  name: string;
}

export const THEMES = [
  { id: "owl", name: "owl" },
  { id: "midnight", name: "midnight" },
  { id: "nord", name: "nord" },
  { id: "light", name: "light" },
  { id: "oled", name: "oled" },
  { id: "gruvbox", name: "gruvbox" },
  { id: "catppuccin", name: "catppuccin" },
  { id: "dracula", name: "dracula" },
  { id: "tokyo-night", name: "tokyo night" },
  { id: "one-dark", name: "one dark" },
  { id: "everforest", name: "everforest" },
] as const satisfies readonly OwlTheme[];

export type ThemeID = (typeof THEMES)[number]["id"]

export const DEFAULT_THEME_ID: ThemeID = "owl"

export function isThemeID(value: string): value is ThemeID {
  return THEMES.some((theme) => theme.id === value)
}

export function applyTheme(themeID: ThemeID) {
  document.documentElement.dataset.theme = themeID
}
