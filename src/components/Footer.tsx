import { ArrowUpDown, CornerDownLeft } from "lucide-react"

import Kbd from "./Kbd"

type FooterProps = {
  resultCount: number
}

function Footer({ resultCount }: FooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-surface/40 px-4 py-2.5">
      <span className="text-xs text-muted">
        {resultCount} {resultCount === 1 ? "result" : "results"}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Kbd size="sm">
            <ArrowUpDown size={13} strokeWidth={2.5} />
          </Kbd>
          <span className="text-xs text-muted">Navigate</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd size="sm">
            <CornerDownLeft size={13} strokeWidth={2.5} />
          </Kbd>
          <span className="text-xs text-muted">Launch</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd size="sm">Esc</Kbd>
          <span className="text-xs text-muted">Hide</span>
        </div>
      </div>
    </div>
  )
}

export default Footer
