// Bail out of the routing chain if we can't find a decrypted auth token

'use strict';

module.exports = function (req, res, next) {
  let auth = (res.locals.cookieTokens && res.locals.cookieTokens.auth_token && (typeof(auth.userID) === 'number'));

  if (auth)
    next();
  else
    res.status(403).end();
};
