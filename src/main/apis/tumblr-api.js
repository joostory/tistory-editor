const OauthInfoReader = require('../oauth/OauthInfoReader')
const oauth = require("../oauth/ElectronOauth1")
const {session, BrowserWindow} = require('electron')
const tumblr = require("tumblr.js")

const getAccessToken = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      session: session.fromPartition("editor:oauth1:" + new Date())
    }
  })

  const oauthReader = new OauthInfoReader()
  const tumblrInfo = oauthReader.getTumblr()
  const config = {
    key: tumblrInfo.clientKey,
    secret: tumblrInfo.clientSecret,
    requestUrl: tumblrInfo.requestTokenUrl,
    authenticateUrl: tumblrInfo.authorizeUrl,
    accessUrl: tumblrInfo.tokenUrl,
    authCallback: tumblrInfo.redirectUri,
    version: '1.0a',
    signatureMethod: 'HMAC-SHA1'
  }

  return oauth(config, window)
    .catch(error => {
      console.log("error", error)
    })
    .finally(() => {
      window.close()
    })
}

function createTumblrClient(auth) {
  const oauthReader = new OauthInfoReader()
  const tumblrInfo = oauthReader.getTumblr()

  return tumblr.createClient({
    credentials: {
      consumer_key: tumblrInfo.clientKey,
      consumer_secret: tumblrInfo.clientSecret,
      token: auth.token,
      token_secret: auth.tokenSecret
    },
    returnPromises: true
  })
}

const fetchUser = (auth) => {
  const client = createTumblrClient(auth)
  return client.userInfo()
}

function _tumblrPostToEditorPost(post) {
  return ({
    id: post.id,
    url: post.post_url,
    title: post.summary,
    content: post.body,
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

function _editorPostToTumblrPost(editorPost) {
  let tumblrPost = {
    title: editorPost.title,
    body: editorPost.content,
    tags: editorPost.tags
  }

  if (editorPost.id) {
    tumblrPost.id = editorPost.id
  }

  return tumblrPost
}

const fetchPosts = (auth, blogName, options) => {
  const client = createTumblrClient(auth)
  return client.blogPosts(blogName, options)
    .then(res => ({
      posts: _tumblrPostsToEditorPosts(res.posts),
      hasNext: res.blog.posts > options.offset + res.posts.length
    }))
}

const fetchPost = (auth, blogName, postId) => {
  const client = createTumblrClient(auth)
  return client.blogPosts(blogName, {id: postId})
    .then(res => ({
      post: _tumblrPostToEditorPost(res.posts[0])
    }))
}

const addPost = async (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  const res = await client.createTextPost(blogName, _editorPostToTumblrPost(post))
  const fetchRes = await fetchPosts(auth, blogName, {offset:0, limit:1})
  return { post: fetchRes.posts[0] }
}

const savePost = async (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  const res = await client.editPost(blogName, _editorPostToTumblrPost(post))
  return await fetchPost(auth, blogName, post.id)
}

const validateAuthInfo = (auth) => auth && auth.token

const fetchAccount = async (auth) => {
  let blogs = []
  let username = ""
  try {
    const res = await fetchUser(auth.authInfo)
    username = res.user.name
    blogs = res.user.blogs
  } catch (e) {
    username = "불러오기 오류"
    console.error(e)
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
  getAccessToken: getAccessToken,
  fetchUser: fetchUser,
  fetchPosts: fetchPosts,
  fetchPost: fetchPost,
  addPost: addPost,
  savePost: savePost,
  validateAuthInfo: validateAuthInfo,
  fetchAccount: fetchAccount
}
