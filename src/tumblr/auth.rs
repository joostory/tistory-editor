use super::models::TumblrOAuthConfig;
use super::oauth_reader::TumblrOAuthInfo;
use anyhow::{Context, Result};
use oauth1::Token;
use reqwest::header::AUTHORIZATION;
use std::borrow::Cow;
use std::collections::HashMap;

pub struct TumblrAuth {
    pub config: TumblrOAuthConfig,
    pub oauth_info: Option<TumblrOAuthInfo>,
}

impl TumblrAuth {
    pub fn new(
        consumer_key: impl Into<String>,
        consumer_secret: impl Into<String>,
        token: Option<String>,
        token_secret: Option<String>,
    ) -> Self {
        Self {
            config: TumblrOAuthConfig {
                consumer_key: consumer_key.into(),
                consumer_secret: consumer_secret.into(),
                token,
                token_secret,
            },
            oauth_info: None,
        }
    }

    pub fn from_oauth_info(
        oauth_info: TumblrOAuthInfo,
        token: Option<String>,
        token_secret: Option<String>,
    ) -> Self {
        Self {
            config: TumblrOAuthConfig {
                consumer_key: oauth_info.client_key.clone(),
                consumer_secret: oauth_info.client_secret.clone(),
                token,
                token_secret,
            },
            oauth_info: Some(oauth_info),
        }
    }

    pub fn is_authenticated(&self) -> bool {
        self.config.token.is_some() && self.config.token_secret.is_some()
    }

    /// OAuth 1.0a Authorization 헤더 생성
    pub fn generate_auth_header(&self, method: &str, url: &str) -> Result<String> {
        let consumer = Token::new(&self.config.consumer_key, &self.config.consumer_secret);

        let token_opt = match (&self.config.token, &self.config.token_secret) {
            (Some(token), Some(secret)) => Some(Token::new(token, secret)),
            _ => None,
        };

        let auth_header = oauth1::authorize(
            method,
            url,
            &consumer,
            token_opt.as_ref(),
            None,
        );

        Ok(auth_header)
    }

    /// Step 1: Request Token 요청
    pub async fn request_temporary_credentials(
        &self,
        client: &reqwest::Client,
    ) -> Result<(String, String)> {
        let oauth_info = self
            .oauth_info
            .as_ref()
            .context("OAuth info not loaded")?;

        let url = &oauth_info.request_token_url;
        let consumer = Token::new(&self.config.consumer_key, &self.config.consumer_secret);

        // callback_uri 포함 서명 생성
        let mut options: HashMap<&str, Cow<'_, str>> = HashMap::new();
        options.insert("oauth_callback", Cow::Borrowed(oauth_info.redirect_uri.as_str()));

        let auth_header = oauth1::authorize(
            "POST",
            url,
            &consumer,
            None,
            Some(options),
        );

        let res = client
            .post(url)
            .header(AUTHORIZATION, auth_header)
            .send()
            .await
            .context("Failed to request OAuth request_token")?;

        let body = res
            .text()
            .await
            .context("Failed to read request_token response body")?;

        let params: HashMap<String, String> = form_urlencoded_parse(&body);

        let token = params
            .get("oauth_token")
            .context("Missing oauth_token in request_token response")?
            .clone();

        let token_secret = params
            .get("oauth_token_secret")
            .context("Missing oauth_token_secret in request_token response")?
            .clone();

        Ok((token, token_secret))
    }

    /// Step 2: 브라우저 인증 URL 생성
    pub fn get_authorize_url(&self, request_token: &str) -> Result<String> {
        let oauth_info = self
            .oauth_info
            .as_ref()
            .context("OAuth info not loaded")?;

        Ok(format!(
            "{}?oauth_token={}",
            oauth_info.authorize_url, request_token
        ))
    }

    /// Step 3: Verifier 코드로 Access Token 요청
    pub async fn request_access_token(
        &self,
        client: &reqwest::Client,
        request_token: &str,
        request_token_secret: &str,
        verifier: &str,
    ) -> Result<(String, String)> {
        let oauth_info = self
            .oauth_info
            .as_ref()
            .context("OAuth info not loaded")?;

        let url = &oauth_info.token_url;
        let consumer = Token::new(&self.config.consumer_key, &self.config.consumer_secret);
        let temp_token = Token::new(request_token, request_token_secret);

        let mut options: HashMap<&str, Cow<'_, str>> = HashMap::new();
        if !verifier.is_empty() {
            options.insert("oauth_verifier", Cow::Borrowed(verifier));
        }

        let auth_header = oauth1::authorize(
            "POST",
            url,
            &consumer,
            Some(&temp_token),
            if options.is_empty() { None } else { Some(options) },
        );

        let res = client
            .post(url)
            .header(AUTHORIZATION, auth_header)
            .send()
            .await
            .context("Failed to request OAuth access_token")?;

        let body = res
            .text()
            .await
            .context("Failed to read access_token response body")?;

        let params: HashMap<String, String> = form_urlencoded_parse(&body);

        let access_token = params
            .get("oauth_token")
            .context("Missing oauth_token in access_token response")?
            .clone();

        let access_token_secret = params
            .get("oauth_token_secret")
            .context("Missing oauth_token_secret in access_token response")?
            .clone();

        Ok((access_token, access_token_secret))
    }

    /// URL, 쿼리 스트링 또는 verifier 코드에서 (oauth_token, oauth_verifier) 파싱
    pub fn parse_callback_input(input: &str) -> (Option<String>, Option<String>) {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return (None, None);
        }

        // 1. Full URL 파싱 시도 (tistory-editor://... 또는 https://...)
        if let Ok(url) = url::Url::parse(trimmed) {
            println!("parse url");
            let mut token = None;
            let mut verifier = None;
            for (key, val) in url.query_pairs() {
                if key == "oauth_token" {
                    token = Some(val.to_string());
                } else if key == "oauth_verifier" {
                    verifier = Some(val.to_string());
                }
            }
            if verifier.is_some() {
                return (token, verifier);
            }
        }

        // 2. 쿼리 파라미터 파싱 시도 (?oauth_token=...&oauth_verifier=...)
        if trimmed.contains("oauth_verifier=") {
            println!("parse query param");
            let query_str = if let Some(idx) = trimmed.find('?') {
                &trimmed[idx + 1..]
            } else {
                trimmed
            };
            let mut token = None;
            let mut verifier = None;
            for pair in query_str.split('&') {
                let mut parts = pair.split('=');
                if let (Some(k), Some(v)) = (parts.next(), parts.next()) {
                    if k == "oauth_token" {
                        token = Some(v.to_string());
                    } else if k == "oauth_verifier" {
                        verifier = Some(v.to_string());
                    }
                }
            }
            if verifier.is_some() {
                return (token, verifier);
            }
        }

        // 3. 단순 verifier 코드
        println!("parse none");
        (None, Some(trimmed.to_string()))
    }
}

fn form_urlencoded_parse(query: &str) -> HashMap<String, String> {
    url::form_urlencoded::parse(query.as_bytes())
        .into_owned()
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_callback_input() {
        let deep_link = "tistory-editor://tistory-editor/callback?oauth_token=tok123&oauth_verifier=ver456";
        let (token, verifier) = TumblrAuth::parse_callback_input(deep_link);
        assert_eq!(token, Some("tok123".to_string()));
        assert_eq!(verifier, Some("ver456".to_string()));

        let web_url = "https://joostory.github.io/tistory-editor/callback.html?oauth_token=tokABC&oauth_verifier=verXYZ";
        let (token2, verifier2) = TumblrAuth::parse_callback_input(web_url);
        assert_eq!(token2, Some("tokABC".to_string()));
        assert_eq!(verifier2, Some("verXYZ".to_string()));

        let plain_verifier = "just_a_verifier_code";
        let (token3, verifier3) = TumblrAuth::parse_callback_input(plain_verifier);
        assert_eq!(token3, None);
        assert_eq!(verifier3, Some("just_a_verifier_code".to_string()));
    }
}
