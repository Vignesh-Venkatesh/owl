import { CommandRegistry } from "./registry";

import { calculatorCommand } from "./providers/calculator";
import { uuidCommand } from "./providers/uuid";
import { themeCommand } from "./providers/theme"
import { colorCommand } from "./providers/color";
import { webCommand } from "./providers/web"

// single shared registry
// built in commands will register themselves here
export const commandRegistry = new CommandRegistry()


commandRegistry.register(calculatorCommand)
commandRegistry.register(uuidCommand)
commandRegistry.register(themeCommand)
commandRegistry.register(colorCommand)
commandRegistry.register(webCommand)
