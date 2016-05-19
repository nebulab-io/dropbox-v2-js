const Dropbox = require('../../index.js')
      Hapi = require('hapi'),
      fs = require('fs'),
      path = require('path'),
      Opn = require('opn'),
      co = require('co'),
      credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../../app.json')));

//set credentials
var oauth = new Dropbox({
  client_id: credentials.appKey,
  client_secret: credentials.appSecret,
  redirect_uri: credentials.redirectUri,
  response_type: "code",
  force_reapprove: false,
  disable_signup: false,
  require_role: "personal"
});

//prepare server & oauth2 response callback
var server = new Hapi.Server();

server.connection({
  port: 5050
});

server.route({
  method: 'GET',
  path: '/auth',
  handler: function(request, reply) {
    co(function * () {
      var params = request.query;
      oauth.getTokenByCode(params.code).then(function(res) {
        console.log(res);
        oauth.revokeAccessToken().then(function() {

          console.log('ok')
        });
      }, function(err) {
        console.log(err);
      });
    });
  }
});

server.start(function() {
  //open authorization url
  Opn(oauth.generateAuthUrl());
});