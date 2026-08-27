import { CommandRegistry } from "./registry";

// single shared registry
// built in commands will register themselves here
export const commandRegistry = new CommandRegistry()
