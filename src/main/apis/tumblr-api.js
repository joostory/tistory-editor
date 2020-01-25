const OauthInfoReader = require('../oauth/OauthInfoReader')
const oauth = require("../oauth/ElectronOauth1")
const {session, BrowserWindow} = require('electron')
const tumblr = require("tumblr.js")

module.exports.getAccessToken = () => {
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

module.exports.fetchUser = (auth) => {
  const client = createTumblrClient(auth)
  return client.userInfo()
}


module.exports.fetchPosts = (auth, blogName, offset) => {
  const client = createTumblrClient(auth)
  return client.blogPosts(blogName, {
    offset: offset
  })
}


module.exports.addPost = (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  console.log('addPost', post)
  return client.createTextPost(blogName, post)
}

module.exports.savePost = (auth, blogName, post) => {
  const client = createTumblrClient(auth)
  console.log('savePost', post)
  return client.editPost(blogName, post)
}
