use crate::npf::{NpfBlock, NpfDocument, TextBlock};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FocusTarget {
    Title,
    Tags,
    Block(usize),
}

#[derive(Debug, Clone)]
pub struct EditorModel {
    pub title: String,
    pub tags: Vec<String>,
    pub tag_input: String,
    pub document: NpfDocument,
    pub active_block_index: usize,
    pub focus_target: FocusTarget,
}

impl Default for EditorModel {
    fn default() -> Self {
        Self {
            title: String::new(),
            tags: Vec::new(),
            tag_input: String::new(),
            document: NpfDocument::with_content(vec![NpfBlock::Text(TextBlock::plain(""))]),
            active_block_index: 0,
            focus_target: FocusTarget::Block(0),
        }
    }
}
