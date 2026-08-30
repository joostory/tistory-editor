use gpui::*;

pub struct SettingsDialog {
    pub on_close: Option<Box<dyn Fn(&mut Window, &mut App)>>,
    pub on_save: Option<Box<dyn Fn(&mut Window, &mut App)>>,
}

impl Default for SettingsDialog {
    fn default() -> Self {
        Self {
            on_close: None,
            on_save: None,
        }
    }
}

impl SettingsDialog {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_on_close<F>(&mut self, callback: F)
    where
        F: Fn(&mut Window, &mut App) + 'static,
    {
        self.on_close = Some(Box::new(callback));
    }

    pub fn set_on_save<F>(&mut self, callback: F)
    where
        F: Fn(&mut Window, &mut App) + 'static,
    {
        self.on_save = Some(Box::new(callback));
    }
}

impl Render for SettingsDialog {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .flex()
            .flex_col()
            .gap_4()
            .p_6()
            .w(px(420.0))
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
                            .child("Tumblr OAuth Settings"),
                    )
                    .child(
                        div()
                            .id("close-settings-x")
                            .px_2()
                            .py_0p5()
                            .rounded_md()
                            .hover(|this| this.bg(rgb(0x2d3040)))
                            .cursor_pointer()
                            .text_sm()
                            .text_color(rgb(0x9ca3af))
                            .child("✕")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                    if let Some(on_close) = &this.on_close {
                                        on_close(window, cx);
                                    }
                                }),
                            ),
                    ),
            )
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap_3()
                    .child(self.render_field("Consumer Key (API Key)", "Enter Tumblr Consumer Key"))
                    .child(self.render_field("Consumer Secret", "Enter Consumer Secret"))
                    .child(self.render_field("OAuth Token", "Enter OAuth Token"))
                    .child(self.render_field("OAuth Token Secret", "Enter OAuth Token Secret")),
            )
            .child(
                div()
                    .flex()
                    .justify_end()
                    .gap_2()
                    .pt_2()
                    .child(
                        div()
                            .id("cancel-settings-btn")
                            .px_4()
                            .py_1p5()
                            .rounded_md()
                            .bg(rgb(0x282a36))
                            .hover(|this| this.bg(rgb(0x353849)))
                            .cursor_pointer()
                            .text_xs()
                            .text_color(rgb(0xdddddd))
                            .child("Cancel")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                    if let Some(on_close) = &this.on_close {
                                        on_close(window, cx);
                                    }
                                }),
                            ),
                    )
                    .child(
                        div()
                            .id("save-settings-btn")
                            .px_4()
                            .py_1p5()
                            .rounded_md()
                            .bg(rgb(0x2563eb))
                            .hover(|this| this.bg(rgb(0x1d4ed8)))
                            .active(|this| this.bg(rgb(0x1e40af)))
                            .cursor_pointer()
                            .text_xs()
                            .font_weight(FontWeight::SEMIBOLD)
                            .text_color(rgb(0xffffff))
                            .child("Save Keys")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                    if let Some(on_save) = &this.on_save {
                                        on_save(window, cx);
                                    }
                                    if let Some(on_close) = &this.on_close {
                                        on_close(window, cx);
                                    }
                                }),
                            ),
                    ),
            )
    }
}

impl SettingsDialog {
    fn render_field(&self, label: &'static str, placeholder: &'static str) -> impl IntoElement {
        div()
            .flex()
            .flex_col()
            .gap_1()
            .child(
                div()
                    .text_xs()
                    .font_weight(FontWeight::MEDIUM)
                    .text_color(rgb(0x9ca3af))
                    .child(label),
            )
            .child(
                div()
                    .px_3()
                    .py_1p5()
                    .rounded_md()
                    .bg(rgb(0x12131a))
                    .border_1()
                    .border_color(rgb(0x2d3040))
                    .text_xs()
                    .text_color(rgb(0x6b7280))
                    .child(placeholder),
            )
    }
}
