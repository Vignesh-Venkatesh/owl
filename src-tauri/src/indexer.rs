//! Indexes linux .desktop application entries from the system and the current user's application directories

use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, serde::Serialize)]
pub struct AppEntry {
    pub name: String,
    pub exec: String,
    pub icon: Option<String>,
    pub terminal: bool,
}

fn clean_exec(exec: &str) -> String {
    const FIELD_CODES: [&str; 7] = ["%f", "%F", "%u", "%U", "%i", "%c", "%k"];
    let mut cleaned = exec.to_string();

    for code in FIELD_CODES {
        cleaned = cleaned.replace(code, "");
    }

    cleaned.trim().to_string()
}

// icon resolver
fn resolve_icon(icon: &str) -> Option<String> {
    let icon_path = Path::new(icon);

    // absolute icon path from the .desktop file
    if icon_path.is_absolute() && icon_path.exists() {
        return icon_path
            .canonicalize()
            .ok()
            .map(|path| path.to_string_lossy().to_string());
    }

    let icon_name = icon
        .strip_suffix(".png")
        .or_else(|| icon.strip_suffix(".svg"))
        .or_else(|| icon.strip_suffix(".xpm"))
        .unwrap_or(icon);

    freedesktop_icons::lookup(icon_name)
        .with_size(48)
        .with_cache()
        .find()
        .and_then(|path| path.canonicalize().ok())
        .map(|path| path.to_string_lossy().to_string())
}

// .desktop text parser
fn parse_desktop_entry(contents: &str) -> Result<Option<AppEntry>, String> {
    let mut in_desktop_entry = false;

    let mut name: Option<String> = None;
    let mut exec: Option<String> = None;
    let mut icon: Option<String> = None;
    let mut no_display = false;
    let mut terminal = false;

    // parsing
    for (line_number, raw_line) in contents.lines().enumerate() {
        let line = raw_line.trim();

        if line.is_empty() || line.starts_with("#") {
            continue;
        }

        if line.starts_with("[") && line.ends_with(']') {
            let section_name = &line[1..line.len() - 1];
            in_desktop_entry = section_name == "Desktop Entry";
            continue;
        }

        if !in_desktop_entry {
            continue;
        }

        let Some((key, value)) = line.split_once('=') else {
            return Err(format!("line {} is not a key-value pair", line_number + 1));
        };

        let key = key.trim();
        let value = value.trim();

        // field handling

        match key {
            "Name" => {
                if !value.is_empty() {
                    name = Some(value.to_string());
                }
            }

            "Exec" => {
                if !value.is_empty() {
                    exec = Some(value.to_string());
                }
            }

            "Icon" => {
                if !value.is_empty() {
                    icon = Some(value.to_string());
                }
            }

            "NoDisplay" => {
                if value.eq_ignore_ascii_case("true") {
                    no_display = true;
                } else if value.eq_ignore_ascii_case("false") {
                    no_display = false;
                } else {
                    return Err(format!(
                        "invalid NoDisplay value on line {}",
                        line_number + 1
                    ));
                }
            }

            "Terminal" => {
                if value.eq_ignore_ascii_case("true") {
                    terminal = true;
                } else if value.eq_ignore_ascii_case("false") {
                    terminal = false;
                } else {
                    return Err(format!(
                        "invalid Terminal value on line {}",
                        line_number + 1
                    ));
                }
            }

            _ => {}
        }
    }

    if no_display {
        return Ok(None);
    }

    let Some(name) = name else {
        return Ok(None);
    };

    let Some(exec) = exec else {
        return Ok(None);
    };

    Ok(Some(AppEntry {
        name,
        exec: clean_exec(&exec),
        icon: icon.and_then(|icon| resolve_icon(&icon)),
        terminal,
    }))
}

// scanning directory
fn scan_directory(path: &Path) -> Vec<AppEntry> {
    let mut apps = Vec::new();

    let entries = match fs::read_dir(path) {
        Ok(entries) => entries,

        Err(error) => {
            eprintln!("warning: could not read {}: {}", path.display(), error);

            return apps;
        }
    };

    for entry in entries {
        let entry = match entry {
            Ok(entry) => entry,

            Err(error) => {
                eprintln!("warning: could not read directory entry: {error}");
                continue;
            }
        };

        let path = entry.path();

        if path.extension().and_then(|ext| ext.to_str()) != Some("desktop") {
            continue;
        }

        let contents = match fs::read_to_string(&path) {
            Ok(contents) => contents,

            Err(error) => {
                eprintln!("warning: could not read {}: {}", path.display(), error);
                continue;
            }
        };

        match parse_desktop_entry(&contents) {
            Ok(Some(app)) => {
                apps.push(app);
            }

            Ok(None) => {
                // the file was valid, but intentionally skipped
            }

            Err(error) => {
                eprintln!("warning: could not parse {}: {}", path.display(), error);
            }
        }
    }

    apps
}

pub fn index_apps() -> Vec<AppEntry> {
    let system_dir = PathBuf::from("/usr/share/applications");
    let system_flatpak_dir = PathBuf::from("/var/lib/flatpak/exports/share/applications");

    let user_dir = env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join(".local/share/applications"));

    let user_flatpak_dir = env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join(".local/share/flatpak/exports/share/applications"));

    let mut apps_by_name: HashMap<String, AppEntry> = HashMap::new();

    // indexing system applications first
    for app in scan_directory(&system_dir) {
        apps_by_name.insert(app.name.clone(), app);
    }

    // indexing system flatpak applications
    for app in scan_directory(&system_flatpak_dir) {
        apps_by_name.insert(app.name.clone(), app);
    }

    // indexing user applications second

    // replaces an existing value if the key already exists, so a user application with the same name automatically overrides the system application
    if let Some(user_dir) = user_dir {
        for app in scan_directory(&user_dir) {
            apps_by_name.insert(app.name.clone(), app);
        }
    }

    // indexing user flatpak applications
    if let Some(user_flatpak_dir) = user_flatpak_dir {
        for app in scan_directory(&user_flatpak_dir) {
            apps_by_name.insert(app.name.clone(), app);
        }
    }

    // used HashMap for deduplication, but callers want a Vec<AppEntry>
    let mut apps: Vec<AppEntry> = apps_by_name.into_values().collect();

    // sorting case insensitively so "Firefox" and "firefox" are ordered based on their letters rather than ASCII capitalization rules
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    apps
}

// testing
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prints_indexed_apps() {
        let apps = index_apps();

        for app in &apps {
            println!("{app:?}");
        }

        println!("Found {} applications", apps.len());
    }

    #[test]
    fn cleans_exec_field_codes() {
        assert_eq!(clean_exec("firefox %u"), "firefox");
        assert_eq!(clean_exec("xed %F"), "xed");
        assert_eq!(
            clean_exec("vlc --started-from-file %U"),
            "vlc --started-from-file"
        );
    }

    #[test]
    fn parses_valid_desktop_entry() {
        let contents = r#"
        [Desktop Entry]
        Name=Firefox
        Exec=firefox %u
        Icon=firefox
        NoDisplay=false
        "#;

        let result = parse_desktop_entry(contents).unwrap().unwrap();

        assert_eq!(result.name, "Firefox");
        assert_eq!(result.exec, "firefox");

        // Firefox is installed on this machine, so its icon should resolve.
        assert!(result.icon.is_some());

        // Terminal defaults to false when Terminal= is omitted.
        assert!(!result.terminal);
    }

    #[test]
    fn skips_no_display_entries() {
        let contents = r#"
    [Desktop Entry]
    Name=Hidden App
    Exec=hidden-app
    NoDisplay=true
    "#;

        let result = parse_desktop_entry(contents).unwrap();

        assert!(result.is_none());
    }

    #[test]
    fn skips_entry_missing_name() {
        let contents = r#"
    [Desktop Entry]
    Exec=some-command
    Icon=some-icon
    "#;

        let result = parse_desktop_entry(contents).unwrap();

        assert!(result.is_none());
    }

    #[test]
    fn skips_entry_missing_exec() {
        let contents = r#"
    [Desktop Entry]
    Name=Some App
    Icon=some-icon
    "#;

        let result = parse_desktop_entry(contents).unwrap();

        assert!(result.is_none());
    }

    #[test]
    fn ignores_other_desktop_sections() {
        let contents = r#"
    [Desktop Entry]
    Name=Firefox
    Exec=firefox %u
    Icon=firefox

    [Desktop Action NewWindow]
    Name=Open New Window
    Exec=firefox --new-window
    "#;

        let result = parse_desktop_entry(contents).unwrap().unwrap();

        assert_eq!(result.name, "Firefox");
        assert_eq!(result.exec, "firefox");
    }

    #[test]
    fn parses_terminal_application() {
        let contents = r#"
    [Desktop Entry]
    Name=btop++
    Exec=btop
    Icon=btop
    Terminal=true
    "#;

        let result = parse_desktop_entry(contents).unwrap().unwrap();

        assert_eq!(result.name, "btop++");
        assert_eq!(result.exec, "btop");
        assert!(result.terminal);
    }
}
