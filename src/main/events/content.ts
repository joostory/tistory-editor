import { ipcMain } from 'electron'
import dayjs from 'dayjs'
import * as AuthenticationManager from '#/main/lib/AuthenticationManager'
import * as ProviderApiManager from '#/main/lib/ProviderApiManager'
import * as NpfConverter from '#/main/lib/NpfConverter'

// 'opengraph-fetcher'는 CJS 혹은 ESM 지원 여부가 불투명할 수 있으므로 safe require 사용
const fetcher = require('opengraph-fetcher')

export default function initContentEvents(): void {
  ipcMain.handle("convert-content", async (_evt, { content, from, to }: { content: any; from: string; to: string }) => {
    console.log('Main.handle: convert-content', { from, to })
    if (from === 'json' && to === 'markdown') {
      const npf = NpfConverter.tiptapToNpf(content)
      return NpfConverter.npfToMarkdown(npf)
    } else if (from === 'markdown' && to === 'json') {
      const npf = NpfConverter.markdownToNpf(content)
      return NpfConverter.npfToTiptap(npf, null)
    }
    return content
  })

  ipcMain.handle("fetch-opengraph", async (_evt, url: string) => {
    console.log('Main.handle: fetch-opengraph', url)
    try {
      const data = await fetcher.fetch(url)
      return {
        success: true,
        data: {
          url: data.url || url,
          title: data.title || '',
          description: data.description || '',
          siteName: data.host || '',
          image: data.image || ''
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch opengraph', e)
      return {
        success: false,
        error: e.message
      }
    }
  })

  ipcMain.on("fetch-categories", (evt, authUUID: string, blogName: string) => {
    console.log('Main.receive: fetch-categories', authUUID, blogName)
    const auth = AuthenticationManager.findByUUID(authUUID)
    if (!auth) return
    const api = ProviderApiManager.getApi(auth.provider)
    if (auth.provider !== 'tistory' || !api.validateAuthInfo(auth.authInfo)) {
      return
    }

    api.fetchCategories(auth.authInfo, blogName)
      .then((categories: any) => {
        evt.sender.send('receive-categories', categories)
      })
  })

  ipcMain.on("fetch-posts", (evt, authUUID: string, blogName: string, options: any) => {
    console.log('Main.receive: fetch-posts', authUUID, blogName, options)
    const auth = AuthenticationManager.findByUUID(authUUID)
    if (!auth) {
      evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
      evt.sender.send('receive-posts-failed')
      return
    }
    const api = ProviderApiManager.getApi(auth.provider)
    if (!api.validateAuthInfo(auth.authInfo)) {
      evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
      evt.sender.send('receive-posts-failed')
      return
    }
    
    api.fetchPosts(auth.authInfo, blogName, options)
      .then((posts: any) => {
        evt.sender.send('receive-posts', posts)
      })
      .catch((err: any) => {
        console.error(err)
        evt.sender.send('receive-message', '글 목록을 불러오지 못했습니다.')
        evt.sender.send('receive-posts-failed')
      })
  })
  
  ipcMain.on("fetch-content", (evt, authUUID: string, blogName: string, postId: string) => {
    console.log('Main.receive: fetch-content', authUUID, blogName, postId)
    const auth = AuthenticationManager.findByUUID(authUUID)
    if (!auth || auth.provider !== 'tistory') {
      evt.sender.send('receive-message', '글 정보를 불러오지 못했습니다.')
      return
    }

    const api = ProviderApiManager.getApi(auth.provider)
    api.fetchPost(auth.authInfo, blogName, postId).then((res: any) => {
      evt.sender.send('receive-content', res.post)
    }).catch((err: any) => {
      console.error(err)
      evt.sender.send('receive-message', '글 정보를 불러오지 못했습니다.')
    })
  })
  
  ipcMain.on("save-content", (evt, authUUID: string, blogName: string, post: any) => {
    console.log('Main.receive: save-content', authUUID, blogName, post)
    const auth = AuthenticationManager.findByUUID(authUUID)
    if (!auth) {
      evt.sender.send('finish-save-content')
      evt.sender.send('receive-message', dayjs().format('HH:mm:ss : ') + '글을 수정하지 못했습니다.')
      return
    }
    const api = ProviderApiManager.getApi(auth.provider)
    const messagePrefix = dayjs().format('HH:mm:ss : ')

    if (!api.validateAuthInfo(auth.authInfo)) {
      evt.sender.send('finish-save-content')
      evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
      return
    }
    
    api.savePost(auth.authInfo, blogName, post)
      .then((res: any) => {
        evt.sender.send('finish-save-content', res.post)
        evt.sender.send('receive-message', messagePrefix + ' 수정완료')
      })
      .catch((err: any) => {
        console.error(err)
        evt.sender.send('finish-save-content')
        evt.sender.send('receive-message', messagePrefix + '글을 수정하지 못했습니다.')
      })
  })

  ipcMain.on("add-content", (evt, authUUID: string, blogName: string, post: any) => {
    console.log('Main.receive: add-content', authUUID, blogName, post)
    const auth = AuthenticationManager.findByUUID(authUUID)
    if (!auth) {
      evt.sender.send('finish-add-content')
      evt.sender.send('receive-message', dayjs().format('HH:mm:ss : ') + '글을 발행하지 못했습니다.')
      return
    }
    const api = ProviderApiManager.getApi(auth.provider)
    const messagePrefix = dayjs().format('HH:mm:ss : ')
    
    if (!api.validateAuthInfo(auth.authInfo)) {
      evt.sender.send('finish-add-content')
      evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
      return
    }
    
    api.addPost(auth.authInfo, blogName, post)
      .then((res: any) => {
        evt.sender.send('finish-add-content', res.post)
        evt.sender.send('receive-message', messagePrefix + '발행 완료')
      })
      .catch((err: any) => {
        console.error(err)
        evt.sender.send('finish-add-content')
        evt.sender.send('receive-message', messagePrefix + '글을 발행하지 못했습니다.')
      })
  })
}
