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
      height: { default: undefined },
      embedHtml: { default: '' }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.video-container',
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === 'string') return {}
          const iframeEl = element.querySelector('iframe')
          if (iframeEl) {
            return {
              src: iframeEl.getAttribute('src') || '',
              provider: element.getAttribute('data-provider') || '',
              width: iframeEl.getAttribute('width') ? parseInt(iframeEl.getAttribute('width')!, 10) : undefined,
              height: iframeEl.getAttribute('height') ? parseInt(iframeEl.getAttribute('height')!, 10) : undefined,
              embedHtml: element.innerHTML
            }
          }
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
        tag: 'iframe',
        getAttrs: (element: string | HTMLElement) => {
          if (typeof element === 'string') return {}
          return {
            src: element.getAttribute('src') || '',
            provider: 'youtube',
            width: element.getAttribute('width') ? parseInt(element.getAttribute('width')!, 10) : undefined,
            height: element.getAttribute('height') ? parseInt(element.getAttribute('height')!, 10) : undefined,
            embedHtml: element.outerHTML
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
    const { src, poster, provider, width, height, embedHtml } = HTMLAttributes

    if (embedHtml || provider === 'youtube') {
      const containerStyle = 'margin: 16px 0; max-width: 100%; display: flex; justify-content: center;'
      
      let iframeSrc = src
      if (src && !src.includes('youtube.com/embed') && src.includes('youtube.com/watch')) {
        const urlObj = new URL(src)
        const v = urlObj.searchParams.get('v')
        if (v) {
          iframeSrc = `https://www.youtube.com/embed/${v}`
        }
      } else if (src && src.includes('youtu.be/')) {
        const id = src.split('youtu.be/')[1]?.split('?')[0]
        if (id) {
          iframeSrc = `https://www.youtube.com/embed/${id}`
        }
      }

      return [
        'div',
        {
          class: 'video-container',
          'data-provider': provider || '',
          style: containerStyle
        },
        [
          'iframe',
          {
            src: iframeSrc,
            width: width || 560,
            height: height || 315,
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            allowfullscreen: 'true',
            style: 'border-radius: 8px;'
          }
        ]
      ]
    }

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
