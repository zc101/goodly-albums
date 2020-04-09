// User authentication and token creation

'use strict';
const encutil = baseRequire('utils/encryption');
const pwmgr = baseRequire('manage/passwords');
const usermgr = baseRequire('manage/users');
const urmgr = baseRequire('manage/user_roles');


// For why we're not just using standard JWT (besides information leakage issues),
// see: https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/
// We can hopefully avert some problems by simply encrypting the entire token with a server-known algo
function setAuthToken(req, res, uID, rIDs) {
  let currentSecond = Math.trunc(Date.now() / 1000); // Whole seconds since UTC epoch

  let token = {
    iat: currentSecond
  , userID: uID
  , roles: rIDs
  };

  let cookieOpts = {
    domain: req.hostname
  , expires: 0  // TODO: Set maxAge and possibly add a refresh token
  , path: '/'
  };

  let encToken = encutil.encryptToken(token);

  if (encToken)
    res.cookie('auth_token', encToken, cookieOpts);
};


// Route handler
module.exports = async function (req, res) {
  let username = (req.body && req.body.username) || req.query.username;
  let password = (req.body && req.body.password) || req.query.password;
  let userID = await usermgr.getUserID(username); // Handles the username input validation too
  let returnTo = (req.body && req.body.return_to) || req.query.return_to || '/en/index.html';

  if (userID !== null && typeof(password) === 'string') {
    if (await pwmgr.checkPasswordByID(userID, password) === true) {
      let roleIDs = await urmgr.getUserRoleIDs(userID);
      setAuthToken(req, res, userID, roleIDs);
      res.redirect(303, returnTo);
      return;
    }
  }

  // If we didn't succeed and return above, redirect back to the login page
  let failpage = '/en/user_login.html?failed=true&return_to=' + returnTo;
  res.redirect(303, failpage);
};
