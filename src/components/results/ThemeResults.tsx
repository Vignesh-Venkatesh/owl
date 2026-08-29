import type { ResultRendererProps } from "./types"

// icon imports
import { CornerDownLeft, Bird, Cat, Trees } from "lucide-react"

// components
import Kbd from "../Kbd"

// types
import type { ResultItem } from "../../commands/types"

type ThemeResult = Extract<ResultItem, { type: "theme" }>

function ThemeResults({results,selectedIndex,onSelect,onActivate,selectedRef,}: ResultRendererProps<ThemeResult>) {
  if (results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
        <p className="text-md font-medium text-text-dim">
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
              className="flex h-8 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-bg p-1"
            >
              <div className="flex w-full flex-col gap-1">
                <div className="h-1.5 w-5 rounded-full bg-text-dim" />

                <div className="flex flex-1 gap-1">
                  <div className="flex-1 rounded-sm bg-surface" />
                  <div className="w-2 rounded-sm bg-accent" />
                </div>
              </div>
            </div>

            <span className="truncate text-[13.5px] text-text">
              {result.name}
            </span>
          </div>

          {/*enter button, with custom icons for certain themes*/}
          {index === selectedIndex && (
            <Kbd size="sm" className="text-accent">
              {result.themeId.includes("owl") ? (
                <Bird size={13} strokeWidth={2.5} />
              ) : result.themeId.includes("catppuccin") ? (
                <Cat size={13} strokeWidth={2.5} />
              ) : result.themeId.includes("everforest") ? (
                <Trees size={13} strokeWidth={2.5} />
              ) : (
                <CornerDownLeft size={13} strokeWidth={2.5} />
              )}
            </Kbd>
          )}
        </p>
      ))}
    </div>
  )
}

export default ThemeResults
