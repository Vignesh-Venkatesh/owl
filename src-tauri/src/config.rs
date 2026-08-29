use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct AppConfig {
    #[serde(default)]
    pub appearance: AppearanceConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppearanceConfig {
    #[serde(default = "default_theme")]
    pub theme: String,
}

impl Default for AppearanceConfig {
    fn default() -> Self {
        Self {
            theme: default_theme(),
        }
    }
}

fn default_theme() -> String {
    "owl".to_string()
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .config_dir()
        .map(|dir| dir.join("owl-launcher").join("config.toml"))
        .map_err(|error| format!("failed to resolve config directory: {error}"))
}

pub fn load_config(app: &AppHandle) -> Result<AppConfig, String> {
    let path = config_path(app)?;

    if !path.exists() {
        return Ok(AppConfig::default());
    }

    let contents =
        fs::read_to_string(&path).map_err(|error| format!("failed to read config: {error}"))?;

    toml::from_str(&contents).map_err(|error| format!("failed to parse config: {error}"))
}

pub fn save_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("failed to create config directory: {error}"))?;
    }

    let contents = toml::to_string_pretty(config)
        .map_err(|error| format!("failed to serialize config: {error}"))?;

    fs::write(&path, contents).map_err(|error| format!("failed to write config: {error}"))
}
