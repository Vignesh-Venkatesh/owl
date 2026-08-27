import { Parser } from "expr-eval";
import type { Command, ResultItem } from "../types";

// calculator command definition
export const calculatorCommand: Command = {
  apiVersion: 1,
  id: "calc",
  name: "Calculator",
  aliases: ["cal", "calculator", "math"],
  description: "calculate a mathematical expression",
  category: "utility",
  mode: "instant",
  passiveMatch
}

const parser = new Parser()

// evaluating a mathematical expression
// invalid or incomplete expressions yield no ResultItem
export function calculate(expression: string): ResultItem[] {
  const trimmedExpression = expression.trim()

  // not evaluating anythng when there is an empty query
  if (!trimmedExpression) {
    return []
  }

  try {
    const value = parser.evaluate(trimmedExpression)

    // values like Infinity and NaN are calculation errors
    // ex: 1/0
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return [
        {
          type: "calc",
          id: `calc:${trimmedExpression}`,
          expression: trimmedExpression,
          value: null,
          status: "error",
        },
      ]
    }

    return [
      {
        type: "calc",
        id: `calc:${trimmedExpression}`,
        expression: trimmedExpression,
        value: String(value),
        status: "valid",
      },
    ]
  } catch {
    // parser errors are treated as pending while the user is typing
    // ex: "12*" may be waiting for the next number
    return [
      {
        type: "calc",
        id: `calc:${trimmedExpression}`,
        expression: trimmedExpression,
        value: null,
        status: "pending",
      },
    ]
  }
}


// checks whether normal search query looks like a math expression
// avoids stealing ordinary app searches
function passiveMatch(query: string): boolean {
  const trimmedQuery = query.trim()

  // must contain at least one number
  const hasNumber = /\d/.test(trimmedQuery)

  // must contain at least one math operator
  const hasOperator = /[+\-*/%^]/.test(trimmedQuery)

  // only allow characters that reasonably belong to a math expression
  const containsOnlyMathCharacters =
    /^[\d\s+\-*/%^().]+$/.test(trimmedQuery)

  return hasNumber && hasOperator && containsOnlyMathCharacters
}
