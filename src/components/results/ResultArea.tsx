import type { RefObject } from "react"

// types
import type { AppEntry } from "../../types"
import type { InputMode, ResultItem, Command } from "../../commands/types"

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
  onActivateTheme: (theme: Extract<ResultItem, { type: "theme" }>) => void
}

function ResultArea({mode, results, query, error, selectedIndex, onSelect, onActivateCommand, launchApp, selectedRef, onActivateTheme}: ResultAreaProps) {
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

  // active commands wait for command-specific input/results
  if (mode.kind === "command-active") {
    const resultType = mode.command.resultType
    if (resultType === "calc") {
      const commandResults = results.filter(
        (result): result is Extract<ResultItem, { type: "calc" }> =>
          result.type === resultType
      )
      const Renderer = rendererMap[resultType]
      return <Renderer results={commandResults} />
    }

    if (resultType === "uuid") {
      const commandResults = results.filter(
        (result): result is Extract<ResultItem, { type: "uuid" }> =>
          result.type === resultType
      )
      const Renderer = rendererMap[resultType]
      return <Renderer results={commandResults} />
    }

    if (resultType === "theme") {
      const commandResults = results.filter(
        (result): result is Extract<ResultItem, { type: "theme" }> =>
          result.type === resultType
      )

      const Renderer = rendererMap[resultType]

      return (
        <Renderer
          results={commandResults}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          onActivate={onActivateTheme}
          selectedRef={selectedRef}
        />
      )
    }
  }

  // passive calculator results can appear while still in normal search mode
  const calcResults = results.filter(
    (result): result is Extract<ResultItem, {type: "calc"}> =>
      result.type === "calc"
  )
  if (calcResults.length>0) {
    const Renderer = rendererMap.calc
    return (
      <Renderer
        results={calcResults}
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
