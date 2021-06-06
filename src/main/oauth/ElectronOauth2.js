'use strict';

const Promise = require('pinkie-promise');
const queryString = require('querystring');
const fetch = require('node-fetch');
const objectAssign = require('object-assign');
const nodeUrl = require('url');
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;
const AuthUtils = require('../lib/AuthUtils')

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

module.exports = function (oauthInfo, windowParams, tokenMethod = 'POST') {
  function getAuthorizationCode(opts) {
    opts = opts || {};

    if (!oauthInfo.redirectUri) {
      oauthInfo.redirectUri = 'https://joostory.github.io/tistory-editor/callback.html';
    }

    var urlParams = {
      response_type: 'code',
      redirect_uri: oauthInfo.redirectUri,
      client_id: oauthInfo.clientId,
      state: AuthUtils.generateRandomString(16)
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType;
    }

    var url = oauthInfo.authorizationUrl + '?' + queryString.stringify(urlParams);

    return new Promise(function (resolve, reject) {
      const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(url) {
        var url_parts = nodeUrl.parse(url, true);
        var query = url_parts.query;
        var code = query.code;
        var error = query.error;

        if (error !== undefined) {
          reject(error);
          authWindow.removeAllListeners('closed');
          setImmediate(function () {
            authWindow.close();
          });
        } else if (code) {
          resolve(code);
          authWindow.removeAllListeners('closed');
          setImmediate(function () {
            authWindow.close();
          });
        }
      }

      authWindow.webContents.on('will-navigate', (event, url) => {
        onCallback(url);
      });

      authWindow.webContents.on("did-navigate", (event, url) => {
        onCallback(url)
      })
    });
  }

  function tokenRequest(data) {
    let header = {
      'Accept': 'application/json'
    };
    let url = oauthInfo.tokenUrl;
    let fetchOptions = {
      method: tokenMethod
    };

    if (oauthInfo.useBasicAuthorizationHeader) {
      header.Authorization = 'Basic ' + new Buffer(oauthInfo.clientId + ':' + oauthInfo.clientSecret).toString('base64');
    } else {
      objectAssign(data, {
        client_id: oauthInfo.clientId,
        client_secret: oauthInfo.clientSecret
      });
    }
    fetchOptions['headers'] = header;

    if (tokenMethod == 'GET') {
      url = `${oauthInfo.tokenUrl}?${queryString.stringify(data)}`
    } else {
      header['Content-Type'] = 'application/x-www-form-urlencoded';
      fetchOptions['body'] = queryString.stringify(data);
    }

    return fetch(url, fetchOptions)
      .then(res => res.json());
  }

  function getAccessToken(opts) {
    return getAuthorizationCode(opts)
      .then(authorizationCode => {
        var tokenRequestData = {
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: oauthInfo.redirectUri
        };
        tokenRequestData = Object.assign(tokenRequestData, opts.additionalTokenRequestData);
        return tokenRequest(tokenRequestData);
      });
  }

  function refreshToken(refreshToken) {
    return tokenRequest({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: oauthInfo.redirectUri
    });
  }

  return {
    getAuthorizationCode: getAuthorizationCode,
    getAccessToken: getAccessToken,
    refreshToken: refreshToken
  };
};
