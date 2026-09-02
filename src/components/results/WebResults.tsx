import type { ResultItem } from "../../commands/types"
import type { ResultRendererProps } from "./types"

type WebResult = Extract<ResultItem, { type: "web" }>

function getSearchEngineName(target: string): string | null {
  try {
    const hostname = new URL(target).hostname.replace(/^www\./, "")
    const domain = hostname.split(".")[0]

    const knownEngines: Record<string, string> = {
      google: "Google",
      bing: "Bing",
      duckduckgo: "DuckDuckGo",
      brave: "Brave",
    }

    if (knownEngines[domain]) {
      return knownEngines[domain]
    }

    return null
  } catch {
    return null
  }
}

function WebResults({ results }: ResultRendererProps<WebResult>) {
  const result = results[0]

  if (!result) {
    return <div className="flex-1" />
  }

  const searchEngineName = result.kind === "search" ? getSearchEngineName(result.target) : null

  return (
    <div className="flex-1 px-4 py-3">
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <p className="text-sm text-text">
          {result.kind === "url"
            ? `Open ${result.target}`
            : searchEngineName
              ? `Search ${searchEngineName} for ${result.query}`
              : `Search the web for ${result.query}`}
        </p>
      </div>
    </div>
  )
}

export default WebResults
