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
        .set('Dropbox-API-Arg', '{ "path": "' + path + '" }');

      console.log(res);
    });
  },

  /**
   * Returns the metadata for a file or folder.
   * Note: Metadata for the root folder is unsupported.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-get_metadata
   *
   * @param {String} path - Path in the user's Dropbox to download   * 
   * @param {Boolean} includeMediaInfo - If true, FileMetadata.media_info is set for 
   * photo and video. The default for this field is False.
   * @param {Boolean} includeDeleted - If true, DeletedMetadata will be returned for 
   * deleted file or folder, otherwise LookupError.not_found will be returned. 
   * The default for this field is False.
   * @param {Boolean} includeHasExplicitSharedMembers - If true, the results will include 
   * a flag for each file indicating whether or not that file has any explicit members. 
   * The default for this field is False.
   *
   * @return {Object} file or folder metadata
   **/
  getMetadata: function (path, includeMediaInfo, includeDeleted, includeHasExplicitSharedMembers) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/get_metadata')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path,
          include_media_info: includeMediaInfo,
          include_deleted: includeDeleted,
          include_has_explicit_shared_members: includeHasExplicitSharedMembers
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
   * Get a preview for a file. Currently previews are only generated for the files with the 
   * following extensions: .doc, .docx, .docm, .ppt, .pps, .ppsx, .ppsm, .pptx, .pptm, 
   * .xls, .xlsx, .xlsm, .rtf
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-get_preview
   * 
   * @param {String} path - Path in the user's Dropbox to download
   * @return {Object} file preview
   */
  getPreview: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/get_preview')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', '{ "path": "' + path + '" }');

      console.log(res);
    });
  },

  /**
   * Get a temporary link to stream content of a file. This link will expire in four hours and afterwards you 
   * will get 410 Gone. Content-Type of the link is determined automatically by the file's mime type.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-get_temporary_link
   
   * @param {String} path - Path in the user's Dropbox to download
   *
   * @return {Object} file temporary link
   **/
  getTemporaryLink: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/get_temporary_link')
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
   * Get a thumbnail for an image.
   * This method currently supports files with the following file extensions: 
   * jpg, jpeg, png, tiff, tif, gif and bmp. Photos that are larger than 20MB 
   * in size won't be converted to a thumbnail.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-get_get_thumbnail
   * 
   * @param {String} path - Path in the user's Dropbox to download
   * @param {String} format - The format for the thumbnail image, jpeg (default) or png. 
   * For images that are photos, jpeg should be preferred, while png is better for 
   * screenshots and digital arts. The default for this union is jpeg.
   * @param {String} size - The size for the thumbnail image. The default for this union is w64h64.
   * 
   * @return {Object} file thumbnail
   */
  getThumbnail: function (path, format, size) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/get_thumbnail')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', '{ "path": "' + path + '", "format": "' + format + '", "size": "' + size +'" }');

      console.log(res);
    });
  },

  /**
   * Returns the contents of a folder.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder
   * 
   * @param {String} path - Path in the user's Dropbox to download
   * @param {Boolean} recursive - If true, the list folder operation will be applied recursively
   * to all subfolders and the response will contain contents of all subfolders. The default for this field is False.
   * @param {Boolean} includeMediaInfo - If true, FileMetadata.media_info is set for 
   * photo and video. The default for this field is False.
   * @param {Boolean} includeDeleted - If true, DeletedMetadata will be returned for 
   * deleted file or folder, otherwise LookupError.not_found will be returned. 
   * The default for this field is False.
   * @param {Boolean} includeHasExplicitSharedMembers - If true, the results will include 
   * a flag for each file indicating whether or not that file has any explicit members. 
   * The default for this field is False.
   *
   * @return {Object} folder info
   **/
  listFolder: function (path, recursive, includeMediaInfo, includeDeleted, includeHasExplicitSharedMembers) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/list_folder')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path,
          recursive: recursive,
          include_media_info: includeMediaInfo,
          include_deleted: includeDeleted,
          include_has_explicit_shared_members: includeHasExplicitSharedMembers
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
   * Once a cursor has been retrieved from list_folder, use this to paginate
   * through all files and retrieve updates to the folder.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder-continue
   * 
   * @param {String} cursor - The cursor returned by your last call to list_folder or list_folder/continue.
   *
   * @return {Object} folder info
   **/
  listFolderContinue: function (cursor) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/list_folder/continue')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          cursor: cursor
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
   * A way to quickly get a cursor for the folder's state. Unlike list_folder, 
   * list_folder/get_latest_cursor doesn't return any entries. 
   * This endpoint is for app which only needs to know about new files and modifications
   * and doesn't need to know about files that already exist in Dropbox.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder-get_latest_cursor
   * 
   * @param {String} path - The path to the folder you want to see the contents of.
   * @param {Boolean} recursive - If true, the list folder operation will be applied recursively
   * to all subfolders and the response will contain contents of all subfolders. The default for this field is False.
   * @param {Boolean} includeMediaInfo - If true, FileMetadata.media_info is set for 
   * photo and video. The default for this field is False.
   * @param {Boolean} includeDeleted - If true, DeletedMetadata will be returned for 
   * deleted file or folder, otherwise LookupError.not_found will be returned. 
   * The default for this field is False.
   * @param {Boolean} includeHasExplicitSharedMembers - If true, the results will include 
   * a flag for each file indicating whether or not that file has any explicit members. 
   * The default for this field is False.
   * 
   * @return {Object} folder info
   **/
  listFolderGetLatestCursor: function (path, recursive, includeMediaInfo, includeDeleted, includeHasExplicitSharedMembers) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/list_folder/get_latest_cursor')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path,
          recursive: recursive,
          include_media_info: includeMediaInfo,
          include_deleted: includeDeleted,
          include_has_explicit_shared_members: includeHasExplicitSharedMembers
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
   * A longpoll endpoint to wait for changes on an account. In conjunction with 
   * list_folder/continue, this call gives you a low-latency way to monitor an account 
   * for file changes. The connection will block until there are changes available or
   * a timeout occurs. This endpoint is useful mostly for client-side apps. 
   * If you're looking for server-side notifications, check out our webhooks documentation.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder-longpoll
   * 
   * @param {String} cursor - The cursor returned by your last call to list_folder or list_folder/continue.
   * @param {int} timeout - A timeout in seconds. The request will block for at most this 
   * length of time, plus up to 90 seconds of random jitter added to avoid the thundering 
   * herd problem. Care should be taken when using this parameter, as some network 
   * infrastructure does not support long timeouts. The default for this field is 30.
   * 
   * @return {Boolean} changes - Indicates whether new changes are available. 
   * If true, call list_folder/continue to retrieve the changes.
   * @return {UInt64?} backoff - If present, backoff for at least this many seconds 
   * before calling list_folder/longpoll again. This field is optional.
   **/
  listFolderLongpoll: function (cursor, timeout) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://notify.dropboxapi.com/2/files/list_folder/longpoll')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          cursor: cursor,
          timeout: timeout
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
   * Return revisions of a file
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-list_revisions
   * 
   * @param {String} path - Path in the user's Dropbox to delete
   * @param {int} limit - The maximum number of revision entries returned. The default for this field is 10.
   * 
   * @return {Object} file revisions
   */
  listRevisions: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/list_revisions')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path,
          limit: limit
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
   * Move a file or folder to a different location in the user's Dropbox.
   * If the source path is a folder all its contents will be moved.
   *
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-move
   * 
   * @param  {String} fromPath - Path in the user's Dropbox to be copied or moved.
   * @param  {String} toPath - Path in the user's Dropbox that is the destination.
   * 
   * @return {Object} file info
   */
  move: function (fromPath, toPath) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/move')
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
  }
}