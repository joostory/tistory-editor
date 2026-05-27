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

  addCommands() {
    return {
      groupImages: () => ({ state, chain }) => {
        const { from, to } = state.selection
        const images = []
        state.doc.nodesBetween(from, to, (node) => {
          if (node.type.name === 'image') {
            images.push(node.toJSON())
          }
        })
        
        if (images.length > 1) {
          return chain()
            .focus()
            .deleteRange({ from, to })
            .insertContent({
              type: 'imageGroup',
              content: images
            })
            .run()
        }
        return false
      },
      
      ungroupImages: () => ({ state, chain }) => {
        const { from, to } = state.selection
        let groupNode = null
        let groupPos = -1
        
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'imageGroup') {
            groupNode = node
            groupPos = pos
            return false
          }
        })
        
        if (groupNode) {
          const images = []
          groupNode.forEach((childNode) => {
            if (childNode.type.name === 'image') {
              images.push(childNode.toJSON())
            }
          })
          
          if (images.length > 0) {
            return chain()
              .focus()
              .deleteRange({ from: groupPos, to: groupPos + groupNode.nodeSize })
              .insertContent(images)
              .run()
          }
        }
        return false
      }
    }
  },
})

export default ImageGroup
