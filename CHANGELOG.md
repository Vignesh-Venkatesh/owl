# Changelog

All notable changes to owl are documented here.

## 0.1.0

Initial release of owl, a lightweight Linux-first application launcher.

### Features

- **Global launcher shortcut**
  - Toggle owl from anywhere with `Ctrl + Alt + Space`.
  - Hide the launcher with the same shortcut or `Esc`.
  - Center, show, focus, and keep the launcher above other windows when it is opened.

- **Spotlight style launcher window**
  - Compact, centered, always on top interface.
  - Non resizable launcher panel with a dark theme, rounded corners, amber selection accents, and a results count footer.

- **Linux application discovery**
  - Index installed applications from standard system and user `.desktop` directories:
    - `/usr/share/applications`
    - `/var/lib/flatpak/exports/share/applications`
    - `~/.local/share/applications`
    - `~/.local/share/flatpak/exports/share/applications`
  - Parse application names, launch commands, icons, and terminal requirements from desktop entries.
  - Ignore hidden entries (`NoDisplay=true`) and entries without a name or executable command.
  - Skip malformed or unreadable entries without preventing the rest of the index from loading.
  - Deduplicate applications by name, preferring user entries over system entries.
  - Sort indexed applications alphabetically without case sensitivity.

- **Live application search**
  - Filter indexed applications as the user types.
  - Perform case insensitive substring matching against application names.
  - Reset the selection to the first result when the query changes.
  - Display the number of matching results and a clear empty state when no applications match.

- **Keyboard and mouse navigation**
  - Use `ArrowUp` and `ArrowDown` to move through results.
  - Keep the selected result visible while navigating longer lists.
  - Press `Enter` to launch the selected application.
  - Click a result to launch it or hover over it to select it.
  - Prevent navigation and launch actions when there are no matching results.

- **Application launching**
  - Launch regular applications as detached child processes without blocking owl.
  - Remove common Freedesktop desktop-entry field codes from executable commands before launch (`%f`, `%F`, `%u`, `%U`, `%i`, `%c`, and `%k`).
  - Launch entries marked `Terminal=true` through `x-terminal-emulator`.
  - Hide owl after a successful launch.

- **Application icons**
  - Resolve absolute icon paths and named icons through the Freedesktop icon theme lookup.
  - Support common icon name suffixes such as `.png`, `.svg`, and `.xpm`.
  - Serve resolved local icons through Tauri's asset protocol.
  - Show a fallback icon when an entry has no icon or its icon cannot be loaded.

- **Error handling**
  - Show a user facing error state when application indexing fails.
  - Show a user facing error state when the launcher cannot hide or an application cannot be started.
  - Continue indexing other applications when an individual desktop file, directory entry, or icon cannot be read or parsed.

### Known limitations

- v0.1.0 is developed and tested on Linux. Other platforms are not currently supported as a release target.
- Search currently uses case insensitive substring matching rather than fuzzy ranking.
- Some terminal applications may not launch correctly, depending on the desktop entry and local terminal emulator setup.
- Application discovery follows Linux desktop entry conventions and does not yet include calculator mode, file search, clipboard history, commands, settings, or plugins.
- The application index is rebuilt when `search_apps` is invoked. Disk caching and background re-indexing are not part of this release.
