import {ArrowUpDown, CornerDownLeft, Move} from "lucide-react"

import Kbd from "./Kbd"
import { FooterHint } from "../commands/types"

type FooterProps = {
  resultCount: number
  hints: FooterHint[]
}

const footerHintIcons = {
  navigate: ArrowUpDown,
  enter: CornerDownLeft,
  "navigate-grid": Move,
}

function Footer({ resultCount, hints }: FooterProps) {

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-t border-border bg-surface/40 px-4">
      <span className="text-xs text-muted">
        {resultCount} {resultCount === 1 ? "result" : "results"}
      </span>

      <div className="flex items-center gap-3 whitespace-nowrap">
        {hints.map((hint) => {
          const Icon = hint.icon
            ? footerHintIcons[hint.icon]
            : null

          return (
            <div
              key={`${hint.key}-${hint.label}`}
              className="flex items-center gap-1"
            >
              {Icon ? (
                <Kbd size="sm">
                  <Icon
                    className="size-3"
                    aria-hidden="true"
                    strokeWidth={3}
                  />
                  <span className="sr-only">{hint.key}</span>
                </Kbd>
              ) : (
                <Kbd size="sm" className="font-semibold text-xs">{hint.key}</Kbd>
              )}

              <span className="text-xs text-muted">
                {hint.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Footer
