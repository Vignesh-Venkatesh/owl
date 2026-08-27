import AppResults from "./AppResults"
import CommandResults from "./CommandResults"
import CalculatorResults from "./CalculatorResults"

export const rendererMap = {
  app: AppResults,
  command: CommandResults,
  calc: CalculatorResults,
}
