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

  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'image-group', ...HTMLAttributes }, 0]
  },
})

export default ImageGroup
