import type { ResultRendererProps } from "./types"
import type { ResultItem } from "../../commands/types"
import { COUNT_LIMITS } from "../../commands/utils/lorem"

type LoremResult = Extract<ResultItem, { type: "lorem" }>

export default function LoremResults({results}: ResultRendererProps<LoremResult>) {
  const result = results[0]

  if (!result) {
    return null
  }

  if (result.status === "invalid" || !result.text) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-3">
        <p className="text-sm text-muted">
          Invalid lorem query
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-medium text-muted">
        <span className="uppercase text-accent font-semibold">
          {result.unit}
        </span>

        <div className="flex items-center gap-2 text-accent">
          <span className="font-semibold">
            {result.count}
          </span>

          {result.requestedCount > COUNT_LIMITS[result.unit] && (
            <span className="text-danger font-semibold">
              {/*[{COUNT_LIMITS[result.unit]} MAX]*/}
              [MAX LIMIT REACHED]
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
          {result.text}
        </p>
      </div>
    </div>
  )
}
