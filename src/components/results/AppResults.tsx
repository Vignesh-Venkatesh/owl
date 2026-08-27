import { useState } from "react"
import type { RefObject } from "react"

// tauri imports
import { convertFileSrc } from "@tauri-apps/api/core"

// icon imports
import { CornerDownLeft, FileQuestionMark } from "lucide-react"

// component imports
import Kbd from "../Kbd"

// types imports
import type { AppEntry } from "../../types"
import type { ResultItem } from "../../commands/types"

type AppResult = Extract<ResultItem, { type: "app" }>

type AppResultsProp = {
  results: AppResult[]
  query: string
  error: string | null
  selectedIndex: number
  onSelect: (index: number) => void
  launchApp: (app: AppEntry) => Promise<void>
  selectedRef: RefObject<HTMLParagraphElement | null>
}

function AppResults({results,query,error,selectedIndex,onSelect,launchApp,selectedRef}: AppResultsProp) {
  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {/* error message */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
          <p className="text-sm font-medium text-danger">
            Something went wrong
          </p>

          <p className="text-xs text-muted">{error}</p>
        </div>
      ) : results.length === 0 ? (
        // no apps found
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
          <p className="text-sm font-medium text-text-dim">
            No applications found
          </p>

          {query && (
            <p className="text-xs text-muted">
              No matches for "{query}"
            </p>
          )}
        </div>
      ) : (
        // displaying apps
        results.map((result, index) => {
          const app = result.app

          return (
            <p
              key={result.id}
              ref={index === selectedIndex ? selectedRef : null}
              onMouseEnter={() => onSelect(index)}
              onClick={() => launchApp(app)}
              className={`group relative flex cursor-default items-center justify-between gap-3 rounded py-2 pl-3 pr-2.5 transition-colors ${
                index === selectedIndex
                  ? "bg-accent/30 font-semibold"
                  : "hover:bg-surface"
              }`}
            >
              {index === selectedIndex && (
                <span className="absolute left-0 top-1/2 h-[50%] w-0.75 -translate-y-1/2 rounded-full bg-accent" />
              )}

              <div className="flex min-w-0 items-center gap-3">
                <ApplicationIcon app={app} />

                <span className="truncate text-[13.5px] text-text">
                  {app.name}
                </span>
              </div>

              {index === selectedIndex && (
                <Kbd size="sm" className="text-accent">
                  <CornerDownLeft size={13} strokeWidth={2.5} />
                </Kbd>
              )}
            </p>
          )
        })
      )}
    </div>
  )
}

function ApplicationIcon({ app }: { app: AppEntry }) {
  const [failed, setFailed] = useState(false)

  if (!app.icon || failed) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
        <FileQuestionMark size={18} strokeWidth={2} />
      </div>
    )
  }

  return (
    <img
      src={convertFileSrc(app.icon)}
      alt=""
      onError={() => setFailed(true)}
      className="h-8 w-8 rounded-md object-contain"
    />
  )
}

export default AppResults
