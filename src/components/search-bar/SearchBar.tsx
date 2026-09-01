import type { KeyboardEvent } from "react"

// icons import
// import { Search } from "lucide-react"

// components import
import Kbd from "../Kbd"
import { useSearchPlaceholder } from "./useSearchPlaceholder"
import { useCurrentTime } from "../../hooks/useCurrentTime"

type SearchBarProps = {
  query: string
  resultCount: number
  onQueryChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  carouselActive: boolean
  autocompleteSuggestion?: string
}


// function SearchBar({ query, resultCount, onQueryChange, onKeyDown, carouselActive }: SearchBarProps) {
function SearchBar({ query, onQueryChange, onKeyDown, carouselActive, autocompleteSuggestion }: SearchBarProps) {
  const { placeholder, visible } = useSearchPlaceholder(carouselActive)

  const autocompleteSuffix =
    autocompleteSuggestion &&
    autocompleteSuggestion.toLowerCase().startsWith(query.toLowerCase())
      ? autocompleteSuggestion.slice(query.length)
      : ""

  // current time
  const time = useCurrentTime()

  const formattedTime = time.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4">
      {/*icon*/}
      {/*<div className="text-accent">
        <Search size={19} strokeWidth={2.5} />
      </div>*/}

      {/* input */}
      <div className="relative w-full">
        {/*placeholder active*/}
        {/*displayed when user is not typing*/}
        {carouselActive && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] text-muted/60 transition-opacity duration-500 motion-reduce:transition-none ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {placeholder}
          </span>
        )}

        {/*command autocomplete*/}
        {autocompleteSuffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre text-[15px]"
          >
            <span className="invisible">{query}</span>
            <span className="text-muted/50">{autocompleteSuffix}</span>
          </span>
        )}

        {/*displayed when user typing*/}
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          aria-label="Search"
          className="relative w-full bg-transparent text-[15px] text-text caret-accent focus:outline-none"
        />
      </div>

      {/*result count*/}
      {/*<Kbd
        size="sm"
        className={`shrink-0 text-muted transition-opacity ${
          query ? "opacity-100" : "opacity-0"
        }`}
      >
        {resultCount}
      </Kbd>*/}

      {/*result count*/}
      <Kbd
        size="sm"
        className={`shrink-0 text-muted transition-opacity font-semibold`}
      >
        {formattedTime}
      </Kbd>
    </div>
  )
}

export default SearchBar
