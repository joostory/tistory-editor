import { Node } from '@tiptap/core'

export const LinkCard = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true, // 하나의 단독 원자 블록 취급 (Backspace 시 통째로 한 번에 삭제)
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      siteName: { default: '' },
      image: { default: '' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.link-card',
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === 'string') return {}
          return {
            url: element.getAttribute('data-url') || '',
            title: element.getAttribute('data-title') || '',
            description: element.getAttribute('data-description') || '',
            siteName: element.getAttribute('data-site-name') || '',
            image: element.getAttribute('data-image') || ''
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { url, title, description, siteName, image } = HTMLAttributes
    const hasImage = !!image
    const imageStyle = hasImage ? `background-image: url('${image}')` : 'display: none'

    return [
      'div',
      {
        class: 'link-card',
        'data-url': url,
        'data-title': title,
        'data-description': description,
        'data-site-name': siteName,
        'data-image': image,
        style: 'border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; display: flex; margin: 16px 0; font-family: sans-serif; text-decoration: none; color: inherit; cursor: pointer;'
      },
      [
        'a',
        {
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: 'display: flex; width: 100%; text-decoration: none; color: inherit;'
        },
        [
          'div',
          {
            class: 'link-card-content',
            style: 'flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center;'
          },
          ['div', { class: 'link-card-title', style: 'font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1a202c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' }, title || url],
          ['div', { class: 'link-card-description', style: 'font-size: 14px; color: #4a5568; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;' }, description || ''],
          ['div', { class: 'link-card-site', style: 'font-size: 12px; color: #718096;' }, siteName || '']
        ],
        [
          'div',
          {
            class: 'link-card-image',
            style: `width: 150px; background-size: cover; background-position: center; ${imageStyle}`
          }
        ]
      ]
    ]
  }
})

export default LinkCard
