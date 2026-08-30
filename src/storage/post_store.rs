use crate::npf::NpfDocument;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedPost {
    pub id: String,
    pub title: String,
    pub date: String,
    pub tags: Vec<String>,
    pub document: NpfDocument,
    pub state: String, // "published" or "draft"
}

pub struct PostStore;

impl PostStore {
    fn storage_path() -> PathBuf {
        if let Some(home) = std::env::var_os("HOME").map(PathBuf::from) {
            let dir = home.join(".tistory-editor");
            let _ = fs::create_dir_all(&dir);
            dir.join("posts.json")
        } else {
            PathBuf::from(".posts.json")
        }
    }

    pub fn load_posts() -> Vec<SavedPost> {
        let path = Self::storage_path();
        if path.exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                if let Ok(posts) = serde_json::from_str::<Vec<SavedPost>>(&content) {
                    return posts;
                }
            }
        }
        Vec::new()
    }

    pub fn save_posts(posts: &[SavedPost]) -> Result<()> {
        let path = Self::storage_path();
        let content = serde_json::to_string_pretty(posts)?;
        fs::write(&path, content)
            .with_context(|| format!("Failed to save posts to: {}", path.display()))?;
        Ok(())
    }
}
