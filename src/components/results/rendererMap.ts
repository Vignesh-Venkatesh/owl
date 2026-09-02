import AppResults from "./AppResults"
import CommandResults from "./CommandResults"
import CalculatorResults from "./CalculatorResults"
import UuidResults from "./UuidResults"
import ThemeResults from "./ThemeResults"
import ColorResults from "./ColorResults"
import WebResults from "./WebResults"
import EmojiResults from "./EmojiResults"
import LoremResults from "./LoremResults"

export const rendererMap = {
  app: AppResults,
  command: CommandResults,
  calc: CalculatorResults,
  uuid: UuidResults,
  theme: ThemeResults,
  color: ColorResults,
  web: WebResults,
  emoji: EmojiResults,
  lorem: LoremResults
}
