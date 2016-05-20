'use strict'

const authentication = require('./src/auth.js'),
      authApi = require('./src/api/auth.js'),
      files = require('./src/api/files.js');

module.exports = function Dropbox(config, accessToken) {
  this.config = config;
  this.accessToken = accessToken;

  if(!this.accessToken && !this.config.accessToken) {
    var auth = authentication.authenticate(this.config);

    this.generateAuthUrl = auth.generateAuthUrl;
    this.getTokenByUrl = auth.getTokenByUrl;
    this.getTokenByCode = auth.getTokenByCode;

  } else if(!config.accessToken) {
    config.accessToken = accessToken;
  }
  
  this.revokeAccessToken = authApi.revokeAccessToken;

  this.copy = files.copy;
}