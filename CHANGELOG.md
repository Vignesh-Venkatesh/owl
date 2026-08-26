# Changelog

All notable changes to owl will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/).

---

## [0.1.1]

A visual polish release focused on improving owl's interface and introducing theme support.

### Added

* Theme system using shared semantic color tokens.
* New built-in themes:

  * Owl
  * Nord
  * Light
  * OLED
  * Gruvbox
  * Catppuccin
* Bundled JetBrains Mono font support.

### Changed

* Migrated launcher styling to Tailwind CSS.
* Refreshed the launcher interface with updated spacing, colors, borders, and selection styling.
* Improved the visual hierarchy of application results.
* Refactored the launcher UI into smaller reusable components.
* Separated theme colors from component styling to make future themes easier to add.

### Fixed

* Fixed invalid HTML nesting in application result rows.

---

## [0.1.0]

Initial release of owl, a lightweight Linux first application launcher.

### Added

#### Launcher

* Global launcher shortcut using `Ctrl + Alt + Space`.
* Support for hiding the launcher with the global shortcut or `Esc`.
* Automatic centering, focusing, and raising of the launcher window when opened.
* Compact, non-resizable, always-on-top launcher window.
* Dark interface with rounded corners, amber selection accents, and a results-count footer.

#### Application discovery

* Index installed Linux applications from:

  * `/usr/share/applications`
  * `/var/lib/flatpak/exports/share/applications`
  * `~/.local/share/applications`
  * `~/.local/share/flatpak/exports/share/applications`
* Parse application names, executable commands, icons, and terminal requirements from `.desktop` entries.
* Ignore entries marked with `NoDisplay=true`.
* Ignore entries without a valid name or executable command.
* Skip malformed or unreadable desktop entries without stopping the rest of the application index.
* Deduplicate applications by name, preferring user entries over system entries.
* Sort indexed applications alphabetically without case sensitivity.

#### Search

* Live application filtering as the user types.
* Case-insensitive substring matching against application names.
* Automatic selection reset when the search query changes.
* Display of the current number of matching applications.
* Empty state when no applications match the current query.

#### Navigation

* Keyboard navigation using `ArrowUp` and `ArrowDown`.
* Automatic scrolling to keep the selected result visible.
* Launch the selected application with `Enter`.
* Select applications by hovering with the mouse.
* Launch applications by clicking a result.
* Prevent navigation and launch actions when no matching result exists.

#### Application launching

* Launch regular applications as detached child processes without blocking owl.
* Strip common Freedesktop desktop-entry field codes from executable commands:

  * `%f`
  * `%F`
  * `%u`
  * `%U`
  * `%i`
  * `%c`
  * `%k`
* Launch entries marked with `Terminal=true` through `x-terminal-emulator`.
* Automatically hide owl after successfully launching an application.

#### Application icons

* Resolve absolute application icon paths.
* Resolve named icons through Freedesktop icon-theme lookup.
* Support `.png`, `.svg`, and `.xpm` icon files.
* Serve local application icons through Tauri's asset protocol.
* Display a fallback icon when an application's icon is missing or cannot be loaded.

#### Error handling

* User-facing error state when application indexing fails.
* User-facing error state when owl cannot hide its window.
* User-facing error state when an application cannot be launched.
* Continue indexing remaining applications when an individual desktop file, directory entry, or icon cannot be read or parsed.

### Known Limitations

* owl 0.1.0 is developed and tested on Linux. Other platforms are not currently supported release targets.
* Search uses case-insensitive substring matching rather than fuzzy ranking.
* Some terminal applications may not launch correctly depending on their desktop entry and the user's terminal emulator configuration.
* Application discovery currently follows Linux desktop-entry conventions.
* Calculator, commands, file search, clipboard history, settings, and plugins are not included in this release.
* The application index is rebuilt whenever `search_apps` is invoked. Disk caching and background re-indexing are not yet implemented.
