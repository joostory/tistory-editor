use super::auth::TumblrAuth;
use super::models::{TumblrBlogInfo, TumblrPostItem, TumblrPostsResponse, TumblrUserInfo};
use crate::npf::NpfDocument;
use anyhow::{Context, Result};
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};

pub struct TumblrClient {
    pub auth: TumblrAuth,
    client: reqwest::Client,
}

fn slice_is_empty<T>(s: &&[T]) -> bool {
    s.is_empty()
}

#[derive(Serialize)]
struct CreatePostRequest<'a> {
    content: &'a [crate::npf::NpfBlock],
    #[serde(skip_serializing_if = "slice_is_empty")]
    layout: &'a [crate::npf::NpfLayout],
    state: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    tags: Option<String>,
}

#[derive(Deserialize)]
struct TumblrApiResponse<T> {
    response: T,
}

#[derive(Deserialize)]
struct UserInfoResponse {
    user: UserInfoPayload,
}

#[derive(Deserialize)]
struct UserInfoPayload {
    name: String,
    blogs: Vec<BlogPayload>,
}

#[derive(Deserialize)]
struct BlogPayload {
    name: String,
    title: String,
    url: String,
    primary: Option<bool>,
}

impl TumblrClient {
    pub fn new(auth: TumblrAuth) -> Self {
        Self {
            auth,
            client: reqwest::Client::new(),
        }
    }

    /// 사용자 정보 및 블로그 목록 조회
    pub async fn get_user_info(&self) -> Result<TumblrUserInfo> {
        let url = "https://api.tumblr.com/v2/user/info";
        let auth_header = self.auth.generate_auth_header("GET", url)?;

        let res = self
            .client
            .get(url)
            .header(AUTHORIZATION, auth_header)
            .send()
            .await
            .context("Failed to send user info request")?;

        let data: TumblrApiResponse<UserInfoResponse> = res
            .json()
            .await
            .context("Failed to parse user info response")?;

        let blogs = data
            .response
            .user
            .blogs
            .into_iter()
            .map(|b| TumblrBlogInfo {
                name: b.name,
                title: b.title,
                url: b.url,
                primary: b.primary.unwrap_or(false),
            })
            .collect();

        Ok(TumblrUserInfo {
            name: data.response.user.name,
            blogs,
        })
    }

    /// 특정 블로그의 최신 NPF 게시글 목록 조회
    pub async fn get_blog_posts(&self, blog_name: &str) -> Result<Vec<TumblrPostItem>> {
        let url = format!("https://api.tumblr.com/v2/blog/{}/posts?npf=true", blog_name);
        let auth_header = self.auth.generate_auth_header("GET", &url)?;

        let res = self
            .client
            .get(&url)
            .header(AUTHORIZATION, auth_header)
            .send()
            .await
            .context("Failed to fetch blog posts")?;

        let data: TumblrApiResponse<TumblrPostsResponse> = res
            .json()
            .await
            .context("Failed to parse blog posts response")?;

        Ok(data.response.posts)
    }

    /// NPF 포스트 생성 (발행 또는 초안)
    pub async fn create_post(
        &self,
        blog_name: &str,
        doc: &NpfDocument,
        state: &str,
        tags: &[String],
    ) -> Result<serde_json::Value> {
        let url = format!("https://api.tumblr.com/v2/blog/{}/posts", blog_name);
        let auth_header = self.auth.generate_auth_header("POST", &url)?;

        let tags_str = if tags.is_empty() {
            None
        } else {
            Some(tags.join(","))
        };

        let body = CreatePostRequest {
            content: &doc.content,
            layout: &doc.layout,
            state,
            tags: tags_str,
        };

        let res = self
            .client
            .post(&url)
            .header(AUTHORIZATION, auth_header)
            .header(CONTENT_TYPE, "application/json")
            .json(&body)
            .send()
            .await
            .context("Failed to create post")?;

        let json = res.json::<serde_json::Value>().await?;
        Ok(json)
    }
}
