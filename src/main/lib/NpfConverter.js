const cheerio = require('cheerio')
const { marked } = require('marked')
const TurndownService = require('turndown')
const turndownPluginGfm = require('turndown-plugin-gfm')

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})
turndownService.use(turndownPluginGfm.gfm)

// ==========================================
// 1. Tiptap JSON <-> Tumblr NPF Blocks 변환
// ==========================================

/**
 * Tiptap JSON (ProseMirror JSON)을 Tumblr NPF Blocks 배열로 변환
 */
function tiptapToNpf(tiptapJson) {
  if (!tiptapJson) return []
  const blocks = []
  
  const content = tiptapJson.content || []
  for (const node of content) {
    if (node.type === 'paragraph' || node.type === 'heading') {
      let text = ''
      const formatting = []
      
      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'text') {
            const start = text.length
            text += child.text
            const end = text.length
            
            if (child.marks) {
              for (const mark of child.marks) {
                const format = {
                  start,
                  end,
                  type: mark.type
                }
                if (mark.type === 'link' && mark.attrs && mark.attrs.href) {
                  format.url = mark.attrs.href
                }
                formatting.push(format)
              }
            }
          }
        }
      }
      
      const block = {
        type: 'text',
        text
      }
      
      if (node.type === 'heading') {
        const level = (node.attrs && node.attrs.level) || 1
        block.subtype = `heading${level}`
      }
      
      if (formatting.length > 0) {
        block.formatting = formatting
      }
      
      blocks.push(block)
    } else if (node.type === 'image') {
      if (node.attrs && node.attrs.src) {
        blocks.push({
          type: 'image',
          media: [{ url: node.attrs.src }],
          alt_text: node.attrs.alt || ''
        })
      }
    }
  }
  
  return blocks
}

/**
 * Tumblr NPF Blocks 배열을 Tiptap JSON (ProseMirror JSON)으로 변환
 */
function npfToTiptap(npfBlocks) {
  const content = []
  
  if (!npfBlocks || !Array.isArray(npfBlocks)) {
    return { type: 'doc', content }
  }
  
  for (const block of npfBlocks) {
    if (block.type === 'text') {
      const text = block.text || ''
      const formatting = block.formatting || []
      const childNodes = []
      
      if (text.length > 0) {
        // 각 글자 인덱스별 마크 목록 수집
        const charMarks = Array.from({ length: text.length }, () => [])
        
        for (const format of formatting) {
          const start = Math.max(0, format.start)
          const end = Math.min(text.length, format.end)
          for (let i = start; i < end; i++) {
            const mark = { type: format.type }
            if (format.type === 'link' && format.url) {
              mark.attrs = { href: format.url }
            }
            charMarks[i].push(mark)
          }
        }
        
        // 동일 마크 조합을 가진 연속된 글자 구간 병합
        let currentText = ''
        let currentMarks = null
        
        const areMarksEqual = (m1, m2) => {
          if (m1.length !== m2.length) return false
          const serialize = m => JSON.stringify(m.map(x => ({ type: x.type, href: x.attrs?.href })).sort((a, b) => a.type.localeCompare(b.type)))
          return serialize(m1) === serialize(m2)
        }
        
        for (let i = 0; i < text.length; i++) {
          const marksAtChar = charMarks[i]
          if (currentMarks === null) {
            currentText = text[i]
            currentMarks = marksAtChar
          } else if (areMarksEqual(currentMarks, marksAtChar)) {
            currentText += text[i]
          } else {
            const childNode = { type: 'text', text: currentText }
            if (currentMarks.length > 0) {
              childNode.marks = currentMarks
            }
            childNodes.push(childNode)
            
            currentText = text[i]
            currentMarks = marksAtChar
          }
        }
        
        if (currentText.length > 0) {
          const childNode = { type: 'text', text: currentText }
          if (currentMarks && currentMarks.length > 0) {
            childNode.marks = currentMarks
          }
          childNodes.push(childNode)
        }
      }
      
      const node = {
        type: block.subtype && block.subtype.startsWith('heading') ? 'heading' : 'paragraph'
      }
      
      if (node.type === 'heading') {
        const match = block.subtype.match(/\d+/)
        const level = match ? parseInt(match[0], 10) : 1
        node.attrs = { level }
      }
      
      if (childNodes.length > 0) {
        node.content = childNodes
      }
      
      content.push(node)
    } else if (block.type === 'image') {
      const mediaUrl = block.media && block.media[0] ? block.media[0].url : ''
      if (mediaUrl) {
        content.push({
          type: 'image',
          attrs: {
            src: mediaUrl,
            alt: block.alt_text || ''
          }
        })
      }
    }
  }
  
  return {
    type: 'doc',
    content
  }
}

// ==========================================
// 2. HTML <-> Tumblr NPF Blocks 변환 (마크다운 파싱을 위한 중간체)
// ==========================================

/**
 * HTML 문자열을 Tumblr NPF Blocks 배열로 변환
 */
/**
 * HTML 문자열을 Tumblr NPF Blocks 배열로 변환 (인라인 서식 및 다양한 노드 타입 완벽 지원)
 */
function htmlToNpf(html) {
  if (!html) return []
  const $ = cheerio.load(html)
  const blocks = []

  $('body').contents().each((_, node) => {
    const $node = $(node)
    
    // 1. 텍스트 노드인 경우
    if (node.nodeType === 3) {
      const text = node.nodeValue.replace(/\n/g, '').trim()
      if (text) {
        blocks.push({
          type: 'text',
          text: text
        })
      }
      return
    }

    // 2. 엘리먼트 노드인 경우
    if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase()

      if (['p', 'div', 'blockquote', 'pre', 'li', 'span'].includes(tagName)) {
        const text = $node.text().replace(/\n/g, ' ').trim()
        if (text) {
          const formatting = []
          parseInlineFormats($node, $, formatting)
          const block = {
            type: 'text',
            text: text
          }
          if (formatting.length > 0) {
            block.formatting = formatting
          }
          blocks.push(block)
        }
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const level = parseInt(tagName.substring(1), 10)
        blocks.push({
          type: 'text',
          text: $node.text().trim(),
          subtype: `heading${level}`
        })
      } else if (tagName === 'img') {
        const src = $node.attr('src')
        if (src) {
          blocks.push({
            type: 'image',
            media: [{ url: src }],
            alt_text: $node.attr('alt') || ''
          })
        }
      } else {
        const text = $node.text().trim()
        if (text) {
          blocks.push({
            type: 'text',
            text: text
          })
        }
      }
    }
  })

  return blocks
}

// 인라인 포맷(bold, italic, link) 파싱 헬퍼 함수
function parseInlineFormats($el, $, formatting, currentOffset = { val: 0 }) {
  $el.contents().each((_, child) => {
    const $child = $(child)
    const childText = $child.text()
    
    if (child.nodeType === 3) {
      currentOffset.val += childText.length
    } else if (child.nodeType === 1) {
      const tagName = child.tagName.toLowerCase()
      const start = currentOffset.val
      const end = start + childText.length
      
      if (childText.length > 0) {
        if (['strong', 'b'].includes(tagName)) {
          formatting.push({ start, end, type: 'bold' })
        } else if (['em', 'i'].includes(tagName)) {
          formatting.push({ start, end, type: 'italic' })
        } else if (tagName === 'a') {
          formatting.push({
            start,
            end,
            type: 'link',
            url: $child.attr('href') || ''
          })
        }
        // 중첩 태그 재귀 파싱
        parseInlineFormats($child, $, formatting, currentOffset)
      }
    }
  })
}

/**
 * Tumblr NPF Blocks 배열을 HTML 문자열로 변환
 */
function npfToHtml(npfBlocks) {
  if (!npfBlocks || !Array.isArray(npfBlocks)) return ''

  return npfBlocks.map(block => {
    if (block.type === 'text') {
      let text = block.text || ''
      const formatting = block.formatting || []
      
      if (formatting.length > 0) {
        // formatting 정보를 HTML 태그로 주입하기 위해 정렬 및 태그화
        // 간단하면서 안전한 복원을 위해 글자별 태그 적용 후 렌더링
        const tagsOpen = Array.from({ length: text.length + 1 }, () => '')
        const tagsClose = Array.from({ length: text.length + 1 }, () => '')
        
        // 정밀한 HTML 태그 조립
        formatting.forEach(format => {
          const start = Math.max(0, format.start)
          const end = Math.min(text.length, format.end)
          if (format.type === 'bold') {
            tagsOpen[start] = '<strong>' + tagsOpen[start]
            tagsClose[end] = tagsClose[end] + '</strong>'
          } else if (format.type === 'italic') {
            tagsOpen[start] = '<em>' + tagsOpen[start]
            tagsClose[end] = tagsClose[end] + '</em>'
          } else if (format.type === 'link' && format.url) {
            tagsOpen[start] = `<a href="${format.url}">` + tagsOpen[start]
            tagsClose[end] = tagsClose[end] + '</a>'
          }
        })
        
        let htmlText = ''
        for (let i = 0; i <= text.length; i++) {
          htmlText += tagsClose[i]
          htmlText += tagsOpen[i]
          if (i < text.length) {
            htmlText += escapeHtml(text[i])
          }
        }
        text = htmlText
      } else {
        text = escapeHtml(text)
      }
      
      if (block.subtype && block.subtype.startsWith('heading')) {
        const match = block.subtype.match(/\d+/)
        const level = match ? match[0] : '1'
        return `<h${level}>${text}</h${level}>`
      }
      return `<p>${text}</p>`
    } else if (block.type === 'image') {
      const mediaUrl = block.media && block.media[0] ? block.media[0].url : ''
      return `<img src="${mediaUrl}" alt="${block.alt_text || ''}" />`
    }
    return ''
  }).join('\n')
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// ==========================================
// 3. Markdown <-> Tumblr NPF Blocks 변환
// ==========================================

/**
 * Markdown 문자열을 Tumblr NPF Blocks 배열로 변환
 */
function markdownToNpf(markdownText) {
  if (!markdownText) return []
  const html = marked.parse(markdownText)
  return htmlToNpf(html)
}

/**
 * Tumblr NPF Blocks 배열을 Markdown 문자열로 변환
 */
function npfToMarkdown(npfBlocks) {
  const html = npfToHtml(npfBlocks)
  return turndownService.turndown(html)
}

module.exports = {
  tiptapToNpf,
  npfToTiptap,
  htmlToNpf,
  npfToHtml,
  markdownToNpf,
  npfToMarkdown
}
