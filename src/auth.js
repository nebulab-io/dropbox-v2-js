const request = require('request'); 

module.exports = {
  authenticate: function(config) {
    return {
      generateAuthUrl: function(input){
        return 'https://www.dropbox.com/oauth2/authorize?' + 
          'client_id=' + config.client_id + 
          '&response_type=' + config.response_type + 
          '&redirect_uri=' + config.redirect_uri +
          '&state=' + config.state +
          '&require_role=' + config.require_role +
          '&force_reapprove=' + config.force_reapprove + 
          '&disable_signup=' + config.disable_signup;
      },
      getToken: function(code, cb){
        request({
          method: 'POST',
          uri: 'https://api.dropboxapi.com/oauth2/token',
          followRedirect: true,
          json: true,
          form: {
            code: code,
            grant_type: 'authorization_code',
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: config.redirect_uri
          }
        }, function(err, resp, body){
          if(err || body.error){
            cb(body.error || {});
          }
          config.token = body.access_token;
          cb(false, body);
        });
      }
    }
  };
};