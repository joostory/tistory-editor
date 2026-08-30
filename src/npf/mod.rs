pub mod types;

pub use types::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serialize_deserialize_text_block() {
        let text_block = TextBlock {
            text: "Hello World!".to_string(),
            subtype: Some(TextSubtype::Heading1),
            formatting: vec![
                NpfFormat::Bold { start: 0, end: 5 },
                NpfFormat::Link {
                    start: 6,
                    end: 11,
                    url: "https://tumblr.com".to_string(),
                },
            ],
            indent_level: None,
        };

        let doc = NpfDocument::with_content(vec![NpfBlock::Text(text_block.clone())]);
        let json = serde_json::to_string_pretty(&doc).unwrap();

        let deserialized: NpfDocument = serde_json::from_str(&json).unwrap();
        assert_eq!(doc, deserialized);
    }

    #[test]
    fn test_npf_with_image_and_layout() {
        let text_block = NpfBlock::Text(TextBlock::plain("Look at this picture!"));
        let image_block = NpfBlock::Image(ImageBlock {
            media: vec![NpfMedia {
                url: "https://64.media.tumblr.com/sample.jpg".to_string(),
                media_type: Some("image/jpeg".to_string()),
                width: Some(1280),
                height: Some(720),
                ..Default::default()
            }],
            alt_text: Some("A nice photo".to_string()),
            caption: Some("Photo caption".to_string()),
            feedback_token: None,
        });

        let mut doc = NpfDocument::with_content(vec![text_block, image_block]);
        doc.generate_default_layout();

        let json = serde_json::to_string(&doc).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();

        assert_eq!(parsed["content"].as_array().unwrap().len(), 2);
        assert_eq!(parsed["content"][0]["type"], "text");
        assert_eq!(parsed["content"][1]["type"], "image");
        assert_eq!(parsed["layout"][0]["type"], "rows");
    }

    #[test]
    fn test_link_and_video_blocks() {
        let link_block = NpfBlock::Link(LinkBlock {
            url: "https://www.tumblr.com".to_string(),
            title: Some("Tumblr".to_string()),
            description: Some("Express yourself".to_string()),
            site_name: Some("Tumblr".to_string()),
            display_url: Some("tumblr.com".to_string()),
            poster: vec![],
            author: None,
        });

        let video_block = NpfBlock::Video(VideoBlock {
            url: Some("https://va.media.tumblr.com/sample.mp4".to_string()),
            media: Some(NpfMedia {
                url: "https://va.media.tumblr.com/sample.mp4".to_string(),
                media_type: Some("video/mp4".to_string()),
                width: Some(1920),
                height: Some(1080),
                ..Default::default()
            }),
            provider: Some("tumblr".to_string()),
            poster: vec![],
            embed_html: None,
            embed_url: None,
        });

        let doc = NpfDocument::with_content(vec![link_block, video_block]);
        let json = serde_json::to_string(&doc).unwrap();
        let deserialized: NpfDocument = serde_json::from_str(&json).unwrap();

        assert_eq!(doc, deserialized);
    }
}
