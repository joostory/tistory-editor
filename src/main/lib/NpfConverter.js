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
 * 변환된 결과 blocks 배열에 .layout 프로퍼티를 주입하여 동시 반환
 */
function tiptapToNpf(tiptapJson) {
  if (!tiptapJson) return []
  const blocks = []
  const displayRows = []
  
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
      
      const nextIdx = blocks.length
      blocks.push(block)
      displayRows.push({ blocks: [nextIdx] })

    } else if (node.type === 'image') {
      if (node.attrs && node.attrs.src) {
        const nextIdx = blocks.length
        blocks.push({
          type: 'image',
          media: [{ url: node.attrs.src }],
          alt_text: node.attrs.alt || ''
        })
        displayRows.push({ blocks: [nextIdx] })
      }
    } else if (node.type === 'imageGroup') {
      const groupBlockIndices = []
      
      if (Array.isArray(node.content)) {
        for (const childImg of node.content) {
          if (childImg.type === 'image' && childImg.attrs && childImg.attrs.src) {
            const nextIdx = blocks.length
            blocks.push({
              type: 'image',
              media: [{ url: childImg.attrs.src }],
              alt_text: childImg.attrs.alt || ''
            })
            groupBlockIndices.push(nextIdx)
          }
        }
      }
      
      if (groupBlockIndices.length > 0) {
        displayRows.push({ blocks: groupBlockIndices })
      }
    }
  }
  
  // 배열 속성으로 layout을 숨겨서 반환 (하위 호환성 극대화)
  blocks.layout = [{
    type: 'rows',
    display: displayRows
  }]
  
  return blocks
}

/**
 * Tumblr NPF Blocks 배열과 layout 정보를 Tiptap JSON (ProseMirror JSON)으로 변환
 */
function npfToTiptap(npfBlocks, layout) {
  const content = []
  
  if (!npfBlocks || !Array.isArray(npfBlocks)) {
    return { type: 'doc', content }
  }

  // layout 정보가 있는 경우
  const rowsLayout = layout && Array.isArray(layout) ? layout.find(l => l.type === 'rows') : null

  if (rowsLayout && Array.isArray(rowsLayout.display)) {
    // 이미 변환에 사용된 블록 인덱스 추적
    const usedBlockIndices = new Set()

    for (const row of rowsLayout.display) {
      if (!row || !Array.isArray(row.blocks) || row.blocks.length === 0) continue

      // 행에 지정된 블록들 중 image 타입이 여러 개 들어있는지 검사
      const rowImageBlocks = []
      const isAllImages = row.blocks.every(idx => {
        const block = npfBlocks[idx]
        return block && block.type === 'image'
      })

      if (isAllImages && row.blocks.length > 1) {
        // 이미지 그룹(imageGroup)으로 묶어서 생성
        const groupImages = []
        for (const idx of row.blocks) {
          const block = npfBlocks[idx]
          const mediaUrl = block.media && block.media[0] ? block.media[0].url : ''
          if (mediaUrl) {
            groupImages.push({
              type: 'image',
              attrs: {
                src: mediaUrl,
                alt: block.alt_text || ''
              }
            })
          }
          usedBlockIndices.add(idx)
        }
        
        if (groupImages.length > 0) {
          content.push({
            type: 'imageGroup',
            content: groupImages
          })
        }
      } else {
        // 개별 변환
        for (const idx of row.blocks) {
          const block = npfBlocks[idx]
          if (!block) continue
          const node = convertSingleBlockToTiptapNode(block)
          if (node) {
            content.push(node)
          }
          usedBlockIndices.add(idx)
        }
      }
    }

    // layout에 포함되지 않은 잔여 블록 처리 (혹시 모를 누락 방지)
    for (let i = 0; i < npfBlocks.length; i++) {
      if (!usedBlockIndices.has(i)) {
        const node = convertSingleBlockToTiptapNode(npfBlocks[i])
        if (node) content.push(node)
      }
    }
  } else {
    // layout이 없는 경우: 순차적으로 단독 변환 (기본 한 줄에 하나씩)
    for (const block of npfBlocks) {
      const node = convertSingleBlockToTiptapNode(block)
      if (node) content.push(node)
    }
  }

  return {
    type: 'doc',
    content
  }
}

/**
 * 단일 NPF 블록을 Tiptap 노드로 변환하는 헬퍼 함수
 */
function convertSingleBlockToTiptapNode(block) {
  if (block.type === 'text') {
    const text = block.text || ''
    const formatting = block.formatting || []
    const childNodes = []
    
    if (text.length > 0) {
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
    
    return node
  } else if (block.type === 'image') {
    const mediaUrl = block.media && block.media[0] ? block.media[0].url : ''
    if (mediaUrl) {
      return {
        type: 'image',
        attrs: {
          src: mediaUrl,
          alt: block.alt_text || ''
        }
      }
    }
  }
  return null
}

// ==========================================
// 2. HTML <-> Tumblr NPF Blocks 변환 (마크다운 파싱을 위한 중간체)
// ==========================================

/**
 * HTML 문자열을 Tumblr NPF Blocks 배열로 변환
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

      // 내부에 img 태그가 중첩되어 있는 경우 (단독 img 태그 제외)
      if (tagName !== 'img' && $node.find('img').length > 0) {
        // 내부에 있는 모든 img 엘리먼트들을 순차적으로 NPF 이미지 블록으로 추출
        $node.find('img').each((_, imgNode) => {
          const src = $(imgNode).attr('src')
          if (src) {
            blocks.push({
              type: 'image',
              media: [{ url: src }],
              alt_text: $(imgNode).attr('alt') || ''
            })
          }
        })

        // 이미지를 제외한 순수 텍스트 콘텐츠가 남아있다면 텍스트 블록도 유실 없이 추출
        const clone = $node.clone()
        clone.find('img').remove() // 이미지는 위에서 처리했으므로 클론에서 삭제
        const text = clone.text().replace(/\n/g, ' ').trim()
        if (text) {
          const formatting = []
          parseInlineFormats(clone, $, formatting)
          const block = {
            type: 'text',
            text: text
          }
          if (formatting.length > 0) {
            block.formatting = formatting
          }
          blocks.push(block)
        }
        return
      }

      // 내부에 img가 없는 일반 엘리먼트 처리
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
 * Tumblr NPF Blocks 배열을 HTML 문자열로 변환 (layout 정보 연동)
 */
function npfToHtml(npfBlocks, layout) {
  if (!npfBlocks || !Array.isArray(npfBlocks)) return ''

  const htmlParts = []
  
  const rowsLayout = layout && Array.isArray(layout) ? layout.find(l => l.type === 'rows') : null

  if (rowsLayout && Array.isArray(rowsLayout.display)) {
    const usedBlockIndices = new Set()

    for (const row of rowsLayout.display) {
      if (!row || !Array.isArray(row.blocks) || row.blocks.length === 0) continue

      const isAllImages = row.blocks.every(idx => {
        const block = npfBlocks[idx]
        return block && block.type === 'image'
      })

      if (isAllImages && row.blocks.length > 1) {
        const imagesHtml = row.blocks.map(idx => {
          const imgBlock = npfBlocks[idx]
          const mediaUrl = imgBlock.media && imgBlock.media[0] ? imgBlock.media[0].url : ''
          return `<img src="${mediaUrl}" alt="${imgBlock.alt_text || ''}" />`
        }).join('')
        htmlParts.push(`<div class="image-group" data-count="${row.blocks.length}">${imagesHtml}</div>`)
        row.blocks.forEach(idx => usedBlockIndices.add(idx))
      } else {
        for (const idx of row.blocks) {
          const block = npfBlocks[idx]
          if (!block) continue
          htmlParts.push(convertSingleBlockToHtml(block))
          usedBlockIndices.add(idx)
        }
      }
    }

    // 누락된 블록 렌더링
    for (let i = 0; i < npfBlocks.length; i++) {
      if (!usedBlockIndices.has(i)) {
        htmlParts.push(convertSingleBlockToHtml(npfBlocks[i]))
      }
    }
  } else {
    // layout이 없는 경우: 단독 변환 (기본 한 줄에 하나씩)
    for (const block of npfBlocks) {
      htmlParts.push(convertSingleBlockToHtml(block))
    }
  }

  return htmlParts.join('\n')
}

/**
 * 단일 NPF 블록을 HTML 문자열로 변환하는 헬퍼 함수
 */
function convertSingleBlockToHtml(block) {
  if (block.type === 'text') {
    let text = block.text || ''
    const formatting = block.formatting || []
    
    if (formatting.length > 0) {
      const tagsOpen = Array.from({ length: text.length + 1 }, () => '')
      const tagsClose = Array.from({ length: text.length + 1 }, () => '')
      
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
      for (let k = 0; k <= text.length; k++) {
        htmlText += tagsClose[k]
        htmlText += tagsOpen[k]
        if (k < text.length) {
          htmlText += escapeHtml(text[k])
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
  const blocks = htmlToNpf(html)
  blocks.layout = []
  return blocks
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
