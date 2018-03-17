const oauth2 = require('electron-oauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('isomorphic-fetch')
const querystring = require('querystring')
const ipc = require('../ipc-event')
const FormData = require('form-data')
const {clipboard, session} = require('electron')
const stream = require('stream')
const Oauth2infoReader = require('../Oauth2infoReader')

const errorHandler = (res) => {
  if (!res.ok) {
		console.error("fetch failed", res)
    throw res.json()
  }

  return res.json()
}

const BASE_URL = 'https://www.tistory.com/apis'

module.exports.getAccessToken = () => {
  const oauth2infoReader = new Oauth2infoReader()
  const tistoryOAuth = oauth2(oauth2infoReader.getTistory(), {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
			nodeIntegration: false,
			session: session.fromPartition("tistory:oauth2:" + new Date())
    }
  })

  return tistoryOAuth.getAccessToken({})
}

module.exports.fetchBlogInfo = (auth) => {
  return fetch(BASE_URL + "/blog/info?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(errorHandler)
}

module.exports.fetchUser = (auth) => {
  return fetch(BASE_URL + "/user/?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }))
  .then(errorHandler)
}

module.exports.fetchPosts = (auth, blogName, page) => {
  return fetch(BASE_URL + "/post/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    count: 30,
    page: page? page : 1
  }))
  .then(errorHandler)
}

module.exports.fetchContent = (auth, blogName, postId) => {
  return fetch(BASE_URL + "/post/read?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    postId: postId
  }))
  .then(errorHandler)
}

module.exports.fetchCategories = (auth, blogName) => {
  return fetch(BASE_URL + "/category/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName
  }))
  .then(errorHandler)
}

module.exports.saveContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)
  formdata.append("postId", post.id)

  return fetch(BASE_URL + "/post/modify", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
}

module.exports.addContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)

  return fetch(BASE_URL + "/post/write", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
}

const makePostFormData = (auth, blogName, post) => {
  let formdata = new FormData()
  formdata.append("access_token", auth.access_token)
  formdata.append("output", "json")
  formdata.append("blogName", blogName)
  formdata.append("title", post.title)
  formdata.append("content", post.content)
  if (post.categoryId) {
    formdata.append("category", post.categoryId)
  }
  if (post.visibility) {
    formdata.append("visibility", post.visibility)
  }
  if (post.tags.tag) {
    formdata.append("tag", post.tags.tag)
  }
  return formdata
}

module.exports.uploadFile = (auth, blogName, filepath) => {
	console.log("uploadFile", blogName, filepath)
	return uploadFile(auth.access_token, blogName, fs.createReadStream(filepath))
}

module.exports.uploadFileWithImage = (auth, blogName, image) => {
	console.log("uploadFileWithImage", blogName)
	var pngImageBuffer = image.toPNG()
	var imageStream = new stream.PassThrough()
	imageStream.end(pngImageBuffer)
	return uploadFile(auth.access_token, blogName, imageStream, {
		filename: 'clipboard.png',
		contentType: 'image/png',
		knownLength: pngImageBuffer.length
	})
}

const uploadFile = (accessToken, blogName, fileBlob, fileOption) => {
	let formdata = new FormData();
  formdata.append("access_token", accessToken)
  formdata.append("output", "json")
  formdata.append("blogName", blogName)
  formdata.append("uploadedfile", fileBlob, fileOption)

  return fetch(BASE_URL + "/post/attach", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
}
