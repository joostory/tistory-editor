jest.mock('marked', () => ({
  marked: {
    parse: (x) => x
  }
}))

const NpfConverter = require('./NpfConverter')

describe('NpfConverter - NPF Layout & Tiptap imageGroup 명시적 연동 테스트', () => {
  const sampleNpfContent = [
    { type: 'text', text: '이미지 레이아웃 테스트', subtype: 'heading1' },
    {
      type: 'image',
      media: [{ url: 'https://test.com/img1.jpg' }]
    },
    {
      type: 'image',
      media: [{ url: 'https://test.com/img2.jpg' }]
    },
    {
      type: 'image',
      media: [{ url: 'https://test.com/img3.jpg' }]
    },
    {
      type: 'image',
      media: [{ url: 'https://test.com/img4.jpg' }]
    },
    { type: 'text', text: '테스트 끝!' }
  ]

  const sampleLayout = [
    {
      type: 'rows',
      display: [
        { blocks: [0] },
        { blocks: [1, 2] }, // 2x2 배치를 위해 1, 2번 블록 묶기
        { blocks: [3, 4] }, // 3, 4번 블록 묶기
        { blocks: [5] }
      ]
    }
  ]

  describe('npfToHtml()', () => {
    it('명시적 layout 정보가 주어지면, 지정된 이미지 블록들을 .image-group 컨테이너로 묶어 변환해야 합니다.', () => {
      const html = NpfConverter.npfToHtml(sampleNpfContent, sampleLayout)

      expect(html).toContain('<h1>이미지 레이아웃 테스트</h1>')
      
      // 첫 번째 이미지 그룹 (1, 2)
      expect(html).toContain('<div class="image-group" data-count="2"><img src="https://test.com/img1.jpg" alt="" /><img src="https://test.com/img2.jpg" alt="" /></div>')
      
      // 두 번째 이미지 그룹 (3, 4)
      expect(html).toContain('<div class="image-group" data-count="2"><img src="https://test.com/img3.jpg" alt="" /><img src="https://test.com/img4.jpg" alt="" /></div>')

      expect(html).toContain('<p>테스트 끝!</p>')
    })

    it('layout 정보가 주어지지 않으면, 연속된 이미지라도 묶지 않고 1줄에 1개씩 단독 이미지 태그로 변환해야 합니다.', () => {
      const html = NpfConverter.npfToHtml(sampleNpfContent, null)

      expect(html).toContain('<h1>이미지 레이아웃 테스트</h1>')
      expect(html).not.toContain('image-group')
      expect(html).toContain('<img src="https://test.com/img1.jpg" alt="" />')
      expect(html).toContain('<img src="https://test.com/img2.jpg" alt="" />')
      expect(html).toContain('<img src="https://test.com/img3.jpg" alt="" />')
      expect(html).toContain('<img src="https://test.com/img4.jpg" alt="" />')
      expect(html).toContain('<p>테스트 끝!</p>')
    })
  })

  describe('npfToTiptap()', () => {
    it('명시적 layout 정보가 주어지면, 묶인 이미지들을 Tiptap imageGroup 노드로 변환해야 합니다.', () => {
      const tiptap = NpfConverter.npfToTiptap(sampleNpfContent, sampleLayout)

      expect(tiptap.type).toBe('doc')
      expect(tiptap.content.length).toBe(4) // heading1, imageGroup, imageGroup, paragraph

      // 첫 번째 노드: Heading
      expect(tiptap.content[0].type).toBe('heading')
      
      // 두 번째 노드: imageGroup (img1, img2)
      expect(tiptap.content[1].type).toBe('imageGroup')
      expect(tiptap.content[1].content.length).toBe(2)
      expect(tiptap.content[1].content[0].attrs.src).toBe('https://test.com/img1.jpg')
      expect(tiptap.content[1].content[1].attrs.src).toBe('https://test.com/img2.jpg')

      // 세 번째 노드: imageGroup (img3, img4)
      expect(tiptap.content[2].type).toBe('imageGroup')
      expect(tiptap.content[2].content.length).toBe(2)
      expect(tiptap.content[2].content[0].attrs.src).toBe('https://test.com/img3.jpg')
      expect(tiptap.content[2].content[1].attrs.src).toBe('https://test.com/img4.jpg')

      // 네 번째 노드: Paragraph
      expect(tiptap.content[3].type).toBe('paragraph')
    })

    it('layout 정보가 주어지지 않으면, 이미지 그룹을 만들지 않고 개별 image 단독 노드로 변환해야 합니다.', () => {
      const tiptap = NpfConverter.npfToTiptap(sampleNpfContent, null)

      expect(tiptap.type).toBe('doc')
      expect(tiptap.content.length).toBe(6) // heading, 4 images, paragraph
      
      const imageNodes = tiptap.content.filter(n => n.type === 'image')
      expect(imageNodes.length).toBe(4)
      
      const groupNodes = tiptap.content.filter(n => n.type === 'imageGroup')
      expect(groupNodes.length).toBe(0)
    })
  })

  describe('tiptapToNpf()', () => {
    it('Tiptap JSON 내의 imageGroup 노드를 NPF 이미지 블록들로 펼치고, 명시적인 layout 정보를 동시에 생성해 숨겨서 반환해야 합니다.', () => {
      const tiptapJson = {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: '작성 테스트' }] },
          {
            type: 'imageGroup',
            content: [
              { type: 'image', attrs: { src: 'https://test.com/img1.jpg', alt: '설명1' } },
              { type: 'image', attrs: { src: 'https://test.com/img2.jpg', alt: '설명2' } }
            ]
          },
          { type: 'paragraph', content: [{ type: 'text', text: '작성 완료' }] }
        ]
      }

      const npfBlocks = NpfConverter.tiptapToNpf(tiptapJson)

      // NPF Blocks 검증
      expect(npfBlocks.length).toBe(4) // heading, img1, img2, paragraph
      expect(npfBlocks[0].text).toBe('작성 테스트')
      expect(npfBlocks[1].type).toBe('image')
      expect(npfBlocks[1].media[0].url).toBe('https://test.com/img1.jpg')
      expect(npfBlocks[2].type).toBe('image')
      expect(npfBlocks[2].media[0].url).toBe('https://test.com/img2.jpg')
      expect(npfBlocks[3].text).toBe('작성 완료')

      // layout 프로퍼티 검증
      expect(npfBlocks.layout).toBeDefined()
      const layoutObj = npfBlocks.layout[0]
      expect(layoutObj.type).toBe('rows')
      
      // display 구조 검증
      expect(layoutObj.display.length).toBe(3)
      expect(layoutObj.display[0].blocks).toEqual([0])
      expect(layoutObj.display[1].blocks).toEqual([1, 2]) // 묶여서 저장되어야 함
      expect(layoutObj.display[2].blocks).toEqual([3])
    })
  })
})
