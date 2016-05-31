'use strict'

const authentication = require('./src/auth.js'),
      authApi = require('./src/api/auth.js'),
      users = require('./src/api/users.js'),
      files = require('./src/api/files.js');

module.exports = function Dropbox(config, accessToken) {
  this.config = config;
  this.accessToken = accessToken;

  if(!this.accessToken && !this.config.accessToken) {
    var auth = authentication.authenticate(this.config);

    this.generateAuthUrl = auth.generateAuthUrl;
    this.getTokenByUrl = auth.getTokenByUrl;
    this.getTokenByCode = auth.getTokenByCode;

  } else if(!config.accessToken) {
    config.accessToken = accessToken;
  }
  
  this.revokeAccessToken = authApi.revokeAccessToken;
  
  this.getAccount = users.getAccount;
  this.getAccountBatch = users.getAccountBatch;
  this.getCurrentAccount = users.getCurrentAccount;
  this.getSpaceUsage = users.getSpaceUsage;

  this.copy = files.copy;
  this.copyReferenceGet = files.copyReferenceGet;
  this.copyReferenceSave = files.copyReferenceSave;
  this.createFolder = files.createFolder;
  this.delete = files.delete;
  this.download = files.download;
  this.getMetadata = files.getMetadata;
  this.getPreview = files.getPreview;
  this.getTemporaryLink = files.getTemporaryLink;
  this.getThumbnail = files.getThumbnail;
  this.listFolder = files.listFolder;
  this.listFolderContinue = files.listFolderContinue;
  this.listFolderGetLatestCursor = files.listFolderGetLatestCursor;
  this.listFolderLongPoll = files.listFolderLongPoll;
  this.listRevisions = files.listRevisions;
  this.move = files.move
  this.permanentlyDelete = files.permanentlyDelete;
  this.restore = files.restore;
  this.saveurl = files.saveUrl;
  this.saveUrlCheckJobStatus = files.saveUrlCheckJobStatus;
  this.search = files.search;
  this.upload = files.upload;
  this.uploadSessionAppend = files.uploadSessionAppend;
  this.uploadSessionFinish = files.uploadSessionFinish;
  this.uploadSessionStart = files.uploadSessionStart;
}