use gpui::prelude::FluentBuilder;
use gpui::*;
use gpui_component::input::{Input, InputEvent, InputState};

use super::blocks::image_block::ImageBlockView;
use super::blocks::link_block::LinkBlockView;
use super::model::EditorModel;
use super::toolbar::{EditorToolbar, ToolbarAction};
use crate::npf::{ImageBlock, LinkBlock, NpfBlock, NpfDocument, NpfMedia, TextBlock, TextSubtype};

pub struct EditorView {
    pub model: Entity<EditorModel>,
    pub toolbar: Entity<EditorToolbar>,
    pub title_input: Entity<InputState>,
    pub tag_input: Entity<InputState>,
    pub block_inputs: Vec<Entity<InputState>>,
}

impl EditorView {
    pub fn new(model: Entity<EditorModel>, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let model_read = model.read(cx);
        let initial_title = model_read.title.clone();
        let initial_doc = model_read.document.clone();

        let title_input = cx.new(|cx| {
            let mut state = InputState::new(window, cx).placeholder("Untitled Post");
            if !initial_title.is_empty() {
                state.set_value(initial_title, window, cx);
            }
            state
        });

        let tag_input = cx.new(|cx| {
            InputState::new(window, cx).placeholder("+ Type tag & press Enter...")
        });

        // 각 블록의 InputState 생성
        let mut block_inputs = Vec::new();
        for block in &initial_doc.content {
            let text_val = match block {
                NpfBlock::Text(tb) => tb.text.clone(),
                _ => String::new(),
            };
            let input = cx.new(|cx| {
                let mut state = InputState::new(window, cx)
                    .auto_grow(1, 20)
                    .placeholder("Type something...");
                if !text_val.is_empty() {
                    state.set_value(text_val, window, cx);
                }
                state
            });
            block_inputs.push(input);
        }

        // 태그 Enter 이벤트 리스너 구독
        let model_for_tag = model.clone();
        let tag_input_for_sub = tag_input.clone();
        cx.subscribe(&tag_input, move |_this, _emitter, event: &InputEvent, cx| {
            if let InputEvent::PressEnter { .. } = event {
                let val = tag_input_for_sub.read(cx).text().to_string();
                let trimmed = val.trim().to_string();
                if !trimmed.is_empty() {
                    model_for_tag.update(cx, |model, cx| {
                        if !model.tags.contains(&trimmed) {
                            model.tags.push(trimmed);
                            cx.notify();
                        }
                    });
                }
            }
        })
        .detach();

        let model_clone = model.clone();
        let toolbar = cx.new(move |_cx| {
            let mut tb = EditorToolbar::new();
            let model_for_action = model_clone.clone();
            tb.set_on_action(move |action, _window, cx| {
                model_for_action.update(cx, |model, cx| {
                    match action {
                        ToolbarAction::Heading1 => {
                            Self::set_active_block_subtype(model, Some(TextSubtype::Heading1));
                        }
                        ToolbarAction::Heading2 => {
                            Self::set_active_block_subtype(model, Some(TextSubtype::Heading2));
                        }
                        ToolbarAction::Paragraph => {
                            Self::set_active_block_subtype(model, None);
                        }
                        ToolbarAction::BulletList => {
                            Self::set_active_block_subtype(model, Some(TextSubtype::UnorderedListItem));
                        }
                        ToolbarAction::NumberedList => {
                            Self::set_active_block_subtype(model, Some(TextSubtype::OrderedListItem));
                        }
                        ToolbarAction::Quote => {
                            Self::set_active_block_subtype(model, Some(TextSubtype::Quote));
                        }
                        ToolbarAction::AddImage => {
                            model.document.content.push(NpfBlock::Image(ImageBlock {
                                media: vec![NpfMedia {
                                    url: "https://assets.tumblr.com/images/default_avatar/cube_closed_128.png".to_string(),
                                    media_type: Some("image/png".to_string()),
                                    width: Some(500),
                                    height: Some(500),
                                    ..Default::default()
                                }],
                                alt_text: Some("New Image Block".to_string()),
                                caption: Some("Tumblr media block".to_string()),
                                feedback_token: None,
                            }));
                            model.active_block_index = model.document.content.len() - 1;
                        }
                        ToolbarAction::AddLink => {
                            model.document.content.push(NpfBlock::Link(LinkBlock {
                                url: "https://www.tumblr.com/docs/npf".to_string(),
                                title: Some("Tumblr Neue Post Format".to_string()),
                                description: Some("Rich text and blocks for Tumblr posts.".to_string()),
                                site_name: Some("Tumblr API".to_string()),
                                display_url: Some("tumblr.com/docs/npf".to_string()),
                                poster: Vec::new(),
                                author: None,
                            }));
                            model.active_block_index = model.document.content.len() - 1;
                        }
                    }
                    cx.notify();
                });
            });
            tb
        });

        Self {
            model,
            toolbar,
            title_input,
            tag_input,
            block_inputs,
        }
    }

    fn set_active_block_subtype(model: &mut EditorModel, subtype: Option<TextSubtype>) {
        if model.active_block_index < model.document.content.len() {
            if let NpfBlock::Text(ref mut text_block) = model.document.content[model.active_block_index] {
                text_block.subtype = subtype;
            }
        }
    }

    /// InputState들의 현재 입력 텍스트를 EditorModel에 동기화
    pub fn sync_model(&self, cx: &mut Context<Self>) {
        let title_text = self.title_input.read(cx).text().to_string();
        let block_texts: Vec<String> = self
            .block_inputs
            .iter()
            .map(|input| input.read(cx).text().to_string())
            .collect();

        self.model.update(cx, |model, _cx| {
            model.title = title_text;
            for (i, text) in block_texts.into_iter().enumerate() {
                if i < model.document.content.len() {
                    if let NpfBlock::Text(ref mut tb) = model.document.content[i] {
                        tb.text = text;
                    }
                }
            }
        });
    }

    pub fn set_document(
        &mut self,
        title: String,
        tags: Vec<String>,
        document: NpfDocument,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        self.title_input.update(cx, |input, cx| {
            input.set_value(title.clone(), window, cx);
        });

        // 블록 InputState 새로 생성
        let mut new_inputs = Vec::new();
        for block in &document.content {
            let text_val = match block {
                NpfBlock::Text(tb) => tb.text.clone(),
                _ => String::new(),
            };
            let input = cx.new(|cx| {
                let mut state = InputState::new(window, cx)
                    .auto_grow(1, 20)
                    .placeholder("Type something...");
                if !text_val.is_empty() {
                    state.set_value(text_val, window, cx);
                }
                state
            });
            new_inputs.push(input);
        }
        self.block_inputs = new_inputs;

        self.model.update(cx, |model, cx| {
            model.title = title;
            model.tags = tags;
            model.document = document;
            model.active_block_index = 0;
            cx.notify();
        });
    }

    pub fn select_block(&mut self, index: usize, cx: &mut Context<Self>) {
        self.model.update(cx, |model, cx| {
            if index < model.document.content.len() {
                model.active_block_index = index;
                cx.notify();
            }
        });
    }

    pub fn delete_block(&mut self, index: usize, cx: &mut Context<Self>) {
        if index < self.block_inputs.len() && self.block_inputs.len() > 1 {
            self.block_inputs.remove(index);
        }
        self.model.update(cx, |model, cx| {
            if model.document.content.len() > 1 && index < model.document.content.len() {
                model.document.content.remove(index);
                if model.active_block_index >= model.document.content.len() {
                    model.active_block_index = model.document.content.len() - 1;
                }
                cx.notify();
            }
        });
    }

    pub fn move_block_up(&mut self, index: usize, cx: &mut Context<Self>) {
        if index > 0 && index < self.block_inputs.len() {
            self.block_inputs.swap(index, index - 1);
        }
        self.model.update(cx, |model, cx| {
            if index > 0 && index < model.document.content.len() {
                model.document.content.swap(index, index - 1);
                model.active_block_index = index - 1;
                cx.notify();
            }
        });
    }

    pub fn move_block_down(&mut self, index: usize, cx: &mut Context<Self>) {
        if index + 1 < self.block_inputs.len() {
            self.block_inputs.swap(index, index + 1);
        }
        self.model.update(cx, |model, cx| {
            if index + 1 < model.document.content.len() {
                model.document.content.swap(index, index + 1);
                model.active_block_index = index + 1;
                cx.notify();
            }
        });
    }

    pub fn add_text_block(
        &mut self,
        text: &str,
        subtype: Option<TextSubtype>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        let text_str = text.to_string();
        let input = cx.new(|cx| {
            let mut state = InputState::new(window, cx)
                .auto_grow(1, 20)
                .placeholder("Type something...");
            if !text_str.is_empty() {
                state.set_value(text_str, window, cx);
            }
            state
        });
        self.block_inputs.push(input);

        self.model.update(cx, |model, cx| {
            let mut block = TextBlock::plain(text);
            block.subtype = subtype;
            model.document.content.push(NpfBlock::Text(block));
            model.active_block_index = model.document.content.len() - 1;
            cx.notify();
        });
    }

    pub fn add_sample_image(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let input = cx.new(|cx| InputState::new(window, cx));
        self.block_inputs.push(input);

        self.model.update(cx, |model, cx| {
            model.document.content.push(NpfBlock::Image(ImageBlock {
                media: vec![NpfMedia {
                    url: "https://assets.tumblr.com/images/default_avatar/cube_closed_128.png".to_string(),
                    media_type: Some("image/png".to_string()),
                    width: Some(500),
                    height: Some(500),
                    ..Default::default()
                }],
                alt_text: Some("Sample Tumblr Image".to_string()),
                caption: Some("Uploaded via GPUI Editor".to_string()),
                feedback_token: None,
            }));
            model.active_block_index = model.document.content.len() - 1;
            cx.notify();
        });
    }

    pub fn add_sample_link(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let input = cx.new(|cx| InputState::new(window, cx));
        self.block_inputs.push(input);

        self.model.update(cx, |model, cx| {
            model.document.content.push(NpfBlock::Link(LinkBlock {
                url: "https://www.tumblr.com/docs/npf".to_string(),
                title: Some("Tumblr Neue Post Format Documentation".to_string()),
                description: Some("Complete specification of Tumblr's rich block-based post format.".to_string()),
                site_name: Some("Tumblr API".to_string()),
                display_url: Some("tumblr.com/docs/npf".to_string()),
                poster: Vec::new(),
                author: None,
            }));
            model.active_block_index = model.document.content.len() - 1;
            cx.notify();
        });
    }
}

impl Render for EditorView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let model = self.model.read(cx);
        let active_idx = model.active_block_index;
        let blocks_count = model.document.content.len();

        let mut block_elements = Vec::new();
        for (i, block) in model.document.content.iter().enumerate() {
            let is_active = active_idx == i;
            let block_idx = i;
            let total_blocks = blocks_count;

            let block_element: AnyElement = match block {
                NpfBlock::Text(text_block) => {
                    let subtype = text_block.subtype;
                    if let Some(input_state) = self.block_inputs.get(i) {
                        let text_input = Input::new(input_state).appearance(false).bordered(false);

                        let base = div()
                            .w_full()
                            .py_1()
                            .px_2()
                            .rounded_md()
                            .when(is_active, |this| {
                                this.bg(rgb(0x1d202d)).border_1().border_color(rgb(0x3b82f6))
                            })
                            .when(!is_active, |this| {
                                this.hover(|this| this.bg(rgb(0x191b26)))
                            });

                        match subtype {
                            Some(TextSubtype::Heading1) => base
                                .text_2xl()
                                .font_weight(FontWeight::BOLD)
                                .text_color(rgb(0xffffff))
                                .child(text_input)
                                .into_any_element(),
                            Some(TextSubtype::Heading2) => base
                                .text_xl()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(rgb(0xeeeeee))
                                .child(text_input)
                                .into_any_element(),
                            Some(TextSubtype::Quote) => base
                                .border_l_4()
                                .border_color(rgb(0x3b82f6))
                                .pl_3()
                                .italic()
                                .child(text_input)
                                .into_any_element(),
                            Some(TextSubtype::UnorderedListItem) => div()
                                .flex()
                                .items_start()
                                .gap_2()
                                .child(div().pt_1().text_color(rgb(0x3b82f6)).child("•"))
                                .child(base.child(text_input))
                                .into_any_element(),
                            Some(TextSubtype::OrderedListItem) => div()
                                .flex()
                                .items_start()
                                .gap_2()
                                .child(div().pt_1().text_color(rgb(0x3b82f6)).child(format!("{}.", i + 1)))
                                .child(base.child(text_input))
                                .into_any_element(),
                            _ => base.child(text_input).into_any_element(),
                        }
                    } else {
                        div().child(text_block.text.clone()).into_any_element()
                    }
                }
                NpfBlock::Image(image_block) => {
                    ImageBlockView::new(image_block.clone(), is_active).into_any_element()
                }
                NpfBlock::Link(link_block) => {
                    LinkBlockView::new(link_block.clone(), is_active).into_any_element()
                }
                _ => div()
                    .p_2()
                    .text_xs()
                    .text_color(rgb(0x6b7280))
                    .child("[Unsupported Block]")
                    .into_any_element(),
            };

            block_elements.push(
                div()
                    .id(SharedString::from(format!("block-row-{}", i)))
                    .group("block-row")
                    .relative()
                    .w_full()
                    .rounded_lg()
                    .on_mouse_down(
                        MouseButton::Left,
                        cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                            this.select_block(block_idx, cx);
                        }),
                    )
                    .child(block_element)
                    // 호버 시 액션 툴바 (⬆️, ⬇️, 🗑️)
                    .child(
                        div()
                            .absolute()
                            .top_1()
                            .right_2()
                            .flex()
                            .items_center()
                            .gap_1()
                            .p_1()
                            .rounded_md()
                            .bg(rgb(0x20222f))
                            .border_1()
                            .border_color(rgb(0x35384c))
                            .when(block_idx > 0, |this| {
                                this.child(
                                    div()
                                        .px_1p5()
                                        .py_0p5()
                                        .rounded_md()
                                        .hover(|this| this.bg(rgb(0x35384c)))
                                        .text_xs()
                                        .child("⬆️")
                                        .on_mouse_down(
                                            MouseButton::Left,
                                            cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                                                this.move_block_up(block_idx, cx);
                                            }),
                                        ),
                                )
                            })
                            .when(block_idx + 1 < total_blocks, |this| {
                                this.child(
                                    div()
                                        .px_1p5()
                                        .py_0p5()
                                        .rounded_md()
                                        .hover(|this| this.bg(rgb(0x35384c)))
                                        .text_xs()
                                        .child("⬇️")
                                        .on_mouse_down(
                                            MouseButton::Left,
                                            cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                                                this.move_block_down(block_idx, cx);
                                            }),
                                        ),
                                )
                            })
                            .when(total_blocks > 1, |this| {
                                this.child(
                                    div()
                                        .px_1p5()
                                        .py_0p5()
                                        .rounded_md()
                                        .hover(|this| this.bg(rgb(0xef4444)))
                                        .text_xs()
                                        .child("🗑️")
                                        .on_mouse_down(
                                            MouseButton::Left,
                                            cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                                                this.delete_block(block_idx, cx);
                                            }),
                                        ),
                                )
                            }),
                    ),
            );
        }

        // 태그 뱃지 목록
        let tag_badges: Vec<_> = model
            .tags
            .iter()
            .enumerate()
            .map(|(idx, tag)| {
                let tag_str = tag.clone();
                div()
                    .px_2()
                    .py_0p5()
                    .rounded_md()
                    .bg(rgb(0x282a3a))
                    .border_1()
                    .border_color(rgb(0x3e4259))
                    .flex()
                    .items_center()
                    .gap_1()
                    .text_xs()
                    .text_color(rgb(0x60a5fa))
                    .child(format!("#{}", tag_str))
                    .child(
                        div()
                            .cursor_pointer()
                            .text_color(rgb(0x9ca3af))
                            .hover(|this| this.text_color(rgb(0xef4444)))
                            .child("✕")
                            .on_mouse_down(
                                MouseButton::Left,
                                cx.listener(move |this, _event: &MouseDownEvent, _window, cx| {
                                    this.model.update(cx, |model, cx| {
                                        if idx < model.tags.len() {
                                            model.tags.remove(idx);
                                            cx.notify();
                                        }
                                    });
                                }),
                            ),
                    )
            })
            .collect();

        div()
            .flex()
            .flex_col()
            .size_full()
            .bg(rgb(0x13141c))
            .child(self.toolbar.clone())
            .child(
                div()
                    .id("editor-scroll-area")
                    .flex_1()
                    .overflow_y_scroll()
                    .px_8()
                    .py_6()
                    .child(
                        div()
                            .max_w(px(768.0))
                            .mx_auto()
                            .flex()
                            .flex_col()
                            .gap_4()
                            // 제목 영역 (Input 컴포넌트로 한글/단축키 지원)
                            .child(
                                div()
                                    .pb_3()
                                    .border_b_1()
                                    .border_color(rgb(0x2a2b36))
                                    .child(
                                        div()
                                            .id("editor-title-area")
                                            .text_3xl()
                                            .font_weight(FontWeight::BOLD)
                                            .text_color(rgb(0xffffff))
                                            .child(
                                                Input::new(&self.title_input)
                                                    .appearance(false)
                                                    .bordered(false),
                                            ),
                                    )
                                    // 태그 영역 (Input 컴포넌트 & 뱃지)
                                    .child(
                                        div()
                                            .id("editor-tags-area")
                                            .pt_2()
                                            .flex()
                                            .items_center()
                                            .flex_wrap()
                                            .gap_2()
                                            .children(tag_badges)
                                            .child(
                                                div()
                                                    .w(px(200.0))
                                                    .child(
                                                        Input::new(&self.tag_input)
                                                            .appearance(false)
                                                            .bordered(false),
                                                    ),
                                            ),
                                    ),
                            )
                            // 블록 목록
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap_3()
                                    .children(block_elements),
                            )
                            // 새 블록 빠른 추가 패널
                            .child(
                                div()
                                    .mt_6()
                                    .p_3()
                                    .rounded_lg()
                                    .border_1()
                                    .border_color(rgb(0x242632))
                                    .bg(rgb(0x191a24))
                                    .flex()
                                    .items_center()
                                    .justify_between()
                                    .child(
                                        div()
                                            .text_xs()
                                            .text_color(rgb(0x9ca3af))
                                            .child("+ Add NPF Block:"),
                                    )
                                    .child(
                                        div()
                                            .flex()
                                            .items_center()
                                            .gap_2()
                                            .child(
                                                div()
                                                    .id("quick-add-text")
                                                    .px_2()
                                                    .py_1()
                                                    .rounded_md()
                                                    .bg(rgb(0x282a36))
                                                    .hover(|this| this.bg(rgb(0x383b4c)))
                                                    .active(|this| this.bg(rgb(0x2563eb)))
                                                    .cursor_pointer()
                                                    .text_xs()
                                                    .text_color(rgb(0x60a5fa))
                                                    .child("Text")
                                                    .on_mouse_down(
                                                        MouseButton::Left,
                                                        cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                                            this.add_text_block("", None, window, cx);
                                                        }),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .id("quick-add-heading")
                                                    .px_2()
                                                    .py_1()
                                                    .rounded_md()
                                                    .bg(rgb(0x282a36))
                                                    .hover(|this| this.bg(rgb(0x383b4c)))
                                                    .active(|this| this.bg(rgb(0x2563eb)))
                                                    .cursor_pointer()
                                                    .text_xs()
                                                    .text_color(rgb(0x60a5fa))
                                                    .child("Heading")
                                                    .on_mouse_down(
                                                        MouseButton::Left,
                                                        cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                                            this.add_text_block(
                                                                "",
                                                                Some(TextSubtype::Heading2),
                                                                window,
                                                                cx,
                                                            );
                                                        }),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .id("quick-add-image")
                                                    .px_2()
                                                    .py_1()
                                                    .rounded_md()
                                                    .bg(rgb(0x282a36))
                                                    .hover(|this| this.bg(rgb(0x383b4c)))
                                                    .active(|this| this.bg(rgb(0x2563eb)))
                                                    .cursor_pointer()
                                                    .text_xs()
                                                    .text_color(rgb(0x60a5fa))
                                                    .child("Image")
                                                    .on_mouse_down(
                                                        MouseButton::Left,
                                                        cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                                            this.add_sample_image(window, cx);
                                                        }),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .id("quick-add-link")
                                                    .px_2()
                                                    .py_1()
                                                    .rounded_md()
                                                    .bg(rgb(0x282a36))
                                                    .hover(|this| this.bg(rgb(0x383b4c)))
                                                    .active(|this| this.bg(rgb(0x2563eb)))
                                                    .cursor_pointer()
                                                    .text_xs()
                                                    .text_color(rgb(0x60a5fa))
                                                    .child("Link Card")
                                                    .on_mouse_down(
                                                        MouseButton::Left,
                                                        cx.listener(|this, _event: &MouseDownEvent, window, cx| {
                                                            this.add_sample_link(window, cx);
                                                        }),
                                                    ),
                                            ),
                                    ),
                            ),
                    ),
            )
    }
}
