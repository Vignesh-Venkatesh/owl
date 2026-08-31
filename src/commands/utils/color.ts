export type RGB = { r: number, g: number, b: number }
export type Color = RGB & { a: number }
export type HSL = { h: number, s: number, l: number }
export type ColorInputState =
  | "empty"
  | "valid"
  | "incomplete"
  | "invalid"

// generating random color
export function generateRandomColor(): Color {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: 1,
  }
}

// parsing
export function parseHex(input: string): Color | null {
  const value = input.trim().replace(/^#/, "")

  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(value)) {
    return null
  }

  const hex =
    value.length === 3 || value.length === 4
      ? value.split("").map((char) => char + char).join("")
      : value

  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  }
}

export function parseRgb(input: string): Color | null {
  const match = input.trim().match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i
  )

  if (!match) {
    return null
  }

  const [, rValue, gValue, bValue, alphaValue] = match

  const r = Number(rValue)
  const g = Number(gValue)
  const b = Number(bValue)

  if ([r, g, b].some((value) => value < 0 || value > 255)) {
    return null
  }

  const isRgba = input.trim().toLowerCase().startsWith("rgba")

  if (isRgba && alphaValue === undefined) {
    return null
  }

  if (!isRgba && alphaValue !== undefined) {
    return null
  }

  const a = alphaValue === undefined
    ? 1
    : Number(alphaValue)

  if (a < 0 || a > 1) {
    return null
  }

  return { r, g, b, a }
}

export function parseHsl(input: string): Color | null {
  const match = input.trim().match(
    /^hsla?\(\s*(-?\d*\.?\d+)\s*,\s*(\d*\.?\d+)%\s*,\s*(\d*\.?\d+)%(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i
  )

  if (!match) {
    return null
  }

  const [, hValue, sValue, lValue, alphaValue] = match

  let h = Number(hValue)
  let s = Number(sValue)
  let l = Number(lValue)

  if (s < 0 || s > 100 || l < 0 || l > 100) {
    return null
  }

  const isHsla = input.trim().toLowerCase().startsWith("hsla")

  if (isHsla && alphaValue === undefined) {
    return null
  }

  if (!isHsla && alphaValue !== undefined) {
    return null
  }

  const a = alphaValue === undefined
    ? 1
    : Number(alphaValue)

  if (a < 0 || a > 1) {
    return null
  }

  h = ((h % 360) + 360) % 360

  const saturation = s / 100
  const lightness = l / 100

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation

  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))

  const m = lightness - chroma / 2

  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = chroma
    g = x
  } else if (h < 120) {
    r = x
    g = chroma
  } else if (h < 180) {
    g = chroma
    b = x
  } else if (h < 240) {
    g = x
    b = chroma
  } else if (h < 300) {
    r = x
    b = chroma
  } else {
    r = chroma
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  }
}

function formatAlpha(alpha: number): string {
  return Number(alpha.toFixed(2)).toString()
}

export function parseColor(input: string): Color | null {
  const value = input.trim()

  if (!value) {
    return null
  }

  return (parseHex(value) ?? parseRgb(value) ?? parseHsl(value))
}


// input state

export function getColorInputState(input: string): ColorInputState {
  const value = input.trim()

  if (value === "") {
    return "empty"
  }

  if (parseColor(value)) {
    return "valid"
  }

  // incomplete hex
  if (/^#?[0-9a-fA-F]{0,8}$/.test(value)) {
    return "incomplete"
  }

  // incomplete rgb/rgba
  if (/^rgba?\([^)]*$/i.test(value)) {
    return "incomplete"
  }

  // incomplete hsl/hsla
  if (/^hsla?\([^)]*$/i.test(value)) {
    return "incomplete"
  }

  return "invalid"
}


// conversion and formatting
export function rgbToHex(color: Color): string {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, "0").toUpperCase()

  const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`

  if (color.a >= 1) {
    return hex
  }

  return `${hex}${toHex(color.a * 255)}`
}


export function rgbToString(color: Color): string {
  if (color.a < 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${formatAlpha(color.a)})`
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0

  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6)
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2)
    } else {
      h = 60 * ((r - g) / delta + 4)
    }
  }

  if (h < 0) {
    h += 360
  }

  const l = (max + min) / 2

  const s = delta === 0
    ? 0
    : delta / (1 - Math.abs(2 * l - 1))

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToString(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

export function rgbToHslString(color: Color): string {
  const hsl = rgbToHsl(color)
  if (color.a < 1) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${formatAlpha(color.a)})`
  }
  return hslToString(hsl)
}


// contrast

export function contrastRatio(
  rgb: RGB,
  against: "black" | "white"
): number {
  const toLinear = (value: number) => {
    const channel = value / 255

    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  }

  const luminance =
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)

  const againstLuminance = against === "black" ? 0 : 1

  const lighter = Math.max(luminance, againstLuminance)
  const darker = Math.min(luminance, againstLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}
