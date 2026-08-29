import type { ComponentType, RefObject } from "react"

// types
import type { AppEntry } from "../../types"
import type { InputMode, ResultItem, Command } from "../../commands/types"
import type { ResultRendererProps } from "./types"

// results
import { rendererMap } from "./rendererMap"

type ResultAreaProps = {
  mode: InputMode
  results: ResultItem[]
  query: string
  error: string | null
  selectedIndex: number
  onSelect: (index: number) => void
  onActivateCommand: (command: Command) => void
  launchApp: (app: AppEntry) => Promise<void>
  selectedRef: RefObject<HTMLParagraphElement | null>
  onActivate: (result: ResultItem) => void
}

function ResultArea({mode,results,query,error,selectedIndex,onSelect,onActivateCommand,launchApp,selectedRef,onActivate,}: ResultAreaProps) {
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
        onActivate={onActivateCommand}
        selectedRef={selectedRef}
      />
    )
  }

  // active commands render through their declared result type
  if (mode.kind === "command-active") {
    const resultType = mode.command.resultType
    const commandResults = results.filter(
      (result) => result.type === resultType
    )
    const Renderer = rendererMap[resultType] as ComponentType<ResultRendererProps<ResultItem>>
    return (
      <Renderer
        results={commandResults}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        onActivate={onActivate}
        selectedRef={selectedRef}
      />
    )
  }

  // passive calculator results can appear while still in normal search mode
  const calcResults = results.filter(
    (result): result is Extract<ResultItem, { type: "calc" }> =>
      result.type === "calc"
  )

  if (calcResults.length > 0) {
    const Renderer = rendererMap.calc
    return (
      <Renderer
        results={calcResults}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
        onActivate={onActivate}
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
