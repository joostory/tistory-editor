use gpui::prelude::FluentBuilder;
use gpui::*;

pub struct SidebarView {
    pub selected_tab: SidebarTab,
    pub published_posts: Vec<SidebarPostItem>,
    pub draft_posts: Vec<SidebarPostItem>,
    pub is_loading: bool,
    pub on_new_post: Option<Box<dyn Fn(&mut Window, &mut App)>>,
    pub on_refresh: Option<Box<dyn Fn(&mut Window, &mut App)>>,
    pub on_select_post: Option<Box<dyn Fn(String, &mut Window, &mut App)>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SidebarTab {
    Published,
    Drafts,
}

#[derive(Debug, Clone)]
pub struct SidebarPostItem {
    pub id: String,
    pub title: String,
    pub date: String,
    pub is_selected: bool,
}

impl SidebarView {
    pub fn new() -> Self {
        Self {
            selected_tab: SidebarTab::Published,
            published_posts: Vec::new(),
            draft_posts: Vec::new(),
            is_loading: false,
            on_new_post: None,
            on_refresh: None,
            on_select_post: None,
        }
    }

    pub fn set_tab(&mut self, tab: SidebarTab, cx: &mut Context<Self>) {
        self.selected_tab = tab;
        cx.notify();
    }

    pub fn set_loading(&mut self, loading: bool, cx: &mut Context<Self>) {
        self.is_loading = loading;
        cx.notify();
    }

    pub fn set_published_posts(&mut self, posts: Vec<SidebarPostItem>, cx: &mut Context<Self>) {
        self.published_posts = posts;
        self.is_loading = false;
        cx.notify();
    }

    pub fn set_draft_posts(&mut self, posts: Vec<SidebarPostItem>, cx: &mut Context<Self>) {
        self.draft_posts = posts;
        cx.notify();
    }

    pub fn select_post(&mut self, post_id: &str, cx: &mut Context<Self>) {
        for post in self.published_posts.iter_mut() {
            post.is_selected = post.id == post_id;
        }
        for post in self.draft_posts.iter_mut() {
            post.is_selected = post.id == post_id;
        }
        cx.notify();
    }

    pub fn add_draft_post(&mut self, id: String, title: String, date: String, cx: &mut Context<Self>) {
        if let Some(existing) = self.draft_posts.iter_mut().find(|p| p.id == id) {
            existing.title = title;
            existing.date = date;
        } else {
            self.draft_posts.insert(
                0,
                SidebarPostItem {
                    id,
                    title,
                    date,
                    is_selected: true,
                },
            );
        }
        self.selected_tab = SidebarTab::Drafts;
        cx.notify();
    }
}

impl Render for SidebarView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let current_posts = match self.selected_tab {
            SidebarTab::Published => &self.published_posts,
            SidebarTab::Drafts => &self.draft_posts,
        };

        let is_loading = self.is_loading;

        let post_items: Vec<_> = current_posts
            .iter()
            .map(|post| {
                let post_id = post.id.clone();
                let is_selected = post.is_selected;
                let title = post.title.clone();
                let date = post.date.clone();

                div()
                    .id(SharedString::from(format!("post-item-{}", post_id)))
                    .p_2()
                    .rounded_md()
                    .cursor_pointer()
                    .when(is_selected, |this| {
                        this.bg(rgb(0x252836)).border_l_2().border_color(rgb(0x3b82f6))
                    })
                    .when(!is_selected, |this| {
                        this.hover(|this| this.bg(rgb(0x1e202b)))
                    })
                    .on_mouse_down(
                        MouseButton::Left,
                        cx.listener(move |this, _event: &MouseDownEvent, window, cx| {
                            let id_clone = post_id.clone();
                            this.select_post(&post_id, cx);
                            if let Some(on_select) = &this.on_select_post {
                                on_select(id_clone, window, cx);
                            }
                        }),
                    )
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(if is_selected {
                                rgb(0xffffff)
                            } else {
                                rgb(0xd1d5db)
                            })
                            .child(title),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(rgb(0x6b7280))
                            .pt_0p5()
                            .child(date),
                    )
            })
            .collect();

        let is_published = self.selected_tab == SidebarTab::Published;

        div()
            .w_64()
            .h_full()
            .flex()
            .flex_col()
            .bg(rgb(0x161720))
            .border_r_1()
            .border_color(rgb(0x242632))
            .child(
                // 상단 버튼 영역 (New Post + Refresh)
                div()
                    .p_3()
                    .flex()
                    .items_center()
                    .gap_2()
                    .child(
                        div()
                            .id("new-post-btn")
                            .flex_1()
                            .py_1p5()
                            .rounded_md()
                            .bg(rgb(0x2563eb))
                            .hover(|this| this.bg(rgb(0x1d4ed8)))
                            .active(|this| this.bg(rgb(0x1e40af)))
                            .cursor_pointer()
                            .flex()
                            .items_center()
                            .justify_center()
                            .gap_1()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(rgb(0xffffff))
                            .child("✏️ New Post")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                    if let Some(on_new) = &this.on_new_post {
                                        on_new(window, cx);
                                    }
                                }),
                            ),
                    )
                    .child(
                        div()
                            .id("refresh-posts-btn")
                            .px_2()
                            .py_1p5()
                            .rounded_md()
                            .bg(rgb(0x232532))
                            .hover(|this| this.bg(rgb(0x2d3040)))
                            .active(|this| this.bg(rgb(0x35384c)))
                            .cursor_pointer()
                            .text_xs()
                            .child("🔄")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                    if let Some(on_ref) = &this.on_refresh {
                                        on_ref(window, cx);
                                    }
                                }),
                            ),
                    ),
            )
            .child(
                // 탭 (Published / Drafts)
                div()
                    .flex()
                    .px_3()
                    .border_b_1()
                    .border_color(rgb(0x242632))
                    .child(
                        div()
                            .id("tab-published")
                            .flex_1()
                            .pb_2()
                            .cursor_pointer()
                            .when(is_published, |this| {
                                this.border_b_2().border_color(rgb(0x3b82f6)).text_color(rgb(0xffffff))
                            })
                            .when(!is_published, |this| {
                                this.text_color(rgb(0x9ca3af)).hover(|this| this.text_color(rgb(0xdddddd)))
                            })
                            .text_center()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .child("Published")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                                    this.set_tab(SidebarTab::Published, cx);
                                }),
                            ),
                    )
                    .child(
                        div()
                            .id("tab-drafts")
                            .flex_1()
                            .pb_2()
                            .cursor_pointer()
                            .when(!is_published, |this| {
                                this.border_b_2().border_color(rgb(0x3b82f6)).text_color(rgb(0xffffff))
                            })
                            .when(is_published, |this| {
                                this.text_color(rgb(0x9ca3af)).hover(|this| this.text_color(rgb(0xdddddd)))
                            })
                            .text_center()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .child("Drafts")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, _window, cx| {
                                    this.set_tab(SidebarTab::Drafts, cx);
                                }),
                            ),
                    ),
            )
            .child(
                // 로딩 인디케이터 또는 포스트 목록
                if is_loading {
                    div()
                        .flex_1()
                        .flex()
                        .items_center()
                        .justify_center()
                        .text_xs()
                        .text_color(rgb(0x9ca3af))
                        .child("⏳ Loading posts from Tumblr...")
                        .into_any_element()
                } else if post_items.is_empty() {
                    div()
                        .flex_1()
                        .flex()
                        .items_center()
                        .justify_center()
                        .p_4()
                        .text_xs()
                        .text_color(rgb(0x6b7280))
                        .text_center()
                        .child("No posts found.")
                        .into_any_element()
                } else {
                    div()
                        .id("sidebar-posts-scroll")
                        .flex_1()
                        .overflow_y_scroll()
                        .p_2()
                        .flex()
                        .flex_col()
                        .gap_1()
                        .children(post_items)
                        .into_any_element()
                },
            )
    }
}
