use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TumblrOAuthInfo {
    pub client_key: String,
    pub client_secret: String,
    pub request_token_url: String,
    pub authorize_url: String,
    pub token_url: String,
    pub redirect_uri: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct OAuthConfigFile {
    pub tumblr: Option<TumblrOAuthInfo>,
}

pub struct OAuthInfoReader;

impl OAuthInfoReader {
    /// .oauthInfo.json 또는 oauthInfo.json을 검색하여 Tumblr OAuth 설정 로드
    pub fn load_tumblr_oauth_info() -> Result<TumblrOAuthInfo> {
        let candidates = [
            PathBuf::from(".oauthInfo.json"),
            PathBuf::from("oauthInfo.json"),
            dirs_candidate_path(),
        ];

        for path in &candidates {
            if path.exists() {
                if let Ok(info) = Self::load_from_file(path) {
                    if let Some(tumblr) = info.tumblr {
                        if !tumblr.client_key.is_empty() && tumblr.client_key != "CLIENT_KEY" {
                            println!("Loaded Tumblr OAuth configuration from: {}", path.display());
                            return Ok(tumblr);
                        }
                    }
                }
            }
        }

        // 기본 fallback (개발용 .oauthInfo.json 파싱 시도)
        if let Ok(content) = fs::read_to_string(".oauthInfo.json") {
            let config: OAuthConfigFile = serde_json::from_str(&content)?;
            if let Some(tumblr) = config.tumblr {
                return Ok(tumblr);
            }
        }

        anyhow::bail!("Failed to find valid Tumblr OAuth configuration in .oauthInfo.json or oauthInfo.json")
    }

    pub fn load_from_file(path: &Path) -> Result<OAuthConfigFile> {
        let content = fs::read_to_string(path)
            .with_context(|| format!("Failed to read OAuth config file: {}", path.display()))?;
        let config: OAuthConfigFile = serde_json::from_str(&content)
            .with_context(|| format!("Failed to parse JSON in: {}", path.display()))?;
        Ok(config)
    }
}

fn dirs_candidate_path() -> PathBuf {
    if let Some(home) = dirs_home() {
        home.join(".tistory-editor").join("oauthInfo.json")
    } else {
        PathBuf::from("oauthInfo.json")
    }
}

fn dirs_home() -> Option<PathBuf> {
    std::env::var_os("HOME").map(PathBuf::from)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_oauth_info() {
        let info = OAuthInfoReader::load_tumblr_oauth_info();
        assert!(info.is_ok(), "Should successfully load .oauthInfo.json");
        let tumblr = info.unwrap();
        assert!(!tumblr.client_key.is_empty());
        assert!(!tumblr.client_secret.is_empty());
        assert_eq!(tumblr.request_token_url, "https://www.tumblr.com/oauth/request_token");
        assert_eq!(tumblr.authorize_url, "https://www.tumblr.com/oauth/authorize");
        assert_eq!(tumblr.token_url, "https://www.tumblr.com/oauth/access_token");
    }
}
