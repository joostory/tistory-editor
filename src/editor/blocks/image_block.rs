use gpui::prelude::FluentBuilder;
use gpui::*;
use crate::npf::ImageBlock;

pub struct ImageBlockView {
    pub block: ImageBlock,
    pub is_focused: bool,
}

impl ImageBlockView {
    pub fn new(block: ImageBlock, is_focused: bool) -> Self {
        Self { block, is_focused }
    }
}

impl IntoElement for ImageBlockView {
    type Element = Div;

    fn into_element(self) -> Self::Element {
        let first_media_url = self
            .block
            .media
            .first()
            .map(|m| m.url.clone())
            .unwrap_or_default();

        let alt_text = self.block.alt_text.as_deref().unwrap_or("No description");
        let caption = self.block.caption.as_deref();

        div()
            .w_full()
            .my_2()
            .p_3()
            .rounded_lg()
            .bg(rgb(0x1e1f29))
            .border_1()
            .border_color(if self.is_focused {
                rgb(0x3b82f6)
            } else {
                rgb(0x2e303e)
            })
            .flex()
            .flex_col()
            .gap_2()
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .text_xs()
                    .text_color(rgb(0x9ca3af))
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap_1()
                            .child("🖼️")
                            .child(format!("Image: {}", alt_text)),
                    )
                    .child(div().child(first_media_url.clone())),
            )
            .child(
                div()
                    .h_48()
                    .w_full()
                    .rounded_md()
                    .bg(rgb(0x12131a))
                    .flex()
                    .items_center()
                    .justify_center()
                    .text_sm()
                    .text_color(rgb(0x6b7280))
                    .child(format!("Preview: {}", first_media_url)),
            )
            .when_some(caption, |this, cap| {
                this.child(
                    div()
                        .text_xs()
                        .italic()
                        .text_color(rgb(0x9ca3af))
                        .child(format!("Caption: {}", cap)),
                )
            })
    }
}
