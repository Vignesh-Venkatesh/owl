import { writeFile } from "node:fs/promises"
import emojiData from "emojibase-data/en/data.json"

type EmojiSource = {
  emoji: string
  label: string
  tags?: string[]
  group?: number
  version: number
}

type EmojiEntry = {
  emoji: string
  name: string
  keywords: string[]
  group: number | null
}

const skinToneModifiers = new Set(["🏻", "🏼", "🏽", "🏾","🏿"])
const maxEmojiVersion = 15.1

// detecting regional indicator emojis
function isRegionalIndicator(emoji: string): boolean {
  const codepoints = Array.from(emoji)
  if (codepoints.length !== 1) {
    return false
  }
  const codepoint = codepoints[0].codePointAt(0)
  return (
    codepoint !== undefined &&
    codepoint >= 0x1f1e6 &&
    codepoint <= 0x1f1ff
  )
}

// filtering out emojis
const emojis: EmojiEntry[] = (emojiData as EmojiSource[])
  .filter((entry) => !skinToneModifiers.has(entry.emoji))
  .filter((entry) => !isRegionalIndicator(entry.emoji))
  .filter((entry) => entry.version <= maxEmojiVersion)
  .map((entry) => ({
    emoji: entry.emoji,
    name: entry.label,
    keywords: entry.tags ?? [],
    group: entry.group ?? null,
  }))

// writing emoji data
await writeFile(
  "src/data/emojis.json",
  JSON.stringify(emojis, null, 2) + "\n",
)

console.log(`Generated ${emojis.length} emoji entries.`)
