import type { CommandRegistry } from "./registry";

export function getCommandAutocompleteMatches(input: string, registry: CommandRegistry): string[] {
  if (!input.startsWith("!")) {
    return []
  }

  const prefix = input.slice(1).trim().toLowerCase()

  if (!prefix) {
    return []
  }

  return registry.getAll().map((command) => command.id).filter((id) => id.toLowerCase().startsWith(prefix)).sort((a, b) => a.localeCompare(b))
}

export function getCommonPrefix(values: string[]): string{
  if (values.length === 0) {
    return ""
  }

  let prefix = values[0]

  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (!prefix) {
        return ""
      }
    }
  }

  return prefix
}
