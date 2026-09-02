import "./App.css"

import {useEffect, useRef, useState, useMemo} from "react"

import type { KeyboardEvent } from "react"

import { getCurrentWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/core"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

import type { AppEntry } from "./types"
import type {ActivationContext, ResultItem} from "./commands/types"

import { useInputMode } from "./input/useInputMode"
import { useToast } from "./components/toast/ToastProvider"

// components
import SearchBar from "./components/search-bar/SearchBar"
import ResultArea from "./components/results/ResultArea"
import Footer from "./components/Footer"

import { searchApps } from "./commands/providers/apps"
import { resolveWeb } from "./commands/providers/web"
import { commandRegistry } from "./commands"
import { resolveFooterHints } from "./commands/footerHints"
import { getCommandAutocompleteMatches, getCommonPrefix } from "./commands/autocomplete"

function App() {
  const toast = useToast()

  const activationContext: ActivationContext = {
    toast,
    copyToClipboard: writeText,
    hideWindow,
  }

  const [webSearchEngine, setWebSearchEngine] = useState<string | null>(null)

  // complete application index returned by rust backend
  const [apps, setApps] = useState<AppEntry[]>([])

  // controls whether owl is searching apps, picking a command or running an active command
  const {mode, updateInput, inputValue, resetInput, activateCommand} = useInputMode()

  // index of the currently highlighted result
  const [selectedIndex, setSelectedIndex] = useState(0)

  // error state
  const [error, setError] = useState<string | null>(null)

  // for keeping current selection in view
  const selectedRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
    })
  }, [selectedIndex, inputValue])

  const autocompleteCycleRef = useRef<{matches: string[], index: number} | null>(null)

  const [activationResults, setActivationResults] = useState<ResultItem[]>([])

  const [interactionResults, setInteractionResults] = useState<ResultItem[] | null>(null)

  const activeCommand = mode.kind === "command-active" ? mode.command : null

  const activeQuery = mode.kind === "command-active" ? mode.query : ""

  // activation commands run once when they become active
  useEffect(() => {
    if (activeCommand?.runOn === "activation") {
      setActivationResults(
        activeCommand.handler(""),
      )
      return
    }

    setActivationResults([])
  }, [activeCommand?.id])

  // load web config when the web command becomes active
  useEffect(() => {
    if (activeCommand?.id !== "web") {
      return
    }
    invoke<string>("get_web_config")
      .then(setWebSearchEngine)
      .catch((error) => {
        console.error("failed to load web config:", error)
        setWebSearchEngine(null)
      })
  }, [activeCommand?.id])

  const lastQueryResultsRef = useRef<{commandId: string | null, results: ResultItem[]}>({commandId: null, results: []})

  // query-change commands only rerun when the command or its query changes
  const rawQueryResults = useMemo(() => {
    if (!activeCommand || activeCommand.runOn !== "query-change") {
      return []
    }
    if (activeCommand.id === "web") {
      return webSearchEngine
        ? resolveWeb(activeQuery, webSearchEngine)
        : []
    }
    return activeCommand.handler(activeQuery)
  }, [activeCommand, activeQuery, webSearchEngine])

  // remember the last valid result from a query-change command
  useEffect(() => {
    if (!activeCommand || activeCommand.runOn !== "query-change" || rawQueryResults.length === 0) {
      return
    }

    lastQueryResultsRef.current = {commandId: activeCommand.id, results: rawQueryResults}
  }, [activeCommand?.id, rawQueryResults])

  // commands can keep their previous valid result while the current query is incomplete
  const queryResults = activeCommand?.preserveLastResultOnEmpty && rawQueryResults.length === 0 && lastQueryResultsRef.current.commandId === activeCommand.id ? lastQueryResultsRef.current.results : rawQueryResults

  // loading application list
  useEffect(() => {
    setError(null)

    invoke<AppEntry[]>("search_apps")
      .then((indexedApps) => {
        setApps(indexedApps)
      })
      .catch((error) => {
        console.error(
          "failed to index applications:",
          error,
        )

        setError("failed to load applications.")
      })
  }, [])

  // for passive command searching
  const passiveCommand =
    mode.kind === "search"
      ? commandRegistry.findPassiveMatch(mode.query)
      : undefined

  const commandPickerCommands =
    mode.kind === "command-picker"
      ? autocompleteCycleRef.current
        ? autocompleteCycleRef.current.matches.flatMap((id) => {
          const command = commandRegistry.getById(id)
          return command ? [command] : []
        })
        : commandRegistry.search(mode.filter)
      : []

  // searching happens entirely in the frontend... for now...
  // normal search mode uses the app search provider
  const results =
    mode.kind === "search"
      ? passiveCommand
        ? passiveCommand.handler(mode.query)
        : searchApps(apps, mode.query)
      : mode.kind === "command-picker"
        ? commandPickerCommands.map((command) => ({
            type: "command" as const,
            id: `command:${command.id}`,
            command,
          }))
        : interactionResults ??
          (mode.command.runOn === "activation"
            ? activationResults
            : queryResults)

  const autocompleteMatches =
    mode.kind === "command-picker"
      ? getCommandAutocompleteMatches(inputValue, commandRegistry)
      : []

  const selectedAutocompleteResult = results[selectedIndex]
  const autocompleteSuggestion =
    mode.kind === "command-picker" &&
    selectedAutocompleteResult?.type === "command"
      ? `!${selectedAutocompleteResult.command.id}`
      : undefined

  const footerHints = resolveFooterHints(mode, results, passiveCommand, autocompleteMatches.length > 0)

  // function to handle query changes
  function handleQueryChange(value: string) {
    autocompleteCycleRef.current = null
    setError(null)
    setInteractionResults(null)

    // pressing space after an exact command name, id or alias activates that command without pressing Enter
    if (mode.kind === "command-picker" && value.startsWith("!") && value.endsWith(" ")) {
      const commandName = value.slice(1, -1)

      const command = commandRegistry.getByNameOrAlias(commandName)

      if (command) {
        activateCommand(command, commandName)
        setSelectedIndex(0)
        return
      }
    }

    updateInput(value)
    setSelectedIndex(0)
  }

  // function to hide Owl
  async function hideWindow() {
    try {
      await getCurrentWindow().hide()
    } catch (error) {
      console.error("failed to hide Owl window", error)
      setError("failed to hide Owl window.")
    }
  }

  async function activateResult(result: ResultItem) {
    if (mode.kind !== "command-active" || !mode.command.onActivate) {
      return
    }

    await mode.command.onActivate(result, activationContext)
  }

  // launching app
  async function launchApp(app: AppEntry) {
    try {
      await invoke("launch_app", {
        exec: app.exec,
        terminal: app.terminal,
      })

      console.log("Launching:", app.name, "Command:", app.exec)

      await hideWindow()
    } catch (error) {
      console.error("failed to launch application:", error)
      setError(`failed to launch ${app.name}`)
    }
  }

  // keyboard handler
  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // arrow keys move through results
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "ArrowLeft" ||event.key === "ArrowRight") {
      const navigation =
        mode.kind === "command-active"
          ? mode.command.navigation
          : undefined

      const isGrid = navigation?.type === "grid"

      // left/right should still move the text cursor for normal result lists
      if (!isGrid && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        return
      }

      event.preventDefault()

      if (results.length === 0) {
        return
      }

      setSelectedIndex((currentIndex) => {
        if (!isGrid) {
          if (event.key === "ArrowDown") {
            return Math.min(currentIndex + 1, results.length - 1)
          }
          return Math.max(currentIndex - 1, 0)
        }
        const columns = navigation.columns
        const rowStart = Math.floor(currentIndex / columns) * columns
        const rowEnd = Math.min(
          rowStart + columns - 1,
          results.length - 1,
        )

        switch (event.key) {
          case "ArrowLeft":
            return Math.max(currentIndex - 1, rowStart)
          case "ArrowRight":
            return Math.min(currentIndex + 1, rowEnd)
            case "ArrowUp": {
              const targetIndex = currentIndex - columns
              return targetIndex >= 0
                ? targetIndex
                : currentIndex
            }
            case "ArrowDown": {
              const targetIndex = currentIndex + columns
              if (targetIndex < results.length) {
                return targetIndex
              }
              const currentRow = Math.floor(currentIndex / columns)
              const lastRow = Math.floor((results.length - 1) / columns)

              // already on the final row
              if (currentRow === lastRow) {
                return currentIndex
              }

              // final row is shorter than the others
              return results.length - 1
            }

          default:
            return currentIndex
        }
      })

      return
    }

    // Tab autocompletes commands while picking a command
    if (event.key === "Tab" && mode.kind === "command-picker") {
      event.preventDefault()

      const cycle = autocompleteCycleRef.current

      // repeated Tab cycles through the existing matches
      if (cycle) {
        const nextIndex = (cycle.index + 1) % cycle.matches.length
        const nextMatch = cycle.matches[nextIndex]

        autocompleteCycleRef.current = {
          matches: cycle.matches,
          index: nextIndex,
        }

        updateInput(`!${nextMatch}`)
        setSelectedIndex(nextIndex)
        return
      }

      const matches = getCommandAutocompleteMatches(inputValue, commandRegistry)

      if (matches.length === 0) {
        return
      }

      if (matches.length === 1) {
        autocompleteCycleRef.current = {matches, index:0}

        updateInput(`!${matches[0]}`)
        setSelectedIndex(0)
        return
      }

      const commonPrefix = getCommonPrefix(matches)
      const currentPrefix = inputValue.slice(1).trim().toLowerCase()

      // complete as far as possible before beginning the cycle
      if (commonPrefix.length > currentPrefix.length) {
        autocompleteCycleRef.current = { matches, index: -1 }
        updateInput(`!${commonPrefix}`)
        setSelectedIndex(0)
        return
      }

      // no longer common prefix, so start at the first match
      autocompleteCycleRef.current = { matches, index: 0 }
      updateInput(`!${matches[0]}`)
      setSelectedIndex(0)
      return
    }

    // Tab is pressed
    if (event.key === "Tab" && mode.kind === "command-active" && mode.command.onTab) {
      event.preventDefault()
      const nextResults = mode.command.onTab(results, activationContext)
      if (nextResults !== undefined) {
        setInteractionResults(nextResults)
      }
      return
    }

    // Enter is pressed
    if (event.key === "Enter") {
      event.preventDefault()
      const selectedResult = results[selectedIndex]
      if (!selectedResult) {
        return
      }

      // app results launch applications
      if (selectedResult.type === "app") {
        await launchApp(selectedResult.app)
        return
      }

      // command results activate the selected command
      if (selectedResult.type === "command") {
        activateCommand(selectedResult.command)
        setSelectedIndex(0)
        return
      }

      const resultCommand =
        mode.kind === "command-active"
          ? mode.command
          : mode.kind === "search"
            ? passiveCommand
            : undefined

      if (resultCommand?.onActivate) {
        await resultCommand.onActivate(selectedResult, activationContext)
        return
      }
    }

    // Esc is pressed
    if (event.key === "Escape") {
      event.preventDefault()

      // escape from command modes returns to normal search
      if (mode.kind !== "search") {
        resetInput()
        setSelectedIndex(0)
        return
      }

      // escape from normal search hides owl
      await hideWindow()
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden rounded-xl border border-border bg-bg text-text">
      {/* search bar */}
      <SearchBar
        query={inputValue}
        resultCount={results.length}
        onQueryChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        carouselActive={mode.kind === "search" && inputValue === ""}
        autocompleteSuggestion={autocompleteSuggestion}
      />

      {/* result area */}
      <ResultArea
        mode={mode}
        results={results}
        query={inputValue}
        error={error}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onActivateCommand={activateCommand}
        launchApp={launchApp}
        selectedRef={selectedRef}
        onActivate={activateResult}
      />

      {/* footer */}
      <Footer resultCount={results.length} hints={footerHints}/>
    </div>
  )
}

export default App
