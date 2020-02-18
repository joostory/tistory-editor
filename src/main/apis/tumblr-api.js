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


const fetchPosts = (auth, blogName, options) => {
  const client = createTumblrClient(auth)
  return client.blogPosts(blogName, options)
    .then(res => ({
      posts: res.posts? [].concat(res.posts) : [],
      hasNext: res.blog.posts > options.offset + res.posts.length
    }))
}

const fetchPost = (auth, blogName, postId) => {
  const client = createTumblrClient(auth)
  return client.blogPosts(blogName, {
    id: postId
  })
}

const addPost = (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  return client.createTextPost(blogName, post)
}

const savePost = (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  return client.editPost(blogName, post)
}

const validateAuthInfo = (auth) => auth && auth.token

const fetchAccount = async (auth) => {
  const res = await fetchUser(auth.authInfo)
  return {
    auth: {
      uuid: auth.uuid,
      provider: auth.provider
    },
    user: {
      name: res.user.name,
      image: null
    },
    blogs: res.user.blogs.map(blog => ({
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
  addPost: addPost,
  savePost: savePost,
  validateAuthInfo: validateAuthInfo,
  fetchAccount: fetchAccount
}
