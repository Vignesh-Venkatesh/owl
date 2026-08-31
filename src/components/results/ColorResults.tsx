import type { ResultItem } from "../../commands/types"

import {contrastRatio, rgbToHex, rgbToHslString,rgbToString} from "../../commands/utils/color"

import type { ResultRendererProps } from "./types"

type ColorResult = Extract<ResultItem, { type: "color" }>
type ColorFormat = ColorResult["activeFormat"]

function ColorResults({results}: ResultRendererProps<ColorResult>) {
  const result = results[0]

  if (!result) {
    return null
  }

  // malformed color input
  if (result.status === "invalid" || !result.rgb) {
    return (
      <div className="flex-1 px-4 py-3">
        <div className="rounded-lg border border-danger bg-surface px-4 py-4">
          <p className="text-sm text-danger">
            Invalid color
          </p>

          <p className="mt-1 text-xs text-text-dim">
            Use hex, rgb, rgba, hsl, or hsla.
          </p>
        </div>
      </div>
    )
  }

  const hex = rgbToHex(result.rgb)
  const rgb = rgbToString(result.rgb)
  const hsl = rgbToHslString(result.rgb)

  const opacity = Math.round(result.rgb.a * 100)
  const hasTransparency = result.rgb.a < 1

  const blackContrast = contrastRatio(result.rgb, "black")

  const whiteContrast = contrastRatio(result.rgb, "white")

  const blackPasses = blackContrast >= 4.5
  const whitePasses = whiteContrast >= 4.5

  const swatchTextColor = blackContrast >= whiteContrast ? "black" : "white"

  const formats: {id: ColorFormat, value: string}[] = [
    {
      id: "hex",
      value: hex,
    },
    {
      id: "rgb",
      value: rgb,
    },
    {
      id: "hsl",
      value: hsl,
    },
  ]

  return (
    <div className="flex-1 px-4 py-3">
      <div className="flex flex-col gap-3">
        {/*color swatch*/}
        <div
          className="relative h-24 overflow-hidden rounded-lg"
          style={{
            background:
              "repeating-conic-gradient(var(--t-surface-2) 0% 25%, var(--t-surface) 0% 50%) 50% / 16px 16px",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b}, ${result.rgb.a})`,
            }}
          />

          <div className="relative z-10 flex h-full items-end justify-between px-3 py-2">
            <span className="font-mono text-xs" style={{ color: swatchTextColor }}>
              {hex}
            </span>

            <span className="font-mono text-xs" style={{ color: swatchTextColor }}>
              {opacity}%
            </span>
          </div>
        </div>

        {/*color formats*/}
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {formats.map((format, index) => { const isActive = result.activeFormat === format.id
            return (
              <div key={format.id}>
                {index > 0 && (<div className="border-t border-border" />
                )}

                <div className={`flex items-center justify-between px-3 py-2 ${isActive ? "bg-surface-2" : ""}`}
                >
                  <span className={`text-xs ${isActive ? "text-accent" : "text-text-dim"}`}>
                    {format.id}
                  </span>

                  <span className="font-mono text-xs text-text">
                    {format.value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/*contrast*/}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <p className="text-xs text-text-dim">
              vs black text
            </p>

            <p className={`mt-1 font-mono text-sm ${hasTransparency ? "text-text-dim" : blackPasses ? "text-good" : "text-danger"}`}
            >
              {hasTransparency ? (
                <>
                  N/A <span className="text-xs">transparent</span>
                </>
              ) : (
                <>
                  {blackContrast.toFixed(1)}{" "}
                  <span className="text-xs">
                    {blackPasses ? "AA" : "fail"}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface px-3 py-2">
            <p className="text-xs text-text-dim">
              vs white text
            </p>

            <p className={`mt-1 font-mono text-sm ${hasTransparency ? "text-text-dim" : whitePasses ? "text-good" : "text-danger"}`}
            >
              {hasTransparency ? (
                <>
                  N/A <span className="text-xs">transparent</span>
                </>
              ) : (
                <>
                  {whiteContrast.toFixed(1)}{" "}
                  <span className="text-xs">
                    {whitePasses ? "AA" : "fail"}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorResults
