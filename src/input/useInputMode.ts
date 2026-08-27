import { useState } from "react";

// type imports
import type { Command, InputMode } from "../commands/types";


// controls which mode owl's input is currently in
// search: normal app search
// command-picker: user has typed a leading "!" and is looking for a command
// command-active: a command has been selected and now owns the rest of the input
export function useInputMode() {
  const [mode, setMode] = useState<InputMode>({
    kind: "search",
    query: "",
  })

  // activates a command selected from the command picker
  function activateCommand(command: Command, invocation=command.id) {
    setMode({
      kind: "command-active",
      command,
      query: "",
      invocation,
    })
  }

  // updates input mode based on the current raw input value
  function updateInput(value: string) {

    // if a command is already active, keeping it active while the input still begins with that command's prefix
    if (mode.kind === "command-active") {
      const commandPrefix = `!${mode.invocation} `

      if (value.startsWith(commandPrefix)) {
        setMode({
          kind: "command-active",
          command: mode.command,
          query: value.slice(commandPrefix.length),
          invocation: mode.invocation
        })

        return
      }
    }

    // commands only trigger when "!" is the first character
    if (value.startsWith("!")) {
      setMode({
        kind: "command-picker",
        filter: value.slice(1),
      })

      return
    }

    // everything else is normal search
    setMode({
      kind: "search",
      query: value,
    })
  }

  // resets back to an empty normal search
  function resetInput() {
    setMode({
      kind: "search",
      query: "",
    })
  }

  // converts the current state back into the text shown in the input
  function getInputValue(): string {
    if (mode.kind === "search") {
      return mode.query
    }

    if (mode.kind === "command-picker") {
      return `!${mode.filter}`
    }

    return `!${mode.invocation} ${mode.query}`
  }

  return {mode, updateInput, activateCommand, resetInput, inputValue: getInputValue()}
}
