import AppResults from "./AppResults"
import CommandResults from "./CommandResults"
import CalculatorResults from "./CalculatorResults"
import UuidResults from "./UuidResults"

export const rendererMap = {
  app: AppResults,
  command: CommandResults,
  calc: CalculatorResults,
  uuid: UuidResults
}
