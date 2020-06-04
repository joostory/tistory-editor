import MarkdownHelper from './MarkdownHelper'

describe("MarkdownHelper", () => {
  it("markdownToHtml: codeblock with language", () => {
    const expected = "<pre><code class=\"language-javascript\">console.log(&quot;Hello&quot;)</code></pre>\n"
    const result = MarkdownHelper.markdownToHtml("```javascript\nconsole.log(\"Hello\")\n```")
    expect(result).toBe(expected)
  })

  it("htmlToMarkdown: codeblock with language", () => {
    const expected = "```javascript\nconsole.log(\"Hello\")\n```"
    const result = MarkdownHelper.htmlToMarkdown("<pre><code class=\"language-javascript\">console.log(&quot;Hello&quot;)</code></pre>\n")
    expect(result).toBe(expected)
  })
})

