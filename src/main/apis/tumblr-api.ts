import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { v4 as uuidv4 } from 'uuid'
import OauthInfoReader from '#/main/oauth/OauthInfoReader'
import ExternalOAuth1 from '#/main/oauth/ExternalOAuth1'
import OAuthRequestManager from '#/main/oauth/OAuthRequestManager'
import * as NpfConverter from '#/main/lib/NpfConverter'

const tumblr = require("tumblr.js")

const PROVIDER_ID = 'tumblr'

function _createTumblrClient(auth: any) {
  const oauthReader = new OauthInfoReader()
  const tumblrInfo = oauthReader.getTumblr()

  return tumblr.createClient({
    consumer_key: tumblrInfo.clientKey,
    consumer_secret: tumblrInfo.clientSecret,
    token: auth.token,
    token_secret: auth.tokenSecret
  })
}

function _tumblrPostToEditorPost(post: any) {
  let tiptapContent = null
  let markdownContent = ''
  let contentHtml = ''

  if (post.content && Array.isArray(post.content)) {
    // Neue Post Format (NPF)
    tiptapContent = NpfConverter.npfToTiptap(post.content, post.layout)
    markdownContent = NpfConverter.npfToMarkdown(post.content)
    contentHtml = NpfConverter.npfToHtml(post.content, post.layout)
  } else {
    // Legacy Post (HTML in body)
    const npfBlocks = NpfConverter.htmlToNpf(post.body || '')
    tiptapContent = NpfConverter.npfToTiptap(npfBlocks, null)
    markdownContent = NpfConverter.npfToMarkdown(npfBlocks)
    contentHtml = post.body || ''
  }

  return {
    id: post.id,
    url: post.post_url,
    title: post.summary || post.title || '',
    content: contentHtml,
    contentJson: tiptapContent,
    contentMarkdown: markdownContent,
    photos: post.photos,
    tags: post.tags,
    date: post.date,
    type: post.type,
    state: post.state
  }
}

function _tumblrPostsToEditorPosts(tumblrPosts: any) {
  const posts = tumblrPosts ? [].concat(tumblrPosts) : []
  return posts.map(_tumblrPostToEditorPost)
}

function base64ToReadStream(base64Data: string) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    return null
  }
  const contentType = matches[1]
  const base64Str = matches[2]
  const extension = contentType.split('/')[1] || 'png'
  
  const buffer = Buffer.from(base64Str, 'base64')
  const tempFilePath = path.join(os.tmpdir(), `tumblr_upload_${uuidv4()}.${extension}`)
  
  fs.writeFileSync(tempFilePath, buffer)
  
  const stream = fs.createReadStream(tempFilePath) as any
  stream.tempFilePath = tempFilePath
  return stream
}

function localFileToReadStream(fileUrl: string) {
  try {
    let filePath = fileUrl
    if (fileUrl.startsWith('file://')) {
      filePath = decodeURIComponent(fileUrl.replace(/^file:\/\//, ''))
      if (process.platform === 'win32' && filePath.startsWith('/')) {
        filePath = filePath.substring(1)
      }
    }
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath)
    }
  } catch (e) {
    console.error("Failed to parse local file url:", fileUrl, e)
  }
  return null
}

function _editorPostToTumblrPost(editorPost: any) {
  let npfBlocks: any = []

  if (editorPost.format === 'json') {
    // Tiptap JSON 형식
    let jsonContent = editorPost.content
    if (typeof jsonContent === 'string') {
      try {
        jsonContent = JSON.parse(jsonContent)
      } catch (e) {
        console.error("Failed to parse json content in backend", e)
      }
    }
    npfBlocks = NpfConverter.tiptapToNpf(jsonContent)
  } else {
    // Markdown 형식
    npfBlocks = NpfConverter.markdownToNpf(editorPost.content || '')
  }

  // map 연산 수행 시 layout 유실 방지 목적
  const layout = npfBlocks.layout || []
  const streamsToCleanup: string[] = []
  
  npfBlocks = npfBlocks.map((block: any) => {
    if (block.type === 'image' && block.media && block.media[0] && block.media[0].url) {
      const urlStr = block.media[0].url
      if (urlStr.startsWith('data:image/')) {
        const stream = base64ToReadStream(urlStr)
        if (stream) {
          streamsToCleanup.push(stream.tempFilePath)
          return {
            type: 'image',
            media: stream,
            alt_text: block.alt_text || ''
          }
        }
      } else if (urlStr.startsWith('file://') || (path.isAbsolute(urlStr) && fs.existsSync(urlStr))) {
        const stream = localFileToReadStream(urlStr)
        if (stream) {
          return {
            type: 'image',
            media: stream,
            alt_text: block.alt_text || ''
          }
        }
      }
    }
    return block
  })

  const tumblrPost: any = {
    content: npfBlocks,
    layout: layout,
    tags: editorPost.tags
  }

  if (editorPost.id) {
    tumblrPost.id = editorPost.id
  }

  tumblrPost._tempFiles = streamsToCleanup

  return tumblrPost
}

export function requestAuth(successHandler: (account: any) => void, failureHandler: () => void) {
  const oauthInfoReader = new OauthInfoReader()
  const oauth1 = new ExternalOAuth1(oauthInfoReader.getTumblr())
  oauth1.requestAuth((requestTokens) => {
    OAuthRequestManager.saveRequestInfo('oauth', (searchParams: URLSearchParams) => {
      const verifier = searchParams.get("oauth_verifier")
      if (verifier) {
        oauth1.requestToken(verifier, requestTokens, (error: any, token: string, tokenSecret: string) => {
          if (error) {
            failureHandler()
            return
          }

          successHandler({
            uuid: uuidv4(),
            provider: PROVIDER_ID,
            authInfo: {
              token, tokenSecret
            }
          })
        })
      } else {
        failureHandler()
      }
    })
  })
}

export function fetchUser(auth: any): Promise<any> {
  const client = _createTumblrClient(auth)
  return client.userInfo()
}

export function fetchPosts(auth: any, blogName: string, options: any): Promise<any> {
  const client = _createTumblrClient(auth)
  const queryOptions = { npf: true, ...options }
  return client.blogPosts(blogName, queryOptions)
    .then((res: any) => ({
      posts: _tumblrPostsToEditorPosts(res.posts),
      hasNext: res.blog.posts > ((options && options.offset) || 0) + res.posts.length
    }))
}

export function fetchPost(auth: any, blogName: string, postId: any): Promise<any> {
  const client = _createTumblrClient(auth)
  return client.blogPosts(blogName, { id: postId, npf: true })
    .then((res: any) => ({
      post: _tumblrPostToEditorPost(res.posts[0])
    }))
}

export async function addPost(auth: any, blogName: string, post: any): Promise<any> {
  const client = _createTumblrClient(auth)
  const tumblrPost = _editorPostToTumblrPost(post)
  try {
    await client.createPost(blogName, tumblrPost)
    const fetchRes = await fetchPosts(auth, blogName, { offset: 0, limit: 1 })
    return { post: fetchRes.posts[0] }
  } finally {
    if (tumblrPost._tempFiles) {
      tumblrPost._tempFiles.forEach((filePath: string) => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        } catch (e) {
          console.error("Failed to delete temp file:", filePath, e)
        }
      })
    }
  }
}

export async function savePost(auth: any, blogName: string, post: any): Promise<any> {
  const client = _createTumblrClient(auth)
  const tumblrPost = _editorPostToTumblrPost(post)
  try {
    await client.editPost(blogName, post.id, tumblrPost)
    return await fetchPost(auth, blogName, post.id)
  } finally {
    if (tumblrPost._tempFiles) {
      tumblrPost._tempFiles.forEach((filePath: string) => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        } catch (e) {
          console.error("Failed to delete temp file:", filePath, e)
        }
      })
    }
  }
}

export function validateAuthInfo(auth: any): boolean {
  return !!(auth && auth.token)
}

export async function fetchAccount(auth: any): Promise<any> {
  let blogs: any[] = []
  let username = ""
  try {
    const res = await fetchUser(auth.authInfo)
    username = (res as any).user.name
    blogs = (res as any).user.blogs
  } catch (e) {
    username = "불러오기 오류"
    console.error("FETCH_ACCOUNT_FAILED", e)
  }
  
  return {
    auth: {
      uuid: auth.uuid,
      provider: auth.provider
    },
    user: {
      name: username,
      image: null
    },
    blogs: blogs.map(blog => ({
      name: blog.name,
      url: blog.url,
      title: blog.title,
      description: blog.description,
      image: blog.avatar ? blog.avatar[0].url : null,
      primary: blog.primary
    }))
  }
}
