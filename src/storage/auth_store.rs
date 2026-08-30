use crate::tumblr::TumblrBlogInfo;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SavedAuth {
    pub token: String,
    pub token_secret: String,
    pub user_name: Option<String>,
    pub blog_name: Option<String>,
    #[serde(default)]
    pub available_blogs: Vec<TumblrBlogInfo>,
}

pub struct AuthStore;

impl AuthStore {
    fn storage_path() -> PathBuf {
        if let Some(home) = std::env::var_os("HOME").map(PathBuf::from) {
            let dir = home.join(".tistory-editor");
            let _ = fs::create_dir_all(&dir);
            dir.join("auth.json")
        } else {
            PathBuf::from(".auth.json")
        }
    }

    pub fn load_auth() -> Option<SavedAuth> {
        let path = Self::storage_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(auth) = serde_json::from_str::<SavedAuth>(&content) {
                    if !auth.token.is_empty() && !auth.token_secret.is_empty() {
                        return Some(auth);
                    }
                }
            }
        }
        None
    }

    pub fn save_auth(auth: &SavedAuth) -> Result<()> {
        let path = Self::storage_path();
        let content = serde_json::to_string_pretty(auth)?;
        fs::write(&path, content)
            .with_context(|| format!("Failed to save auth to: {}", path.display()))?;
        println!("Saved auth credentials to: {}", path.display());
        Ok(())
    }

    pub fn clear_auth() -> Result<()> {
        let path = Self::storage_path();
        if path.exists() {
            fs::remove_file(&path)?;
        }
        Ok(())
    }
}
