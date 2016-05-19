'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {      
  /**
   * Function that revokes the access for the current token available.
   * 
   * @param  {String} 
   * @return {Boolean || String} returns true if it works or the status message if not.
   */
  revokeAccessToken: function () {
    var th = this;
    return co(function *() {
      console.log(th.accessToken || th.config.accessToken);
      let res = yield request
        .post('https://api.dropboxapi.com/2/auth/token/revoke')
        .set('Authorization', 'Bearer ' + th.accessToken || th.config.accessToken);

        console.log(res);

      if (res.statusCode == 200) {
        return true;
      } else {
        Promise.reject(res.statusMessage);
      }
    });
  }
}