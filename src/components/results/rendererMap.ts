import AppResults from "./AppResults"
import CommandResults from "./CommandResults"
import CalculatorResults from "./CalculatorResults"
import UuidResults from "./UuidResults"
import ThemeResults from "./ThemeResults"

export const rendererMap = {
  app: AppResults,
  command: CommandResults,
  calc: CalculatorResults,
  uuid: UuidResults,
  theme: ThemeResults
}
