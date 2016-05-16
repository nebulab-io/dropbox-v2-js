'use strict'

const authentication = require('./src/auth.js');

module.exports = function Dropbox(config) {
  let auth = authentication.authenticate(config);

  this.generateAuthUrl = auth.generateAuthUrl;
  this.getTokenByUrl = auth.getTokenByUrl;
  this.getTokenByCode = auth.getTokenByCode;
}