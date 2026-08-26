import "./App.css"

import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"

import type { AppEntry } from "./types"

import { getCurrentWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/core"

// components
import SearchBar from "./components/SearchBar"
import ResultArea from "./components/results/ResultArea"
import Footer from "./components/Footer"

function App() {
  // complete application index returned by rust backend
  const [apps, setApps] = useState<AppEntry[]>([])

  // whatever the user has currently typed in the launcher
  const [query, setQuery] = useState("")

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
  }, [selectedIndex, query])

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
  const normalizedQuery = query.toLowerCase()

  const filteredApps = apps.filter((app) => {
    const normalizedName = app.name.toLowerCase()
    return normalizedName.includes(normalizedQuery)
  })

  // function to handle query changes
  function handleQueryChange(value: string) {
    setError(null)
    setQuery(value)
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

      if (filteredApps.length === 0) {
        return
      }

      setSelectedIndex((currentIndex) =>
        Math.min(currentIndex + 1, filteredApps.length - 1)
      )

      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      if (filteredApps.length === 0) {
        return
      }

      setSelectedIndex((currentIndex) =>
        Math.max(currentIndex - 1, 0)
      )

      return
    }

    if (event.key === "Enter") {
      event.preventDefault()

      const selectedApp = filteredApps[selectedIndex]

      if (!selectedApp) {
        return
      }

      await launchApp(selectedApp)

      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      await hideWindow()
    }
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden rounded-xl border border-border bg-bg text-text">
      {/* search bar */}
      <SearchBar
        query={query}
        resultCount={filteredApps.length}
        onQueryChange={handleQueryChange}
        onKeyDown={handleKeyDown}
      />

      {/* result area */}
      <ResultArea
        mode="apps"
        apps={filteredApps}
        query={query}
        error={error}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        launchApp={launchApp}
        selectedRef={selectedRef}
      />

      {/* footer */}
      <Footer resultCount={filteredApps.length} />
    </div>
  )
}

export default App
