'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {

  /**
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-get_temporary_link
   *
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
    var args = {};

    args.path = path;
    args.format = format;
    args.size = size;

    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/get_thumbnail')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', JSON.stringify(args));

      return res;
    });
  },

  /**
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
  },

  /**
   * @see https://www.dropbox.com/en/help/40
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-permanently_delete
   *
   * @param  {String} path - Path in the user's Dropbox to be deleted
   */
  permanentlyDelete: function (path) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/permanently_delete')
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-restore
   *
   * @param  {String} path - Path in the user's Dropbox to be deleted
   * @param  {String} rev - The revision to restore for the file.
   *
   * @return {Object} file metadata
   */
  restore: function (path, rev) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/restore')
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-save_url
   *
   * @param  {String} path - Path in the user's Dropbox to be deleted
   * @param  {String} url - The URL to be saved.
   *
   * @return SaveUrlResult (union)
   */
  saveUrl: function (path, url) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/restore')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .type('application/json')
        .send({
          path: path,
          url: url
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-save_url-check_job_status
   *
   * @param  {String} async_job_id - Id of the asynchronous job.
   * This is the value of a response returned from the method that launched the job.
   *
   * @return SaveUrlJobStatus (union)
   */
  saveUrlCheckJobStatus: function (asyncJobId) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/save_url/check_job_status')
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-search
   *
   * @param {String} path - The path in the user's Dropbox to search. Should probably be a folder.
   * @param {String} query - The string to search for. The search string is split on spaces
   * into multiple tokens. For file name searching, the last token is used for prefix
   * matching (i.e. "bat c" matches "bat cave" but not "batman car").
   * @param {UInt64} start - The starting index within the search results (used for paging).
   * The default for this field is 0.
   * @param {UInt64} maxResults - The maximum number of search results to return.
   * The default for this field is 100.
   * @param {SearchMode} mode - The search mode (filename, filename_and_content, or deleted_filename).
   * Note that searching file content is only available for Dropbox Business accounts.
   * The default for this union is filename.
   */
  saveUrlCheckJobStatus: function (path, query, start, maxResults, mode) {
    var th = this;
    return co(function *() {
      let res = yield request
        .post('https://api.dropboxapi.com/2/files/search')
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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-upload
   *
   * @param {String} path - Path in the user's Dropbox to save the file.
   * @param {WriteMode} mode - Selects what to do if the file already exists.
   * The default for this union is add.
   * @param {Boolean} autorename - If there's a conflict, as determined by mode,
   * have the Dropbox server try to autorename the file to avoid conflict.
   * The default for this field is False.client_modified Timestamp? The value to store as
   * the client_modified timestamp. Dropbox automatically records the time at which the
   * file was written to the Dropbox servers. It can also record an additional timestamp,
   * provided by Dropbox desktop clients, mobile clients, and API apps of when the file was
   * actually created or modified. This field is optional.
   * @param {Boolean} mute - Normally, users are made aware of any file modifications
   * in their Dropbox account via notifications in the client software. If true, this
   * tells the clients that this modification shouldn't result in a user notification.
   * The default for this field is False.
   *
   * @return {Object} file info
   */
  upload: function (path, mode, autorename, mute, file, clientModified) {
    var th = this;
    var args = {};

    args.path = path;
    args.mode = mode;
    args.autorename = autorename;
    args.mute = mute;

    if(clientModified) {
      args.client_modified = clientModified;
    }

    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/upload')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', JSON.stringify(args))
        .attach('file', file);

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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-append_v2
   *
   * @param {UploadSessionCursor} cursor - Contains the upload session ID and the offset.
   * @param {Boolean} close - If true, current session will be closed.
   * You cannot do upload_session/append any more to current session.
   * The default for this field is False.
   */
  uploadSessionAppend: function (cursor, close) {
    var th = this;
    var args = {};

    args.cursor = cursor;
    args.close = close;

    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/upload_session/append_v2')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', JSON.stringify(args))
        .attach('file', file);

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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-finish
   *
   * @param {UploadSessionCursor} cursor - Contains the upload session ID and the offset.
   * @param {CommitInfo} commit - Contains the path and other optional modifiers for the commit.
   *
   * @return {Object} FileMetadata
   */
  uploadSessionFinish: function (cursor, commit) {
    var th = this;
    var args = {};

    args.cursor = cursor;
    args.commit = commit;

    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/upload_session/finish')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', JSON.stringify(args))
        .attach('file', file);

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
   * @see https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-start
   *
   * @param {Boolean} close - If true, current session will be closed.
   * You cannot do upload_session/append any more to current session.
   * The default for this field is False.
   *
   * @return {String} session_id
   */
  uploadSessionStart: function (close) {
    var th = this;
    var args = {};

    args.close = close;

    return co(function *() {
      let res = yield request
        .post('https://content.dropboxapi.com/2/files/upload_session/start')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken))
        .set('Dropbox-API-Arg', JSON.stringify(args))
        .attach('file', file);

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
