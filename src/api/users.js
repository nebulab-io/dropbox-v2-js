'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {
  
  /**
   * Function that returns account info for a given account ID.
   * 
   * @param  {String} accountId
   * @return {Object} account info
   */
  getAccount: function (accountId) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/users/get_account')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          account_id: accountId
        });

      if (Object.keys(res.body).length === 0) {
        res.body = JSON.parse(res.text);
      }

      if (res.body.error) {
        Promise.reject(res.body.error);
      }

      return res.body;
    });
  },

  /**
   * Function that returns account info for an array of account IDs.
   * 
   * @param  {Array} of accountIds
   * @return {Object} accounts info
   */
  getAccountBatch: function (accountIds) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/users/get_account_batch')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          account_ids: accountIds
        });

      if (Object.keys(res.body).length === 0) {
        res.body = JSON.parse(res.text);
      }

      if (res.body.error) {
        Promise.reject(res.body.error);
      }

      return res.body;
    });
  },

  /**
   * Function that returns account info for the current account
   * 
   * @return {Obejct} account info
   */
  getCurrentAccount: function () {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/users/get_current_account')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken));

      if (Object.keys(res.body).length === 0) {
        res.body = JSON.parse(res.text);
      }

      if (res.body.error) {
        Promise.reject(res.body.error);
      }

      return res.body;
    });
  },

  /**
   * Function that returns space usage info for the current account.
   * 
   * @return {Obejct} account info
   */
  getSpaceUsage: function () {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/users/get_space_usage')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken));

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