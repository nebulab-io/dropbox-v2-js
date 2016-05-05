
var Dropbox = require('../src/auth');
var Hapi = require('hapi');
var fs = require('fs');
var path = require('path');
var Opn = require('opn');
var co = require('co')
var credentials = JSON.parse(fs.readFileSync(path.join(__dirname, '../app.json')));

//set auth credentials
var oauth = Dropbox.authenticate({
  client_id: credentials.appKey,
  client_secret: credentials.appSecret,
  redirect_uri: credentials.redirectUri,
  response_type: "code",
  force_reapprove: false,
  disable_signup: false,
  require_role: "personal"
});

console.log(oauth.generateAuthUrl());


//prepare server & oauth2 response callback
var server = new Hapi.Server();
server.connection({ port: 5050 });
server.route({
        method: 'GET',
        path: '/auth',
        handler: function (request, reply) {
          co(function *(){
            var params = request.query;
            oauth.getTokenByCode(params.code).then(function(res) {
              console.log(res);
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