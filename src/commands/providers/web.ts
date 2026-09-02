import type { Command, ResultItem, ActivationContext } from "../types"
import { openUrl } from "@tauri-apps/plugin-opener"

// checking url shapes before falling back to search
function hasHttpScheme(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function isLocalhost(value: string): boolean {
  return /^localhost(?::\d+)?(?:[/?#].*)?$/i.test(value)
}

function isIpv4(value: string): boolean {
  const match = value.match(/^((?:\d{1,3}\.){3}\d{1,3})(?::\d+)?(?:[/?#].*)?$/)
  if (!match) {
    return false
  }
  return match[1].split(".").every((part) => Number(part) >= 0 && Number(part) <= 255)
}

function isDomain(value: string): boolean {
  return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z](?:[a-z0-9-]*[a-z0-9])?(?::\d+)?(?:[/?#].*)?$/i.test(value)
}

function looksLikeUrl(value: string): boolean {
  if (/\s/.test(value)) {
    return false
  }
  return (
    hasHttpScheme(value) ||
    isLocalhost(value) ||
    isIpv4(value) ||
    isDomain(value)
  )
}

// normalizing schemeless urls before opening
function withScheme(value: string): string {
  if (hasHttpScheme(value)) {
    return value
  }
  return `https://${value}`
}

// resolving input into either a direct url or search query
export function resolveWeb(query: string, searchEngine: string): ResultItem[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return []
  }
  if (looksLikeUrl(trimmedQuery)) {
    return [
      {
        type: "web",
        id: `web:${trimmedQuery}`,
        query: trimmedQuery,
        target: withScheme(trimmedQuery),
        kind: "url"
      }
    ]
  }
  return [
    {
      type: "web",
      id: `web:${trimmedQuery}`,
      query: trimmedQuery,
      target: searchEngine.replace("{query}", encodeURIComponent(trimmedQuery)),
      kind: "search"
    }
  ]
}

// opening the resolved target
async function activateWebResult(item: ResultItem, { toast, hideWindow }: ActivationContext) {
  if (item.type !== "web") {
    return
  }
  try {
    await openUrl(item.target)
    await hideWindow()
  } catch (error) {
    console.error("failed to open web result:", error)
    toast.error("failed to open web result")
  }
}

export const webCommand: Command = {
  apiVersion: 1,
  id: "web",
  name: "Web",
  aliases: ["web"],
  description: "open a URL or search the web",
  category: "utility",
  mode: "instant",
  runOn: "query-change",
  handler: () => [],
  resultType: "web",
  onActivate: activateWebResult,
  footerHints: (_mode, results) => {
    const result = results.find((result) => result.type === "web")
    if (!result) {
      return [
        { key: "Esc", label: "Back" },
      ]
    }
    return [
      {
        key: "Enter",
        label: result.kind === "search" ? "Search" : "Open",
        icon: "enter",
      },
      { key: "Esc", label: "Back" },
    ]
  },
}
