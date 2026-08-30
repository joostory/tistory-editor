use gpui::prelude::FluentBuilder;
use gpui::*;
use crate::npf::{TextBlock, TextSubtype};

pub struct TextBlockView {
    pub block: TextBlock,
    pub is_focused: bool,
}

impl TextBlockView {
    pub fn new(block: TextBlock, is_focused: bool) -> Self {
        Self { block, is_focused }
    }
}

impl IntoElement for TextBlockView {
    type Element = Div;

    fn into_element(self) -> Self::Element {
        let subtype = self.block.subtype;
        let is_empty = self.block.text.is_empty();

        let display_text = if is_empty {
            if self.is_focused {
                "|".to_string()
            } else {
                "Type text or click toolbar to change style...".to_string()
            }
        } else if self.is_focused {
            format!("{}|", self.block.text)
        } else {
            self.block.text.clone()
        };

        let is_placeholder = is_empty && !self.is_focused;

        let base = div()
            .w_full()
            .py_1()
            .px_2()
            .rounded_md()
            .when(self.is_focused, |this| {
                this.bg(rgb(0x222432)).border_1().border_color(rgb(0x3b82f6))
            })
            .when(!self.is_focused, |this| {
                this.hover(|this| this.bg(rgb(0x191b26)))
            });

        match subtype {
            Some(TextSubtype::Heading1) => base
                .text_2xl()
                .font_weight(FontWeight::BOLD)
                .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xffffff) })
                .child(display_text),
            Some(TextSubtype::Heading2) => base
                .text_xl()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xeeeeee) })
                .child(display_text),
            Some(TextSubtype::Quote) => base
                .border_l_4()
                .border_color(rgb(0x3b82f6))
                .pl_3()
                .italic()
                .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xcccccc) })
                .child(display_text),
            Some(TextSubtype::UnorderedListItem) => div()
                .flex()
                .items_start()
                .gap_2()
                .child(div().text_color(rgb(0x3b82f6)).child("•"))
                .child(
                    base.text_base()
                        .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xffffff) })
                        .child(display_text),
                ),
            Some(TextSubtype::OrderedListItem) => div()
                .flex()
                .items_start()
                .gap_2()
                .child(div().text_color(rgb(0x3b82f6)).child("1."))
                .child(
                    base.text_base()
                        .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xffffff) })
                        .child(display_text),
                ),
            _ => base
                .text_base()
                .line_height(relative(1.6))
                .text_color(if is_placeholder { rgb(0x4b5563) } else { rgb(0xdddddd) })
                .child(display_text),
        }
    }
}
