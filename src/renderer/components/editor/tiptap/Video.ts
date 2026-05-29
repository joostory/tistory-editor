import { Node } from '@tiptap/core'

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true, // 하나의 단독 원자 블록 취급 (Backspace 시 통째로 한 번에 삭제)
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      poster: { default: '' },
      provider: { default: '' },
      width: { default: undefined },
      height: { default: undefined }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.video-container',
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === 'string') return {}
          const videoEl = element.querySelector('video')
          if (!videoEl) return {}
          return {
            src: videoEl.getAttribute('src') || '',
            poster: videoEl.getAttribute('poster') || '',
            provider: element.getAttribute('data-provider') || '',
            width: videoEl.getAttribute('width') ? parseInt(videoEl.getAttribute('width')!, 10) : undefined,
            height: videoEl.getAttribute('height') ? parseInt(videoEl.getAttribute('height')!, 10) : undefined
          }
        }
      },
      {
        tag: 'video',
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === 'string') return {}
          return {
            src: element.getAttribute('src') || '',
            poster: element.getAttribute('poster') || '',
            provider: '',
            width: element.getAttribute('width') ? parseInt(element.getAttribute('width')!, 10) : undefined,
            height: element.getAttribute('height') ? parseInt(element.getAttribute('height')!, 10) : undefined
          }
        }
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, poster, provider, width, height } = HTMLAttributes
    const posterAttr = poster ? { poster } : {}
    const widthAttr = width ? { width } : {}
    const heightAttr = height ? { height } : {}

    return [
      'div',
      {
        class: 'video-container',
        'data-provider': provider || '',
        style: 'margin: 16px 0; max-width: 100%; display: flex; justify-content: center;'
      },
      [
        'video',
        {
          src,
          controls: 'true',
          style: 'max-width: 100%; height: auto; border-radius: 8px;',
          ...posterAttr,
          ...widthAttr,
          ...heightAttr
        }
      ]
    ]
  }
})

export default Video
