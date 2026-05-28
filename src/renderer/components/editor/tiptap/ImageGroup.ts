import { Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGroup: {
      groupImages: () => ReturnType
      groupImagesNearCursor: (targetPos: number | null | undefined) => ReturnType
      ungroupImages: () => ReturnType
    }
  }
}

export const ImageGroup = Node.create({
  name: 'imageGroup',
  group: 'block',
  content: 'image*',
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageGroupNormalizer'),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged)
          if (!docChanged) return null

          let tr = newState.tr
          let modified = false

          interface Task {
            node: any;
            pos: number;
          }
          const tasks: Task[] = []
          newState.doc.descendants((node, pos) => {
            if (node.type.name === 'imageGroup') {
              if (node.childCount <= 1) {
                tasks.push({ node, pos })
              }
              return false // imageGroup 자식은 더 이상 탐색하지 않음
            }
            return true
          })

          // 역순으로 지우거나 치환하여 포지션 꼬임 방지
          for (let i = tasks.length - 1; i >= 0; i--) {
            const { node, pos } = tasks[i]
            if (node.childCount === 0) {
              tr.delete(pos, pos + node.nodeSize)
              modified = true
            } else if (node.childCount === 1) {
              const childImage = node.firstChild
              if (childImage) {
                tr.replaceWith(pos, pos + node.nodeSize, childImage)
                modified = true
              }
            }
          }

          return modified ? tr : null
        }
      })
    ]
  },

  addCommands() {
    return {
      groupImages: () => ({ state, chain }) => {
        const { from, to } = state.selection

        if (from !== to) {
          // 1. 드래그 선택 범위가 존재하는 경우: 해당 범위 내의 개별 이미지들만 정밀 병합
          const images: any[] = []
          let groupStart = -1
          let groupEnd = -1

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'image') {
              images.push(node.toJSON())
              if (groupStart === -1) groupStart = pos
              groupEnd = pos + node.nodeSize
            }
          })

          if (images.length > 1 && groupStart !== -1 && groupEnd !== -1) {
            return chain()
              .focus()
              .deleteRange({ from: groupStart, to: groupEnd })
              .insertContentAt(groupStart, {
                type: 'imageGroup',
                content: images
              })
              .run()
          }
        } else {
          // 2. 선택 범위가 없는 단순 커서 상태: 에디터 전체 선형 스캔 일괄 병합 (툴바 전용)
          let currentGroup: any[] = []
          const groupsToMerge: any[] = []

          state.doc.forEach((node, pos) => {
            if (node.type.name === 'image') {
              currentGroup.push({ node: node.toJSON(), pos, size: node.nodeSize })
            } else {
              if (currentGroup.length > 1) {
                groupsToMerge.push({
                  start: currentGroup[0].pos,
                  end: currentGroup[currentGroup.length - 1].pos + currentGroup[currentGroup.length - 1].size,
                  images: currentGroup.map(item => item.node)
                })
              }
              currentGroup = []
            }
          })

          if (currentGroup.length > 1) {
            groupsToMerge.push({
              start: currentGroup[0].pos,
              end: currentGroup[currentGroup.length - 1].pos + currentGroup[currentGroup.length - 1].size,
              images: currentGroup.map(item => item.node)
            })
          }

          if (groupsToMerge.length > 0) {
            let runChain = chain().focus()
            for (let k = groupsToMerge.length - 1; k >= 0; k--) {
              const group = groupsToMerge[k]
              runChain = runChain
                .deleteRange({ from: group.start, to: group.end })
                .insertContentAt(group.start, {
                  type: 'imageGroup',
                  content: group.images
                })
            }
            return runChain.run()
          }
        }
        return false
      },

      groupImagesNearCursor: (targetPos) => ({ state, chain }) => {
        if (targetPos === null || targetPos === undefined) return false

        // targetPos 주변 3포인트 스캔
        const start = Math.max(0, targetPos - 3)
        const end = Math.min(state.doc.content.size, targetPos + 3)

        const localImages: any[] = []
        let localStart = -1
        let localEnd = -1

        state.doc.nodesBetween(start, end, (node, pos) => {
          if (node.type.name === 'image') {
            localImages.push(node.toJSON())
            if (localStart === -1) localStart = pos
            localEnd = pos + node.nodeSize
          } else if (node.type.name === 'imageGroup') {
            // 기존 imageGroup을 만난 경우 통째로 자식들을 확보하고,
            // 블록 전체를 삭제하도록 위치 범위를 올바르게 확보해 ProseMirror 에러를 방지
            node.forEach((childNode) => {
              if (childNode.type.name === 'image') {
                localImages.push(childNode.toJSON())
              }
            })
            if (localStart === -1) localStart = pos
            localEnd = pos + node.nodeSize
            return false // imageGroup 내부의 자식을 개별로 중복 순회하지 않도록 함
          }
          return true
        })

        if (localImages.length > 1 && localStart !== -1 && localEnd !== -1) {
          return chain()
            .focus()
            .deleteRange({ from: localStart, to: localEnd })
            .insertContentAt(localStart, {
              type: 'imageGroup',
              content: localImages
            })
            .run()
        }
        return false
      },

      ungroupImages: () => ({ state, chain }) => {
        const { from, to } = state.selection
        let groupNode: any = null
        let groupPos = -1

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === 'imageGroup') {
            groupNode = node
            groupPos = pos
            return false
          }
        })

        if (groupNode) {
          const images: any[] = []
          groupNode.forEach((childNode: any) => {
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
