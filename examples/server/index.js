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
  path: '/copy',
  handler: function(request, reply) {
    oauth.copy('/teste/guitar.png', '/teste2/guitar3.png').then(function(res) {
      console.log(res)
    }, function (err) {
      console.log(err);
    });
  }
});

server.route({
  method: 'GET',
  path: '/auth',
  handler: function(request, reply) {
    co(function *() {
      var params = request.query;
      oauth.getTokenByCode(params.code).then(function(res) {
        console.log(res);
        
      }, function(err) {
        console.log(err);
      });
    });
  }
});

server.route({
  method: 'GET',
  path: '/user',
  handler: function(request, reply) {
    co(function *() {
      oauth.getSpaceUsage().then(function(res) {
          console.log(res);
      }, function(err) {
        console.log(err);
      });
    });
  }
});

server.route({
  method: 'GET',
  path: '/files',
  handler: function(request, reply) {
    co(function *() {
      oauth.getTokenByCode(params.code).then(function(res) {
        reply('Yo '+ res.access_token);
      }, function(err) {
        console.log(err);
      });
  }
});

server.start(function() {
  //open authorization url
  Opn(oauth.generateAuthUrl());
});