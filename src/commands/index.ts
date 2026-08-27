import { CommandRegistry } from "./registry";

import { calculatorCommand } from "./providers/calculator";

// single shared registry
// built in commands will register themselves here
export const commandRegistry = new CommandRegistry()


commandRegistry.register(calculatorCommand)
