use gpui::prelude::FluentBuilder;
use gpui::*;

pub struct AuthDialogView {
    pub auth_url: Option<String>,
    pub status_message: Option<String>,
    pub detected_verifier: Option<String>,
    pub on_open_browser: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_paste_clipboard: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_submit_verifier: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
    pub on_close: Box<dyn Fn(&MouseDownEvent, &mut Window, &mut App) + 'static>,
}

impl IntoElement for AuthDialogView {
    type Element = Div;

    fn into_element(self) -> Self::Element {
        let status = self.status_message;
        let detected = self.detected_verifier;
        let on_close = self.on_close;
        let on_open_browser = self.on_open_browser;
        let on_paste_clipboard = self.on_paste_clipboard;
        let on_submit_verifier = self.on_submit_verifier;

        div()
            .flex()
            .flex_col()
            .gap_4()
            .p_6()
            .w(px(500.0))
            .bg(rgb(0x1a1b24))
            .rounded_xl()
            .border_1()
            .border_color(rgb(0x2d3040))
            .shadow_lg()
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .child(
                        div()
                            .text_lg()
                            .font_weight(FontWeight::BOLD)
                            .text_color(rgb(0xffffff))
                            .child("Connect Tumblr Account"),
                    )
                    .child(
                        div()
                            .id("close-auth-x")
                            .px_2()
                            .py_0p5()
                            .rounded_md()
                            .hover(|this| this.bg(rgb(0x2d3040)))
                            .cursor_pointer()
                            .text_sm()
                            .text_color(rgb(0x9ca3af))
                            .child("✕")
                            .on_mouse_down(MouseButton::Left, on_close),
                    ),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(rgb(0x9ca3af))
                    .line_height(relative(1.5))
                    .child("Authorize with Tumblr in your browser. If another app intercepts the callback URL, simply copy the URL from your browser's address bar and click 'Paste & Connect' below."),
            )
            // Step 1: 브라우저 열기 버튼
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap_2()
                    .p_3()
                    .rounded_lg()
                    .bg(rgb(0x13141c))
                    .border_1()
                    .border_color(rgb(0x282a3a))
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(rgb(0x60a5fa))
                            .child("Step 1: Open Tumblr Authorization"),
                    )
                    .child(
                        div()
                            .id("open-browser-auth-btn")
                            .w_full()
                            .py_2()
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
                            .child("🌐 Open Authorization Page in Browser")
                            .on_mouse_down(MouseButton::Left, on_open_browser),
                    ),
            )
            // Step 2: 클립보드 붙여넣기 및 인증 완료
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap_2()
                    .p_3()
                    .rounded_lg()
                    .bg(rgb(0x13141c))
                    .border_1()
                    .border_color(rgb(0x282a3a))
                    .child(
                        div()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(rgb(0x60a5fa))
                            .child("Step 2: Confirm Verification"),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(rgb(0x9ca3af))
                            .line_height(relative(1.4))
                            .child("After granting access, copy the callback URL from your browser (Cmd+C) and click below:"),
                    )
                    .child(
                        div()
                            .flex()
                            .gap_2()
                            .child(
                                div()
                                    .id("paste-clipboard-auth-btn")
                                    .flex_1()
                                    .py_2()
                                    .rounded_md()
                                    .bg(rgb(0x7c3aed))
                                    .hover(|this| this.bg(rgb(0x6d28d9)))
                                    .active(|this| this.bg(rgb(0x5b21b6)))
                                    .cursor_pointer()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .gap_1()
                                    .text_xs()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(rgb(0xffffff))
                                    .child("📋 Paste from Clipboard & Connect")
                                    .on_mouse_down(MouseButton::Left, on_paste_clipboard),
                            )
                            .child(
                                div()
                                    .id("submit-verifier-btn")
                                    .px_4()
                                    .py_2()
                                    .rounded_md()
                                    .bg(rgb(0x059669))
                                    .hover(|this| this.bg(rgb(0x047857)))
                                    .active(|this| this.bg(rgb(0x065f46)))
                                    .cursor_pointer()
                                    .flex()
                                    .items_center()
                                    .justify_center()
                                    .text_xs()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(rgb(0xffffff))
                                    .child("✓ Connect")
                                    .on_mouse_down(MouseButton::Left, on_submit_verifier),
                            ),
                    )
                    .when_some(detected, |this, ver| {
                        this.child(
                            div()
                                .p_2()
                                .rounded_md()
                                .bg(rgb(0x1e293b))
                                .text_xs()
                                .text_color(rgb(0xa7f3d0))
                                .child(format!("🔑 Detected Verifier: {}", ver)),
                        )
                    }),
            )
            .when_some(status, |this, msg| {
                this.child(
                    div()
                        .p_2()
                        .rounded_md()
                        .bg(rgb(0x1e293b))
                        .text_xs()
                        .text_color(rgb(0x38bdf8))
                        .child(msg),
                )
            })
    }
}
