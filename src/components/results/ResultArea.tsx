import type { RefObject } from "react"

// types
import type { AppEntry } from "../../types"
import type { InputMode, ResultItem } from "../../commands/types"

// results
import { rendererMap } from "./rendererMap"

type ResultAreaProps = {
  mode: InputMode
  results: ResultItem[]
  query: string
  error: string | null
  selectedIndex: number
  onSelect: (index: number) => void
  launchApp: (app: AppEntry) => Promise<void>
  selectedRef: RefObject<HTMLParagraphElement | null>
}

function ResultArea({mode, results, query, error, selectedIndex, onSelect, launchApp, selectedRef}: ResultAreaProps) {
  // command picker has its own renderer and empty state
  if (mode.kind === "command-picker") {
    const commandResults = results.filter(
      (result): result is Extract<ResultItem, { type: "command" }> =>
        result.type === "command"
    )

    const Renderer = rendererMap.command

    return (
      <Renderer
        results={commandResults}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        selectedRef={selectedRef}
      />
    )
  }

  // normal search currently only produces app results
  const appResults = results.filter(
    (result): result is Extract<ResultItem, { type: "app" }> =>
      result.type === "app"
  )

  const Renderer = rendererMap.app

  return (
    <Renderer
      results={appResults}
      query={query}
      error={error}
      selectedIndex={selectedIndex}
      onSelect={onSelect}
      launchApp={launchApp}
      selectedRef={selectedRef}
    />
  )
}

export default ResultArea
