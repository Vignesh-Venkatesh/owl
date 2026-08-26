import type { KeyboardEvent } from "react"

// icons import
import { Search } from "lucide-react"

// components import
import Kbd from "./Kbd"

type SearchBarProps = {
  query: string
  resultCount: number
  onQueryChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}


function SearchBar({ query, resultCount, onQueryChange, onKeyDown }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4">
      {/*icon*/}
      <div className="text-accent">
        <Search size={19} strokeWidth={2.5} />
      </div>

      {/*input*/}
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search applications..."
        autoFocus
        className="w-full bg-transparent text-[15px] tracking-tight text-text caret-accent placeholder:text-muted focus:outline-none"
      />

      {/*result count*/}
      <Kbd
        size="sm"
        className={`shrink-0 text-muted transition-opacity ${
          query ? "opacity-100" : "opacity-0"
        }`}
      >
        {resultCount}
      </Kbd>
    </div>
  )
}

export default SearchBar
