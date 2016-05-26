'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {

  /**
   * Copy a file or folder to a different location in the user's Dropbox. 
   * If the source path is a folder all its contents will be copied.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-copy
   * 
   * @param  {String} fromPath - Path in the user's Dropbox to be copied or moved.
   * @param  {String} toPath - Path in the user's Dropbox that is the destination.
   * @return {Object} file info
   */
  copy: function (fromPath, toPath) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/copy')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          from_path: fromPath,
          to_path: toPath
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
   * Get a copy reference to a file or folder. This reference string can 
   * be used to save that file or folder to another user's Dropbox by passing 
   * it to copy_reference/save
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-copy_reference-get
   * 
   * @param  {String} path - The path to the file or folder you want to get a copy reference to.
   * @return {Object} containing file metadata, copy_reference and expires
   */
  copyReferenceGet: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/copy_reference/get')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path
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
   * Save a copy reference returned by copy_reference/get to the user's Dropbox.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-copy_reference-save
   * 
   * @param  {String} copyReference - A copy reference returned by copy_reference/get
   * @param  {String} path - Path in the user's Dropbox that is the destination
   * @return {Object} containing file metadata
   */
  copyReferenceSave: function (copyReference, path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/copy_reference/save')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-create_folder
   * 
   * @param {String} path - Path in the user's Dropbox to create
   * @return {Object} file info
   */
  createFolder: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/create_folder')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path
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
   * Delete the file or folder at a given path. 
   * If the path is a folder, all its contents will be deleted too.
   * A successful response indicates that the file or folder was deleted. 
   * The returned metadata will be the corresponding FileMetadata or 
   * FolderMetadata for the item at time of deletion, and not a DeletedMetadata object.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-delete
   * 
   * @param {String} path - Path in the user's Dropbox to delete
   * @return {Object} file info
   */
  delete: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/delete')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path
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
   * Download a file from a user's Dropbox.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-download
   * 
   * @param {String} path - Path in the user's Dropbox to download
   * @return {Object} file info
   */
  download: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/download')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .send({
          path: path
        });

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