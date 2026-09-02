export type LoremUnit = "word" | "sentence" | "paragraph"

export type ParsedLoremQuery = {
  requestedCount: number
  count: number
  unit: LoremUnit
  explicit: boolean
}

const WORDS_PER_SENTENCE = 8
const SENTENCES_PER_PARAGRAPH = 4

export const COUNT_LIMITS: Record<LoremUnit, number> = {
  word: 1000,
  sentence: 100,
  paragraph: 50,
}

export function clampCount(count: number, unit: LoremUnit): number {
  return Math.max(1, Math.min(count, COUNT_LIMITS[unit]))
}

export function parseLoremQuery(query: string): ParsedLoremQuery | null {
  const value = query.trim()

  // empty query uses the default
  if (value === "") {
    return {
      requestedCount: 3,
      count: 3,
      unit: "sentence",
      explicit: false,
    }
  }

  // bare number uses the default unit
  if (/^\d+$/.test(value)) {
    const requestedCount = Number(value)
    return {
      requestedCount,
      count: clampCount(requestedCount, "sentence"),
      unit: "sentence",
      explicit: false,
    }
  }

  // explicit unit suffix
  const match = /^(\d+)([wsp])$/i.exec(value)
  if (!match) {
    return null
  }
  const unitMap: Record<string, LoremUnit> = {
    w: "word",
    s: "sentence",
    p: "paragraph",
  }

  const unit = unitMap[match[2].toLowerCase()]
  const requestedCount = Number(match[1])
  return {
    requestedCount,
    count: clampCount(requestedCount, unit),
    unit,
    explicit: true,
  }
}


const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
]

export function buildWords(count: number): string {
  const words: string[] = []
  for (let index = 0; index < count; index += 1) {
    words.push(LOREM_WORDS[index % LOREM_WORDS.length])
  }
  return words.join(" ")
}


function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function buildSentences(count: number): string {
  const sentences: string[] = []
  for (let sentenceIndex = 0; sentenceIndex < count; sentenceIndex += 1) {
    const words: string[] = []

    for (let wordIndex = 0; wordIndex < WORDS_PER_SENTENCE; wordIndex += 1) {
      const index = sentenceIndex * WORDS_PER_SENTENCE + wordIndex
      words.push(LOREM_WORDS[index % LOREM_WORDS.length])
    }

    sentences.push(`${capitalize(words.join(" "))}.`)
  }

  return sentences.join(" ")
}

export function buildParagraphs(count: number): string {
  const paragraphs: string[] = []
  for (let paragraphIndex = 0; paragraphIndex < count; paragraphIndex += 1) {
    const sentences: string[] = []

    for (let sentenceIndex = 0; sentenceIndex < SENTENCES_PER_PARAGRAPH; sentenceIndex += 1) {
      const absoluteSentenceIndex = paragraphIndex * SENTENCES_PER_PARAGRAPH + sentenceIndex
      const words: string[] = []

      for (let wordIndex = 0; wordIndex < WORDS_PER_SENTENCE; wordIndex += 1) {
        const index = absoluteSentenceIndex * WORDS_PER_SENTENCE + wordIndex
        words.push(LOREM_WORDS[index % LOREM_WORDS.length])
      }

      sentences.push(`${capitalize(words.join(" "))}.`)
    }

    paragraphs.push(sentences.join(" "))
  }

  return paragraphs.join("\n\n")
}

export function generateLoremText(count: number, unit: LoremUnit): string {
  switch (unit) {
    case "word":
      return buildWords(count)

    case "sentence":
      return buildSentences(count)

    case "paragraph":
      return buildParagraphs(count)
  }
}
