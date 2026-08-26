import type { RefObject } from "react"

// types
import type { AppEntry } from "../../types"
import type { ResultItem } from "../../commands/types"

// components
import { rendererMap } from "./rendererMap"

type ResultAreaProps = {
  results: ResultItem[]
  query: string
  error: string | null
  selectedIndex: number
  onSelect: (index: number) => void
  launchApp: (app: AppEntry) => Promise<void>
  selectedRef: RefObject<HTMLParagraphElement | null>
}

function ResultArea({results,query,error,selectedIndex,onSelect,launchApp,selectedRef}: ResultAreaProps) {
  const resultType = results[0]?.type ?? "app"
  const Renderer = rendererMap[resultType]

  return (
    <Renderer
      results={results}
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
