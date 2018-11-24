const oauth2 = require('../oauth/ElectronOauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('isomorphic-fetch')
const querystring = require('querystring')
const ipc = require('../ipc-event')
const FormData = require('form-data')
const {clipboard, session} = require('electron')
const stream = require('stream')
const Oauth2infoReader = require('../oauth/Oauth2infoReader')
const appInfo = require('../appInfo')

const errorHandler = (res) => {
  if (!res.ok) {
    console.error("fetch failed", res)
    res.text().then(text => console.error("fetch body", text))
    throw new Error(res)
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
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.fetchUser = (auth) => {
  return fetch(BASE_URL + "/user?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json"
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.fetchPosts = (auth, blogName, page) => {
  return fetch(BASE_URL + "/post/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    count: 30,
    page: page? page : 1
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.fetchContent = (auth, blogName, postId) => {
  return fetch(BASE_URL + "/post/read?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    postId: postId
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.fetchCategories = (auth, blogName) => {
  return fetch(BASE_URL + "/category/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.saveContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)
  formdata.append("postId", post.id)

  return fetch(BASE_URL + "/post/modify", {
    method: 'post',
    body: formdata
  }, {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
}

module.exports.addContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)

  return fetch(BASE_URL + "/post/write", {
    method: 'post',
    body: formdata
  }, {
    headers: {
      'User-Agent': appInfo.userAgent
    }
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

module.exports.uploadFileWithBuffer = (auth, blogName, buffer, options) => {
	console.log("uploadFileWithClipboard", blogName)
	var imageStream = new stream.PassThrough()
	imageStream.end(buffer)
	return uploadFile(auth.access_token, blogName, imageStream, options)
}

module.exports.uploadFileWithBlob = (auth, blogName, blob, options) => {
  console.log("uploadFileWithBlob", blogName)
  var imageStream = new stream.PassThrough()
	imageStream.end(blob.buffer)
	return uploadFile(auth.access_token, blogName, imageStream, {
    filename: 'blobimage.jpg',
		contentType: options.contentType,
		knownLength: options.length
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
