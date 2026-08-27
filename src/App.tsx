import "./App.css"

import { useEffect, useRef, useState } from "react"
import { useInputMode } from "./input/useInputMode"

import type { KeyboardEvent } from "react"

import type { AppEntry } from "./types"

import { getCurrentWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/core"

// components
import SearchBar from "./components/SearchBar"
import ResultArea from "./components/results/ResultArea"
import Footer from "./components/Footer"

import { searchApps } from "./commands/providers/apps"
import { calculate, calculatorCommand } from "./commands/providers/calculator"
import { commandRegistry } from "./commands"

function App() {
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

  // searching happens entirely in the frontend... for now...
  // normal search mode uses the app search provider
  const results =
    mode.kind === "search"
      ? calculatorCommand.passiveMatch?.(mode.query)
        ? calculate(mode.query)
        : searchApps(apps, mode.query)
      : mode.kind === "command-picker"
        ? commandRegistry.search(mode.filter).map((command) => ({
            type: "command" as const,
            id: `command:${command.id}`,
            command,
          }))
        : mode.command.id === "calc"
          ? calculate(mode.query)
          : []

  // function to handle query changes
  function handleQueryChange(value: string) {
    setError(null)
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

    if (event.key === "ArrowUp") {
      event.preventDefault()

      if (results.length === 0) {
        return
      }

      setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0))

      return
    }

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
    }

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
