use serde::{Deserialize, Serialize};

/// Tumblr NPF (Neue Post Format) 최상위 문서 구조체
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct NpfDocument {
    pub content: Vec<NpfBlock>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub layout: Vec<NpfLayout>,
}

impl NpfDocument {
    pub fn new() -> Self {
        Self {
            content: Vec::new(),
            layout: Vec::new(),
        }
    }

    pub fn with_content(content: Vec<NpfBlock>) -> Self {
        Self {
            content,
            layout: Vec::new(),
        }
    }

    /// 기본 1단 행 레이아웃 생성
    pub fn generate_default_layout(&mut self) {
        let display = self
            .content
            .iter()
            .enumerate()
            .map(|(idx, _)| LayoutRow { blocks: vec![idx] })
            .collect();

        self.layout = vec![NpfLayout::Rows {
            display,
            truncate_after: None,
        }];
    }
}

/// NPF 블록 유형
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum NpfBlock {
    Text(TextBlock),
    Image(ImageBlock),
    Link(LinkBlock),
    Audio(AudioBlock),
    Video(VideoBlock),
}

/// 텍스트 블록
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct TextBlock {
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtype: Option<TextSubtype>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub formatting: Vec<NpfFormat>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub indent_level: Option<u32>,
}

impl TextBlock {
    pub fn plain(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: None,
            formatting: Vec::new(),
            indent_level: None,
        }
    }

    pub fn heading1(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: Some(TextSubtype::Heading1),
            formatting: Vec::new(),
            indent_level: None,
        }
    }

    pub fn heading2(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: Some(TextSubtype::Heading2),
            formatting: Vec::new(),
            indent_level: None,
        }
    }

    pub fn unordered_list_item(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: Some(TextSubtype::UnorderedListItem),
            formatting: Vec::new(),
            indent_level: None,
        }
    }

    pub fn ordered_list_item(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: Some(TextSubtype::OrderedListItem),
            formatting: Vec::new(),
            indent_level: None,
        }
    }

    pub fn quote(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            subtype: Some(TextSubtype::Quote),
            formatting: Vec::new(),
            indent_level: None,
        }
    }
}

/// 텍스트 서브타입
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum TextSubtype {
    Heading1,
    Heading2,
    Quirky,
    Quote,
    Indented,
    Chat,
    OrderedListItem,
    UnorderedListItem,
}

/// 인라인 텍스트 서식
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum NpfFormat {
    Bold {
        start: usize,
        end: usize,
    },
    Italic {
        start: usize,
        end: usize,
    },
    Strikethrough {
        start: usize,
        end: usize,
    },
    Small {
        start: usize,
        end: usize,
    },
    Link {
        start: usize,
        end: usize,
        url: String,
    },
    Mention {
        start: usize,
        end: usize,
        blog: BlogMention,
    },
    Color {
        start: usize,
        end: usize,
        hex: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct BlogMention {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uuid: Option<String>,
}

/// 미디어 객체
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct NpfMedia {
    pub url: String,
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub media_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub original_dimensions_missing: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cropped: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_original_dimensions: Option<bool>,
}

/// 이미지 블록
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ImageBlock {
    pub media: Vec<NpfMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub caption: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub feedback_token: Option<String>,
}

/// 링크 블록
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct LinkBlock {
    pub url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub site_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub display_url: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub poster: Vec<NpfMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
}

/// 오디오 블록
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct AudioBlock {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media: Option<NpfMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub poster: Vec<NpfMedia>,
}

/// 비디오 블록
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct VideoBlock {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media: Option<NpfMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub poster: Vec<NpfMedia>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub embed_html: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub embed_url: Option<String>,
}

/// 레이아웃 정의
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum NpfLayout {
    Rows {
        display: Vec<LayoutRow>,
        #[serde(skip_serializing_if = "Option::is_none")]
        truncate_after: Option<usize>,
    },
    Ask {
        blocks: Vec<usize>,
        #[serde(skip_serializing_if = "Option::is_none")]
        attribution: Option<serde_json::Value>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct LayoutRow {
    pub blocks: Vec<usize>,
}
