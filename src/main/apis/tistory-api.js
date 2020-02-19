const oauth2 = require('../oauth/ElectronOauth2');
const fs = require('fs')
const fetch = require('isomorphic-fetch')
const querystring = require('querystring')
const FormData = require('form-data')
const {session} = require('electron')
const stream = require('stream')
const Oauth2infoReader = require('../oauth/OauthInfoReader')
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

const getAccessToken = () => {
  const oauth2infoReader = new Oauth2infoReader()
  const tistoryOAuth = oauth2(oauth2infoReader.getTistory(), {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
			nodeIntegration: false,
			session: session.fromPartition("tistory:oauth2:" + new Date())
    }
  }, 'GET')

  return tistoryOAuth.getAccessToken({})
}

const fetchBlogInfo = (auth) => {
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

const fetchUser = (auth) => {
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

function tistoryPostToEditorPost(tistoryPosts) {
  let posts = tistoryPosts? [].concat(tistoryPosts) : []

  return posts.map(post => ({
    id: post.id,
    url: post.postUrl,
    title: post.title,
    date: post.date,
    categoryId: post.categoryId,
    state: post.visibility > 0? 'published' : 'draft'
  }))
}

const fetchPosts = (auth, blogName, options) => {
  return fetch(BASE_URL + "/post/list?" + querystring.stringify({
    access_token: auth.access_token,
    output: "json",
    blogName: blogName,
    count: 30,
    page: options.page? options.page : 1
  }), {
    headers: {
      'User-Agent': appInfo.userAgent
    }
  })
  .then(errorHandler)
  .then(res => ({
    page: res.tistory.item.page,
    posts: tistoryPostToEditorPost(res.tistory.item.posts),
    hasNext: res.tistory.item.totalCount > res.tistory.item.page * res.tistory.item.count
  }))
}

const fetchContent = (auth, blogName, postId) => {
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

const fetchCategories = (auth, blogName) => {
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

const saveContent = (auth, blogName, post) => {
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

const addContent = (auth, blogName, post) => {
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

const uploadFile = (auth, blogName, filepath) => {
	console.log("uploadFile", blogName, filepath)
	return _uploadFile(auth.access_token, blogName, fs.createReadStream(filepath))
}

const uploadFileWithBuffer = (auth, blogName, buffer, options) => {
  console.log("uploadFileWithClipboard", blogName)
	var imageStream = new stream.PassThrough()
	imageStream.end(buffer)
	return _uploadFile(auth.access_token, blogName, imageStream, options)
}

const uploadFileWithBlob = (auth, blogName, blob, options) => {
  console.log("uploadFileWithBlob", blogName)
  var imageStream = new stream.PassThrough()
	imageStream.end(blob.buffer)
	return _uploadFile(auth.access_token, blogName, imageStream, {
    filename: 'blobimage.jpg',
		contentType: options.contentType,
		knownLength: options.length
  })
}

const _uploadFile = (accessToken, blogName, fileBlob, fileOption) => {
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

const validateAuthInfo = (auth) => auth && auth.access_token

const fetchAccount = async (auth) => {
  const userRes = await fetchUser(auth.authInfo)
  const blogRes = await fetchBlogInfo(auth.authInfo)
  return {
    auth: {
      uuid: auth.uuid,
      provider: auth.provider
    },
    user: {
      name: userRes.tistory.item.name,
      image: userRes.tistory.item.image
    },
    blogs: blogRes.tistory.item.blogs.map(blog => ({
      name: blog.name,
      url: blog.secondaryUrl == ''? blog.url : blog.secondaryUrl,
      title: blog.title,
      description: blog.description,
      image: blog.profileImageUrl,
      primary: blog.default == 'Y'
    }))
  }
}


module.exports = {
  getAccessToken: getAccessToken,
  fetchBlogInfo: fetchBlogInfo,
  fetchUser: fetchUser,
  fetchPosts: fetchPosts,
  fetchCategories: fetchCategories,
  fetchContent: fetchContent,
  fetchAccount: fetchAccount,
  uploadFileWithBuffer: uploadFileWithBuffer,
  uploadFileWithBlob: uploadFileWithBlob,
  saveContent: saveContent,
  addContent: addContent,
  validateAuthInfo: validateAuthInfo
}
