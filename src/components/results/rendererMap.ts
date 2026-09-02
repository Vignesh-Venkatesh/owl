import AppResults from "./AppResults"
import CommandResults from "./CommandResults"
import CalculatorResults from "./CalculatorResults"
import UuidResults from "./UuidResults"
import ThemeResults from "./ThemeResults"
import ColorResults from "./ColorResults"
import WebResults from "./WebResults"

export const rendererMap = {
  app: AppResults,
  command: CommandResults,
  calc: CalculatorResults,
  uuid: UuidResults,
  theme: ThemeResults,
  color: ColorResults,
  web: WebResults
}
