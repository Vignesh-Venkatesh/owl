// types
import type { ResultItem } from "../../commands/types";

type CalculatorResult = Extract<ResultItem, {type: "calc"}>

type CalculatorResultProps = {
  results: CalculatorResult[]
}

function CalculatorResults({ results }: CalculatorResultProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-14 text-center">
        <p className="text-sm font-medium text-text-dim">
          Type an expression
        </p>
      </div>
    )
  }

  const result = results[0]

  return (
    <div className="flex-1 px-2 py-2">
      <div className="rounded px-3 py-3">
        <p className="text-xs text-muted">
          {result.expression}
        </p>
        <p className="mt-1 text-lg font-semibold text-text">
          {result.value}
        </p>
      </div>
    </div>
  )
}


export default CalculatorResults
