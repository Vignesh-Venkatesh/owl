import type { RefObject } from "react"

// types
import type { AppEntry } from "../../types"

// components
import AppResults from "./AppResults"

type ResultAreaProps = {
  mode: "apps"
  apps: AppEntry[]
  query: string
  error: string | null
  selectedIndex: number
  onSelect: (index: number) => void
  launchApp: (app: AppEntry) => Promise<void>
  selectedRef: RefObject<HTMLParagraphElement | null>
}

function ResultArea({mode,apps,query,error,selectedIndex,onSelect,launchApp,selectedRef}: ResultAreaProps) {
  switch (mode) {
    case "apps":
      return (
        <AppResults
          apps={apps}
          query={query}
          error={error}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
          launchApp={launchApp}
          selectedRef={selectedRef}
        />
      )
  }
}

export default ResultArea
