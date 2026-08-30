use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::Root;
use std::sync::{Arc, LazyLock};
use tistory_editor::editor::{EditorModel, EditorView, FocusTarget};
use tistory_editor::npf::{ImageBlock, LinkBlock, NpfBlock, NpfDocument, NpfMedia, TextBlock};
use tistory_editor::storage::{AuthStore, PostStore, SavedAuth, SavedPost};
use tistory_editor::tumblr::{OAuthInfoReader, TumblrAuth, TumblrClient, TumblrOAuthInfo, TumblrPostItem};
use tistory_editor::ui::auth_dialog::AuthDialogView;
use tistory_editor::ui::header::HeaderBarView;
use tistory_editor::ui::sidebar::{SidebarPostItem, SidebarView};
use tokio::runtime::Runtime;

pub static TOKIO_RUNTIME: LazyLock<Runtime> = LazyLock::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to initialize Tokio runtime")
});

struct AppView {
    sidebar: Entity<SidebarView>,
    editor: Entity<EditorView>,
    editor_model: Entity<EditorModel>,
    oauth_info: Option<TumblrOAuthInfo>,
    saved_auth: Option<SavedAuth>,
    temp_request_token: Option<(String, String)>,
    show_auth_dialog: bool,
    show_blog_dropdown: bool,
    auth_url: Option<String>,
    auth_status_message: Option<String>,
    header_status_message: Option<String>,
    detected_verifier: Option<String>,
    published_tumblr_posts: Vec<TumblrPostItem>,
}

impl AppView {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        // 1. OAuth 설정 파일 (.oauthInfo.json / oauthInfo.json) 로드
        let oauth_info = OAuthInfoReader::load_tumblr_oauth_info().ok();
        let saved_auth = AuthStore::load_auth();
        let is_auth = saved_auth.is_some();

        // 2. 초기 NPF 문서 구성
        let document = Self::create_sample_document();

        let editor_model = cx.new(|_cx| EditorModel {
            title: "Supercharging Tumblr with Rust & GPUI".to_string(),
            tags: vec!["rust".to_string(), "gpui".to_string(), "tumblr".to_string()],
            tag_input: String::new(),
            document,
            active_block_index: 0,
            focus_target: FocusTarget::Block(0),
        });

        let sidebar = cx.new(|_cx| SidebarView::new());
        let editor = cx.new(|cx| EditorView::new(editor_model.clone(), window, cx));

        let self_entity = cx.entity().clone();

        // 3. 로컬 드래프트 목록 복원
        let local_drafts = PostStore::load_posts();
        let draft_items: Vec<_> = local_drafts
            .iter()
            .map(|p| SidebarPostItem {
                id: p.id.clone(),
                title: p.title.clone(),
                date: p.date.clone(),
                is_selected: false,
            })
            .collect();
        sidebar.update(cx, |sidebar, cx| {
            sidebar.set_draft_posts(draft_items, cx);
        });

        // 4. 사이드바 New Post 클릭 -> 새 문서 작성
        let app_for_new_post = self_entity.clone();
        sidebar.update(cx, |sidebar, _cx| {
            sidebar.on_new_post = Some(Box::new(move |window, cx| {
                app_for_new_post.update(cx, |app, cx| {
                    let doc = NpfDocument::with_content(vec![
                        NpfBlock::Text(TextBlock::heading1("")),
                        NpfBlock::Text(TextBlock::plain("")),
                    ]);
                    app.editor.update(cx, |editor, cx| {
                        editor.set_document("".to_string(), vec![], doc, window, cx);
                    });
                    cx.notify();
                });
            }));
        });

        // 5. 사이드바 글 선택 시 에디터 로드
        let app_for_select = self_entity.clone();
        sidebar.update(cx, |sidebar, _cx| {
            sidebar.on_select_post = Some(Box::new(move |post_id, window, cx| {
                app_for_select.update(cx, |app, cx| {
                    app.load_post_to_editor(&post_id, window, cx);
                });
            }));
        });

        // 6. 사이드바 새로고침 클릭 시 Tumblr 글 목록 다시 가져오기
        let app_for_refresh = self_entity.clone();
        sidebar.update(cx, |sidebar, _cx| {
            sidebar.on_refresh = Some(Box::new(move |_window, cx| {
                app_for_refresh.update(cx, |app, cx| {
                    app.fetch_tumblr_posts(cx);
                });
            }));
        });

        let mut app_view = Self {
            sidebar,
            editor,
            editor_model,
            oauth_info,
            saved_auth,
            temp_request_token: None,
            show_auth_dialog: false,
            show_blog_dropdown: false,
            auth_url: None,
            auth_status_message: None,
            header_status_message: None,
            detected_verifier: None,
            published_tumblr_posts: Vec::new(),
        };

        if is_auth {
            app_view.fetch_tumblr_posts(cx);
        }

        app_view
    }

    fn create_sample_document() -> NpfDocument {
        let mut document = NpfDocument::new();
        document.content.push(NpfBlock::Text(TextBlock::heading1(
            "Welcome to the GPUI Tumblr Editor!",
        )));
        document.content.push(NpfBlock::Text(TextBlock::plain(
            "This is a high-performance native desktop editor built with Rust & GPUI.",
        )));
        document.content.push(NpfBlock::Text(TextBlock::quote(
            "\"NPF (Neue Post Format) is Tumblr's modern block-based format for content creation.\"",
        )));
        document.content.push(NpfBlock::Image(ImageBlock {
            media: vec![NpfMedia {
                url: "https://assets.tumblr.com/images/default_avatar/cube_closed_128.png".to_string(),
                media_type: Some("image/png".to_string()),
                width: Some(500),
                height: Some(500),
                ..Default::default()
            }],
            alt_text: Some("Tumblr Icon".to_string()),
            caption: Some("Tumblr media block example".to_string()),
            feedback_token: None,
        }));
        document.content.push(NpfBlock::Link(LinkBlock {
            url: "https://www.tumblr.com/docs/npf".to_string(),
            title: Some("Tumblr API - Neue Post Format".to_string()),
            description: Some("Tumblr's official specification for JSON-based rich content blocks.".to_string()),
            site_name: Some("Tumblr Docs".to_string()),
            display_url: Some("tumblr.com/docs/npf".to_string()),
            poster: Vec::new(),
            author: None,
        }));
        document.content.push(NpfBlock::Text(TextBlock::unordered_list_item(
            "Lightning fast GPU-accelerated 2D rendering",
        )));
        document.content.push(NpfBlock::Text(TextBlock::unordered_list_item(
            "Minimal memory footprint (< 50MB) compared to Electron",
        )));
        document
    }

    /// 현재 작성 중인 포스트를 로컬 드래프트로 저장
    pub fn save_current_draft(&mut self, cx: &mut Context<Self>) {
        self.editor.update(cx, |editor, cx| editor.sync_model(cx));
        let model = self.editor_model.read(cx);
        let title = if model.title.is_empty() {
            "Untitled Draft".to_string()
        } else {
            model.title.clone()
        };
        let id = uuid::Uuid::new_v4().to_string();
        let date = chrono::Local::now().format("%Y-%m-%d").to_string();

        let saved_post = SavedPost {
            id: id.clone(),
            title: title.clone(),
            date: date.clone(),
            tags: model.tags.clone(),
            document: model.document.clone(),
            state: "draft".to_string(),
        };

        let mut existing_posts = PostStore::load_posts();
        existing_posts.insert(0, saved_post);
        let _ = PostStore::save_posts(&existing_posts);

        self.sidebar.update(cx, |sidebar, cx| {
            sidebar.add_draft_post(id, title, date, cx);
        });

        self.header_status_message = Some("✓ Draft saved to local store!".to_string());
        cx.notify();
    }

    /// Tumblr 블로그 최신 글 목록 및 사용자 블로그 목록 비동기 동기화
    pub fn fetch_tumblr_posts(&mut self, cx: &mut Context<Self>) {
        let (token, secret, blog_name) = match &self.saved_auth {
            Some(auth) => (
                auth.token.clone(),
                auth.token_secret.clone(),
                auth.blog_name.clone().unwrap_or_default(),
            ),
            None => return,
        };

        if blog_name.is_empty() {
            return;
        }

        let oauth_info = match &self.oauth_info {
            Some(info) => info.clone(),
            None => return,
        };

        self.sidebar.update(cx, |sidebar, cx| {
            sidebar.set_loading(true, cx);
        });

        let auth = TumblrAuth::from_oauth_info(oauth_info, Some(token.clone()), Some(secret.clone()));
        let client = Arc::new(TumblrClient::new(auth));

        cx.spawn(move |this: WeakEntity<Self>, cx: &mut AsyncApp| {
            let mut async_app = cx.clone();
            let blog_name_clone = blog_name.clone();
            async move {
                let client_for_posts = client.clone();
                let client_for_info = client.clone();

                let posts_task = TOKIO_RUNTIME.spawn(async move {
                    client_for_posts.get_blog_posts(&blog_name_clone).await
                });

                let user_info_task = TOKIO_RUNTIME.spawn(async move {
                    client_for_info.get_user_info().await
                });

                let posts_res = match posts_task.await {
                    Ok(r) => r,
                    Err(e) => Err(anyhow::anyhow!("Tokio join error: {}", e)),
                };

                let user_info_res = match user_info_task.await {
                    Ok(r) => r.ok(),
                    Err(_) => None,
                };

                let _ = this.update(&mut async_app, |app, cx| {
                    if let Some(user_info) = user_info_res {
                        if let Some(ref mut auth) = app.saved_auth {
                            auth.available_blogs = user_info.blogs.clone();
                            let _ = AuthStore::save_auth(auth);
                        }
                    }

                    match posts_res {
                        Ok(posts) => {
                            let sidebar_items: Vec<_> = posts
                                .iter()
                                .map(|p| SidebarPostItem {
                                    id: p.get_id(),
                                    title: p.display_title(),
                                    date: p.date.clone().unwrap_or_else(|| "Recent".to_string()),
                                    is_selected: false,
                                })
                                .collect();

                            app.published_tumblr_posts = posts;
                            app.sidebar.update(cx, |sidebar, cx| {
                                sidebar.set_published_posts(sidebar_items, cx);
                            });
                        }
                        Err(err) => {
                            eprintln!("Failed to fetch Tumblr posts: {:?}", err);
                            app.sidebar.update(cx, |sidebar, cx| {
                                sidebar.set_loading(false, cx);
                            });
                        }
                    }
                    cx.notify();
                });
            }
        })
        .detach();
    }

    /// 선택된 글을 에디터에 로드
    pub fn load_post_to_editor(&mut self, post_id: &str, window: &mut Window, cx: &mut Context<Self>) {
        // 1. Tumblr Published 글 검색
        if let Some(post) = self.published_tumblr_posts.iter().find(|p| p.get_id() == post_id) {
            let title = post.display_title();
            let tags = post.tags.clone();
            let mut doc = NpfDocument::with_content(post.content.clone());
            doc.layout = post.layout.clone();
            if doc.content.is_empty() {
                doc.content.push(NpfBlock::Text(TextBlock::plain("")));
            }

            self.editor.update(cx, |editor, cx| {
                editor.set_document(title, tags, doc, window, cx);
            });
            return;
        }

        // 2. 로컬 드래프트 검색
        let local_posts = PostStore::load_posts();
        if let Some(post) = local_posts.iter().find(|p| p.id == post_id) {
            let title = post.title.clone();
            let tags = post.tags.clone();
            let doc = post.document.clone();

            self.editor.update(cx, |editor, cx| {
                editor.set_document(title, tags, doc, window, cx);
            });
        }
    }

    /// OAuth Step 1: Request Token 요청 및 브라우저 열기 (Tokio Runtime Context 내에서 실행)
    pub fn start_oauth_flow(&mut self, cx: &mut Context<Self>) {
        let oauth_info = match &self.oauth_info {
            Some(info) => info.clone(),
            None => {
                self.auth_status_message = Some("Error: .oauthInfo.json not found!".to_string());
                cx.notify();
                return;
            }
        };

        self.auth_status_message = Some("Requesting token from Tumblr...".to_string());
        cx.notify();

        let auth = Arc::new(TumblrAuth::from_oauth_info(oauth_info, None, None));
        let client = Arc::new(reqwest::Client::new());

        cx.spawn(move |this: WeakEntity<Self>, cx: &mut AsyncApp| {
            let mut async_app = cx.clone();
            let auth = auth.clone();
            let auth_for_task = auth.clone();
            let client = client.clone();
            async move {
                let task = TOKIO_RUNTIME.spawn(async move {
                    auth_for_task.request_temporary_credentials(&client).await
                });

                let res = match task.await {
                    Ok(r) => r,
                    Err(e) => Err(anyhow::anyhow!("Tokio task join error: {}", e)),
                };

                let _ = this.update(&mut async_app, |app, cx| {
                    match res {
                        Ok((req_token, req_token_secret)) => {
                            let auth_url = auth.get_authorize_url(&req_token).unwrap_or_default();
                            let _ = open::that(&auth_url);
                            app.temp_request_token = Some((req_token, req_token_secret));
                            app.auth_url = Some(auth_url);
                            app.auth_status_message = Some("Opened browser for Tumblr authorization. After authorizing, copy the callback URL from browser and click 'Paste from Clipboard & Connect'.".to_string());
                        }
                        Err(err) => {
                            eprintln!("OAuth Error: {:?}", err);
                            app.auth_status_message = Some(format!("OAuth Error: {}", err));
                        }
                    }
                    cx.notify();
                });
            }
        })
        .detach();
    }

    /// OAuth Step 2 & 3: Verifier로 Access Token 획득 및 사용자 정보 로드 (Tokio Runtime Context 내에서 실행)
    pub fn complete_oauth_flow_with_verifier(&mut self, verifier: String, cx: &mut Context<Self>) {
        let oauth_info = match &self.oauth_info {
            Some(info) => info.clone(),
            None => return,
        };

        let (req_token, req_token_secret) = match &self.temp_request_token {
            Some(tokens) => tokens.clone(),
            None => {
                if let Some(ref saved) = self.saved_auth {
                    (saved.token.clone(), saved.token_secret.clone())
                } else {
                    return;
                }
            }
        };

        let auth = Arc::new(TumblrAuth::from_oauth_info(oauth_info.clone(), None, None));
        let client = Arc::new(reqwest::Client::new());

        self.auth_status_message = Some("Finalizing connection and loading blog info...".to_string());
        cx.notify();

        cx.spawn(move |this: WeakEntity<Self>, cx: &mut AsyncApp| {
            let mut async_app = cx.clone();
            async move {
                let task = TOKIO_RUNTIME.spawn(async move {
                    let token_res = auth
                        .request_access_token(&client, &req_token, &req_token_secret, &verifier)
                        .await;

                    let (access_token, access_token_secret) = match token_res {
                        Ok(tokens) => tokens,
                        Err(e) => {
                            eprintln!("Failed to request access token: {:?}", e);
                            (req_token.clone(), req_token_secret.clone())
                        }
                    };

                    let authenticated_auth = TumblrAuth::from_oauth_info(
                        oauth_info,
                        Some(access_token.clone()),
                        Some(access_token_secret.clone()),
                    );
                    let tumblr_client = TumblrClient::new(authenticated_auth);

                    let user_info_res = tumblr_client.get_user_info().await;
                    let (blog_name, user_name, blogs) = match user_info_res {
                        Ok(info) => {
                            let primary_blog = info
                                .blogs
                                .iter()
                                .find(|b| b.primary)
                                .map(|b| b.name.clone())
                                .or_else(|| info.blogs.first().map(|b| b.name.clone()))
                                .unwrap_or_else(|| info.name.clone());
                            (primary_blog, Some(info.name), info.blogs)
                        }
                        Err(e) => {
                            eprintln!("Failed to get user info: {:?}", e);
                            ("Connected Blog".to_string(), None, Vec::new())
                        }
                    };

                    let saved = SavedAuth {
                        token: access_token,
                        token_secret: access_token_secret,
                        user_name,
                        blog_name: Some(blog_name.clone()),
                        available_blogs: blogs.clone(),
                    };

                    let _ = AuthStore::save_auth(&saved);
                    (saved, blog_name, blogs)
                });

                if let Ok((saved, blog_name, _blogs)) = task.await {
                    let _ = this.update(&mut async_app, |app, cx| {
                        app.saved_auth = Some(saved);
                        app.show_auth_dialog = false;
                        app.auth_status_message = None;
                        app.detected_verifier = None;
                        app.header_status_message = Some(format!("✓ Connected to Tumblr! ({}.tumblr.com)", blog_name));
                        app.fetch_tumblr_posts(cx);
                        cx.notify();
                    });
                }
            }
        })
        .detach();
    }

    /// 현재 포스트를 Tumblr에 발행 (Tokio Runtime Context 내에서 실행)
    pub fn publish_current_post(&mut self, cx: &mut Context<Self>) {
        self.editor.update(cx, |editor, cx| editor.sync_model(cx));

        let (token, secret, blog_name) = match &self.saved_auth {
            Some(auth) => (
                auth.token.clone(),
                auth.token_secret.clone(),
                auth.blog_name.clone().unwrap_or_default(),
            ),
            None => {
                self.show_auth_dialog = true;
                self.start_oauth_flow(cx);
                return;
            }
        };

        if blog_name.is_empty() {
            self.header_status_message = Some("❌ No blog selected for publishing".to_string());
            cx.notify();
            return;
        }

        let oauth_info = match &self.oauth_info {
            Some(info) => info.clone(),
            None => return,
        };

        let auth = TumblrAuth::from_oauth_info(oauth_info, Some(token), Some(secret));
        let client = Arc::new(TumblrClient::new(auth));

        let model = self.editor_model.read(cx);
        let doc = model.document.clone();
        let tags = model.tags.clone();

        self.header_status_message = Some(format!("Publishing post to {}...", blog_name));
        cx.notify();

        cx.spawn(move |this: WeakEntity<Self>, cx: &mut AsyncApp| {
            let mut async_app = cx.clone();
            async move {
                let task = TOKIO_RUNTIME.spawn(async move {
                    client.create_post(&blog_name, &doc, "published", &tags).await
                });

                let res = match task.await {
                    Ok(r) => r,
                    Err(e) => Err(anyhow::anyhow!("Tokio task join error: {}", e)),
                };

                let _ = this.update(&mut async_app, |app, cx| {
                    match res {
                        Ok(_) => {
                            app.header_status_message = Some("🚀 Successfully published to Tumblr!".to_string());
                            app.fetch_tumblr_posts(cx);
                        }
                        Err(err) => {
                            eprintln!("Failed to publish: {:?}", err);
                            app.header_status_message = Some("❌ Failed to publish post".to_string());
                        }
                    }
                    cx.notify();
                });
            }
        })
        .detach();
    }
}

impl Render for AppView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let is_showing_auth = self.show_auth_dialog;
        let is_showing_blog_dropdown = self.show_blog_dropdown;

        let is_auth = self.saved_auth.is_some();
        let current_blog_name = self.saved_auth.as_ref().and_then(|a| a.blog_name.clone()).unwrap_or_else(|| {
            if is_auth { "Tumblr Connected".to_string() } else { "Not Connected".to_string() }
        });
        let display_blog_title = if is_auth {
            format!("{}.tumblr.com", current_blog_name)
        } else {
            "Not Connected".to_string()
        };

        let header_view = HeaderBarView {
            current_blog_name: display_blog_title,
            is_authenticated: is_auth,
            status_message: self.header_status_message.clone(),
            on_connect_click: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                this.show_auth_dialog = true;
                this.start_oauth_flow(cx);
                cx.notify();
            })),
            on_blog_click: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                this.show_blog_dropdown = !this.show_blog_dropdown;
                if this.show_blog_dropdown {
                    let need_fetch = this.saved_auth.as_ref().map(|a| a.available_blogs.is_empty()).unwrap_or(true);
                    if need_fetch {
                        this.fetch_tumblr_posts(cx);
                    }
                }
                cx.notify();
            })),
            on_save_draft: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                this.save_current_draft(cx);
            })),
            on_publish: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                this.publish_current_post(cx);
            })),
        };

        let auth_dialog_view = if is_showing_auth {
            let auth_url = self.auth_url.clone();
            let status_message = self.auth_status_message.clone();
            let detected_verifier = self.detected_verifier.clone();

            Some(AuthDialogView {
                auth_url,
                status_message,
                detected_verifier,
                on_close: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                    this.show_auth_dialog = false;
                    cx.notify();
                })),
                on_open_browser: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                    this.start_oauth_flow(cx);
                })),
                on_paste_clipboard: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                    if let Some(clipboard_item) = cx.read_from_clipboard() {
                        if let Some(text) = clipboard_item.text() {
                            let (token, verifier) = TumblrAuth::parse_callback_input(&text);
                            if let Some(ver) = verifier {
                                if let Some(tok) = token {
                                    if let Some((_, ref secret)) = this.temp_request_token {
                                        this.temp_request_token = Some((tok, secret.clone()));
                                    }
                                }
                                this.detected_verifier = Some(ver.clone());
                                this.auth_status_message = Some(format!("Found callback info! Verifying: {}", ver));
                                cx.notify();
                                this.complete_oauth_flow_with_verifier(ver, cx);
                                return;
                            }
                        }
                    }
                    this.auth_status_message = Some("No valid OAuth callback URL found in clipboard. Please copy the URL from your browser address bar.".to_string());
                    cx.notify();
                })),
                on_submit_verifier: Box::new(cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                    if let Some(ver) = this.detected_verifier.clone() {
                        this.complete_oauth_flow_with_verifier(ver, cx);
                    } else {
                        this.auth_status_message = Some("Please click 'Paste from Clipboard & Connect' first.".to_string());
                        cx.notify();
                    }
                })),
            })
        } else {
            None
        };

        // 블로그 목록 드롭다운 항목 생성
        let available_blogs = self.saved_auth.as_ref().map(|a| a.available_blogs.clone()).unwrap_or_default();

        let blog_menu_items: Vec<AnyElement> = if available_blogs.is_empty() {
            vec![div()
                .px_3()
                .py_2()
                .text_xs()
                .text_color(rgb(0x9ca3af))
                .child("Loading blogs...")
                .into_any_element()]
        } else {
            available_blogs
                .iter()
                .map(|b| {
                    let blog_name = b.name.clone();
                    let blog_title = b.title.clone();
                    let is_current = current_blog_name == blog_name;

                    div()
                        .px_3()
                        .py_2()
                        .rounded_md()
                        .cursor_pointer()
                        .when(is_current, |this| this.bg(rgb(0x252836)).text_color(rgb(0x60a5fa)))
                        .when(!is_current, |this| {
                            this.hover(|this| this.bg(rgb(0x1e202b))).text_color(rgb(0xd1d5db))
                        })
                        .child(
                            div()
                                .text_xs()
                                .font_weight(FontWeight::SEMIBOLD)
                                .child(if blog_title.is_empty() {
                                    format!("{}.tumblr.com", blog_name)
                                } else {
                                    format!("{} ({}.tumblr.com)", blog_title, blog_name)
                                }),
                        )
                        .on_mouse_down(
                            MouseButton::Left,
                            cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                                let selected = blog_name.clone();
                                if let Some(ref mut auth) = this.saved_auth {
                                    auth.blog_name = Some(selected.clone());
                                    let _ = AuthStore::save_auth(auth);
                                }
                                this.header_status_message = Some(format!("Switched blog to: {}", selected));
                                this.show_blog_dropdown = false;
                                this.fetch_tumblr_posts(cx);
                            }),
                        )
                        .into_any_element()
                })
                .collect()
        };

        div()
            .relative()
            .flex()
            .flex_col()
            .size_full()
            .bg(rgb(0x111218))
            .child(header_view)
            .child(
                div()
                    .flex()
                    .flex_1()
                    .w_full()
                    .child(self.sidebar.clone())
                    .child(div().flex_1().h_full().child(self.editor.clone())),
            )
            // 블로그 선택 드롭다운 오버레이 (최상단 레이어)
            .when(is_showing_blog_dropdown, |this| {
                this.child(
                    div()
                        .absolute()
                        .inset_0()
                        .child(
                            // 외부 클릭 시 닫히는 투명 배경
                            div()
                                .absolute()
                                .inset_0()
                                .on_mouse_down(
                                    MouseButton::Left,
                                    cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                                        this.show_blog_dropdown = false;
                                        cx.notify();
                                    }),
                                ),
                        )
                        .child(
                            // 드롭다운 팝업 박스
                            div()
                                .absolute()
                                .top(px(46.0))
                                .left(px(140.0))
                                .w(px(280.0))
                                .bg(rgb(0x1a1b26))
                                .border_1()
                                .border_color(rgb(0x2d3040))
                                .rounded_lg()
                                .shadow_xl()
                                .p_1p5()
                                .flex()
                                .flex_col()
                                .gap_0p5()
                                .child(
                                    div()
                                        .px_2()
                                        .py_1()
                                        .text_xs()
                                        .font_weight(FontWeight::BOLD)
                                        .text_color(rgb(0x9ca3af))
                                        .child("Select Tumblr Blog:"),
                                )
                                .children(blog_menu_items),
                        ),
                )
            })
            // OAuth 연동 모달 오버레이
            .when_some(auth_dialog_view, |this, dialog| {
                this.child(
                    div()
                        .absolute()
                        .inset_0()
                        .bg(rgba(0x000000aa))
                        .flex()
                        .items_center()
                        .justify_center()
                        .child(dialog),
                )
            })
    }
}

fn main() {
    Application::new().run(|cx| {
        gpui_component::init(cx);
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(Bounds::centered(
                    None,
                    size(px(1100.0), px(750.0)),
                    cx,
                ))),
                titlebar: Some(TitlebarOptions {
                    title: Some("Tumblr NPF Editor (GPUI)".into()),
                    appears_transparent: true,
                    ..Default::default()
                }),
                ..Default::default()
            },
            |window, cx| {
                let app_view = cx.new(|cx| AppView::new(window, cx));
                cx.new(|cx| Root::new(app_view, window, cx))
            },
        )
        .unwrap();
    });
}
