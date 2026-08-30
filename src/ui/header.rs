use gpui::prelude::FluentBuilder;
use gpui::*;

pub struct HeaderBarView {
    pub current_blog_name: String,
    pub is_authenticated: bool,
    pub status_message: Option<String>,
    pub on_connect_click: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_blog_click: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_save_draft: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_publish: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
}

impl IntoElement for HeaderBarView {
    type Element = Div;

    fn into_element(self) -> Self::Element {
        let status = self.status_message;
        let is_auth = self.is_authenticated;
        let on_connect = self.on_connect_click;
        let on_blog = self.on_blog_click;
        let on_save = self.on_save_draft;
        let on_pub = self.on_publish;

        div()
            .h_12()
            .w_full()
            .flex()
            .items_center()
            .justify_between()
            .px_4()
            .bg(rgb(0x161720))
            .border_b_1()
            .border_color(rgb(0x242632))
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap_3()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::BOLD)
                            .text_color(rgb(0x3b82f6))
                            .child("Tumblr Editor"),
                    )
                    // 현재 블로그 선택 뱃지
                    .child(
                        div()
                            .id("blog-selector-btn")
                            .px_2p5()
                            .py_1()
                            .rounded_md()
                            .bg(rgb(0x232532))
                            .hover(|this| this.bg(rgb(0x2d3040)))
                            .active(|this| this.bg(rgb(0x35384c)))
                            .cursor_pointer()
                            .flex()
                            .items_center()
                            .gap_1p5()
                            .text_xs()
                            .text_color(if is_auth { rgb(0x34d399) } else { rgb(0xf59e0b) })
                            .child(format!("🌐 {}", self.current_blog_name))
                            .when(is_auth, |this| {
                                this.child(div().text_xs().text_color(rgb(0x9ca3af)).child("▼"))
                            })
                            .on_mouse_down(MouseButton::Left, on_blog),
                    )
                    .when_some(status, |this, msg| {
                        this.child(
                            div()
                                .px_2()
                                .py_0p5()
                                .rounded_md()
                                .bg(rgb(0x1e3a2f))
                                .border_1()
                                .border_color(rgb(0x10b981))
                                .text_xs()
                                .text_color(rgb(0x34d399))
                                .child(msg),
                        )
                    }),
            )
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap_2()
                    .when(!is_auth, |this| {
                        this.child(
                            div()
                                .id("connect-tumblr-btn")
                                .px_3()
                                .py_1()
                                .rounded_md()
                                .bg(rgb(0x059669))
                                .hover(|this| this.bg(rgb(0x047857)))
                                .active(|this| this.bg(rgb(0x065f46)))
                                .cursor_pointer()
                                .text_xs()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(rgb(0xffffff))
                                .child("🔑 Connect Tumblr")
                                .on_mouse_down(MouseButton::Left, on_connect),
                        )
                    })
                    .child(
                        div()
                            .id("save-draft-btn")
                            .px_3()
                            .py_1()
                            .rounded_md()
                            .bg(rgb(0x282a36))
                            .hover(|this| this.bg(rgb(0x353849)))
                            .active(|this| this.bg(rgb(0x40445a)))
                            .cursor_pointer()
                            .text_xs()
                            .text_color(rgb(0xdddddd))
                            .child("Save Draft")
                            .on_mouse_down(MouseButton::Left, on_save),
                    )
                    .child(
                        div()
                            .id("publish-btn")
                            .px_3()
                            .py_1()
                            .rounded_md()
                            .bg(if is_auth { rgb(0x2563eb) } else { rgb(0x4b5563) })
                            .hover(|this| {
                                if is_auth {
                                    this.bg(rgb(0x1d4ed8))
                                } else {
                                    this.bg(rgb(0x374151))
                                }
                            })
                            .active(|this| this.bg(rgb(0x1e40af)))
                            .cursor_pointer()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(rgb(0xffffff))
                            .child("🚀 Publish to Tumblr")
                            .on_mouse_down(MouseButton::Left, on_pub),
                    ),
            )
    }
}
