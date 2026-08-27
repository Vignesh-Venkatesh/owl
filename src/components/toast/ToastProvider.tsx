import { createContext, useCallback, useEffect, useState, type ReactNode, useRef, useContext } from "react";

type ToastVariant = "success" | "error" | "info"

type Toast = {
  id: string
  variant: ToastVariant
  message: string
  duration: number
}

export type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

type ToastProviderProps = {
  children: ReactNode
}

type ToastItemProps = {
  toast: Toast
  onRemove: (id: string) => void
}

const DEFAULT_DURATION = 2000
const EXIT_DURATION = 180
const MAX_TOASTS = 1

const ToastContext = createContext<ToastApi | null>(null)

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [entered, setEntered] = useState(false)
  const [exiting, setExiting] = useState(false)

  const dismissingRef = useRef(false)
  const exitTimerRef = useRef<number | null>(null)

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const dismiss = useCallback(() => {
    if (dismissingRef.current) {
      return
    }
    dismissingRef.current = true

    if (reducedMotion) {
      onRemove(toast.id)
      return
    }

    setExiting(true)

    exitTimerRef.current = window.setTimeout(() => {
      onRemove(toast.id)
    }, EXIT_DURATION)
  }, [onRemove, reducedMotion, toast.id])


  useEffect(() => {
    if (reducedMotion) {
      setEntered(true)
      return
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setEntered(true)
    })

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [reducedMotion])


  useEffect(() => {
    const timeoutId = window.setTimeout(dismiss, toast.duration)

    return () => {
      window.clearTimeout(timeoutId)

      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current)
      }
    }
  }, [dismiss, toast.duration])


  const variantClass = {
    success: "border-accent/50 text-accent",
    error: "border-danger/50 text-danger",
    info: "border-border text-muted",
  }[toast.variant]


  return (
    <button
      type="button"
      onClick={dismiss}
      className={`flex w-full items-center justify-center rounded-lg border bg-bg px-3 py-2 text-center text-sm shadow-lg transition-all duration-200 motion-reduce:transition-none ${variantClass} ${
        entered && !exiting
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
      }`}
    >
      {toast.message}
    </button>
  )
}


export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((variant: ToastVariant, message: string) => {
    const toast: Toast = {
      id: crypto.randomUUID(),
      variant,
      message,
      duration: DEFAULT_DURATION,
    }

    setToasts((currentToasts) => [toast, ...currentToasts].slice(0, MAX_TOASTS))
  }, [])

  const toastApi: ToastApi = {
    success: (message) => addToast("success", message),
    error: (message) => addToast("error", message),
    info: (message) => addToast("info", message),
  }

  return (
    <ToastContext.Provider value={toastApi}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col font-semibold"
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              marginTop: index === 0 ? 0 : -30,
              transform: `scale(${1 - index * 0.02})`,
              zIndex: toasts.length - index,
              filter: `drop-shadow(0 ${4 + index * 2}px ${8 + index * 2}px rgba(0, 0, 0, 0.42))`,
            }}
          >
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const toast = useContext(ToastContext)

  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return toast
}
