import "./App.css"

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import type { AppEntry } from "./types";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";

// icons
import { Search, CornerDownLeft, AppWindow, FileQuestionMark } from "lucide-react";

function App() {


  // complete application index returned by rust backend
  const [apps, setApps] = useState<AppEntry[]>([])

  // whatver the user has currently types in the launcher
  const [query, setQuery] = useState("")

  // index of the currently highlighted result
  const [selectedIndex, setSelectedIndex] = useState(0)

  // error state
  const [error, setError] = useState<string | null>(null)

  const selectedRef = useRef<HTMLParagraphElement | null>(null);


  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
    });
  }, [selectedIndex, query]);

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

  // function to assign application icon and fallback
  function ApplicationIcon({ app }: { app: AppEntry }) {
    // for failed to load application icons
    const [failed, setFailed] = useState(false)

    if (!app.icon || failed) {
      return (
        <div className="app-icon-fallback">
          {/*<AppWindow size={28} strokeWidth={1} />*/}
          <FileQuestionMark size={28} strokeWidth={2} />
        </div>
      )
    }

    return (
      <img
        src={convertFileSrc(app.icon)}
        alt=""
        className="app-icon"
        onError={() => setFailed(true)}
      />
    )
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
      await launchApp(selectedApp)
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      await hideWindow()
    }
  }

  return (

    <div className="app">

      <div className="search-container">
        {/*search icon*/}
        <div className="search-icon">
          <Search size={20} strokeWidth={3}/>
        </div>

        {/*input*/}
        <input
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search applications..."
          autoFocus
          className="search-input"
        />
      </div>

      {/*results*/}
      <div className="results">
        {filteredApps.map((app, index) => (
            <p
              key={app.name}
              ref={index === selectedIndex ? selectedRef : null}
              className={`result ${index === selectedIndex ? "selected" : ""}`}

              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => launchApp(app)}
          >
            <div className="result-info">
              {/* app icon */}
              <ApplicationIcon app={app} />

              {/* app name */}
              <span>{app.name}</span>
            </div>

            {/*return icon*/}
            {index === selectedIndex && (
              <CornerDownLeft size={16} strokeWidth={3} />
            )}
            </p>
          ))}
      </div>

      {/*footer*/}
      <div className="footer">
        {filteredApps.length} results
      </div>

    </div>

  )
}

export default App;
