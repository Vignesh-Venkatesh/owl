import "./App.css"

import { useEffect, useRef, useState } from "react"
import { useInputMode } from "./input/useInputMode"
import { useToast } from "./components/toast/ToastProvider"

import type { KeyboardEvent } from "react"

import type { AppEntry } from "./types"
import type { ResultItem } from "./commands/types"

import { getCurrentWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/core"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"

// components
import SearchBar from "./components/search-bar/SearchBar"
import ResultArea from "./components/results/ResultArea"
import Footer from "./components/Footer"

import { searchApps } from "./commands/providers/apps"
import { commandRegistry } from "./commands"

function App() {
  const toast = useToast()

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

  const [activationResults, setActivationResults] = useState<ResultItem[]>([])

  const activeCommand =
    mode.kind === "command-active"
      ? mode.command
      : null

  useEffect(() => {
    if (activeCommand?.runOn === "activation") {
      setActivationResults(activeCommand.handler(""))
      return
    }

    setActivationResults([])
  }, [activeCommand?.id])

  // loading application list
  useEffect(() => {
    setError(null)

    invoke<AppEntry[]>("search_apps")
      .then((indexedApps) => {
        setApps(indexedApps)
      })
      .catch((error) => {
        console.error("failed to index applications:", error)
        setError("failed to load applications.")
      })
  }, [])

  // for passive command searching
  const passiveCommand =
    mode.kind === "search"
      ? commandRegistry.findPassiveMatch(mode.query)
      : undefined

  // searching happens entirely in the frontend... for now...
  // normal search mode uses the app search provider
  const results =
    mode.kind === "search"
      ? passiveCommand
        ? passiveCommand.handler(mode.query)
        : searchApps(apps, mode.query)
      : mode.kind === "command-picker"
        ? commandRegistry.search(mode.filter).map((command) => ({
            type: "command" as const,
            id: `command:${command.id}`,
            command,
          }))
        : mode.command.runOn === "activation"
          ? activationResults
          : mode.command.handler(mode.query)

  // function to handle query changes
  function handleQueryChange(value: string) {
    setError(null)

    // pressing space after an exact command name, id or alias activates that command without pressing Enter
    if (mode.kind === "command-picker" && value.startsWith("!") && value.endsWith(" ")) {
      const commandName = value.slice(1, -1)
      const command = commandRegistry.getByNameOrAlias(commandName) // getting command name if it exists in registry

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
    // arrow down key is pressed
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (results.length === 0) {
        return
      }
      setSelectedIndex((currentIndex) =>
        Math.min(currentIndex + 1, results.length - 1)
      )
      return
    }

    // arrow up key is pressed
    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (results.length === 0) {
        return
      }
      setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0))
      return
    }

    // Tab is pressed
    if (event.key === "Tab") {
      if (mode.kind === "command-active" && mode.command.id === "uuid") {
        event.preventDefault()
        setActivationResults(mode.command.handler(""))
        return
      }
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

      // valid calculator results are copied to the clipboard and appropriate toasts shown
      if (selectedResult.type === "calc") {
        if (selectedResult.status != "valid" || selectedResult.value === null) {
          toast.error("nothing to copy")
          return
        }
        try {
          await writeText(selectedResult.value)
          toast.success(`copied ${selectedResult.value}`)
        } catch (err) {
          console.error("failed to copy calculator result:", err)
          toast.error("failed to copy")
        }
        return
      }

      // UUID results are copied to the clipboard
      if (selectedResult.type === "uuid") {
        try {
          await writeText(selectedResult.value)
          toast.success(`copied \n${selectedResult.value}`)
        } catch (err) {
          console.error("failed to copy UUID result:", err)
          toast.error("failed to copy")
        }
        return
      }

      // command results activate the selected command
      if (selectedResult.type === "command") {
        activateCommand(selectedResult.command)
        setSelectedIndex(0)
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
      />

      {/* footer */}
      <Footer resultCount={results.length} />
    </div>
  )
}

export default App
