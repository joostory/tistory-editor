import * as cheerio from 'cheerio'
import { marked } from 'marked'
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

function parseTextNode(node: any, subtype: string | null): any {
  let text = ''
  const formatting: any[] = []
  
  if (node.content) {
    for (const child of node.content) {
      if (child.type === 'text') {
        const start = text.length
        text += child.text
        const end = text.length
        
        if (child.marks) {
          for (const mark of child.marks) {
            const format: any = {
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
  
  const block: any = {
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

export function tiptapToNpf(tiptapJson: any): any[] {
  if (!tiptapJson) return []
  const blocks: any = []
  const displayRows: any[] = []
  
  const content = tiptapJson.content || []
  for (const node of content) {
    if (node.type === 'paragraph' || node.type === 'heading') {
      let subtype: string | null = null
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
    } else if (node.type === 'linkCard') {
      if (node.attrs && node.attrs.url) {
        const nextIdx = blocks.length
        const posterMedia = node.attrs.image ? [{ url: node.attrs.image }] : []
        blocks.push({
          type: 'link',
          url: node.attrs.url,
          title: node.attrs.title || '',
          description: node.attrs.description || '',
          site_name: node.attrs.siteName || '',
          poster: posterMedia
        })
        displayRows.push({ blocks: [nextIdx] })
      }
    } else if (node.type === 'imageGroup') {
      const groupBlockIndices: number[] = []
      
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
    } else if (node.type === 'video') {
      if (node.attrs && node.attrs.src) {
        const provider = node.attrs.provider || 'tumblr'
        
        // Tumblr 직접 업로드 비디오만 NPF 비디오 블록으로 빌드하여 전송
        if (provider === 'tumblr') {
          const nextIdx = blocks.length
          const posterMedia = node.attrs.poster ? [{ type: 'image/jpeg', url: node.attrs.poster }] : []
          blocks.push({
            type: 'video',
            provider: 'tumblr',
            url: node.attrs.src,
            media: {
              url: node.attrs.src,
              type: 'video/mp4',
              width: node.attrs.width || 1920,
              height: node.attrs.height || 1080
            },
            poster: posterMedia
          })
          displayRows.push({ blocks: [nextIdx] })
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

function parseChildNodes(text: string, formatting: any[]): any[] {
  const childNodes: any[] = []
  if (!text || text.length === 0) return childNodes

  const charMarks: any[][] = Array.from({ length: text.length }, () => [])
  
  for (const format of formatting) {
    const start = Math.max(0, format.start)
    const end = Math.min(text.length, format.end)
    for (let i = start; i < end; i++) {
      const mark: any = { type: format.type }
      if (format.type === 'link' && format.url) {
        mark.attrs = { href: format.url }
      }
      charMarks[i].push(mark)
    }
  }
  
  let currentText = ''
  let currentMarks: any[] | null = null
  
  const areMarksEqual = (m1: any[], m2: any[]) => {
    if (m1.length !== m2.length) return false
    const serialize = (m: any[]) => JSON.stringify(m.map(x => ({ type: x.type, href: x.attrs?.href })).sort((a, b) => a.type.localeCompare(b.type)))
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
      const childNode: any = { type: 'text', text: currentText }
      if (currentMarks.length > 0) {
        childNode.marks = currentMarks
      }
      childNodes.push(childNode)
      
      currentText = text[i]
      currentMarks = marksAtChar
    }
  }
  
  if (currentText.length > 0) {
    const childNode: any = { type: 'text', text: currentText }
    if (currentMarks && currentMarks.length > 0) {
      childNode.marks = currentMarks
    }
    childNodes.push(childNode)
  }

  return childNodes
}

export function npfToTiptap(npfBlocks: any[], layout: any[] | null | undefined): any {
  const content: any[] = []
  
  if (!npfBlocks || !Array.isArray(npfBlocks)) {
    return { type: 'doc', content }
  }

  const rowsLayout = layout && Array.isArray(layout) ? layout.find(l => l.type === 'rows') : null

  if (rowsLayout && Array.isArray(rowsLayout.display)) {
    const usedBlockIndices = new Set<number>()

    for (const row of rowsLayout.display) {
      if (!row || !Array.isArray(row.blocks) || row.blocks.length === 0) continue

      const isAllImages = row.blocks.every(idx => {
        const block = npfBlocks[idx]
        return block && block.type === 'image'
      })

      if (isAllImages && row.blocks.length > 1) {
        const groupImages: any[] = []
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
  const finalContent: any[] = []
  let currentList: any | null = null

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

function convertSingleBlockToTiptapNode(block: any): any {
  if (block.type === 'text') {
    const childNodes = parseChildNodes(block.text || '', block.formatting || [])
    
    if (block.subtype === 'unordered-list-item' || block.subtype === 'ordered-list-item') {
      const pNode: any = { type: 'paragraph' }
      if (childNodes.length > 0) {
        pNode.content = childNodes
      }
      return {
        type: block.subtype === 'unordered-list-item' ? 'tempUnorderedListItem' : 'tempOrderedListItem',
        content: [pNode]
      }
    }

    const node: any = {
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
    const poster = block.poster && block.poster[0] ? block.poster[0].url : ''
    return {
      type: 'linkCard',
      attrs: {
        url: block.url || '',
        title: block.title || '',
        description: block.description || '',
        siteName: block.site_name || '',
        image: poster
      }
    }
  } else if (block.type === 'video') {
    const videoUrl = block.media && block.media.url ? block.media.url : (block.url || '')
    const poster = block.poster && block.poster[0] ? block.poster[0].url : ''
    return {
      type: 'video',
      attrs: {
        src: videoUrl,
        poster: poster,
        provider: block.provider || '',
        width: block.media && block.media.width ? block.media.width : undefined,
        height: block.media && block.media.height ? block.media.height : undefined,
        embedHtml: block.embed_html || ''
      }
    }
  }
  return null
}

// ==========================================
// 2. HTML <-> Tumblr NPF Blocks 변환 (마크다운 파싱을 위한 중간체)
// ==========================================

export function htmlToNpf(html: string): any[] {
  if (!html) return []
  const $ = cheerio.load(html)
  const blocks: any[] = []

  $('body').contents().each((_, node) => {
    const $node = $(node)
    
    if (node.nodeType === 3) {
      const text = (node.nodeValue || '').replace(/\n/g, '').trim()
      if (text) {
        blocks.push({
          type: 'text',
          text: text
        })
      }
      return
    }

    if (node.nodeType === 1) {
      const tagName = ((node as any).tagName || '').toLowerCase()

      if (tagName === 'ul' || tagName === 'ol') {
        $node.children('li').each((_, liNode) => {
          const $li = $(liNode)
          const text = $li.text().replace(/\n/g, ' ').trim()
          if (text) {
            const formatting: any[] = []
            parseInlineFormats($li, $, formatting)
            const block: any = {
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

      if (tagName === 'div' && $node.hasClass('link-card')) {
        const url = $node.attr('data-url') || ''
        const title = $node.attr('data-title') || ''
        const description = $node.attr('data-description') || ''
        const siteName = $node.attr('data-site-name') || ''
        const image = $node.attr('data-image') || ''
        const posterMedia = image ? [{ url: image }] : []
        blocks.push({
          type: 'link',
          url,
          title,
          description,
          site_name: siteName,
          poster: posterMedia
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
          const formatting: any[] = []
          parseInlineFormats(clone, $, formatting)
          const block: any = {
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
          const formatting: any[] = []
          parseInlineFormats($node, $, formatting)
          const block: any = {
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

function parseInlineFormats($el: any, $: any, formatting: any[], currentOffset = { val: 0 }) {
  $el.contents().each((_: any, child: any) => {
    const $child = $(child)
    const childText = $child.text()
    
    if (child.nodeType === 3) {
      currentOffset.val += childText.length
    } else if (child.nodeType === 1) {
      const tagName = (child.tagName || '').toLowerCase()
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

function applyFormattingToHtml(text: string, formatting: any[]): string {
  if (!text) return ''
  if (!formatting || formatting.length === 0) return escapeHtml(text)

  const tagsOpen: string[] = Array.from({ length: text.length + 1 }, () => '')
  const tagsClose: string[] = Array.from({ length: text.length + 1 }, () => '')
  
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

export function npfToHtml(npfBlocks: any[], layout?: any[] | null | undefined): string {
  if (!npfBlocks || !Array.isArray(npfBlocks)) return ''

  const htmlParts: string[] = []
  const rowsLayout = layout && Array.isArray(layout) ? layout.find(l => l.type === 'rows') : null

  if (rowsLayout && Array.isArray(rowsLayout.display)) {
    const usedBlockIndices = new Set<number>()

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
  const finalHtmlParts: string[] = []
  let currentListType: string | null = null
  let listItems: string[] = []

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

function convertSingleBlockToHtml(block: any): string {
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
    const description = block.description || ''
    const siteName = block.site_name || ''
    const poster = block.poster && block.poster[0] ? block.poster[0].url : ''
    
    const hasImage = !!poster
    const imageStyle = hasImage ? `background-image: url('${escapeHtml(poster)}')` : 'display: none'
    
    return `<div class="link-card" data-url="${escapeHtml(url)}" data-title="${escapeHtml(title)}" data-description="${escapeHtml(description)}" data-site-name="${escapeHtml(siteName)}" data-image="${escapeHtml(poster)}" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; display: flex; margin: 16px 0; font-family: sans-serif; text-decoration: none; color: inherit; cursor: pointer;"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="display: flex; width: 100%; text-decoration: none; color: inherit;"><div class="link-card-image" style="width: 150px; background-size: cover; background-position: center; ${imageStyle}"></div><div class="link-card-content" style="flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center;"><div class="link-card-title" style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1a202c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(title)}</div><div class="link-card-description" style="font-size: 14px; color: #4a5568; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(description)}</div><div class="link-card-site" style="font-size: 12px; color: #718096;">${escapeHtml(siteName)}</div></div></a></div>`
  } else if (block.type === 'video') {
    const isYoutube = block.provider === 'youtube'
    const embedHtml = block.embed_html || ''
    
    if (embedHtml) {
      return `<div class="video-container" data-provider="${escapeHtml(block.provider || '')}" style="margin: 16px 0; max-width: 100%; display: flex; justify-content: center;">${embedHtml}</div>`
    }
    
    const videoUrl = block.media && block.media.url ? block.media.url : (block.url || '')
    
    if (isYoutube) {
      let iframeSrc = videoUrl
      if (videoUrl && !videoUrl.includes('youtube.com/embed') && videoUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(videoUrl)
        const v = urlObj.searchParams.get('v')
        if (v) {
          iframeSrc = `https://www.youtube.com/embed/${v}`
        }
      } else if (videoUrl && videoUrl.includes('youtu.be/')) {
        const id = videoUrl.split('youtu.be/')[1]?.split('?')[0]
        if (id) {
          iframeSrc = `https://www.youtube.com/embed/${id}`
        }
      }
      
      const width = block.media && block.media.width ? block.media.width : 560
      const height = block.media && block.media.height ? block.media.height : 315
      
      return `<div class="video-container" data-provider="youtube" style="margin: 16px 0; max-width: 100%; display: flex; justify-content: center;"><iframe src="${escapeHtml(iframeSrc)}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: 8px;"></iframe></div>`
    }
    
    const poster = block.poster && block.poster[0] ? block.poster[0].url : ''
    const posterAttr = poster ? ` poster="${escapeHtml(poster)}"` : ''
    const widthAttr = block.media && block.media.width ? ` width="${block.media.width}"` : ''
    const heightAttr = block.media && block.media.height ? ` height="${block.media.height}"` : ''
    
    return `<div class="video-container" style="margin: 16px 0; max-width: 100%; display: flex; justify-content: center;"><video src="${escapeHtml(videoUrl)}"${posterAttr}${widthAttr}${heightAttr} controls style="max-width: 100%; height: auto; border-radius: 8px;"></video></div>`
  }
  return ''
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
