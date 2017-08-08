# JavaScript Library for the Dropbox API v2

## Overview
This is a JavaScript library for the new Dropbox API, written in JavaScript with some ECMAscript 6 features, suitable for use in both modern browsers and in server-side code running under node.js.

## Dependencies
**dropbox-v2-js** relies on [co](https://github.com/tj/co) for using [generators](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Generator) and [SuperAgent](http://visionmedia.github.io/superagent/), a simple HTTP library that works both on browsers and on node.js.

**dropbox-v2-js** uses [Browserify](http://browserify.org/) to build the browser library.

## Supported Platforms

This library is tested against the following JavaScript platforms.

 - node.js 6.0.0
 - Chrome 50.0
 
Keep in mind that the versions above are not hard requirements. 
You may need to provide a [Promise Polyfill](https://github.com/tj/co#platform-compatibility).

## Installation

## Usage
**dropbox-v2-js** is built over a [constructor pattern](http://javascript.info/tutorial/all-one-constructor-pattern). This means that you should initialize the library with the `new` keyword. For more info, see the [examples](https://github.com/nebulab-io/dropbox-v2-js/tree/master/examples) folder.

### Initialize
To initialize the library you must provide a object containing the following  parameters.

 - **response_type** - *String* - The grant type requested, either token or code.
 - **client_id** - *String* - The app's key, found in the App Console.
redirect_uri String? Where to redirect the user after authorization has completed. This must be the exact URI registered in the App Console; even 'localhost' must be listed if it is used for testing. All redirect URIs must be HTTPS except for localhost URIs. A redirect URI is required for the token flow, but optional for the code flow. If the redirect URI is omitted, the code will be presented directly to the user and they will be invited to enter the information in your app.

 - **state** - *String?* - Up to 500 bytes of arbitrary data that will be passed back to your redirect URI. This parameter should be used to protect against cross-site request forgery (CSRF). See Sections 4.4.1.8 and 4.4.2.5 of the OAuth 2.0 threat model spec.

 - **require_role** - *String?* - If this parameter is specified, the user will be asked to authorize with a particular type of Dropbox account, either work for a team account or personal for a personal account. Your app should still verify the type of Dropbox account after authorization since the user could modify or remove the require_role parameter.

 - **force_reapprove** - *Boolean?* - Whether or not to force the user to approve the app again if they've already done so. If false (default), a user who has already approved the application may be automatically redirected to the URI specified by 
redirect_uri. If true, the user will not be automatically redirected and will have to approve the app again.

 - **disable_signup** - *Boolean?* - When true (default is false) users will not be able to sign up for a Dropbox account via the authorization page. Instead, the authorization page will show a link to the Dropbox iOS app in the App Store. This is only intended for use when necessary for compliance with App Store policies.
 
 
```javascript
  var dropbox = new Dropbox({
    client_id: "clientId",
    client_secret: "clientSecret",
    redirect_uri: "redirectUri",
    response_type: "code",
    force_reapprove: "forceReapprove",
    disable_signup: "disableSignup",
    require_role: "personal"
    });
```

If you already have the access_token you can pass it to the library through the config object as `config.accessToken` and skip the Authentication process.

### Authentication

Dropbox API v2 provides two different flows of authentication: the code flow and the token flow. The first one is suitable to the backend and the second one, to the frontend.

#### Code Flow
The first step is to initialize the library passing `code` as `response_type`. Then you need to generate the Auth URL, which is the Dropbox page that asks for user permission.

After the user grant access to your app, you must receive the access token through the redirect_uri, which is usually `yourdomain.com/auth`:

```javascript
const express = require('express');
const Dropbox = require('dropbox2'); 
const Opn = require('opn');

const app = express();

var dropbox = new Dropbox({
  client_id: appKey,
  client_secret: appSecret,
  redirect_uri: redirectUri,
  response_type: "code",
  force_reapprove: false,
  disable_signup: false,
  require_role: "personal"
});

app.get('/auth', function (req, res) {
  var params = req.query;
  dropbox.getTokenByCode(params.code).then(function(res) {
  console.log(res);
  }, function(err) {
    console.log(err);
  });
});

app.listen(5050, function () {
  Opn(dropbox.generateAuthUrl());
});
```

#### Token flow

The token flow is useful for client apps, since it returns the access token directly on the URI. All you need to do is iniatilize the library with `token` as `response_type`, open the AuthUrl and then grab the variables in the URL with the `getTokenByUrl` method provided by the library.

First step

```javascript
var dropbox = new Dropbox({
  client_id: appKey,
  redirect_uri: redirectUri,
  response_type: "token",
  force_reapprove: false,
  disable_signup: false,
  require_role: "personal",
  state: state
});

window.location = dropbox.generateAuthUrl();

```
Second step (after user grants access)
```javascript
var response = dropbox.getTokenByUrl(location.hash.substring(1));

if(response.state === state) {
  dropbox.accessToken = response.access_token;
}
 
```
