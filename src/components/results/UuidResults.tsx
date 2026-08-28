import type { ResultItem } from "../../commands/types";
import type { ResultRendererProps } from "./types"

type UuidResult = Extract<ResultItem, { type: "uuid" }>

function UuidResults({results,}: ResultRendererProps<UuidResult>) {
  const result = results[0]

  if (!result) {
    return null
  }

  return (
    <div className="flex-1 px-2 py-2">
      <div className="rounded px-3 py-3">
        <p key={result.value} className="font-mono text-2xl font-semibold text-text/90 text-end animate-calc-pop">
          {result.value}
        </p>
      </div>
    </div>
  )
}

export default UuidResults
