// types
import { useState, useEffect } from "react";
import type { ResultItem } from "../../commands/types";
import type { ResultRendererProps } from "./types"

type CalculatorResult = Extract<ResultItem, {type: "calc"}>

function CalculatorResults({results}: ResultRendererProps<CalculatorResult>) {
  // to remember the most recent successful calculation so incomplete expressions do not make the result flicker
  const [lastValidValue, setLastValidValue] = useState<string | null>(null)

  const result = results[0]

  useEffect(() => {
    // clearing the calculator also clears its previous result
    if (!result) {
      setLastValidValue(null)
      return
    }

    // only successful calculations replace the remembered value
    if (result.status === "valid" && result.value !== null) {
      setLastValidValue(result.value)
    }
  }, [result])

  if (!result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
        <p className="text-sm font-medium text-text-dim">
          Type an expression
        </p>
      </div>
    )
  }

  // valid result -> show the new value
  // error -> show Err
  // pending -> keep showing the previous valid value
  const displayValue =
    result.status === "valid"
      ? result.value
      : result.status === "error"
        ? "Err"
        : lastValidValue ?? ""

  return (
    <div className="flex-1 px-2 py-2">
      <div className="rounded px-3 py-3">
        <p className="text-xs text-muted">
          {result.expression}
        </p>

        <p key={result.id} className="mt-1 text-4xl font-semibold text-text/90 text-end animate-calc-pop">
          {displayValue}
        </p>
      </div>
    </div>
  )
}


export default CalculatorResults
