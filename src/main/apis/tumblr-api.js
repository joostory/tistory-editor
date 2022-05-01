const uuid = require('uuid').v4
const OauthInfoReader = require('../oauth/OauthInfoReader')
const tumblr = require("tumblr.js")
const ExternalOAuth1 = require('../oauth/ExternalOAuth1');
const OAuthRequestManager = require('../oauth/OAuthRequestManager');

const PROVIDER_ID = 'tumblr'

function _createTumblrClient(auth) {
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
  const res = await client.createTextPost(blogName, _editorPostToTumblrPost(post))
  const fetchRes = await fetchPosts(auth, blogName, {offset:0, limit:1})
  return { post: fetchRes.posts[0] }
}

async function savePost(auth, blogName, post) {
  const client = _createTumblrClient(auth)
  const res = await client.editPost(blogName, _editorPostToTumblrPost(post))
  return await fetchPost(auth, blogName, post.id)
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
  requestAuth: requestAuth,
  fetchUser: fetchUser,
  fetchPosts: fetchPosts,
  fetchPost: fetchPost,
  addPost: addPost,
  savePost: savePost,
  validateAuthInfo: validateAuthInfo,
  fetchAccount: fetchAccount
}
