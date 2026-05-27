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
 * Tiptap JSON 텍스트 노드를 파싱하여 NPF 텍스트 블록 객체 생성
 */
function parseTextNode(node, subtype) {
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
  
  if (subtype) {
    block.subtype = subtype
  }
  
  if (formatting.length > 0) {
    block.formatting = formatting
  }
  
  return block
}

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
      let subtype = null
      if (node.type === 'heading') {
        const level = (node.attrs && node.attrs.level) || 1
        subtype = `heading${level}`
      }
      const block = parseTextNode(node, subtype)
      const nextIdx = blocks.length
      blocks.push(block)
      displayRows.push({ blocks: [nextIdx] })
    } else if (node.type === 'bulletList' || node.type === 'orderedList') {
      const subtype = node.type === 'bulletList' ? 'unordered-list-item' : 'ordered-list-item'
      if (node.content) {
        for (const listItem of node.content) {
          if (listItem.type === 'listItem' && listItem.content) {
            for (const childNode of listItem.content) {
              if (childNode.type === 'paragraph') {
                const block = parseTextNode(childNode, subtype)
                const nextIdx = blocks.length
                blocks.push(block)
                displayRows.push({ blocks: [nextIdx] })
              }
            }
          }
        }
      }
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
        const N = groupBlockIndices.length
        if (N <= 3) {
          displayRows.push({ blocks: groupBlockIndices })
        } else if (N === 4) {
          displayRows.push({ blocks: groupBlockIndices.slice(0, 2) })
          displayRows.push({ blocks: groupBlockIndices.slice(2, 4) })
        } else if (N === 5) {
          displayRows.push({ blocks: groupBlockIndices.slice(0, 3) })
          displayRows.push({ blocks: groupBlockIndices.slice(3, 5) })
        } else {
          for (let k = 0; k < groupBlockIndices.length; k += 3) {
            displayRows.push({ blocks: groupBlockIndices.slice(k, k + 3) })
          }
        }
      }
    }
  }
  
  blocks.layout = [{
    type: 'rows',
    display: displayRows
  }]
  
  return blocks
}

/**
 * NPF 텍스트 블록의 formatting 및 text를 기반으로 Tiptap 자식 텍스트 노드 배열 생성
 */
function parseChildNodes(text, formatting) {
  const childNodes = []
  if (!text || text.length === 0) return childNodes

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

  return childNodes
}

/**
 * Tumblr NPF Blocks 배열과 layout 정보를 Tiptap JSON (ProseMirror JSON)으로 변환
 */
function npfToTiptap(npfBlocks, layout) {
  const content = []
  
  if (!npfBlocks || !Array.isArray(npfBlocks)) {
    return { type: 'doc', content }
  }

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

    for (let i = 0; i < npfBlocks.length; i++) {
      if (!usedBlockIndices.has(i)) {
        const node = convertSingleBlockToTiptapNode(npfBlocks[i])
        if (node) content.push(node)
      }
    }
  } else {
    for (const block of npfBlocks) {
      const node = convertSingleBlockToTiptapNode(block)
      if (node) content.push(node)
    }
  }

  // 2차 후처리 필터: 임시 리스트 아이템들을 실제 bulletList / orderedList로 그룹화
  const finalContent = []
  let currentList = null

  const flushList = () => {
    if (currentList) {
      finalContent.push(currentList)
      currentList = null
    }
  }

  for (const node of content) {
    if (node && (node.type === 'tempUnorderedListItem' || node.type === 'tempOrderedListItem')) {
      const listType = node.type === 'tempUnorderedListItem' ? 'bulletList' : 'orderedList'
      const listItemNode = {
        type: 'listItem',
        content: node.content
      }

      if (currentList && currentList.type === listType) {
        currentList.content.push(listItemNode)
      } else {
        flushList()
        currentList = {
          type: listType,
          content: [listItemNode]
        }
      }
    } else {
      flushList()
      finalContent.push(node)
    }
  }
  flushList()

  return {
    type: 'doc',
    content: finalContent
  }
}

/**
 * 단일 NPF 블록을 Tiptap 노드로 변환하는 헬퍼 함수
 */
function convertSingleBlockToTiptapNode(block) {
  if (block.type === 'text') {
    const childNodes = parseChildNodes(block.text || '', block.formatting || [])
    
    if (block.subtype === 'unordered-list-item' || block.subtype === 'ordered-list-item') {
      const pNode = { type: 'paragraph' }
      if (childNodes.length > 0) {
        pNode.content = childNodes
      }
      return {
        type: block.subtype === 'unordered-list-item' ? 'tempUnorderedListItem' : 'tempOrderedListItem',
        content: [pNode]
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
  } else if (block.type === 'link') {
    const url = block.url || ''
    const title = block.title || url
    return {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: title,
          marks: [
            {
              type: 'link',
              attrs: { href: url }
            }
          ]
        }
      ]
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

    if (node.nodeType === 1) {
      const tagName = node.tagName.toLowerCase()

      if (tagName === 'ul' || tagName === 'ol') {
        $node.children('li').each((_, liNode) => {
          const $li = $(liNode)
          const text = $li.text().replace(/\n/g, ' ').trim()
          if (text) {
            const formatting = []
            parseInlineFormats($li, $, formatting)
            const block = {
              type: 'text',
              text: text,
              subtype: tagName === 'ul' ? 'unordered-list-item' : 'ordered-list-item'
            }
            if (formatting.length > 0) {
              block.formatting = formatting
            }
            blocks.push(block)
          }
        })
        return
      }

      if (tagName !== 'img' && $node.find('img').length > 0) {
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

        const clone = $node.clone()
        clone.find('img').remove()
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

      if (['p', 'div', 'blockquote', 'pre', 'li', 'span'].includes(tagName)) {
        const text = $node.text().replace(/\n/g, ' ').trim()
        if (text) {
          const formatting = []
          parseInlineFormats($node, $, formatting)
          const block = {
            type: 'text',
            text: text
          }
          if (tagName === 'li') {
            if ($node.closest('ol').length > 0) {
              block.subtype = 'ordered-list-item'
            } else {
              block.subtype = 'unordered-list-item'
            }
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
      } else if (tagName === 'a') {
        const href = $node.attr('href') || ''
        blocks.push({
          type: 'link',
          url: href,
          title: $node.text().trim() || href
        })
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
        parseInlineFormats($child, $, formatting, currentOffset)
      }
    }
  })
}

/**
 * NPF 텍스트 블록의 formatting을 주입하여 HTML 안전하게 생성
 */
function applyFormattingToHtml(text, formatting) {
  if (!text) return ''
  if (!formatting || formatting.length === 0) return escapeHtml(text)

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
  for (let i = 0; i <= text.length; i++) {
    htmlText += tagsClose[i]
    htmlText += tagsOpen[i]
    if (i < text.length) {
      htmlText += escapeHtml(text[i])
    }
  }
  return htmlText
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

    for (let i = 0; i < npfBlocks.length; i++) {
      if (!usedBlockIndices.has(i)) {
        htmlParts.push(convertSingleBlockToHtml(npfBlocks[i]))
      }
    }
  } else {
    for (const block of npfBlocks) {
      htmlParts.push(convertSingleBlockToHtml(block))
    }
  }

  // 2차 후처리 래핑 필터: 임시 li-temp 노드들을 연속적으로 ul / ol 태그로 감싸 병합
  const finalHtmlParts = []
  let currentListType = null
  let listItems = []

  const flushList = () => {
    if (currentListType && listItems.length > 0) {
      finalHtmlParts.push(`<${currentListType}>\n${listItems.join('\n')}\n</${currentListType}>`)
      listItems = []
      currentListType = null
    }
  }

  for (const part of htmlParts) {
    if (part) {
      const match = part.match(/^<li-temp type="(ul|ol)">(.*)<\/li-temp>$/)
      if (match) {
        const listType = match[1]
        const innerText = match[2]

        if (currentListType && currentListType !== listType) {
          flushList()
        }
        currentListType = listType
        listItems.push(`<li>${innerText}</li>`)
      } else {
        flushList()
        finalHtmlParts.push(part)
      }
    }
  }
  flushList()

  return finalHtmlParts.join('\n')
}

/**
 * 단일 NPF blocks를 HTML 문자열로 변환하는 헬퍼 함수
 */
function convertSingleBlockToHtml(block) {
  if (block.type === 'text') {
    const formattedText = applyFormattingToHtml(block.text || '', block.formatting || [])
    
    if (block.subtype === 'unordered-list-item') {
      return `<li-temp type="ul">${formattedText}</li-temp>`
    } else if (block.subtype === 'ordered-list-item') {
      return `<li-temp type="ol">${formattedText}</li-temp>`
    }

    if (block.subtype && block.subtype.startsWith('heading')) {
      const match = block.subtype.match(/\d+/)
      const level = match ? match[0] : '1'
      return `<h${level}>${formattedText}</h${level}>`
    }
    return `<p>${formattedText}</p>`
  } else if (block.type === 'image') {
    const mediaUrl = block.media && block.media[0] ? block.media[0].url : ''
    return `<img src="${mediaUrl}" alt="${block.alt_text || ''}" />`
  } else if (block.type === 'link') {
    const url = block.url || ''
    const title = block.title || url
    return `<p><a href="${escapeHtml(url)}">${escapeHtml(title)}</a></p>`
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
