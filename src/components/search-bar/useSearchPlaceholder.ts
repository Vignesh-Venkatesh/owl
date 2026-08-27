import { useEffect, useState } from "react"

const PLACEHOLDERS = [
  "Search apps",
  "Type ! for commands",
  "!calc 2+2",
]


const CYCLE_DURATION = 4000
const FADE_DURATION = 200

export function useSearchPlaceholder(active: boolean) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length))


  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active) {
      setVisible(true)
      return
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let fadeTimeoutId: number | undefined

    const intervalID = window.setInterval(() => {

      if (reducedMotion) {
        setIndex((currentIndex) => {
          return (currentIndex + 1) % PLACEHOLDERS.length
        })
        return
      }

      setVisible(false)

      fadeTimeoutId = window.setTimeout(() => {
        setIndex((currentIndex) => {
          return (currentIndex + 1) % PLACEHOLDERS.length
        })
        setVisible(true)
      }, FADE_DURATION)

    }, CYCLE_DURATION)

    return () => {
      window.clearInterval(intervalID)
      if (fadeTimeoutId !== undefined) {
        window.clearTimeout(fadeTimeoutId)
      }
    }
  }, [active])

  return {
    placeholder: PLACEHOLDERS[index],
    visible
  }
}
