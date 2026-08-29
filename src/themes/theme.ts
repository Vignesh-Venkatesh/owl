export interface OwlTheme {
  id: string;
  name: string;
}

export const THEMES = [
  { id: "owl", name: "Owl" },
  { id: "owl-light", name: "Owl Light" },
  { id: "ayu-dark", name: "Ayu Dark" },
  { id: "ayu-light", name: "Ayu Light" },
  { id: "catppuccin-latte", name: "Catppuccin Latte" },
  { id: "catppuccin-mocha", name: "Catppuccin Mocha" },
  { id: "crimson", name: "Crimson" },
  { id: "crimson-light", name: "Crimson Light" },
  { id: "dracula", name: "Dracula" },
  { id: "everforest-dark", name: "Everforest Dark" },
  { id: "everforest-light", name: "Everforest Light" },
  { id: "github-dark", name: "GitHub Dark" },
  { id: "github-light", name: "GitHub Light" },
  { id: "gruvbox", name: "Gruvbox" },
  { id: "gruvbox-light", name: "Gruvbox Light" },
  { id: "monokai-pro", name: "Monokai Pro" },
  { id: "monokai-pro-light", name: "Monokai Pro Light" },
  { id: "nord", name: "Nord" },
  { id: "oled", name: "OLED" },
  { id: "one-dark", name: "One Dark" },
  { id: "one-light", name: "One Light" },
  { id: "rose-pine", name: "Rosé Pine" },
  { id: "rose-pine-dawn", name: "Rosé Pine Dawn" },
  { id: "solarized-dark", name: "Solarized Dark" },
  { id: "solarized-light", name: "Solarized Light" },
  { id: "tokyo-night", name: "Tokyo Night" },
  { id: "tokyo-night-day", name: "Tokyo Night Day" },
] as const satisfies readonly OwlTheme[];

export type ThemeID = (typeof THEMES)[number]["id"]

export const DEFAULT_THEME_ID: ThemeID = "owl"

export function isThemeID(value: string): value is ThemeID {
  return THEMES.some((theme) => theme.id === value)
}

export function applyTheme(themeID: ThemeID) {
  document.documentElement.dataset.theme = themeID
}
