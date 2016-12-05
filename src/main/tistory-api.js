const oauth2 = require('electron-oauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const querystring = require('querystring')
const ipc = require('./ipc-event')

module.exports.getAccessToken = (callback) => {
  oauth2info = JSON.parse(fs.readFileSync(path.join(__dirname, "../../oauth2info.json"), 'utf8'))
  const tistoryOAuth = oauth2(oauth2info, {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
        nodeIntegration: false
    }
  })

  return tistoryOAuth.getAccessToken({})
    .then(token => callback(token))
}

module.exports.fetchBlogInfo = (auth) => {
  return fetch("https://www.tistory.com/apis/blog/info?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(errorHandler)
  .then(res => res.json())
}

module.exports.fetchUser = (auth) => {
  return fetch("https://www.tistory.com/apis/user/?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(errorHandler)
  .then(res => res.json())
}

module.exports.fetchPosts = (auth, blogName) => {
  return fetch("https://www.tistory.com/apis/post/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName
  }))
  .then(errorHandler)
  .then(res => res.json())
}

module.exports.fetchContent = (auth, blogName, postId) => {
  return fetch("https://www.tistory.com/apis/post/read?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    postId: postId
  }))
  .then(errorHandler)
  .then(res => res.json())
}

module.exports.fetchCategories = (auth, blogName) => {
  return fetch("https://www.tistory.com/apis/category/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName
  }))
  .then(errorHandler)
  .then(res => res.json())
}

const errorHandler = (res) => {
  if (!res.ok) {
    console.error(res)
    throw "Error:" + res.tistory.status
  }

  return res
}
