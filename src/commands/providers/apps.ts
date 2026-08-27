import type { AppEntry } from "../../types";
import type { ResultItem } from "../types";

// converts an AppEntry into the ResultItem format
function createAppResult(app: AppEntry): ResultItem{
  return {
    type: "app",
    id: `app:${app.name}`,
    app,
  }
}

// searches the existing app list
export function searchApps(apps: AppEntry[], query: string): ResultItem[] {
  const normalizedQuery = query.toLowerCase()
  return apps.filter((app) => {
    const normalizedName = app.name.toLowerCase()
    return normalizedName.includes(normalizedQuery)
  }).map(createAppResult)
}
