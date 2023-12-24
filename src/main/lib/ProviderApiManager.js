const tumblr = require('../apis/tumblr-api')


function getApi(provider) {
  switch (provider) {
    case 'tumblr':
      return tumblr
    default:
      throw `Unknown provider : ${provider}`
  }
}

module.exports = {
  getApi: getApi
}
