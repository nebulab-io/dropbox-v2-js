(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dropbox = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./src/api/auth.js":9,"./src/api/files.js":10,"./src/api/users.js":11,"./src/auth.js":12}],2:[function(require,module,exports){

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1)

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get Content-Type even if getting
  // other headers fails.
  this.header['Content-Type'] = this.xhr.getResponseHeader('Content-Type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // Content-Type
  var ct = this.header['Content-Type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this._header['Content-Type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this._header['Content-Type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * @deprecated
 */
Response.prototype.parse = function serialize(fn){
  if (root.console) {
    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
  }
  this.serialize(fn);
  return this;
};

Response.prototype.serialize = function serialize(fn){
  this._parser = fn;
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this._header['Content-Type'];
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":4,"./request":6,"./request-base":5,"emitter":7,"reduce":8}],4:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

module.exports = isObject;

},{}],5:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {
  this._getFormData().append(name, val);
  return this;
};

},{"./is-object":4}],6:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}],7:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],8:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],9:[function(require,module,exports){
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
      let res = yield request
        .post('https://api.dropboxapi.com/2/auth/token/revoke')
        .set('Authorization', 'Bearer ' + (th.accessToken || th.config.accessToken));

        console.log(res);

      if (res.statusCode == 200) {
        return true;
      } else {
        Promise.reject(res.statusMessage);
      }
    });
  }
}
},{"co":2,"superagent":3}],10:[function(require,module,exports){
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

      console.log(res);
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
},{"co":2,"superagent":3}],11:[function(require,module,exports){
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
},{"co":2,"superagent":3}],12:[function(require,module,exports){
'use strict';

const request = require('superagent');
const co = require('co');

module.exports = {

  /**
   * Returns the object that handles Dropbox API v2 authentication
   *
   * @param  {Object} config - configurations to be sended via HTTP request
   * @return {Object}        - methods that handle authentication
   */
  authenticate: function (config) {
    return {

      /**
       * Function that returns the URL to get either the authorization code
       * or the access token, depending on the authentication flow choosed (code or token)
       *
       * @return {String}      - URL
       */
      generateAuthUrl: function () {
        return 'https://www.dropbox.com/oauth2/authorize?' +
          'client_id=' + config.client_id +
          '&response_type=' + config.response_type +
          '&redirect_uri=' + config.redirect_uri +
          '&state=' + config.state +
          '&require_role=' + (config.require_role ? config.require_role : 'personal') +
          '&force_reapprove=' + (config.force_reapprove ? config.force_reapprove : false) +
          '&disable_signup=' + (config.disable_signup ? config.disable_signup : false);
      },

      /**
       * Function that gets the access token via GET request.
       * This function should be used when using the token flow
       *
       * queryString usually is location.hash.substring(1)
       *
       * @see http://dev.mendeley.com/reference/topics/authorization_implicit.html
       *
       * @param  {String}   authUrl - URL generated by the generateAuthUrl() function
       * @param  {Function} callback
       */
      getTokenByUrl: function (queryString) {
        let params = {},
            regex = /([^&=]+)=([^&]*)/g,
            regexResult;

        while (regexResult = regex.exec(queryString)) {
          params[decodeURIComponent(regexResult[1])] = decodeURIComponent(regexResult[2]);
        }

        if(config.state == params.state) {
          config.accessToken = params.access_token;
          return params;
        } else {
          return false;
        }
      },

      /**
       * Function that gets the access token by sending the code
       * received by the user authorization in the browser
       *
       * @param  {String}   code     - Authorization Code received whn the user authorizes the app.
       * @param  {Function} callback
       */
      getTokenByCode: function (code) {
        return co(function *() {
          let res = yield request
            .post('https://api.dropboxapi.com/oauth2/token')
            .type('form')
            .send({
              code: code,
              grant_type: 'authorization_code',
              client_id: config.client_id,
              client_secret: config.client_secret,
              redirect_uri: config.redirect_uri,
            });

          if (Object.keys(res.body).length === 0) {
            res.body = JSON.parse(res.text);
          }

          if (res.body.error) {
            Promise.reject(res.body.error);
          }

          config.accessToken = res.body.access_token;
          return res.body;
        });
      }
    };
  }
};

},{"co":2,"superagent":3}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jby9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9jbGllbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9saWIvaXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL3JlcXVlc3QtYmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcmFnZW50L2xpYi9yZXF1ZXN0LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2NvbXBvbmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL3JlZHVjZS1jb21wb25lbnQvaW5kZXguanMiLCJzcmMvYXBpL2F1dGguanMiLCJzcmMvYXBpL2ZpbGVzLmpzIiwic3JjL2FwaS91c2Vycy5qcyIsInNyYy9hdXRoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3p6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGF1dGhlbnRpY2F0aW9uID0gcmVxdWlyZSgnLi9zcmMvYXV0aC5qcycpLFxuICAgICAgYXV0aEFwaSA9IHJlcXVpcmUoJy4vc3JjL2FwaS9hdXRoLmpzJyksXG4gICAgICB1c2VycyA9IHJlcXVpcmUoJy4vc3JjL2FwaS91c2Vycy5qcycpLFxuICAgICAgZmlsZXMgPSByZXF1aXJlKCcuL3NyYy9hcGkvZmlsZXMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBEcm9wYm94KGNvbmZpZywgYWNjZXNzVG9rZW4pIHtcbiAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIHRoaXMuYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbjtcblxuICBpZighdGhpcy5hY2Nlc3NUb2tlbiAmJiAhdGhpcy5jb25maWcuYWNjZXNzVG9rZW4pIHtcbiAgICB2YXIgYXV0aCA9IGF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0ZSh0aGlzLmNvbmZpZyk7XG5cbiAgICB0aGlzLmdlbmVyYXRlQXV0aFVybCA9IGF1dGguZ2VuZXJhdGVBdXRoVXJsO1xuICAgIHRoaXMuZ2V0VG9rZW5CeVVybCA9IGF1dGguZ2V0VG9rZW5CeVVybDtcbiAgICB0aGlzLmdldFRva2VuQnlDb2RlID0gYXV0aC5nZXRUb2tlbkJ5Q29kZTtcblxuICB9IGVsc2UgaWYoIWNvbmZpZy5hY2Nlc3NUb2tlbikge1xuICAgIGNvbmZpZy5hY2Nlc3NUb2tlbiA9IGFjY2Vzc1Rva2VuO1xuICB9XG4gIFxuICB0aGlzLnJldm9rZUFjY2Vzc1Rva2VuID0gYXV0aEFwaS5yZXZva2VBY2Nlc3NUb2tlbjtcbiAgXG4gIHRoaXMuZ2V0QWNjb3VudCA9IHVzZXJzLmdldEFjY291bnQ7XG4gIHRoaXMuZ2V0QWNjb3VudEJhdGNoID0gdXNlcnMuZ2V0QWNjb3VudEJhdGNoO1xuICB0aGlzLmdldEN1cnJlbnRBY2NvdW50ID0gdXNlcnMuZ2V0Q3VycmVudEFjY291bnQ7XG4gIHRoaXMuZ2V0U3BhY2VVc2FnZSA9IHVzZXJzLmdldFNwYWNlVXNhZ2U7XG5cbiAgdGhpcy5jb3B5ID0gZmlsZXMuY29weTtcbiAgdGhpcy5jb3B5UmVmZXJlbmNlR2V0ID0gZmlsZXMuY29weVJlZmVyZW5jZUdldDtcbiAgdGhpcy5jb3B5UmVmZXJlbmNlU2F2ZSA9IGZpbGVzLmNvcHlSZWZlcmVuY2VTYXZlO1xuICB0aGlzLmNyZWF0ZUZvbGRlciA9IGZpbGVzLmNyZWF0ZUZvbGRlcjtcbiAgdGhpcy5kZWxldGUgPSBmaWxlcy5kZWxldGU7XG4gIHRoaXMuZG93bmxvYWQgPSBmaWxlcy5kb3dubG9hZDtcbiAgdGhpcy5nZXRNZXRhZGF0YSA9IGZpbGVzLmdldE1ldGFkYXRhO1xuICB0aGlzLmdldFByZXZpZXcgPSBmaWxlcy5nZXRQcmV2aWV3O1xuICB0aGlzLmdldFRlbXBvcmFyeUxpbmsgPSBmaWxlcy5nZXRUZW1wb3JhcnlMaW5rO1xuICB0aGlzLmdldFRodW1ibmFpbCA9IGZpbGVzLmdldFRodW1ibmFpbDtcbiAgdGhpcy5saXN0Rm9sZGVyID0gZmlsZXMubGlzdEZvbGRlcjtcbiAgdGhpcy5saXN0Rm9sZGVyQ29udGludWUgPSBmaWxlcy5saXN0Rm9sZGVyQ29udGludWU7XG4gIHRoaXMubGlzdEZvbGRlckdldExhdGVzdEN1cnNvciA9IGZpbGVzLmxpc3RGb2xkZXJHZXRMYXRlc3RDdXJzb3I7XG4gIHRoaXMubGlzdEZvbGRlckxvbmdQb2xsID0gZmlsZXMubGlzdEZvbGRlckxvbmdQb2xsO1xuICB0aGlzLmxpc3RSZXZpc2lvbnMgPSBmaWxlcy5saXN0UmV2aXNpb25zO1xuICB0aGlzLm1vdmUgPSBmaWxlcy5tb3ZlXG4gIHRoaXMucGVybWFuZW50bHlEZWxldGUgPSBmaWxlcy5wZXJtYW5lbnRseURlbGV0ZTtcbiAgdGhpcy5yZXN0b3JlID0gZmlsZXMucmVzdG9yZTtcbiAgdGhpcy5zYXZldXJsID0gZmlsZXMuc2F2ZVVybDtcbiAgdGhpcy5zYXZlVXJsQ2hlY2tKb2JTdGF0dXMgPSBmaWxlcy5zYXZlVXJsQ2hlY2tKb2JTdGF0dXM7XG4gIHRoaXMuc2VhcmNoID0gZmlsZXMuc2VhcmNoO1xuICB0aGlzLnVwbG9hZCA9IGZpbGVzLnVwbG9hZDtcbiAgdGhpcy51cGxvYWRTZXNzaW9uQXBwZW5kID0gZmlsZXMudXBsb2FkU2Vzc2lvbkFwcGVuZDtcbiAgdGhpcy51cGxvYWRTZXNzaW9uRmluaXNoID0gZmlsZXMudXBsb2FkU2Vzc2lvbkZpbmlzaDtcbiAgdGhpcy51cGxvYWRTZXNzaW9uU3RhcnQgPSBmaWxlcy51cGxvYWRTZXNzaW9uU3RhcnQ7XG59IiwiXG4vKipcbiAqIHNsaWNlKCkgcmVmZXJlbmNlLlxuICovXG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLyoqXG4gKiBFeHBvc2UgYGNvYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvWydkZWZhdWx0J10gPSBjby5jbyA9IGNvO1xuXG4vKipcbiAqIFdyYXAgdGhlIGdpdmVuIGdlbmVyYXRvciBgZm5gIGludG8gYVxuICogZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZS5cbiAqIFRoaXMgaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiBzbyB0aGF0XG4gKiBldmVyeSBgY28oKWAgY2FsbCBkb2Vzbid0IGNyZWF0ZSBhIG5ldyxcbiAqIHVubmVjZXNzYXJ5IGNsb3N1cmUuXG4gKlxuICogQHBhcmFtIHtHZW5lcmF0b3JGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5jby53cmFwID0gZnVuY3Rpb24gKGZuKSB7XG4gIGNyZWF0ZVByb21pc2UuX19nZW5lcmF0b3JGdW5jdGlvbl9fID0gZm47XG4gIHJldHVybiBjcmVhdGVQcm9taXNlO1xuICBmdW5jdGlvbiBjcmVhdGVQcm9taXNlKCkge1xuICAgIHJldHVybiBjby5jYWxsKHRoaXMsIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBvciBhIGdlbmVyYXRvclxuICogYW5kIHJldHVybiBhIHByb21pc2UuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNvKGdlbikge1xuICB2YXIgY3R4ID0gdGhpcztcbiAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcblxuICAvLyB3ZSB3cmFwIGV2ZXJ5dGhpbmcgaW4gYSBwcm9taXNlIHRvIGF2b2lkIHByb21pc2UgY2hhaW5pbmcsXG4gIC8vIHdoaWNoIGxlYWRzIHRvIG1lbW9yeSBsZWFrIGVycm9ycy5cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90ai9jby9pc3N1ZXMvMTgwXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAodHlwZW9mIGdlbiA9PT0gJ2Z1bmN0aW9uJykgZ2VuID0gZ2VuLmFwcGx5KGN0eCwgYXJncyk7XG4gICAgaWYgKCFnZW4gfHwgdHlwZW9mIGdlbi5uZXh0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gcmVzb2x2ZShnZW4pO1xuXG4gICAgb25GdWxmaWxsZWQoKTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7TWl4ZWR9IHJlc1xuICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChyZXMpIHtcbiAgICAgIHZhciByZXQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXQgPSBnZW4ubmV4dChyZXMpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgbmV4dChyZXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBvblJlamVjdGVkKGVycikge1xuICAgICAgdmFyIHJldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGdlbi50aHJvdyhlcnIpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgbmV4dChyZXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgbmV4dCB2YWx1ZSBpbiB0aGUgZ2VuZXJhdG9yLFxuICAgICAqIHJldHVybiBhIHByb21pc2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcmV0XG4gICAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIG5leHQocmV0KSB7XG4gICAgICBpZiAocmV0LmRvbmUpIHJldHVybiByZXNvbHZlKHJldC52YWx1ZSk7XG4gICAgICB2YXIgdmFsdWUgPSB0b1Byb21pc2UuY2FsbChjdHgsIHJldC52YWx1ZSk7XG4gICAgICBpZiAodmFsdWUgJiYgaXNQcm9taXNlKHZhbHVlKSkgcmV0dXJuIHZhbHVlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpO1xuICAgICAgcmV0dXJuIG9uUmVqZWN0ZWQobmV3IFR5cGVFcnJvcignWW91IG1heSBvbmx5IHlpZWxkIGEgZnVuY3Rpb24sIHByb21pc2UsIGdlbmVyYXRvciwgYXJyYXksIG9yIG9iamVjdCwgJ1xuICAgICAgICArICdidXQgdGhlIGZvbGxvd2luZyBvYmplY3Qgd2FzIHBhc3NlZDogXCInICsgU3RyaW5nKHJldC52YWx1ZSkgKyAnXCInKSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgYHlpZWxkYGVkIHZhbHVlIGludG8gYSBwcm9taXNlLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvUHJvbWlzZShvYmopIHtcbiAgaWYgKCFvYmopIHJldHVybiBvYmo7XG4gIGlmIChpc1Byb21pc2Uob2JqKSkgcmV0dXJuIG9iajtcbiAgaWYgKGlzR2VuZXJhdG9yRnVuY3Rpb24ob2JqKSB8fCBpc0dlbmVyYXRvcihvYmopKSByZXR1cm4gY28uY2FsbCh0aGlzLCBvYmopO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygb2JqKSByZXR1cm4gdGh1bmtUb1Byb21pc2UuY2FsbCh0aGlzLCBvYmopO1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSByZXR1cm4gYXJyYXlUb1Byb21pc2UuY2FsbCh0aGlzLCBvYmopO1xuICBpZiAoaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iamVjdFRvUHJvbWlzZS5jYWxsKHRoaXMsIG9iaik7XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHRodW5rIHRvIGEgcHJvbWlzZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRodW5rVG9Qcm9taXNlKGZuKSB7XG4gIHZhciBjdHggPSB0aGlzO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZuLmNhbGwoY3R4LCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikgcmVzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgcmVzb2x2ZShyZXMpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGFuIGFycmF5IG9mIFwieWllbGRhYmxlc1wiIHRvIGEgcHJvbWlzZS5cbiAqIFVzZXMgYFByb21pc2UuYWxsKClgIGludGVybmFsbHkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gb2JqXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXJyYXlUb1Byb21pc2Uob2JqKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChvYmoubWFwKHRvUHJvbWlzZSwgdGhpcykpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gb2JqZWN0IG9mIFwieWllbGRhYmxlc1wiIHRvIGEgcHJvbWlzZS5cbiAqIFVzZXMgYFByb21pc2UuYWxsKClgIGludGVybmFsbHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvUHJvbWlzZShvYmope1xuICB2YXIgcmVzdWx0cyA9IG5ldyBvYmouY29uc3RydWN0b3IoKTtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIHByb21pc2UgPSB0b1Byb21pc2UuY2FsbCh0aGlzLCBvYmpba2V5XSk7XG4gICAgaWYgKHByb21pc2UgJiYgaXNQcm9taXNlKHByb21pc2UpKSBkZWZlcihwcm9taXNlLCBrZXkpO1xuICAgIGVsc2UgcmVzdWx0c1trZXldID0gb2JqW2tleV07XG4gIH1cbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZGVmZXIocHJvbWlzZSwga2V5KSB7XG4gICAgLy8gcHJlZGVmaW5lIHRoZSBrZXkgaW4gdGhlIHJlc3VsdFxuICAgIHJlc3VsdHNba2V5XSA9IHVuZGVmaW5lZDtcbiAgICBwcm9taXNlcy5wdXNoKHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICByZXN1bHRzW2tleV0gPSByZXM7XG4gICAgfSkpO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBwcm9taXNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqKSB7XG4gIHJldHVybiAnZnVuY3Rpb24nID09IHR5cGVvZiBvYmoudGhlbjtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGdlbmVyYXRvci5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0dlbmVyYXRvcihvYmopIHtcbiAgcmV0dXJuICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai5uZXh0ICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai50aHJvdztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNHZW5lcmF0b3JGdW5jdGlvbihvYmopIHtcbiAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICBpZiAoIWNvbnN0cnVjdG9yKSByZXR1cm4gZmFsc2U7XG4gIGlmICgnR2VuZXJhdG9yRnVuY3Rpb24nID09PSBjb25zdHJ1Y3Rvci5uYW1lIHx8ICdHZW5lcmF0b3JGdW5jdGlvbicgPT09IGNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGlzR2VuZXJhdG9yKGNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgZm9yIHBsYWluIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIE9iamVjdCA9PSB2YWwuY29uc3RydWN0b3I7XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmVkdWNlJyk7XG52YXIgcmVxdWVzdEJhc2UgPSByZXF1aXJlKCcuL3JlcXVlc3QtYmFzZScpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pcy1vYmplY3QnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdDtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgeyAvLyBCcm93c2VyIHdpbmRvd1xuICByb290ID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn0gZWxzZSB7IC8vIE90aGVyIGVudmlyb25tZW50c1xuICByb290ID0gdGhpcztcbn1cblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKXt9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgaG9zdCBvYmplY3QsXG4gKiB3ZSBkb24ndCB3YW50IHRvIHNlcmlhbGl6ZSB0aGVzZSA6KVxuICpcbiAqIFRPRE86IGZ1dHVyZSBwcm9vZiwgbW92ZSB0byBjb21wb2VudCBsYW5kXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzSG9zdChvYmopIHtcbiAgdmFyIHN0ciA9IHt9LnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBzd2l0Y2ggKHN0cikge1xuICAgIGNhc2UgJ1tvYmplY3QgRmlsZV0nOlxuICAgIGNhc2UgJ1tvYmplY3QgQmxvYl0nOlxuICAgIGNhc2UgJ1tvYmplY3QgRm9ybURhdGFdJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbnZhciByZXF1ZXN0ID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3JlcXVlc3QnKS5iaW5kKG51bGwsIFJlcXVlc3QpO1xuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCBvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWwpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIHJldHVybiB2YWwuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9KTtcbiAgfVxuICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsKSk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgcmV0dXJuIC9bXFwvK11qc29uXFxiLy50ZXN0KG1pbWUpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9ICgodGhpcy5yZXEubWV0aG9kICE9J0hFQUQnICYmICh0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnKSkgfHwgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgIDogbnVsbDtcbiAgdGhpcy5zdGF0dXNUZXh0ID0gdGhpcy5yZXEueGhyLnN0YXR1c1RleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgQ29udGVudC1UeXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnQ29udGVudC1UeXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBDb250ZW50LVR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ0NvbnRlbnQtVHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIGlmICghcGFyc2UgJiYgaXNKU09OKHRoaXMudHlwZSkpIHtcbiAgICBwYXJzZSA9IHJlcXVlc3QucGFyc2VbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgfVxuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307IC8vIHByZXNlcnZlcyBoZWFkZXIgbmFtZSBjYXNlXG4gIHRoaXMuX2hlYWRlciA9IHt9OyAvLyBjb2VyY2VzIGhlYWRlciBuYW1lcyB0byBsb3dlcmNhc2VcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgZXJyID0gbnVsbDtcbiAgICB2YXIgcmVzID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICByZXMgPSBuZXcgUmVzcG9uc2Uoc2VsZik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZTtcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBlcnIucmF3UmVzcG9uc2UgPSBzZWxmLnhociAmJiBzZWxmLnhoci5yZXNwb25zZVRleHQgPyBzZWxmLnhoci5yZXNwb25zZVRleHQgOiBudWxsO1xuICAgICAgLy8gaXNzdWUgIzg3NjogcmV0dXJuIHRoZSBodHRwIHN0YXR1cyBjb2RlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBlcnIuc3RhdHVzQ29kZSA9IHNlbGYueGhyICYmIHNlbGYueGhyLnN0YXR1cyA/IHNlbGYueGhyLnN0YXR1cyA6IG51bGw7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgdmFyIG5ld19lcnIgPSBuZXcgRXJyb3IocmVzLnN0YXR1c1RleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJyk7XG4gICAgbmV3X2Vyci5vcmlnaW5hbCA9IGVycjtcbiAgICBuZXdfZXJyLnJlc3BvbnNlID0gcmVzO1xuICAgIG5ld19lcnIuc3RhdHVzID0gcmVzLnN0YXR1cztcblxuICAgIHNlbGYuY2FsbGJhY2sobmV3X2VyciwgcmVzKTtcbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgIGFuZCBgcmVxdWVzdEJhc2VgLlxuICovXG5cbkVtaXR0ZXIoUmVxdWVzdC5wcm90b3R5cGUpO1xuZm9yICh2YXIga2V5IGluIHJlcXVlc3RCYXNlKSB7XG4gIFJlcXVlc3QucHJvdG90eXBlW2tleV0gPSByZXF1ZXN0QmFzZVtrZXldO1xufVxuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCByZXNwb25zZVR5cGUgdG8gYHZhbGAuIFByZXNlbnRseSB2YWxpZCByZXNwb25zZVR5cGVzIGFyZSAnYmxvYicgYW5kIFxuICogJ2FycmF5YnVmZmVyJy5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5yZXNwb25zZVR5cGUoJ2Jsb2InKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5yZXNwb25zZVR5cGUgPSBmdW5jdGlvbih2YWwpe1xuICB0aGlzLl9yZXNwb25zZVR5cGUgPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nIG9yICdiYXNpYycgKGRlZmF1bHQgJ2Jhc2ljJylcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcywgb3B0aW9ucyl7XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0eXBlOiAnYmFzaWMnXG4gICAgfVxuICB9XG5cbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgICBicmVhaztcblxuICAgIGNhc2UgJ2F1dG8nOlxuICAgICAgdGhpcy51c2VybmFtZSA9IHVzZXI7XG4gICAgICB0aGlzLnBhc3N3b3JkID0gcGFzcztcbiAgICBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBmaWxlbmFtZWAuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuYXR0YWNoKG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSl7XG4gIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKGZpZWxkLCBmaWxlLCBmaWxlbmFtZSB8fCBmaWxlLm5hbWUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9nZXRGb3JtRGF0YSA9IGZ1bmN0aW9uKCl7XG4gIGlmICghdGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2Zvcm1EYXRhO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCBhcyB0aGUgcmVxdWVzdCBib2R5LCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0nKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5faGVhZGVyWydDb250ZW50LVR5cGUnXTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLl9oZWFkZXJbJ0NvbnRlbnQtVHlwZSddO1xuICAgIGlmICgnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyA9PSB0eXBlKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YVxuICAgICAgICA/IHRoaXMuX2RhdGEgKyAnJicgKyBkYXRhXG4gICAgICAgIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFvYmogfHwgaXNIb3N0KGRhdGEpKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHNlcmlhbGl6ZShmbil7XG4gIGlmIChyb290LmNvbnNvbGUpIHtcbiAgICBjb25zb2xlLndhcm4oXCJDbGllbnQtc2lkZSBwYXJzZSgpIG1ldGhvZCBoYXMgYmVlbiByZW5hbWVkIHRvIHNlcmlhbGl6ZSgpLiBUaGlzIG1ldGhvZCBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHN1cGVyYWdlbnQgdjIuMFwiKTtcbiAgfVxuICB0aGlzLnNlcmlhbGl6ZShmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVzcG9uc2UucHJvdG90eXBlLnNlcmlhbGl6ZSA9IGZ1bmN0aW9uIHNlcmlhbGl6ZShmbil7XG4gIHRoaXMuX3BhcnNlciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcyl7XG4gIHZhciBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICBmbihlcnIsIHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGhhcyBiZWVuIHRlcm1pbmF0ZWRcXG5Qb3NzaWJsZSBjYXVzZXM6IHRoZSBuZXR3b3JrIGlzIG9mZmxpbmUsIE9yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4sIHRoZSBwYWdlIGlzIGJlaW5nIHVubG9hZGVkLCBldGMuJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICB2YXIgc3RhdHVzO1xuICAgIHRyeSB7IHN0YXR1cyA9IHhoci5zdGF0dXMgfSBjYXRjaChlKSB7IHN0YXR1cyA9IDA7IH1cblxuICAgIGlmICgwID09IHN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQpIHJldHVybiBzZWxmLnRpbWVvdXRFcnJvcigpO1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9O1xuXG4gIC8vIHByb2dyZXNzXG4gIHZhciBoYW5kbGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgIGlmIChlLnRvdGFsID4gMCkge1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgIH1cbiAgICBlLmRpcmVjdGlvbiA9ICdkb3dubG9hZCc7XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgaWYgKHRoaXMudXNlcm5hbWUgJiYgdGhpcy5wYXNzd29yZCkge1xuICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSwgdGhpcy51c2VybmFtZSwgdGhpcy5wYXNzd29yZCk7XG4gIH0gZWxzZSB7XG4gICAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcbiAgfVxuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoJ0dFVCcgIT0gdGhpcy5tZXRob2QgJiYgJ0hFQUQnICE9IHRoaXMubWV0aG9kICYmICdzdHJpbmcnICE9IHR5cGVvZiBkYXRhICYmICFpc0hvc3QoZGF0YSkpIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICB2YXIgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ0NvbnRlbnQtVHlwZSddO1xuICAgIHZhciBzZXJpYWxpemUgPSB0aGlzLl9wYXJzZXIgfHwgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXNwb25zZVR5cGUpIHtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gdGhpcy5fcmVzcG9uc2VUeXBlO1xuICB9XG5cbiAgLy8gc2VuZCBzdHVmZlxuICB0aGlzLmVtaXQoJ3JlcXVlc3QnLCB0aGlzKTtcblxuICAvLyBJRTExIHhoci5zZW5kKHVuZGVmaW5lZCkgc2VuZHMgJ3VuZGVmaW5lZCcgc3RyaW5nIGFzIFBPU1QgcGF5bG9hZCAoaW5zdGVhZCBvZiBub3RoaW5nKVxuICAvLyBXZSBuZWVkIG51bGwgaGVyZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICB4aHIuc2VuZCh0eXBlb2YgZGF0YSAhPT0gJ3VuZGVmaW5lZCcgPyBkYXRhIDogbnVsbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdGAuXG4gKi9cblxucmVxdWVzdC5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBHRVQgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5xdWVyeShkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogSEVBRCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxucmVxdWVzdFsnZGVsJ10gPSBkZWw7XG5yZXF1ZXN0WydkZWxldGUnXSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcbiIsIi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG51bGwgIT0gb2JqICYmICdvYmplY3QnID09IHR5cGVvZiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIE1vZHVsZSBvZiBtaXhlZC1pbiBmdW5jdGlvbnMgc2hhcmVkIGJldHdlZW4gbm9kZSBhbmQgY2xpZW50IGNvZGVcbiAqL1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pcy1vYmplY3QnKTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uIF9jbGVhclRpbWVvdXQoKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBGb3JjZSBnaXZlbiBwYXJzZXJcbiAqXG4gKiBTZXRzIHRoZSBib2R5IHBhcnNlciBubyBtYXR0ZXIgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UoZm4pe1xuICB0aGlzLl9wYXJzZXIgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50aW1lb3V0ID0gZnVuY3Rpb24gdGltZW91dChtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEZhdXggcHJvbWlzZSBzdXBwb3J0XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICovXG5cbmV4cG9ydHMudGhlbiA9IGZ1bmN0aW9uIHRoZW4oZnVsZmlsbCwgcmVqZWN0KSB7XG4gIHJldHVybiB0aGlzLmVuZChmdW5jdGlvbihlcnIsIHJlcykge1xuICAgIGVyciA/IHJlamVjdChlcnIpIDogZnVsZmlsbChyZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuZXhwb3J0cy51c2UgPSBmdW5jdGlvbiB1c2UoZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG5cbi8qKlxuICogR2V0IHJlcXVlc3QgaGVhZGVyIGBmaWVsZGAuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKiBUaGlzIGlzIGEgZGVwcmVjYXRlZCBpbnRlcm5hbCBBUEkuIFVzZSBgLmdldChmaWVsZClgIGluc3RlYWQuXG4gKlxuICogKGdldEhlYWRlciBpcyBubyBsb25nZXIgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBzdXBlcmFnZW50IGNvZGUgYmFzZSlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICogQGRlcHJlY2F0ZWRcbiAqL1xuXG5leHBvcnRzLmdldEhlYWRlciA9IGV4cG9ydHMuZ2V0O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKi9cbmV4cG9ydHMudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCJcbiAqIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd8QmxvYnxGaWxlfEJ1ZmZlcnxmcy5SZWFkU3RyZWFtfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0cy5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCIvLyBUaGUgbm9kZSBhbmQgYnJvd3NlciBtb2R1bGVzIGV4cG9zZSB2ZXJzaW9ucyBvZiB0aGlzIHdpdGggdGhlXG4vLyBhcHByb3ByaWF0ZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBib3VuZCBhcyBmaXJzdCBhcmd1bWVudFxuLyoqXG4gKiBJc3N1ZSBhIHJlcXVlc3Q6XG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgcmVxdWVzdCgnR0VUJywgJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycpLmVuZChjYWxsYmFjaylcbiAqICAgIHJlcXVlc3QoJy91c2VycycsIGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSB1cmwgb3IgY2FsbGJhY2tcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVlc3QoUmVxdWVzdENvbnN0cnVjdG9yLCBtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0Q29uc3RydWN0b3IoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKDIgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdENvbnN0cnVjdG9yKCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXF1ZXN0Q29uc3RydWN0b3IobWV0aG9kLCB1cmwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVlc3Q7XG4iLCJcclxuLyoqXHJcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXHJcbiAqXHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcclxuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXHJcbiAqIEByZXR1cm4ge09iamVjdH1cclxuICogQGFwaSBwcml2YXRlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XHJcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XHJcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBvYmo7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxyXG4gKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XHJcbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICAodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pXHJcbiAgICAucHVzaChmbik7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXHJcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxyXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuXHJcbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xyXG4gIGZ1bmN0aW9uIG9uKCkge1xyXG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKTtcclxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBvbi5mbiA9IGZuO1xyXG4gIHRoaXMub24oZXZlbnQsIG9uKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxyXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXHJcbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cclxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxyXG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcclxuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XHJcblxyXG4gIC8vIGFsbFxyXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyBzcGVjaWZpYyBldmVudFxyXG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcclxuXHJcbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xyXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcclxuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxyXG4gIHZhciBjYjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY2IgPSBjYWxsYmFja3NbaV07XHJcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xyXG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcGFyYW0ge01peGVkfSAuLi5cclxuICogQHJldHVybiB7RW1pdHRlcn1cclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcclxuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxyXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO1xyXG5cclxuICBpZiAoY2FsbGJhY2tzKSB7XHJcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxyXG4gKiBAcmV0dXJuIHtBcnJheX1cclxuICogQGFwaSBwdWJsaWNcclxuICovXHJcblxyXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XHJcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xyXG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cclxuICpcclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAqIEBhcGkgcHVibGljXHJcbiAqL1xyXG5cclxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xyXG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xyXG59O1xyXG4iLCJcbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKTtcbmNvbnN0IGNvID0gcmVxdWlyZSgnY28nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7ICAgICAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHJldm9rZXMgdGhlIGFjY2VzcyBmb3IgdGhlIGN1cnJlbnQgdG9rZW4gYXZhaWxhYmxlLlxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBcbiAgICogQHJldHVybiB7Qm9vbGVhbiB8fCBTdHJpbmd9IHJldHVybnMgdHJ1ZSBpZiBpdCB3b3JrcyBvciB0aGUgc3RhdHVzIG1lc3NhZ2UgaWYgbm90LlxuICAgKi9cbiAgcmV2b2tlQWNjZXNzVG9rZW46IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvYXV0aC90b2tlbi9yZXZva2UnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG5cbiAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PSAyMDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuc3RhdHVzTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5jb25zdCBjbyA9IHJlcXVpcmUoJ2NvJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtY29weVxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBmcm9tUGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGJlIGNvcGllZCBvciBtb3ZlZC5cbiAgICogQHBhcmFtICB7U3RyaW5nfSB0b1BhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0aGF0IGlzIHRoZSBkZXN0aW5hdGlvbi5cbiAgICogQHJldHVybiB7T2JqZWN0fSBmaWxlIGluZm9cbiAgICovXG4gIGNvcHk6IGZ1bmN0aW9uIChmcm9tUGF0aCwgdG9QYXRoKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL2NvcHknKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIGZyb21fcGF0aDogZnJvbVBhdGgsXG4gICAgICAgICAgdG9fcGF0aDogdG9QYXRoXG4gICAgICAgIH0pO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocmVzLmJvZHkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzLmJvZHkuZXJyb3IpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vZGV2ZWxvcGVycy9kb2N1bWVudGF0aW9uL2h0dHAvZG9jdW1lbnRhdGlvbiNmaWxlcy1jb3B5X3JlZmVyZW5jZS1nZXRcbiAgICogXG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBmaWxlIG9yIGZvbGRlciB5b3Ugd2FudCB0byBnZXQgYSBjb3B5IHJlZmVyZW5jZSB0by5cbiAgICogQHJldHVybiB7T2JqZWN0fSBjb250YWluaW5nIGZpbGUgbWV0YWRhdGEsIGNvcHlfcmVmZXJlbmNlIGFuZCBleHBpcmVzXG4gICAqL1xuICBjb3B5UmVmZXJlbmNlR2V0OiBmdW5jdGlvbiAocGF0aCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9jb3B5X3JlZmVyZW5jZS9nZXQnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGhcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLWNvcHlfcmVmZXJlbmNlLXNhdmVcbiAgICogXG4gICAqIEBwYXJhbSAge1N0cmluZ30gY29weVJlZmVyZW5jZSAtIEEgY29weSByZWZlcmVuY2UgcmV0dXJuZWQgYnkgY29weV9yZWZlcmVuY2UvZ2V0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gcGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRoYXQgaXMgdGhlIGRlc3RpbmF0aW9uXG4gICAqIEByZXR1cm4ge09iamVjdH0gY29udGFpbmluZyBmaWxlIG1ldGFkYXRhXG4gICAqL1xuICBjb3B5UmVmZXJlbmNlU2F2ZTogZnVuY3Rpb24gKGNvcHlSZWZlcmVuY2UsIHBhdGgpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvY29weV9yZWZlcmVuY2Uvc2F2ZScpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtY3JlYXRlX2ZvbGRlclxuICAgKiBcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBjcmVhdGVcbiAgICogQHJldHVybiB7T2JqZWN0fSBmaWxlIGluZm9cbiAgICovXG4gIGNyZWF0ZUZvbGRlcjogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvY3JlYXRlX2ZvbGRlcicpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtZGVsZXRlXG4gICAqIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGRlbGV0ZVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZpbGUgaW5mb1xuICAgKi9cbiAgZGVsZXRlOiBmdW5jdGlvbiAocGF0aCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9kZWxldGUnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGhcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLWRvd25sb2FkXG4gICAqIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGRvd25sb2FkXG4gICAqIEByZXR1cm4ge09iamVjdH0gZmlsZSBpbmZvXG4gICAqL1xuICBkb3dubG9hZDogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vY29udGVudC5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL2Rvd25sb2FkJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAuc2V0KCdEcm9wYm94LUFQSS1BcmcnLCAneyBcInBhdGhcIjogXCInICsgcGF0aCArICdcIiB9Jyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vZGV2ZWxvcGVycy9kb2N1bWVudGF0aW9uL2h0dHAvZG9jdW1lbnRhdGlvbiNmaWxlcy1nZXRfbWV0YWRhdGFcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBkb3dubG9hZCAgICogXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZU1lZGlhSW5mbyAtIElmIHRydWUsIEZpbGVNZXRhZGF0YS5tZWRpYV9pbmZvIGlzIHNldCBmb3IgXG4gICAqIHBob3RvIGFuZCB2aWRlby4gVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZURlbGV0ZWQgLSBJZiB0cnVlLCBEZWxldGVkTWV0YWRhdGEgd2lsbCBiZSByZXR1cm5lZCBmb3IgXG4gICAqIGRlbGV0ZWQgZmlsZSBvciBmb2xkZXIsIG90aGVyd2lzZSBMb29rdXBFcnJvci5ub3RfZm91bmQgd2lsbCBiZSByZXR1cm5lZC4gXG4gICAqIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIEZhbHNlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGluY2x1ZGVIYXNFeHBsaWNpdFNoYXJlZE1lbWJlcnMgLSBJZiB0cnVlLCB0aGUgcmVzdWx0cyB3aWxsIGluY2x1ZGUgXG4gICAqIGEgZmxhZyBmb3IgZWFjaCBmaWxlIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgdGhhdCBmaWxlIGhhcyBhbnkgZXhwbGljaXQgbWVtYmVycy4gXG4gICAqIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIEZhbHNlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZpbGUgb3IgZm9sZGVyIG1ldGFkYXRhXG4gICAqKi9cbiAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uIChwYXRoLCBpbmNsdWRlTWVkaWFJbmZvLCBpbmNsdWRlRGVsZXRlZCwgaW5jbHVkZUhhc0V4cGxpY2l0U2hhcmVkTWVtYmVycykge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9nZXRfbWV0YWRhdGEnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgaW5jbHVkZV9tZWRpYV9pbmZvOiBpbmNsdWRlTWVkaWFJbmZvLFxuICAgICAgICAgIGluY2x1ZGVfZGVsZXRlZDogaW5jbHVkZURlbGV0ZWQsXG4gICAgICAgICAgaW5jbHVkZV9oYXNfZXhwbGljaXRfc2hhcmVkX21lbWJlcnM6IGluY2x1ZGVIYXNFeHBsaWNpdFNoYXJlZE1lbWJlcnNcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLWdldF9wcmV2aWV3XG4gICAqIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGRvd25sb2FkXG4gICAqIEByZXR1cm4ge09iamVjdH0gZmlsZSBwcmV2aWV3XG4gICAqL1xuICBnZXRQcmV2aWV3OiBmdW5jdGlvbiAocGF0aCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9jb250ZW50LmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvZ2V0X3ByZXZpZXcnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC5zZXQoJ0Ryb3Bib3gtQVBJLUFyZycsICd7IFwicGF0aFwiOiBcIicgKyBwYXRoICsgJ1wiIH0nKTtcblxuICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLWdldF90ZW1wb3JhcnlfbGlua1xuICAgKiAgIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGRvd25sb2FkXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gZmlsZSB0ZW1wb3JhcnkgbGlua1xuICAgKiovXG4gIGdldFRlbXBvcmFyeUxpbms6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL2dldF90ZW1wb3JhcnlfbGluaycpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtZ2V0X2dldF90aHVtYm5haWxcbiAgICogXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gUGF0aCBpbiB0aGUgdXNlcidzIERyb3Bib3ggdG8gZG93bmxvYWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZvcm1hdCAtIFRoZSBmb3JtYXQgZm9yIHRoZSB0aHVtYm5haWwgaW1hZ2UsIGpwZWcgKGRlZmF1bHQpIG9yIHBuZy4gXG4gICAqIEZvciBpbWFnZXMgdGhhdCBhcmUgcGhvdG9zLCBqcGVnIHNob3VsZCBiZSBwcmVmZXJyZWQsIHdoaWxlIHBuZyBpcyBiZXR0ZXIgZm9yIFxuICAgKiBzY3JlZW5zaG90cyBhbmQgZGlnaXRhbCBhcnRzLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyB1bmlvbiBpcyBqcGVnLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIFRoZSBzaXplIGZvciB0aGUgdGh1bWJuYWlsIGltYWdlLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyB1bmlvbiBpcyB3NjRoNjQuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZpbGUgdGh1bWJuYWlsXG4gICAqL1xuICBnZXRUaHVtYm5haWw6IGZ1bmN0aW9uIChwYXRoLCBmb3JtYXQsIHNpemUpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHZhciBhcmdzID0ge307XG5cbiAgICBhcmdzLnBhdGggPSBwYXRoO1xuICAgIGFyZ3MuZm9ybWF0ID0gZm9ybWF0O1xuICAgIGFyZ3Muc2l6ZSA9IHNpemU7XG5cbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2NvbnRlbnQuZHJvcGJveGFwaS5jb20vMi9maWxlcy9nZXRfdGh1bWJuYWlsJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAuc2V0KCdEcm9wYm94LUFQSS1BcmcnLCBKU09OLnN0cmluZ2lmeShhcmdzKSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vZGV2ZWxvcGVycy9kb2N1bWVudGF0aW9uL2h0dHAvZG9jdW1lbnRhdGlvbiNmaWxlcy1saXN0X2ZvbGRlclxuICAgKiBcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBkb3dubG9hZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlY3Vyc2l2ZSAtIElmIHRydWUsIHRoZSBsaXN0IGZvbGRlciBvcGVyYXRpb24gd2lsbCBiZSBhcHBsaWVkIHJlY3Vyc2l2ZWx5XG4gICAqIHRvIGFsbCBzdWJmb2xkZXJzIGFuZCB0aGUgcmVzcG9uc2Ugd2lsbCBjb250YWluIGNvbnRlbnRzIG9mIGFsbCBzdWJmb2xkZXJzLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyBGYWxzZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpbmNsdWRlTWVkaWFJbmZvIC0gSWYgdHJ1ZSwgRmlsZU1ldGFkYXRhLm1lZGlhX2luZm8gaXMgc2V0IGZvciBcbiAgICogcGhvdG8gYW5kIHZpZGVvLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyBGYWxzZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpbmNsdWRlRGVsZXRlZCAtIElmIHRydWUsIERlbGV0ZWRNZXRhZGF0YSB3aWxsIGJlIHJldHVybmVkIGZvciBcbiAgICogZGVsZXRlZCBmaWxlIG9yIGZvbGRlciwgb3RoZXJ3aXNlIExvb2t1cEVycm9yLm5vdF9mb3VuZCB3aWxsIGJlIHJldHVybmVkLiBcbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUhhc0V4cGxpY2l0U2hhcmVkTWVtYmVycyAtIElmIHRydWUsIHRoZSByZXN1bHRzIHdpbGwgaW5jbHVkZSBcbiAgICogYSBmbGFnIGZvciBlYWNoIGZpbGUgaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCB0aGF0IGZpbGUgaGFzIGFueSBleHBsaWNpdCBtZW1iZXJzLiBcbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gZm9sZGVyIGluZm9cbiAgICoqL1xuICBsaXN0Rm9sZGVyOiBmdW5jdGlvbiAocGF0aCwgcmVjdXJzaXZlLCBpbmNsdWRlTWVkaWFJbmZvLCBpbmNsdWRlRGVsZXRlZCwgaW5jbHVkZUhhc0V4cGxpY2l0U2hhcmVkTWVtYmVycykge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9saXN0X2ZvbGRlcicpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICByZWN1cnNpdmU6IHJlY3Vyc2l2ZSxcbiAgICAgICAgICBpbmNsdWRlX21lZGlhX2luZm86IGluY2x1ZGVNZWRpYUluZm8sXG4gICAgICAgICAgaW5jbHVkZV9kZWxldGVkOiBpbmNsdWRlRGVsZXRlZCxcbiAgICAgICAgICBpbmNsdWRlX2hhc19leHBsaWNpdF9zaGFyZWRfbWVtYmVyczogaW5jbHVkZUhhc0V4cGxpY2l0U2hhcmVkTWVtYmVyc1xuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtbGlzdF9mb2xkZXItY29udGludWVcbiAgICogXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjdXJzb3IgLSBUaGUgY3Vyc29yIHJldHVybmVkIGJ5IHlvdXIgbGFzdCBjYWxsIHRvIGxpc3RfZm9sZGVyIG9yIGxpc3RfZm9sZGVyL2NvbnRpbnVlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZvbGRlciBpbmZvXG4gICAqKi9cbiAgbGlzdEZvbGRlckNvbnRpbnVlOiBmdW5jdGlvbiAoY3Vyc29yKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL2xpc3RfZm9sZGVyL2NvbnRpbnVlJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIC5zZW5kKHtcbiAgICAgICAgICBjdXJzb3I6IGN1cnNvclxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtbGlzdF9mb2xkZXItZ2V0X2xhdGVzdF9jdXJzb3JcbiAgICogXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gVGhlIHBhdGggdG8gdGhlIGZvbGRlciB5b3Ugd2FudCB0byBzZWUgdGhlIGNvbnRlbnRzIG9mLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHJlY3Vyc2l2ZSAtIElmIHRydWUsIHRoZSBsaXN0IGZvbGRlciBvcGVyYXRpb24gd2lsbCBiZSBhcHBsaWVkIHJlY3Vyc2l2ZWx5XG4gICAqIHRvIGFsbCBzdWJmb2xkZXJzIGFuZCB0aGUgcmVzcG9uc2Ugd2lsbCBjb250YWluIGNvbnRlbnRzIG9mIGFsbCBzdWJmb2xkZXJzLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyBGYWxzZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpbmNsdWRlTWVkaWFJbmZvIC0gSWYgdHJ1ZSwgRmlsZU1ldGFkYXRhLm1lZGlhX2luZm8gaXMgc2V0IGZvciBcbiAgICogcGhvdG8gYW5kIHZpZGVvLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyBGYWxzZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBpbmNsdWRlRGVsZXRlZCAtIElmIHRydWUsIERlbGV0ZWRNZXRhZGF0YSB3aWxsIGJlIHJldHVybmVkIGZvciBcbiAgICogZGVsZXRlZCBmaWxlIG9yIGZvbGRlciwgb3RoZXJ3aXNlIExvb2t1cEVycm9yLm5vdF9mb3VuZCB3aWxsIGJlIHJldHVybmVkLiBcbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUhhc0V4cGxpY2l0U2hhcmVkTWVtYmVycyAtIElmIHRydWUsIHRoZSByZXN1bHRzIHdpbGwgaW5jbHVkZSBcbiAgICogYSBmbGFnIGZvciBlYWNoIGZpbGUgaW5kaWNhdGluZyB3aGV0aGVyIG9yIG5vdCB0aGF0IGZpbGUgaGFzIGFueSBleHBsaWNpdCBtZW1iZXJzLiBcbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZvbGRlciBpbmZvXG4gICAqKi9cbiAgbGlzdEZvbGRlckdldExhdGVzdEN1cnNvcjogZnVuY3Rpb24gKHBhdGgsIHJlY3Vyc2l2ZSwgaW5jbHVkZU1lZGlhSW5mbywgaW5jbHVkZURlbGV0ZWQsIGluY2x1ZGVIYXNFeHBsaWNpdFNoYXJlZE1lbWJlcnMpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvbGlzdF9mb2xkZXIvZ2V0X2xhdGVzdF9jdXJzb3InKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgcmVjdXJzaXZlOiByZWN1cnNpdmUsXG4gICAgICAgICAgaW5jbHVkZV9tZWRpYV9pbmZvOiBpbmNsdWRlTWVkaWFJbmZvLFxuICAgICAgICAgIGluY2x1ZGVfZGVsZXRlZDogaW5jbHVkZURlbGV0ZWQsXG4gICAgICAgICAgaW5jbHVkZV9oYXNfZXhwbGljaXRfc2hhcmVkX21lbWJlcnM6IGluY2x1ZGVIYXNFeHBsaWNpdFNoYXJlZE1lbWJlcnNcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLWxpc3RfZm9sZGVyLWxvbmdwb2xsXG4gICAqIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gY3Vyc29yIC0gVGhlIGN1cnNvciByZXR1cm5lZCBieSB5b3VyIGxhc3QgY2FsbCB0byBsaXN0X2ZvbGRlciBvciBsaXN0X2ZvbGRlci9jb250aW51ZS5cbiAgICogQHBhcmFtIHtpbnR9IHRpbWVvdXQgLSBBIHRpbWVvdXQgaW4gc2Vjb25kcy4gVGhlIHJlcXVlc3Qgd2lsbCBibG9jayBmb3IgYXQgbW9zdCB0aGlzIFxuICAgKiBsZW5ndGggb2YgdGltZSwgcGx1cyB1cCB0byA5MCBzZWNvbmRzIG9mIHJhbmRvbSBqaXR0ZXIgYWRkZWQgdG8gYXZvaWQgdGhlIHRodW5kZXJpbmcgXG4gICAqIGhlcmQgcHJvYmxlbS4gQ2FyZSBzaG91bGQgYmUgdGFrZW4gd2hlbiB1c2luZyB0aGlzIHBhcmFtZXRlciwgYXMgc29tZSBuZXR3b3JrIFxuICAgKiBpbmZyYXN0cnVjdHVyZSBkb2VzIG5vdCBzdXBwb3J0IGxvbmcgdGltZW91dHMuIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIDMwLlxuICAgKiBcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gY2hhbmdlcyAtIEluZGljYXRlcyB3aGV0aGVyIG5ldyBjaGFuZ2VzIGFyZSBhdmFpbGFibGUuIFxuICAgKiBJZiB0cnVlLCBjYWxsIGxpc3RfZm9sZGVyL2NvbnRpbnVlIHRvIHJldHJpZXZlIHRoZSBjaGFuZ2VzLlxuICAgKiBAcmV0dXJuIHtVSW50NjQ/fSBiYWNrb2ZmIC0gSWYgcHJlc2VudCwgYmFja29mZiBmb3IgYXQgbGVhc3QgdGhpcyBtYW55IHNlY29uZHMgXG4gICAqIGJlZm9yZSBjYWxsaW5nIGxpc3RfZm9sZGVyL2xvbmdwb2xsIGFnYWluLiBUaGlzIGZpZWxkIGlzIG9wdGlvbmFsLlxuICAgKiovXG4gIGxpc3RGb2xkZXJMb25ncG9sbDogZnVuY3Rpb24gKGN1cnNvciwgdGltZW91dCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9ub3RpZnkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9saXN0X2ZvbGRlci9sb25ncG9sbCcpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgY3Vyc29yOiBjdXJzb3IsXG4gICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtbGlzdF9yZXZpc2lvbnNcbiAgICogXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gUGF0aCBpbiB0aGUgdXNlcidzIERyb3Bib3ggdG8gZGVsZXRlXG4gICAqIEBwYXJhbSB7aW50fSBsaW1pdCAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiByZXZpc2lvbiBlbnRyaWVzIHJldHVybmVkLiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyAxMC5cbiAgICogXG4gICAqIEByZXR1cm4ge09iamVjdH0gZmlsZSByZXZpc2lvbnNcbiAgICovXG4gIGxpc3RSZXZpc2lvbnM6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL2xpc3RfcmV2aXNpb25zJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIC5zZW5kKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgIGxpbWl0OiBsaW1pdFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtbW92ZVxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBmcm9tUGF0aCAtIFBhdGggaW4gdGhlIHVzZXIncyBEcm9wYm94IHRvIGJlIGNvcGllZCBvciBtb3ZlZC5cbiAgICogQHBhcmFtICB7U3RyaW5nfSB0b1BhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0aGF0IGlzIHRoZSBkZXN0aW5hdGlvbi5cbiAgICogXG4gICAqIEByZXR1cm4ge09iamVjdH0gZmlsZSBpbmZvXG4gICAqL1xuICBtb3ZlOiBmdW5jdGlvbiAoZnJvbVBhdGgsIHRvUGF0aCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9tb3ZlJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIC5zZW5kKHtcbiAgICAgICAgICBmcm9tX3BhdGg6IGZyb21QYXRoLFxuICAgICAgICAgIHRvX3BhdGg6IHRvUGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2VuL2hlbHAvNDBcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLXBlcm1hbmVudGx5X2RlbGV0ZVxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIC0gUGF0aCBpbiB0aGUgdXNlcidzIERyb3Bib3ggdG8gYmUgZGVsZXRlZFxuICAgKi9cbiAgcGVybWFuZW50bHlEZWxldGU6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL3Blcm1hbmVudGx5X2RlbGV0ZScpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtcmVzdG9yZVxuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoIC0gUGF0aCBpbiB0aGUgdXNlcidzIERyb3Bib3ggdG8gYmUgZGVsZXRlZFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHJldiAtIFRoZSByZXZpc2lvbiB0byByZXN0b3JlIGZvciB0aGUgZmlsZS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSBmaWxlIG1ldGFkYXRhXG4gICAqL1xuICByZXN0b3JlOiBmdW5jdGlvbiAocGF0aCwgcmV2KSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL3Jlc3RvcmUnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGhcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLXNhdmVfdXJsXG4gICAqIFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBiZSBkZWxldGVkXG4gICAqIEBwYXJhbSAge1N0cmluZ30gdXJsIC0gVGhlIFVSTCB0byBiZSBzYXZlZC5cbiAgICpcbiAgICogQHJldHVybiBTYXZlVXJsUmVzdWx0ICh1bmlvbilcbiAgICovXG4gIHNhdmVVcmw6IGZ1bmN0aW9uIChwYXRoLCB1cmwpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvcmVzdG9yZScpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICB1cmw6IHVybFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtc2F2ZV91cmwtY2hlY2tfam9iX3N0YXR1c1xuICAgKiBcbiAgICogQHBhcmFtICB7U3RyaW5nfSBhc3luY19qb2JfaWQgLSBJZCBvZiB0aGUgYXN5bmNocm9ub3VzIGpvYi4gXG4gICAqIFRoaXMgaXMgdGhlIHZhbHVlIG9mIGEgcmVzcG9uc2UgcmV0dXJuZWQgZnJvbSB0aGUgbWV0aG9kIHRoYXQgbGF1bmNoZWQgdGhlIGpvYi5cbiAgICpcbiAgICogQHJldHVybiBTYXZlVXJsSm9iU3RhdHVzICh1bmlvbilcbiAgICovXG4gIHNhdmVVcmxDaGVja0pvYlN0YXR1czogZnVuY3Rpb24gKGFzeW5jSm9iSWQpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvc2F2ZV91cmwvY2hlY2tfam9iX3N0YXR1cycpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgcGF0aDogcGF0aFxuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtc2VhcmNoXG4gICAqIFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFRoZSBwYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBzZWFyY2guIFNob3VsZCBwcm9iYWJseSBiZSBhIGZvbGRlci5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IC0gVGhlIHN0cmluZyB0byBzZWFyY2ggZm9yLiBUaGUgc2VhcmNoIHN0cmluZyBpcyBzcGxpdCBvbiBzcGFjZXMgXG4gICAqIGludG8gbXVsdGlwbGUgdG9rZW5zLiBGb3IgZmlsZSBuYW1lIHNlYXJjaGluZywgdGhlIGxhc3QgdG9rZW4gaXMgdXNlZCBmb3IgcHJlZml4IFxuICAgKiBtYXRjaGluZyAoaS5lLiBcImJhdCBjXCIgbWF0Y2hlcyBcImJhdCBjYXZlXCIgYnV0IG5vdCBcImJhdG1hbiBjYXJcIikuXG4gICAqIEBwYXJhbSB7VUludDY0fSBzdGFydCAtIFRoZSBzdGFydGluZyBpbmRleCB3aXRoaW4gdGhlIHNlYXJjaCByZXN1bHRzICh1c2VkIGZvciBwYWdpbmcpLlxuICAgKiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyAwLlxuICAgKiBAcGFyYW0ge1VJbnQ2NH0gbWF4UmVzdWx0cyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiBzZWFyY2ggcmVzdWx0cyB0byByZXR1cm4uXG4gICAqIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIDEwMC5cbiAgICogQHBhcmFtIHtTZWFyY2hNb2RlfSBtb2RlIC0gVGhlIHNlYXJjaCBtb2RlIChmaWxlbmFtZSwgZmlsZW5hbWVfYW5kX2NvbnRlbnQsIG9yIGRlbGV0ZWRfZmlsZW5hbWUpLiBcbiAgICogTm90ZSB0aGF0IHNlYXJjaGluZyBmaWxlIGNvbnRlbnQgaXMgb25seSBhdmFpbGFibGUgZm9yIERyb3Bib3ggQnVzaW5lc3MgYWNjb3VudHMuIFxuICAgKiBUaGUgZGVmYXVsdCBmb3IgdGhpcyB1bmlvbiBpcyBmaWxlbmFtZS5cbiAgICovXG4gIHNhdmVVcmxDaGVja0pvYlN0YXR1czogZnVuY3Rpb24gKHBhdGgsIHF1ZXJ5LCBzdGFydCwgbWF4UmVzdWx0cywgbW9kZSkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi9maWxlcy9zZWFyY2gnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpXG4gICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgLnNlbmQoe1xuICAgICAgICAgIHBhdGg6IHBhdGhcbiAgICAgICAgfSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHNlZSBodHRwczovL3d3dy5kcm9wYm94LmNvbS9kZXZlbG9wZXJzL2RvY3VtZW50YXRpb24vaHR0cC9kb2N1bWVudGF0aW9uI2ZpbGVzLXVwbG9hZFxuICAgKiBcbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIGluIHRoZSB1c2VyJ3MgRHJvcGJveCB0byBzYXZlIHRoZSBmaWxlLlxuICAgKiBAcGFyYW0ge1dyaXRlTW9kZX0gbW9kZSAtIFNlbGVjdHMgd2hhdCB0byBkbyBpZiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0cy5cbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgdW5pb24gaXMgYWRkLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGF1dG9yZW5hbWUgLSBJZiB0aGVyZSdzIGEgY29uZmxpY3QsIGFzIGRldGVybWluZWQgYnkgbW9kZSxcbiAgICogaGF2ZSB0aGUgRHJvcGJveCBzZXJ2ZXIgdHJ5IHRvIGF1dG9yZW5hbWUgdGhlIGZpbGUgdG8gYXZvaWQgY29uZmxpY3QuXG4gICAqIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIEZhbHNlLmNsaWVudF9tb2RpZmllZCBUaW1lc3RhbXA/IFRoZSB2YWx1ZSB0byBzdG9yZSBhcyBcbiAgICogdGhlIGNsaWVudF9tb2RpZmllZCB0aW1lc3RhbXAuIERyb3Bib3ggYXV0b21hdGljYWxseSByZWNvcmRzIHRoZSB0aW1lIGF0IHdoaWNoIHRoZSBcbiAgICogZmlsZSB3YXMgd3JpdHRlbiB0byB0aGUgRHJvcGJveCBzZXJ2ZXJzLiBJdCBjYW4gYWxzbyByZWNvcmQgYW4gYWRkaXRpb25hbCB0aW1lc3RhbXAsIFxuICAgKiBwcm92aWRlZCBieSBEcm9wYm94IGRlc2t0b3AgY2xpZW50cywgbW9iaWxlIGNsaWVudHMsIGFuZCBBUEkgYXBwcyBvZiB3aGVuIHRoZSBmaWxlIHdhcyBcbiAgICogYWN0dWFsbHkgY3JlYXRlZCBvciBtb2RpZmllZC4gVGhpcyBmaWVsZCBpcyBvcHRpb25hbC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBtdXRlIC0gTm9ybWFsbHksIHVzZXJzIGFyZSBtYWRlIGF3YXJlIG9mIGFueSBmaWxlIG1vZGlmaWNhdGlvbnMgXG4gICAqIGluIHRoZWlyIERyb3Bib3ggYWNjb3VudCB2aWEgbm90aWZpY2F0aW9ucyBpbiB0aGUgY2xpZW50IHNvZnR3YXJlLiBJZiB0cnVlLCB0aGlzIFxuICAgKiB0ZWxscyB0aGUgY2xpZW50cyB0aGF0IHRoaXMgbW9kaWZpY2F0aW9uIHNob3VsZG4ndCByZXN1bHQgaW4gYSB1c2VyIG5vdGlmaWNhdGlvbi5cbiAgICogVGhlIGRlZmF1bHQgZm9yIHRoaXMgZmllbGQgaXMgRmFsc2UuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGZpbGUgaW5mb1xuICAgKi9cbiAgdXBsb2FkOiBmdW5jdGlvbiAocGF0aCwgbW9kZSwgYXV0b3JlbmFtZSwgbXV0ZSwgZmlsZSwgY2xpZW50TW9kaWZpZWQpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHZhciBhcmdzID0ge307XG5cbiAgICBhcmdzLnBhdGggPSBwYXRoO1xuICAgIGFyZ3MubW9kZSA9IG1vZGU7XG4gICAgYXJncy5hdXRvcmVuYW1lID0gYXV0b3JlbmFtZTtcbiAgICBhcmdzLm11dGUgPSBtdXRlO1xuXG4gICAgaWYoY2xpZW50TW9kaWZpZWQpIHtcbiAgICAgIGFyZ3MuY2xpZW50X21vZGlmaWVkID0gY2xpZW50TW9kaWZpZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9jb250ZW50LmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvdXBsb2FkJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAuc2V0KCdEcm9wYm94LUFQSS1BcmcnLCBKU09OLnN0cmluZ2lmeShhcmdzKSlcbiAgICAgICAgLmF0dGFjaCgnZmlsZScsIGZpbGUpO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocmVzLmJvZHkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzLmJvZHkuZXJyb3IpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vZGV2ZWxvcGVycy9kb2N1bWVudGF0aW9uL2h0dHAvZG9jdW1lbnRhdGlvbiNmaWxlcy11cGxvYWRfc2Vzc2lvbi1hcHBlbmRfdjJcbiAgICogXG4gICAqIEBwYXJhbSB7VXBsb2FkU2Vzc2lvbkN1cnNvcn0gY3Vyc29yIC0gQ29udGFpbnMgdGhlIHVwbG9hZCBzZXNzaW9uIElEIGFuZCB0aGUgb2Zmc2V0LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNsb3NlIC0gSWYgdHJ1ZSwgY3VycmVudCBzZXNzaW9uIHdpbGwgYmUgY2xvc2VkLiBcbiAgICogWW91IGNhbm5vdCBkbyB1cGxvYWRfc2Vzc2lvbi9hcHBlbmQgYW55IG1vcmUgdG8gY3VycmVudCBzZXNzaW9uLlxuICAgKiBUaGUgZGVmYXVsdCBmb3IgdGhpcyBmaWVsZCBpcyBGYWxzZS5cbiAgICovXG4gIHVwbG9hZFNlc3Npb25BcHBlbmQ6IGZ1bmN0aW9uIChjdXJzb3IsIGNsb3NlKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICB2YXIgYXJncyA9IHt9O1xuXG4gICAgYXJncy5jdXJzb3IgPSBjdXJzb3I7XG4gICAgYXJncy5jbG9zZSA9IGNsb3NlO1xuXG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9jb250ZW50LmRyb3Bib3hhcGkuY29tLzIvZmlsZXMvdXBsb2FkX3Nlc3Npb24vYXBwZW5kX3YyJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAuc2V0KCdEcm9wYm94LUFQSS1BcmcnLCBKU09OLnN0cmluZ2lmeShhcmdzKSlcbiAgICAgICAgLmF0dGFjaCgnZmlsZScsIGZpbGUpO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocmVzLmJvZHkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzLmJvZHkuZXJyb3IpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cuZHJvcGJveC5jb20vZGV2ZWxvcGVycy9kb2N1bWVudGF0aW9uL2h0dHAvZG9jdW1lbnRhdGlvbiNmaWxlcy11cGxvYWRfc2Vzc2lvbi1maW5pc2hcbiAgICogXG4gICAqIEBwYXJhbSB7VXBsb2FkU2Vzc2lvbkN1cnNvcn0gY3Vyc29yIC0gQ29udGFpbnMgdGhlIHVwbG9hZCBzZXNzaW9uIElEIGFuZCB0aGUgb2Zmc2V0LlxuICAgKiBAcGFyYW0ge0NvbW1pdEluZm99IGNvbW1pdCAtIENvbnRhaW5zIHRoZSBwYXRoIGFuZCBvdGhlciBvcHRpb25hbCBtb2RpZmllcnMgZm9yIHRoZSBjb21taXQuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gRmlsZU1ldGFkYXRhXG4gICAqL1xuICB1cGxvYWRTZXNzaW9uRmluaXNoOiBmdW5jdGlvbiAoY3Vyc29yLCBjb21taXQpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHZhciBhcmdzID0ge307XG5cbiAgICBhcmdzLmN1cnNvciA9IGN1cnNvcjtcbiAgICBhcmdzLmNvbW1pdCA9IGNvbW1pdDtcblxuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vY29udGVudC5kcm9wYm94YXBpLmNvbS8yL2ZpbGVzL3VwbG9hZF9zZXNzaW9uL2ZpbmlzaCcpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnNldCgnRHJvcGJveC1BUEktQXJnJywgSlNPTi5zdHJpbmdpZnkoYXJncykpXG4gICAgICAgIC5hdHRhY2goJ2ZpbGUnLCBmaWxlKTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LmRyb3Bib3guY29tL2RldmVsb3BlcnMvZG9jdW1lbnRhdGlvbi9odHRwL2RvY3VtZW50YXRpb24jZmlsZXMtdXBsb2FkX3Nlc3Npb24tc3RhcnRcbiAgICogXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvc2UgLSBJZiB0cnVlLCBjdXJyZW50IHNlc3Npb24gd2lsbCBiZSBjbG9zZWQuIFxuICAgKiBZb3UgY2Fubm90IGRvIHVwbG9hZF9zZXNzaW9uL2FwcGVuZCBhbnkgbW9yZSB0byBjdXJyZW50IHNlc3Npb24uXG4gICAqIFRoZSBkZWZhdWx0IGZvciB0aGlzIGZpZWxkIGlzIEZhbHNlLlxuICAgKiAgXG4gICAqIEByZXR1cm4ge1N0cmluZ30gc2Vzc2lvbl9pZFxuICAgKi9cbiAgdXBsb2FkU2Vzc2lvblN0YXJ0OiBmdW5jdGlvbiAoY2xvc2UpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHZhciBhcmdzID0ge307XG5cbiAgICBhcmdzLmNsb3NlID0gY2xvc2U7XG5cbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2NvbnRlbnQuZHJvcGJveGFwaS5jb20vMi9maWxlcy91cGxvYWRfc2Vzc2lvbi9zdGFydCcpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnNldCgnRHJvcGJveC1BUEktQXJnJywgSlNPTi5zdHJpbmdpZnkoYXJncykpXG4gICAgICAgIC5hdHRhY2goJ2ZpbGUnLCBmaWxlKTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpO1xuY29uc3QgY28gPSByZXF1aXJlKCdjbycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgYWNjb3VudCBpbmZvIGZvciBhIGdpdmVuIGFjY291bnQgSUQuXG4gICAqIFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IGFjY291bnRJZFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGFjY291bnQgaW5mb1xuICAgKi9cbiAgZ2V0QWNjb3VudDogZnVuY3Rpb24gKGFjY291bnRJZCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi91c2Vycy9nZXRfYWNjb3VudCcpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSlcbiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgYWNjb3VudF9pZDogYWNjb3VudElkXG4gICAgICAgIH0pO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocmVzLmJvZHkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzLmJvZHkuZXJyb3IpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhY2NvdW50IGluZm8gZm9yIGFuIGFycmF5IG9mIGFjY291bnQgSURzLlxuICAgKiBcbiAgICogQHBhcmFtICB7QXJyYXl9IG9mIGFjY291bnRJZHNcbiAgICogQHJldHVybiB7T2JqZWN0fSBhY2NvdW50cyBpbmZvXG4gICAqL1xuICBnZXRBY2NvdW50QmF0Y2g6IGZ1bmN0aW9uIChhY2NvdW50SWRzKSB7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgIGxldCByZXMgPSB5aWVsZCByZXF1ZXN0XG4gICAgICAgIC5wb3N0KCdodHRwczovL2FwaS5kcm9wYm94YXBpLmNvbS8yL3VzZXJzL2dldF9hY2NvdW50X2JhdGNoJylcbiAgICAgICAgLnNldCgnQXV0aG9yaXphdGlvbicsICdCZWFyZXIgJyArICh0aC5hY2Nlc3NUb2tlbiB8fCB0aC5jb25maWcuYWNjZXNzVG9rZW4pKVxuICAgICAgICAudHlwZSgnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIC5zZW5kKHtcbiAgICAgICAgICBhY2NvdW50X2lkczogYWNjb3VudElkc1xuICAgICAgICB9KTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKHJlcy5ib2R5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmVzLmJvZHkgPSBKU09OLnBhcnNlKHJlcy50ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcy5ib2R5LmVycm9yKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KHJlcy5ib2R5LmVycm9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcy5ib2R5O1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgYWNjb3VudCBpbmZvIGZvciB0aGUgY3VycmVudCBhY2NvdW50XG4gICAqIFxuICAgKiBAcmV0dXJuIHtPYmVqY3R9IGFjY291bnQgaW5mb1xuICAgKi9cbiAgZ2V0Q3VycmVudEFjY291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGggPSB0aGlzO1xuICAgIHJldHVybiBjbyhmdW5jdGlvbiAqKCkge1xuICAgICAgbGV0IHJlcyA9IHlpZWxkIHJlcXVlc3RcbiAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tLzIvdXNlcnMvZ2V0X2N1cnJlbnRfYWNjb3VudCcpXG4gICAgICAgIC5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyAodGguYWNjZXNzVG9rZW4gfHwgdGguY29uZmlnLmFjY2Vzc1Rva2VuKSk7XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJlcy5ib2R5ID0gSlNPTi5wYXJzZShyZXMudGV4dCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICBQcm9taXNlLnJlamVjdChyZXMuYm9keS5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXMuYm9keTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCByZXR1cm5zIHNwYWNlIHVzYWdlIGluZm8gZm9yIHRoZSBjdXJyZW50IGFjY291bnQuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtPYmVqY3R9IGFjY291bnQgaW5mb1xuICAgKi9cbiAgZ2V0U3BhY2VVc2FnZTogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aCA9IHRoaXM7XG4gICAgcmV0dXJuIGNvKGZ1bmN0aW9uICooKSB7XG4gICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAucG9zdCgnaHR0cHM6Ly9hcGkuZHJvcGJveGFwaS5jb20vMi91c2Vycy9nZXRfc3BhY2VfdXNhZ2UnKVxuICAgICAgICAuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgKHRoLmFjY2Vzc1Rva2VuIHx8IHRoLmNvbmZpZy5hY2Nlc3NUb2tlbikpO1xuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocmVzLmJvZHkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVzLmJvZHkuZXJyb3IpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgfSk7XG4gIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5jb25zdCBjbyA9IHJlcXVpcmUoJ2NvJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvYmplY3QgdGhhdCBoYW5kbGVzIERyb3Bib3ggQVBJIHYyIGF1dGhlbnRpY2F0aW9uXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIC0gY29uZmlndXJhdGlvbnMgdG8gYmUgc2VuZGVkIHZpYSBIVFRQIHJlcXVlc3RcbiAgICogQHJldHVybiB7T2JqZWN0fSAgICAgICAgLSBtZXRob2RzIHRoYXQgaGFuZGxlIGF1dGhlbnRpY2F0aW9uXG4gICAqL1xuICBhdXRoZW50aWNhdGU6IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAvKipcbiAgICAgICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgVVJMIHRvIGdldCBlaXRoZXIgdGhlIGF1dGhvcml6YXRpb24gY29kZVxuICAgICAgICogb3IgdGhlIGFjY2VzcyB0b2tlbiwgZGVwZW5kaW5nIG9uIHRoZSBhdXRoZW50aWNhdGlvbiBmbG93IGNob29zZWQgKGNvZGUgb3IgdG9rZW4pXG4gICAgICAgKlxuICAgICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgIC0gVVJMXG4gICAgICAgKi9cbiAgICAgIGdlbmVyYXRlQXV0aFVybDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ2h0dHBzOi8vd3d3LmRyb3Bib3guY29tL29hdXRoMi9hdXRob3JpemU/JyArXG4gICAgICAgICAgJ2NsaWVudF9pZD0nICsgY29uZmlnLmNsaWVudF9pZCArXG4gICAgICAgICAgJyZyZXNwb25zZV90eXBlPScgKyBjb25maWcucmVzcG9uc2VfdHlwZSArXG4gICAgICAgICAgJyZyZWRpcmVjdF91cmk9JyArIGNvbmZpZy5yZWRpcmVjdF91cmkgK1xuICAgICAgICAgICcmc3RhdGU9JyArIGNvbmZpZy5zdGF0ZSArXG4gICAgICAgICAgJyZyZXF1aXJlX3JvbGU9JyArIChjb25maWcucmVxdWlyZV9yb2xlID8gY29uZmlnLnJlcXVpcmVfcm9sZSA6ICdwZXJzb25hbCcpICtcbiAgICAgICAgICAnJmZvcmNlX3JlYXBwcm92ZT0nICsgKGNvbmZpZy5mb3JjZV9yZWFwcHJvdmUgPyBjb25maWcuZm9yY2VfcmVhcHByb3ZlIDogZmFsc2UpICtcbiAgICAgICAgICAnJmRpc2FibGVfc2lnbnVwPScgKyAoY29uZmlnLmRpc2FibGVfc2lnbnVwID8gY29uZmlnLmRpc2FibGVfc2lnbnVwIDogZmFsc2UpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBGdW5jdGlvbiB0aGF0IGdldHMgdGhlIGFjY2VzcyB0b2tlbiB2aWEgR0VUIHJlcXVlc3QuXG4gICAgICAgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBiZSB1c2VkIHdoZW4gdXNpbmcgdGhlIHRva2VuIGZsb3dcbiAgICAgICAqXG4gICAgICAgKiBxdWVyeVN0cmluZyB1c3VhbGx5IGlzIGxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpXG4gICAgICAgKlxuICAgICAgICogQHNlZSBodHRwOi8vZGV2Lm1lbmRlbGV5LmNvbS9yZWZlcmVuY2UvdG9waWNzL2F1dGhvcml6YXRpb25faW1wbGljaXQuaHRtbFxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBhdXRoVXJsIC0gVVJMIGdlbmVyYXRlZCBieSB0aGUgZ2VuZXJhdGVBdXRoVXJsKCkgZnVuY3Rpb25cbiAgICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICovXG4gICAgICBnZXRUb2tlbkJ5VXJsOiBmdW5jdGlvbiAocXVlcnlTdHJpbmcpIHtcbiAgICAgICAgbGV0IHBhcmFtcyA9IHt9LFxuICAgICAgICAgICAgcmVnZXggPSAvKFteJj1dKyk9KFteJl0qKS9nLFxuICAgICAgICAgICAgcmVnZXhSZXN1bHQ7XG5cbiAgICAgICAgd2hpbGUgKHJlZ2V4UmVzdWx0ID0gcmVnZXguZXhlYyhxdWVyeVN0cmluZykpIHtcbiAgICAgICAgICBwYXJhbXNbZGVjb2RlVVJJQ29tcG9uZW50KHJlZ2V4UmVzdWx0WzFdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocmVnZXhSZXN1bHRbMl0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoY29uZmlnLnN0YXRlID09IHBhcmFtcy5zdGF0ZSkge1xuICAgICAgICAgIGNvbmZpZy5hY2Nlc3NUb2tlbiA9IHBhcmFtcy5hY2Nlc3NfdG9rZW47XG4gICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogRnVuY3Rpb24gdGhhdCBnZXRzIHRoZSBhY2Nlc3MgdG9rZW4gYnkgc2VuZGluZyB0aGUgY29kZVxuICAgICAgICogcmVjZWl2ZWQgYnkgdGhlIHVzZXIgYXV0aG9yaXphdGlvbiBpbiB0aGUgYnJvd3NlclxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBjb2RlICAgICAtIEF1dGhvcml6YXRpb24gQ29kZSByZWNlaXZlZCB3aG4gdGhlIHVzZXIgYXV0aG9yaXplcyB0aGUgYXBwLlxuICAgICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICAgKi9cbiAgICAgIGdldFRva2VuQnlDb2RlOiBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICByZXR1cm4gY28oZnVuY3Rpb24gKigpIHtcbiAgICAgICAgICBsZXQgcmVzID0geWllbGQgcmVxdWVzdFxuICAgICAgICAgICAgLnBvc3QoJ2h0dHBzOi8vYXBpLmRyb3Bib3hhcGkuY29tL29hdXRoMi90b2tlbicpXG4gICAgICAgICAgICAudHlwZSgnZm9ybScpXG4gICAgICAgICAgICAuc2VuZCh7XG4gICAgICAgICAgICAgIGNvZGU6IGNvZGUsXG4gICAgICAgICAgICAgIGdyYW50X3R5cGU6ICdhdXRob3JpemF0aW9uX2NvZGUnLFxuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIGNsaWVudF9zZWNyZXQ6IGNvbmZpZy5jbGllbnRfc2VjcmV0LFxuICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGNvbmZpZy5yZWRpcmVjdF91cmksXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhyZXMuYm9keSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXMuYm9keSA9IEpTT04ucGFyc2UocmVzLnRleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyZXMuYm9keS5lcnJvcikge1xuICAgICAgICAgICAgUHJvbWlzZS5yZWplY3QocmVzLmJvZHkuZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbmZpZy5hY2Nlc3NUb2tlbiA9IHJlcy5ib2R5LmFjY2Vzc190b2tlbjtcbiAgICAgICAgICByZXR1cm4gcmVzLmJvZHk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG4iXX0=
