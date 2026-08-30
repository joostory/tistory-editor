use gpui::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToolbarAction {
    Heading1,
    Heading2,
    Paragraph,
    BulletList,
    NumberedList,
    Quote,
    AddImage,
    AddLink,
}

pub struct EditorToolbar {
    pub on_action: Option<Box<dyn Fn(ToolbarAction, &mut Window, &mut Context<Self>)>>,
}

impl Default for EditorToolbar {
    fn default() -> Self {
        Self { on_action: None }
    }
}

impl EditorToolbar {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn set_on_action<F>(&mut self, callback: F)
    where
        F: Fn(ToolbarAction, &mut Window, &mut Context<Self>) + 'static,
    {
        self.on_action = Some(Box::new(callback));
    }
}

impl Render for EditorToolbar {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .h_10()
            .w_full()
            .flex()
            .items_center()
            .gap_1()
            .px_3()
            .bg(rgb(0x1a1b23))
            .border_b_1()
            .border_color(rgb(0x2a2b36))
            .child(
                div()
                    .flex()
                    .items_center()
                    .gap_1()
                    .child(self.render_btn(ToolbarAction::Heading1, "H1", cx))
                    .child(self.render_btn(ToolbarAction::Heading2, "H2", cx))
                    .child(self.render_btn(ToolbarAction::Paragraph, "¶", cx))
                    .child(div().w_px().h_5().bg(rgb(0x2a2b36)).mx_1())
                    .child(self.render_btn(ToolbarAction::BulletList, "• List", cx))
                    .child(self.render_btn(ToolbarAction::NumberedList, "1. List", cx))
                    .child(self.render_btn(ToolbarAction::Quote, "” Quote", cx))
                    .child(div().w_px().h_5().bg(rgb(0x2a2b36)).mx_1())
                    .child(self.render_btn(ToolbarAction::AddImage, "📷 Image", cx))
                    .child(self.render_btn(ToolbarAction::AddLink, "🔗 Link", cx)),
            )
    }
}

impl EditorToolbar {
    fn render_btn(
        &self,
        action: ToolbarAction,
        label: &'static str,
        cx: &mut Context<Self>,
    ) -> impl IntoElement {
        div()
            .id(SharedString::from(format!("toolbar-btn-{:?}", action)))
            .px_2()
            .py_1()
            .rounded_md()
            .bg(rgb(0x242632))
            .hover(|this| this.bg(rgb(0x383b4c)))
            .active(|this| this.bg(rgb(0x2563eb)))
            .cursor_pointer()
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(rgb(0xdddddd))
            .child(label)
            .on_mouse_down(
                MouseButton::Left,
                cx.listener(move |this, _event: &MouseDownEvent, window, cx| {
                    if let Some(on_action) = &this.on_action {
                        on_action(action, window, cx);
                    }
                }),
            )
    }
}
