use gpui::*;
use crate::npf::LinkBlock;

pub struct LinkBlockView {
    pub block: LinkBlock,
    pub is_focused: bool,
}

impl LinkBlockView {
    pub fn new(block: LinkBlock, is_focused: bool) -> Self {
        Self { block, is_focused }
    }
}

impl IntoElement for LinkBlockView {
    type Element = Div;

    fn into_element(self) -> Self::Element {
        let title = self.block.title.as_deref().unwrap_or("Untitled Link");
        let description = self
            .block
            .description
            .as_deref()
            .unwrap_or("No description provided");
        let site_name = self.block.site_name.as_deref().unwrap_or("");

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
            .gap_1()
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::BOLD)
                            .text_color(rgb(0x60a5fa))
                            .child(title.to_string()),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(rgb(0x9ca3af))
                            .child(site_name.to_string()),
                    ),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(rgb(0xd1d5db))
                    .line_height(relative(1.4))
                    .child(description.to_string()),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(rgb(0x6b7280))
                    .child(self.block.url.clone()),
            )
    }
}
