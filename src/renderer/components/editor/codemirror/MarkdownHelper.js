import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import marked from 'marked'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
})
turndownService.use(gfm)
turndownService.keep(['script'])

class MarkdownHelper {
	static htmlToMarkdown(content) {
    return turndownService.turndown(content)
	}

	static markdownToHtml(content) {
		return marked(content, {
      gfm: true,
      breaks: true,
      headerIds: false
    })
	}
}

export default MarkdownHelper
