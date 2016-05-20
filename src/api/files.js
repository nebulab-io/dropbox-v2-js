'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {      
  
  copy: function (fromPath, toPath) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/copy')
        .send({
          from_path: fromPath,
          to_path: toPath
        })
        .type('application/json')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken));
        console.log(res);

      if (Object.keys(res.body).length === 0) {
        res.body = JSON.parse(res.text);
      }

      if (res.body.error) {
        Promise.reject(res.body.error);
      }
      return res.body;
    });
  }
}