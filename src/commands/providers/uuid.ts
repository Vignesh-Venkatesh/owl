import type { Command, ResultItem, ActivationContext } from "../types";

async function activateUuidResult(item: ResultItem,{ toast, copyToClipboard }: ActivationContext) {
  if (item.type !== "uuid") {
    return
  }

  try {
    await copyToClipboard(item.value)
    toast.success(`copied \n${item.value}`)
  } catch (err) {
    console.error("failed to copy UUID result:", err)
    toast.error("failed to copy")
  }
}

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
  onActivate: activateUuidResult,
  onTab: generateUUID,
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
