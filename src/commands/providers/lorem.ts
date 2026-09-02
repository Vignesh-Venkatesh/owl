import type { Command, ResultItem, FooterHint,ActivationContext} from "../types"
import {clampCount, generateLoremText, parseLoremQuery} from "../utils/lorem"

function generateLorem(query: string): ResultItem[] {
  const parsed = parseLoremQuery(query)

  if (!parsed) {
    return [
      {
        type: "lorem",
        id: "lorem-result",
        count: 0,
        unit: "sentence",
        explicit: false,
        text: null,
        status: "invalid",
        requestedCount: 0,
      },
    ]
  }

  return [
    {
      type: "lorem",
      id: "lorem-result",
      count: parsed.count,
      unit: parsed.unit,
      explicit: parsed.explicit,
      text: generateLoremText(parsed.count, parsed.unit),
      status: "valid",
      requestedCount: parsed.requestedCount,
    },
  ]
}

function cycleLoremUnit(results: ResultItem[]): ResultItem[] {
  const loremResult = results.find((result) => result.type === "lorem")

  if (!loremResult || loremResult.status !== "valid" || loremResult.explicit) {
    return results
  }

  const nextUnit =
    loremResult.unit === "word"
      ? "sentence"
      : loremResult.unit === "sentence"
        ? "paragraph"
        : "word"

  const nextCount = clampCount(loremResult.requestedCount, nextUnit)

  return results.map((result) => {
    if (result.type !== "lorem") {
      return result
    }

    return {
      ...result,
      count: nextCount,
      unit: nextUnit,
      text: generateLoremText(nextCount, nextUnit),
    }
  })
}

async function activateLoremResult(result: ResultItem, { toast, copyToClipboard }: ActivationContext) {
  if (result.type !== "lorem" || result.status !== "valid" || !result.text) {
    return
  }

  try {
    await copyToClipboard(result.text)

    const unit =
      result.count === 1
        ? result.unit
        : `${result.unit}s`

    toast.success(`Copied ${result.count} ${unit}`)
  } catch (error) {
    console.error("failed to copy lorem result:", error)
    toast.error("failed to copy")
  }
}

export const loremCommand: Command = {
  apiVersion: 1,
  id: "lorem",
  name: "Lorem ipsum",
  aliases: ["lorem"],
  description: "generate placeholder text",
  category: "utility",
  mode: "instant",
  runOn: "query-change",
  handler: generateLorem,
  resultType: "lorem",
  footerHints: (_mode, results) => {
    const loremResult = results.find((result) => result.type === "lorem")
    if (loremResult?.type === "lorem" && loremResult.status === "invalid") {
      return [{ key: "Esc", label: "Back" }]
    }
    const hints: FooterHint[] = []
    if (loremResult?.type === "lorem" && !loremResult.explicit) {
      hints.push({ key: "Tab", label: "Change unit" })
    }
    hints.push({ key: "Enter", label: "Copy", icon: "enter" })
    hints.push({ key: "Esc", label: "Back" })
    return hints
  },
  onActivate: activateLoremResult,
  onTab: cycleLoremUnit,
}
