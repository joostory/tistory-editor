import { Node } from '@tiptap/core'

export const ImageGroup = Node.create({
  name: 'imageGroup',
  group: 'block',
  content: 'image+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.image-group',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const childCount = node ? node.childCount : 1
    return ['div', { class: 'image-group', 'data-count': childCount, ...HTMLAttributes }, 0]
  },
})

export default ImageGroup
