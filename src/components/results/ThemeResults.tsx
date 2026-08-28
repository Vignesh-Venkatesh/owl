import type { ResultRendererProps } from "./types"

// icon imports
import { CornerDownLeft } from "lucide-react"

// components
import Kbd from "../Kbd"

// types
import type { ResultItem } from "../../commands/types"

type ThemeResult = Extract<ResultItem, { type: "theme" }>

function ThemeResults({results,selectedIndex,onSelect,onActivate,selectedRef,}: ResultRendererProps<ThemeResult>) {
  if (results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
        <p className="text-sm font-medium text-text-dim">
          No themes found
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {results.map((result, index) => (
        <p
          key={result.id}
          ref={index === selectedIndex ? selectedRef : null}
          onMouseEnter={() => onSelect(index)}
          onClick={() => onActivate(result)}
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
            <div
              data-theme={result.themeId}
              className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-bg p-1.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="h-2.5 w-2.5 rounded-full bg-good" />
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            </div>

            <span className="truncate text-[13.5px] text-text">
              {result.name}
            </span>
          </div>

          {index === selectedIndex && (
            <Kbd size="sm" className="text-accent">
              <CornerDownLeft size={13} strokeWidth={2.5} />
            </Kbd>
          )}
        </p>
      ))}
    </div>
  )
}

export default ThemeResults
