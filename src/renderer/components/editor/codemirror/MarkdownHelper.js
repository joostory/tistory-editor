import toMarkdown from 'to-markdown'
import marked from 'marked'

class MarkdownHelper {
	static htmlToMarkdown(content) {
		return toMarkdown(content, {
			converters: [
				{
					filter: "script",
					replacement: (innerHTML, node) => {
						return node.outerHTML
					}
				}
			]
		})
	}

	static markdownToHtml(content) {
		return marked(content)
	}
}

export default MarkdownHelper
