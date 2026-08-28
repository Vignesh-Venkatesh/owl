import type { RefObject } from "react"
import type { ResultItem } from "../../commands/types"

export type ResultRendererProps<T extends ResultItem> = {
  results: T[]
  selectedIndex: number
  onSelect: (index: number) => void
  onActivate: (result: T) => void
  selectedRef: RefObject<HTMLParagraphElement | null>
}
