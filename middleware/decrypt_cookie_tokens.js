// Middleware to automatically decrypt any valid incoming token cookies

'use strict';
const encutil = baseRequire('utils/encryption');

// Only "normal" token names allowed to prevent any funny business
const tokenNameRegex = /^[a-zA-Z0-9_\-]+$/

// Encrypted token strings should contain 3 base64 fields separated by colons
const tokenRegex = /^[a-zA-Z0-9\+\/=]+:[a-zA-Z0-9\+\/=]+:[a-zA-Z0-9\+\/=]+$/;


function decryptCookieTokens(req, res, next) {
  res.locals.cookieTokens = res.locals.cookieTokens || {};

  for (var [cookie_name, cookie_value] of Object.entries(req.cookies)) {
    if (cookie_name.match(tokenNameRegex) && typeof(cookie_value) === 'string' && cookie_value.match(tokenRegex)) {
      let token = encutil.validateAndDecryptToken(cookie_value);
      if (token !== null)
        res.locals.cookieTokens[cookie_name] = token;
    }
  }

  next();
};


module.exports = decryptCookieTokens;
