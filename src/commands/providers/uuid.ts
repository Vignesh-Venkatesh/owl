import type { Command, ResultItem } from "../types";

// uuid command definition
export const uuidCommand: Command = {
  apiVersion: 1,
  id: "uuid",
  name: "Generate UUID",
  aliases: ["uuid", "guid"],
  description: "generate a random UUID (v4)",
  category: "utility",
  mode: "instant",
  runOn: "activation",
  handler: generateUUID,
  resultType: "uuid",
  footerHints: () => [
    { key: "Tab", label: "Regenerate" },
    { key: "Enter", label: "Copy", icon: "enter" },
    { key: "Esc", label: "Back" },
  ],
}

function generateUUID(): ResultItem[]{
  return [
    {
      type: "uuid",
      id: "uuid-result",
      value: crypto.randomUUID(),
    },
  ]
}
