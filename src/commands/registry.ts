import type { Command } from "./types";

// normalizing ids before comparing them
function normalize(value: string): string {
  return value.normalize("NFKC").trim().toLowerCase()
}

export class CommandRegistry {
  // stores commands by their normalized command ID
  // ex: "Calculator" -> "calculator"
  private byId = new Map<string, Command>()

  // every command id, name, and alias occupies the same namespace
  // normalized value -> command id
  private claims = new Map<string, string>()


  // registers a new command into the registry
  // the key is the normalized claim and the value is the normalized command ID that owns it
  // ex:
  // "calculator" -> "calculator"
  // "calc" -> "calculator"
  // "math" -> "calculator"
  // this prevents two commands from claiming the same name, ID, or alias
  register(command: Command): void {
    // normalize the command ID before storing or comparing it
    const normalizedID = normalize(command.id)

    // command IDs must be unique
    // if the ID already exists, stop registration immediately
    if (this.byId.has(normalizedID)) {
      throw new Error(`command id "${command.id}" is already registered`)
    }

    // collect the command's ID, name, and aliases
    // normalize all of them so comparisons are consistent
    // set removes duplicates within the same command
    // ex: id "calculator" and name "Calculator" both become "calculator"
    const commandClaims = new Set(
      [
        command.id,
        command.name,
        ...command.aliases,
      ].map(normalize)
    )

    // detect collisions against commands already registered
    for (const claim of commandClaims) {
      // check if another command already owns this claim
      const existingCommandID = this.claims.get(claim)

      // if a command already owns this ID, name, or alias, registration fails
      if (existingCommandID) {
        throw new Error(`command "${command.id}" conflicts with "${existingCommandID}" on "${claim}"`)
      }
    }

    // store the command using its normalized ID
    this.byId.set(normalizedID, command)

    // store every ID, name, and alias claimed by this command
    // each claim points back to the command's normalized ID
    for (const claim of commandClaims) {
      this.claims.set(claim, normalizedID)
    }
  }

  // gets a command using its ID
  // the provided ID is normalized before lookup
  getById(id: string): Command | undefined {
    return this.byId.get(normalize(id))
  }

  // gets a command using either its name or one of its aliases
  getByNameOrAlias(value: string): Command | undefined {
    // find which command ID owns this name or alias
    const commandID = this.claims.get(normalize(value))

    // no command owns it
    if (!commandID) {
      return undefined
    }

    // use the command ID to retrieve the full command
    return this.byId.get(commandID)
  }

  // all commands currently registered
  getAll(): Command[]{
    return Array.from(this.byId.values())
  }
}
