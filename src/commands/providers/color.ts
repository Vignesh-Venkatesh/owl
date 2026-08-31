import type {ActivationContext,Command,ResultItem} from "../types"

import {generateRandomColor, getColorInputState, parseColor, rgbToHex, rgbToHslString, rgbToString} from "../utils/color"

type ColorResult = Extract<ResultItem, { type: "color" }>

function getColorValue(result: ColorResult): string | null {
  if (result.status !== "valid" || !result.rgb) {
    return null
  }

  switch (result.activeFormat) {
    case "hex":
      return rgbToHex(result.rgb)

    case "rgb":
      return rgbToString(result.rgb)

    case "hsl":
      return rgbToHslString(result.rgb)
  }
}

async function activateColorResult(item: ResultItem,{ toast, copyToClipboard }: ActivationContext) {
  if (item.type !== "color") {
    return
  }

  const value = getColorValue(item)

  if (!value) {
    return
  }

  try {
    await copyToClipboard(value)
    toast.success(`copied \n${value}`)
  } catch (error) {
    console.error("failed to copy color result:", error)
    toast.error("failed to copy")
  }
}

function previewColor(query: string): ResultItem[] {
  const state = getColorInputState(query)

  if (state === "empty") {
    return [
      {
        type: "color",
        id: "color-result",
        rgb: generateRandomColor(),
        status: "valid",
        activeFormat: "hex",
      },
    ]
  }

  // let owl keep showing the previous valid color while input is incomplete
  if (state === "incomplete") {
    return []
  }

  if (state === "invalid") {
    return [
      {
        type: "color",
        id: "color-result",
        rgb: null,
        status: "invalid",
        activeFormat: "hex",
      },
    ]
  }

  const rgb = parseColor(query)

  if (!rgb) {
    return []
  }

  return [
    {
      type: "color",
      id: "color-result",
      rgb,
      status: "valid",
      activeFormat: "hex",
    },
  ]
}

function cycleColorFormat(results: ResultItem[]): ResultItem[] {
  const colorResult = results.find((result) => result.type === "color")

  if (!colorResult || colorResult.status !== "valid" || !colorResult.rgb) {
    return results
  }

  const nextFormat = colorResult.activeFormat === "hex" ? "rgb" : colorResult.activeFormat === "rgb" ? "hsl" : "hex"

  return results.map((result) => result.type === "color" ? {...result, activeFormat: nextFormat} : result)
}

export const colorCommand: Command = {
  apiVersion: 1,
  id: "color",
  name: "Color",
  aliases: ["color"],
  description: "preview and convert colors",
  category: "utility",
  mode: "instant",
  runOn: "query-change",
  handler: previewColor,
  resultType: "color",
  preserveLastResultOnEmpty: true,

  footerHints: (_mode, results) => { const colorResult = results.find((result) => result.type === "color")

    if (colorResult?.type === "color" && colorResult.status === "invalid") {
      return [
        { key: "Esc", label: "Back" },
      ]
    }

    const format = colorResult?.type === "color" ? colorResult.activeFormat : "hex"

    return [
      { key: "Tab", label: "Change format" },
      {
        key: "Enter",
        label: `Copy ${format}`,
        icon: "enter",
      },
      { key: "Esc", label: "Back" },
    ]
  },

  onActivate: activateColorResult,
  onTab: cycleColorFormat,
}
