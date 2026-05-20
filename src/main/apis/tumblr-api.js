const fs = require('fs')
const path = require('path')
const os = require('os')
const uuid = require('uuid').v4
const OauthInfoReader = require('../oauth/OauthInfoReader')
const tumblr = require("tumblr.js")
const ExternalOAuth1 = require('../oauth/ExternalOAuth1');
const OAuthRequestManager = require('../oauth/OAuthRequestManager');

const PROVIDER_ID = 'tumblr'

const NpfConverter = require('../lib/NpfConverter')

function _createTumblrClient(auth) {
  const oauthReader = new OauthInfoReader()
  const tumblrInfo = oauthReader.getTumblr()

  return tumblr.createClient({
    consumer_key: tumblrInfo.clientKey,
    consumer_secret: tumblrInfo.clientSecret,
    token: auth.token,
    token_secret: auth.tokenSecret
  })
}


function _tumblrPostToEditorPost(post) {
  let tiptapContent = null
  let markdownContent = ''
  let contentHtml = ''

  if (post.content && Array.isArray(post.content)) {
    // Neue Post Format (NPF)
    tiptapContent = NpfConverter.npfToTiptap(post.content)
    markdownContent = NpfConverter.npfToMarkdown(post.content)
    contentHtml = NpfConverter.npfToHtml(post.content)
  } else {
    // Legacy Post (HTML in body)
    const npfBlocks = NpfConverter.htmlToNpf(post.body || '')
    tiptapContent = NpfConverter.npfToTiptap(npfBlocks)
    markdownContent = NpfConverter.npfToMarkdown(npfBlocks)
    contentHtml = post.body || ''
  }

  return ({
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
  })
}

function _tumblrPostsToEditorPosts(tumblrPosts) {
  let posts = tumblrPosts? [].concat(tumblrPosts) : []

  return posts.map(_tumblrPostToEditorPost)
}

function base64ToReadStream(base64Data) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    return null
  }
  const contentType = matches[1]
  const base64Str = matches[2]
  const extension = contentType.split('/')[1] || 'png'
  
  const buffer = Buffer.from(base64Str, 'base64')
  const tempFilePath = path.join(os.tmpdir(), `tumblr_upload_${uuid()}.${extension}`)
  
  fs.writeFileSync(tempFilePath, buffer)
  
  const stream = fs.createReadStream(tempFilePath)
  stream.tempFilePath = tempFilePath
  return stream
}

function localFileToReadStream(fileUrl) {
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


function _editorPostToTumblrPost(editorPost) {
  let npfBlocks = []

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

  const streamsToCleanup = []
  
  npfBlocks = npfBlocks.map(block => {
    if (block.type === 'image' && block.media && block.media[0] && block.media[0].url) {
      const url = block.media[0].url
      if (url.startsWith('data:image/')) {
        const stream = base64ToReadStream(url)
        if (stream) {
          streamsToCleanup.push(stream.tempFilePath)
          return {
            type: 'image',
            media: stream,
            alt_text: block.alt_text || ''
          }
        }
      } else if (url.startsWith('file://') || (path.isAbsolute(url) && fs.existsSync(url))) {
        const stream = localFileToReadStream(url)
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

  let tumblrPost = {
    content: npfBlocks,
    tags: editorPost.tags
  }

  if (editorPost.id) {
    tumblrPost.id = editorPost.id
  }

  tumblrPost._tempFiles = streamsToCleanup

  return tumblrPost
}

function requestAuth(successHandler, failureHandler) {
  const oauthInfoReader = new OauthInfoReader()
  const oauth1 = new ExternalOAuth1(oauthInfoReader.getTumblr())
  oauth1.requestAuth((requestTokens) => {
    OAuthRequestManager.saveRequestInfo('oauth', (searchParams) => {
      const verifier = searchParams.get("oauth_verifier")
      oauth1.requestToken(verifier, requestTokens, (error, token, tokenSecret) => {
        if (error) {
          failureHandler()
          return
        }

        successHandler({
          uuid: uuid(),
          provider: PROVIDER_ID,
          authInfo: {
            token, tokenSecret
          }
        })
      })
    })
  })

}

function fetchUser(auth) {
  const client = _createTumblrClient(auth)
  return client.userInfo()
}


function fetchPosts(auth, blogName, options) {
  const client = _createTumblrClient(auth)
  return client.blogPosts(blogName, options)
    .then(res => ({
      posts: _tumblrPostsToEditorPosts(res.posts),
      hasNext: res.blog.posts > options.offset + res.posts.length
    }))
}

function fetchPost(auth, blogName, postId) {
  const client = _createTumblrClient(auth)
  return client.blogPosts(blogName, {id: postId})
    .then(res => ({
      post: _tumblrPostToEditorPost(res.posts[0])
    }))
}

async function addPost(auth, blogName, post) {
  const client = _createTumblrClient(auth)
  const tumblrPost = _editorPostToTumblrPost(post)
  try {
    const res = await client.createPost(blogName, tumblrPost)
    const fetchRes = await fetchPosts(auth, blogName, {offset:0, limit:1})
    return { post: fetchRes.posts[0] }
  } finally {
    if (tumblrPost._tempFiles) {
      tumblrPost._tempFiles.forEach(filePath => {
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

async function savePost(auth, blogName, post) {
  const client = _createTumblrClient(auth)
  const tumblrPost = _editorPostToTumblrPost(post)
  try {
    const res = await client.editPost(blogName, post.id, tumblrPost)
    return await fetchPost(auth, blogName, post.id)
  } finally {
    if (tumblrPost._tempFiles) {
      tumblrPost._tempFiles.forEach(filePath => {
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

function validateAuthInfo(auth) {
  return auth && auth.token
}

async function fetchAccount(auth) {
  let blogs = []
  let username = ""
  try {
    const res = await fetchUser(auth.authInfo)
    username = res.user.name
    blogs = res.user.blogs
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
      image: blog.avatar? blog.avatar[0].url: null,
      primary: blog.primary
    }))
  }
}


module.exports = {
  requestAuth: requestAuth,
  fetchUser: fetchUser,
  fetchPosts: fetchPosts,
  fetchPost: fetchPost,
  addPost: addPost,
  savePost: savePost,
  validateAuthInfo: validateAuthInfo,
  fetchAccount: fetchAccount
}
