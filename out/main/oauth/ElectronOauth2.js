"use strict";
const Promise$1 = require("pinkie-promise");
const queryString = require("querystring");
const axios = require("axios");
const objectAssign = require("object-assign");
const nodeUrl = require("url");
const { BrowserWindow } = require("electron");
const AuthUtils = require("../lib/AuthUtils");
module.exports = function(oauthInfo, windowParams, tokenMethod = "POST") {
  function getAuthorizationCode(opts) {
    opts = opts || {};
    if (!oauthInfo.redirectUri) {
      oauthInfo.redirectUri = "https://joostory.github.io/tistory-editor/callback.html";
    }
    var urlParams = {
      response_type: "code",
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
    var url = oauthInfo.authorizationUrl + "?" + queryString.stringify(urlParams);
    return new Promise$1(function(resolve, reject) {
      const authWindow = new BrowserWindow(windowParams || { "use-content-size": true });
      authWindow.loadURL(url);
      authWindow.show();
      authWindow.on("closed", () => {
        reject(new Error("window was closed by user"));
      });
      function onCallback(url2) {
        var url_parts = nodeUrl.parse(url2, true);
        var query = url_parts.query;
        var code = query.code;
        var error = query.error;
        if (error !== void 0) {
          reject(error);
          authWindow.removeAllListeners("closed");
          setImmediate(function() {
            authWindow.close();
          });
        } else if (code) {
          resolve(code);
          authWindow.removeAllListeners("closed");
          setImmediate(function() {
            authWindow.close();
          });
        }
      }
      authWindow.webContents.on("will-navigate", (event, url2) => {
        onCallback(url2);
      });
      authWindow.webContents.on("did-navigate", (event, url2) => {
        onCallback(url2);
      });
    });
  }
  function tokenRequest(data) {
    let header = {
      "Accept": "application/json"
    };
    let url = oauthInfo.tokenUrl;
    let fetchOptions = {
      method: tokenMethod
    };
    if (oauthInfo.useBasicAuthorizationHeader) {
      header.Authorization = "Basic " + new Buffer(oauthInfo.clientId + ":" + oauthInfo.clientSecret).toString("base64");
    } else {
      objectAssign(data, {
        client_id: oauthInfo.clientId,
        client_secret: oauthInfo.clientSecret
      });
    }
    fetchOptions["headers"] = header;
    if (tokenMethod == "GET") {
      url = `${oauthInfo.tokenUrl}?${queryString.stringify(data)}`;
    } else {
      header["Content-Type"] = "application/x-www-form-urlencoded";
      fetchOptions["body"] = queryString.stringify(data);
    }
    return axios(url, fetchOptions).then((res) => res.data);
  }
  function getAccessToken(opts) {
    return getAuthorizationCode(opts).then((authorizationCode) => {
      var tokenRequestData = {
        code: authorizationCode,
        grant_type: "authorization_code",
        redirect_uri: oauthInfo.redirectUri
      };
      tokenRequestData = Object.assign(tokenRequestData, opts.additionalTokenRequestData);
      return tokenRequest(tokenRequestData);
    });
  }
  function refreshToken(refreshToken2) {
    return tokenRequest({
      refresh_token: refreshToken2,
      grant_type: "refresh_token",
      redirect_uri: oauthInfo.redirectUri
    });
  }
  return {
    getAuthorizationCode,
    getAccessToken,
    refreshToken
  };
};
