import { useEffect, useState } from "react";

import type { AppEntry } from "./types";
import { invoke } from "@tauri-apps/api/core";

function App() {
  // complete application index returned by rust backend
  const [apps, setApps] = useState<AppEntry[]>([])

  // whatver the user has currently types in the launcher
  const [query, setQuery] = useState("")

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

  return (
    <main>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search applications..."
        autoFocus
      />

      {error && <p>{error}</p>}

      <p>
        Loaded: {apps.length} apps | Matching: {filteredApps.length}
      </p>

      <ul>
        {filteredApps.map((app) => (
          <li key={app.name}>{app.name}</li>
        ))}
      </ul>
    </main>
  )
}

export default App;
