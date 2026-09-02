import emojiData from "../../data/emojis.json"
import type {Command, ResultItem, ActivationContext} from "../types"

type EmojiEntry = {
  emoji: string
  name: string
  keywords: string[]
  group: number | null
}

type SearchableEmojiEntry = EmojiEntry & {
  searchName: string
  searchKeywords: string[]
}

const emojis: SearchableEmojiEntry[] = (emojiData as EmojiEntry[]).map(
  (emoji) => ({...emoji, searchName: emoji.name.toLowerCase(), searchKeywords: emoji.keywords.map((keyword) => keyword.toLowerCase())}),
)


function getMatchScore(emoji: SearchableEmojiEntry, query: string): number | null {
  if (emoji.searchName === query) {
    return 0
  }
  if (emoji.searchName.startsWith(query)) {
    return 1
  }
  if (emoji.searchKeywords.some((keyword) => keyword === query)) {
    return 2
  }
  if (emoji.searchKeywords.some((keyword) => keyword.startsWith(query))) {
    return 3
  }
  if (emoji.searchName.includes(query)) {
    return 4
  }
  if (emoji.searchKeywords.some((keyword) => keyword.includes(query))) {
    return 5
  }
  return null
}

function searchEmojis(query: string): ResultItem[] {
  const normalizedQuery = query.trim().toLowerCase()

  const matches = emojis
    .map((emoji) => ({emoji, score: normalizedQuery ? getMatchScore(emoji, normalizedQuery): 0}))
    .filter((match): match is {
        emoji: SearchableEmojiEntry
        score: number
      } => match.score !== null,
    )
    .sort((a, b) => a.score - b.score)
    // .slice(0, 60)

  return matches.map(({ emoji }) => ({
    type: "emoji",
    id: `emoji:${emoji.emoji}`,
    emoji: emoji.emoji,
    name: emoji.name,
    keywords: emoji.keywords,
    group: emoji.group,
  }))
}

async function activateEmojiResult(item: ResultItem, { toast, copyToClipboard }: ActivationContext) {
  if (item.type !== "emoji") {
    return
  }
  try {
    await copyToClipboard(item.emoji)
    toast.success(`copied ${item.emoji}`)
  } catch (error) {
    console.error("failed to copy emoji:", error)
    toast.error("failed to copy")
  }
}

export const emojiCommand: Command = {
  apiVersion: 1,
  id: "emoji",
  name: "Emoji",
  aliases: ["emoji"],
  description: "search and copy emoji",
  category: "utility",
  mode: "instant",
  runOn: "query-change",
  handler: searchEmojis,
  resultType: "emoji",
  onActivate: activateEmojiResult,
  footerHints: () => [
    { key: "", label: "Navigate", icon: "navigate-grid" },
    { key: "Enter", label: "Copy", icon: "enter" },
    { key: "Esc", label: "Back" },
  ],
  navigation: {
    type: "grid",
    columns: 6,
  },
}
