import type { RefObject } from "react"

// icon imports
import { CornerDownLeft } from "lucide-react"

// components
import Kbd from "../Kbd"

// types
import type { ResultItem, Command } from "../../commands/types"

type CommandResult = Extract<ResultItem, { type: "command" }>

type CommandResultsProps = {
  results: CommandResult[]
  selectedIndex: number
  onSelect: (index: number) => void
  onActivate: (command: Command) => void
  selectedRef: RefObject<HTMLParagraphElement | null>
}

function CommandResults({results, selectedIndex, onSelect, onActivate, selectedRef}: CommandResultsProps) {
  // no registered commands match the current picker filter
  if (results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
        <p className="text-sm font-medium text-text-dim">
          No commands found
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {/* displaying commands */}
      {results.map((result, index) => {
        const command = result.command

        return (
          <p
            key={result.id}
            ref={index === selectedIndex ? selectedRef : null}
            onMouseEnter={() => onSelect(index)}
            onClick={() => onActivate(command)}
            className={`group relative flex cursor-default items-center justify-between gap-3 rounded py-2 pl-3 pr-2.5 transition-colors ${
              index === selectedIndex
                ? "bg-accent/30 font-semibold"
                : "hover:bg-surface"
            }`}
          >
            {index === selectedIndex && (
              <span className="absolute left-0 top-1/2 h-[50%] w-0.75 -translate-y-1/2 rounded-full bg-accent" />
            )}

            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13.5px] text-text/90">
                {command.name}
              </span>

              <span className="truncate text-xs text-muted font-medium">
                {command.description}
              </span>
            </div>

            {index === selectedIndex && (
              <Kbd size="sm" className="text-accent">
                <CornerDownLeft size={13} strokeWidth={2.5} />
              </Kbd>
            )}
          </p>
        )
      })}
    </div>
  )
}

export default CommandResults
