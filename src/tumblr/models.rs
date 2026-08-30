use crate::npf::{NpfBlock, NpfLayout};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TumblrUserInfo {
    pub name: String,
    pub blogs: Vec<TumblrBlogInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TumblrBlogInfo {
    pub name: String,
    pub title: String,
    pub url: String,
    #[serde(default)]
    pub primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TumblrOAuthConfig {
    pub consumer_key: String,
    pub consumer_secret: String,
    pub token: Option<String>,
    pub token_secret: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TumblrPostsResponse {
    #[serde(default)]
    pub total_posts: Option<u64>,
    #[serde(default)]
    pub posts: Vec<TumblrPostItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TumblrPostItem {
    pub id_string: Option<String>,
    pub id: Option<u64>,
    pub title: Option<String>,
    pub summary: Option<String>,
    pub date: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub content: Vec<NpfBlock>,
    #[serde(default)]
    pub layout: Vec<NpfLayout>,
    #[serde(default)]
    pub state: Option<String>,
}

impl TumblrPostItem {
    pub fn get_id(&self) -> String {
        self.id_string
            .clone()
            .or_else(|| self.id.map(|id| id.to_string()))
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string())
    }

    pub fn display_title(&self) -> String {
        if let Some(ref title) = self.title {
            if !title.is_empty() {
                return title.clone();
            }
        }
        if let Some(ref summary) = self.summary {
            if !summary.is_empty() {
                return summary.clone();
            }
        }
        // content의 첫 텍스트 블록에서 제목 유추
        for block in &self.content {
            if let NpfBlock::Text(ref tb) = block {
                if !tb.text.trim().is_empty() {
                    let first_line = tb.text.lines().next().unwrap_or(&tb.text);
                    return first_line.chars().take(40).collect();
                }
            }
        }
        "Untitled Tumblr Post".to_string()
    }
}
