import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";

import type { AppEntry } from "./types";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

function App() {
  // complete application index returned by rust backend
  const [apps, setApps] = useState<AppEntry[]>([])

  // whatver the user has currently types in the launcher
  const [query, setQuery] = useState("")

  // index of the currently highlighted result
  const [selectedIndex, setSelectedIndex] = useState(0)

  // error state
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  // apps only changes when rust gives a new application index
  // query changes on every keystroke. no filesystem access happens here.
  const normalizedQuery = query.toLowerCase()
  const filteredApps = apps.filter((app) => {
    const normalizedName = app.name.toLowerCase()
    return normalizedName.includes(normalizedQuery)
  })

  // function to handle query changes
  function handleQueryChange(value: string) {
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

  // keyboard handler
  async function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (filteredApps.length === 0) {
        return
      }
      setSelectedIndex((currentIndex) => Math.min(currentIndex + 1, filteredApps.length - 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (filteredApps.length === 0) {
        return
      }
      setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0))
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const selectedApp = filteredApps[selectedIndex]
      if (!selectedApp) {
        return
      }

      try {
        await invoke("launch_app", {
          exec: selectedApp.exec,
        })

        console.log("Launching: ", selectedApp.name, "\tCommand: ", selectedApp.exec)

        await hideWindow()
      } catch (error) {
        console.error("failed to launch application: ", error)
        setError(`failed to launch ${selectedApp.name}`)
      }

      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      await hideWindow()
    }
  }

  return (
    <main>
      <input
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search applications..."
        autoFocus
      />

      {error && <p>{error}</p>}

      <p>
        Loaded: {apps.length} apps | Matching: {filteredApps.length}
      </p>

      <ul>
        {filteredApps.map((app, index) => (
          <li key={app.name} style={{background: index === selectedIndex? "#ddd" : "transparent"}}>{app.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App;
