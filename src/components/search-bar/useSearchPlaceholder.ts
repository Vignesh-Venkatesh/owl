import { useEffect, useState } from "react"

const PLACEHOLDERS = [
  "Search apps",
  "Type ! for commands",
  "!uuid",
  "!theme",
  "!web",
  "!lorem"
]

const CYCLE_DURATION = 4000
const FADE_DURATION = 200

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals = 1) {
  return Number(
    (Math.random() * (max - min) + min).toFixed(decimals)
  )
}

function getRandomCalcExpression() {
  const firstNumber = randomInt(1, 999)
  const secondNumber = randomInt(1, 999)

  const operators = ["+", "-", "*", "/"]
  const operator = operators[randomInt(0, operators.length - 1)]

  return `${firstNumber} ${operator} ${secondNumber}`
}

function randomHexChannel() {
  return randomInt(0, 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()
}

function getRandomColor() {
  const type = randomInt(0, 4)

  switch (type) {
    case 0:
      return `#${randomHexChannel()}${randomHexChannel()}${randomHexChannel()}`

    case 1:
      return `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)})`

    case 2:
      return `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomFloat(0.1, 1)})`

    case 3:
      return `hsl(${randomInt(0, 359)}, ${randomInt(0, 100)}%, ${randomInt(0, 100)}%)`

    default:
      return `hsla(${randomInt(0, 359)}, ${randomInt(0, 100)}%, ${randomInt(0, 100)}%, ${randomFloat(0.1, 1)})`
  }
}

function getRandomPlaceholder() {
  const type = randomInt(0, 3)

  switch (type) {
    case 1:
      return `!calc ${getRandomCalcExpression()}`

    case 2:
      return `!color ${getRandomColor()}`

    default:
      return PLACEHOLDERS[
        randomInt(0, PLACEHOLDERS.length - 1)
      ]
  }
}

export function useSearchPlaceholder(active: boolean) {
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder)
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
        setPlaceholder(getRandomPlaceholder())
        return
      }

      setVisible(false)

      fadeTimeoutId = window.setTimeout(() => {
        setPlaceholder(getRandomPlaceholder())
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

  return {placeholder, visible}
}
