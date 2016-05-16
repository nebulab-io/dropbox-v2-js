'use strict'

const Dropbox = require('../index.js'),
      assert = require('chai').assert;

var dropbox = new Dropbox({
  client_id: 1,
  client_secret: 1,
  redirect_uri: 1,
  response_type: 1,
  state: 1,
  force_reapprove: 1,
  disable_signup: 1,
  require_role: 1
});

describe('Authentication', function() {
  describe('generateAuthUrl', function () {
    it('should return the URL with the correct params', function () {
      let url = 'https://www.dropbox.com/oauth2/authorize?client_id=1&response_type=1' +
                '&redirect_uri=1&state=1&require_role=1&force_reapprove=1&disable_signup=1';

      assert.equal(url, dropbox.generateAuthUrl());
    });
  });

  describe('getTokenByUrl', function () {
    it('should return the correct params', function () {
      let url = 'access_token=access_token' +
                '&token_type=token_type&state=state&uid=uid';

      let params = dropbox.getTokenByUrl(url);

      assert.equal(params.access_token, 'access_token');
      assert.equal(params.token_type, 'token_type');
      assert.equal(params.state, 'state');
      assert.equal(params.uid, 'uid');
    });
  });

  describe('getTokenByCode', function () {
    it('@TODO end-to-end test', function () {
      
      assert.equal(1, 2);
    });
  });
});

