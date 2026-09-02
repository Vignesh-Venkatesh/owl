import { useEffect, useRef, useState } from "react"
import type { ResultItem } from "../../commands/types"
import type { ResultRendererProps } from "./types"

type EmojiResult = Extract<ResultItem, { type: "emoji" }>

const COLUMN_COUNT = 6
const TILE_SIZE = 44
const GAP = 8
const ROW_HEIGHT = TILE_SIZE + GAP
const PADDING_Y = 12
const OVERSCAN_ROWS = 3

function EmojiResults({results, selectedIndex, onSelect, onActivate,selectedRef}: ResultRendererProps<EmojiResult>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(400)

  const selectedResult = results[selectedIndex] ?? results[0]

  const totalRows = Math.ceil(results.length / COLUMN_COUNT)

  const totalHeight = PADDING_Y * 2 + totalRows * TILE_SIZE + Math.max(0, totalRows - 1) * GAP

  const firstVisibleRow = Math.max(0, Math.floor((scrollTop - PADDING_Y) / ROW_HEIGHT) - OVERSCAN_ROWS)

  const lastVisibleRow = Math.min(totalRows - 1, Math.ceil((scrollTop + viewportHeight - PADDING_Y) / ROW_HEIGHT) + OVERSCAN_ROWS)

  const visibleRows = lastVisibleRow >= firstVisibleRow ? Array.from({ length: lastVisibleRow - firstVisibleRow + 1 }, (_, index) => firstVisibleRow + index) : []

  // tracking the available grid height
  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }
    const updateHeight = () => {
      setViewportHeight(element.clientHeight)
    }
    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // keeping keyboard selection inside the visible viewport.
  useEffect(() => {
    const element = scrollRef.current
    if (!element || !selectedResult) {
      return
    }
    const selectedRow = Math.floor(selectedIndex / COLUMN_COUNT)
    const rowTop = PADDING_Y + selectedRow * ROW_HEIGHT
    const rowBottom = rowTop + TILE_SIZE

    const viewportTop = element.scrollTop
    const viewportBottom = viewportTop + element.clientHeight

    if (rowTop < viewportTop) {
      element.scrollTop = rowTop
      setScrollTop(rowTop)
    } else if (rowBottom > viewportBottom) {
      const nextScrollTop = rowBottom - element.clientHeight
      element.scrollTop = nextScrollTop
      setScrollTop(nextScrollTop)
    }
  }, [selectedIndex, selectedResult])

  if (!selectedResult) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-14">
        <p className="text-sm text-text-dim">
          No emoji found 😔
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/*selected emoji preview*/}
      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center text-[26px]">
          {selectedResult.emoji}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-text">
            {selectedResult.name}
          </p>

          <p className="text-xs text-accent">
            enter to copy
          </p>
        </div>
      </div>

      {/*virtualized emoji grid*/}
      <div
        ref={scrollRef}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop)
        }}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-2"
      >
        <div className="relative" style={{ height: totalHeight }}>
          {visibleRows.map((rowIndex) => {
            const startIndex = rowIndex * COLUMN_COUNT
            const rowResults = results.slice(startIndex, startIndex + COLUMN_COUNT)

            return (
              <div
                key={rowIndex}
                className="absolute left-0 right-0 grid grid-cols-6 justify-items-center gap-2"
                style={{ top: PADDING_Y + rowIndex * ROW_HEIGHT, height: TILE_SIZE}}
              >
                {rowResults.map((result, columnIndex) => {
                  const index = startIndex + columnIndex
                  const selected = index === selectedIndex

                  return (
                    <p
                      key={result.id}
                      ref={selected ? selectedRef : null}
                      onMouseEnter={() => onSelect(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onSelect(index)
                        onActivate(result)
                      }}
                      className={`flex h-11 w-11 cursor-default items-center justify-center rounded-lg border text-[24px] transition-colors ${
                        selected
                          ? "border-accent bg-accent/10"
                          : "border-transparent hover:bg-surface"
                      }`}
                    >
                      {result.emoji}
                    </p>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default EmojiResults
