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
  let userID = await usermgr.getUserID(req.query.username); // Handles the username input validation too

  if (userID !== null && typeof(req.query.password) === 'string') {
    if (await pwmgr.checkPasswordByID(userID, req.query.password) === true) {
      let roleIDs = await urmgr.getUserRoleIDs(userID);
      setAuthToken(req, res, userID, roleIDs);
      res.status(200).send();
      return;
    }
  }

  res.status(403).send();
};
