// CSRF defense & validation middleware
// See https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie

const uuid = require('uuid').v4;
const uuidRegex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
const rejection = {error: 'Invalid CSRF response'};


function resetToken(req, res, next) {
  res.cookie('csrf_token', uuid(),
  {
    domain: req.hostname
  , expires: 0
  , path: '/'
  , sameSite: 'Lax'
  });

  if (typeof(next) === 'function')
    next();
};


function ensureToken(req, res, next) {
  let csrf_token = req.cookies.csrf_token;

  // TODO: See whether it's better/faster to check against the regex or to simply regenerate the UUID token every time
  if (typeof(csrf_token) !== 'string' || csrf_token.match(uuidRegex) === null) {
    resetToken(req, res);
  }

  next();
};


function checkHeader(req, res, next) {
  let cookie_token = req.cookies.csrf_token;
  resetToken(req, res); // Change out the CSRF cookie with every request

  if (typeof(cookie_token) === 'string' && cookie_token.match(uuidRegex) !== null) {
    if (req.header('X-CSRF-Token') === cookie_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkQuery(req, res, next) {
  let cookie_token = req.cookies.csrf_token;
  resetToken(req, res); // Change out the CSRF cookie with every request

  if (typeof(cookie_token) === 'string' && cookie_token.match(uuidRegex) !== null) {
    let query_token = (req.body && req.body.csrf_token) || req.query.csrf_token;
    if (query_token === cookie_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkCookie(req, res, next) {
  let cookie_token = req.cookies.csrf_token;
  let echo_token = req.cookies.csrf_token_echo;
  resetToken(req, res); // Change out the CSRF cookie with every request

  if (typeof(cookie_token) === 'string' && cookie_token.match(uuidRegex) !== null) {
    if (echo_token === cookie_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkHeaderAndQuery(req, res, next) {
  let cookie_token = req.cookies.csrf_token;
  resetToken(req, res); // Change out the CSRF cookie with every request

  if (typeof(cookie_token) === 'string' && cookie_token.match(uuidRegex) !== null) {
    let query_token = (req.body && req.body.csrf_token) || req.query.csrf_token;
    if (req.header('X-CSRF-Token') === cookie_token && query_token === cookie_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkHeaderOrQuery(req, res, next) {
  let cookie_token = req.cookies.csrf_token;
  resetToken(req, res); // Change out the CSRF cookie with every request

  if (typeof(cookie_token) === 'string' && cookie_token.match(uuidRegex) !== null) {
    let query_token = (req.body && req.body.csrf_token) || req.query.csrf_token;
    if (req.header('X-CSRF-Token') === cookie_token || query_token === cookie_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


module.exports = {
  resetToken
, ensureToken
, checkHeader
, checkQuery
, checkCookie
, checkHeaderAndQuery
, checkHeaderOrQuery
};
