import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/toast/ToastProvider"
import { invoke } from "@tauri-apps/api/core";
import { applyTheme, DEFAULT_THEME_ID, isThemeID } from "./themes/theme";

async function startApp() {
  try {

    // applying theme
    const savedTheme = await invoke<string>("get_theme")
    if (isThemeID(savedTheme)) {
      applyTheme(savedTheme)
    } else {
      console.warn(`unknown theme "${savedTheme}, using default`)
      applyTheme(DEFAULT_THEME_ID)
    }

  } catch (err) {
    console.error("failed to load saved theme:", err)
    applyTheme(DEFAULT_THEME_ID)
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);

void startApp()
