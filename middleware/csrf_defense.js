// CSRF defense & validation middleware
// See https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie

const uuid = require('uuid').v4;
const uuidRegex = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
const rejection = {error: 'Invalid CSRF response'};


function resetCookie(req, res, next) {
  res.cookie('csrf_token', uuid(),
  {
    domain: req.hostname
  , expires: 0
  , path: '/'
  });

  if (typeof(next) === 'function')
    next();
};


function ensureCookie(req, res, next) {
  let csrf_token = req.cookies.csrf_token;

  // TODO: See whether it's better/faster to check against the regex or to simply regenerate the UUID token every time
  if (typeof(csrf_token) !== 'string' || csrf_token.match(uuidRegex) === null) {
    resetCookie(req, res);
  }

  next();
};


function checkHeader(req, res, next) {
  let csrf_token = req.cookies.csrf_token;
  resetCookie(req, res); // Change out the CSRF cookie with every request

  if (typeof(csrf_token) === 'string' && csrf_token.match(uuidRegex) !== null) {
    if (req.header('X-CSRF-Token') === csrf_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkQuery(req, res, next) {
  let csrf_token = req.cookies.csrf_token;
  resetCookie(req, res); // Change out the CSRF cookie with every request

  if (typeof(csrf_token) === 'string' && csrf_token.match(uuidRegex) !== null) {
    if (req.query.csrf_token === csrf_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


function checkHeaderAndQuery(req, res, next) {
  let csrf_token = req.cookies.csrf_token;
  resetCookie(req, res); // Change out the CSRF cookie with every request

  if (typeof(csrf_token) === 'string' && csrf_token.match(uuidRegex) !== null) {
    if (req.header('X-CSRF-Token') === csrf_token && req.query.csrf_token === csrf_token) {
      next();
      return;
    }
  }

  res.status(403).send(rejection);
};


module.exports = {
  resetCookie
, ensureCookie
, checkHeader
, checkQuery
, checkHeaderAndQuery
};
