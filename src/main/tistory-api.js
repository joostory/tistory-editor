const oauth2 = require('electron-oauth2');
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const querystring = require('querystring')
const ipc = require('./ipc-event')
const FormData = require('form-data')
const {clipboard} = require('electron')
const stream = require('stream');

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

module.exports.fetchPosts = (auth, blogName, page) => {
  return fetch("https://www.tistory.com/apis/post/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    count: 30,
    page: page? page : 1
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
    throw res.json()
  }

	console.log(res)

  return res
}

module.exports.saveContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)
  formdata.append("postId", post.id)

  return fetch("https://www.tistory.com/apis/post/modify", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
  .then(res => res.json())
}

module.exports.addContent = (auth, blogName, post) => {
  let formdata = makePostFormData(auth, blogName, post)

  return fetch("https://www.tistory.com/apis/post/write", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
  .then(res => res.json())
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
	var imageStream = new stream.PassThrough()
	imageStream.end(image.toPNG())
	return uploadFile(auth.access_token, blogName, imageStream)
}

const uploadFile = (accessToken, blogName, fileBlob) => {
	let formdata = new FormData();
  formdata.append("access_token", accessToken)
  formdata.append("output", "json")
  formdata.append("blogName", blogName)
  formdata.append("uploadedfile", fileBlob)

	console.log(formdata)

  return fetch("https://www.tistory.com/apis/post/attach", {
    method: 'post',
    body: formdata
  })
  .then(errorHandler)
  .then(res => res.json())
}
