
'use strict';

// Create a global way to 'require' relative to the base directory
global._baseDir = __dirname;
global.baseRequire = name => require(`${__dirname}/${name}`);

const conf = baseRequire('manage/config');
const cookieParser = require('cookie-parser');
const csrfd = baseRequire('middleware/csrf-defense');
const decryptCookieTokens = baseRequire('middleware/decrypt_cookie_tokens');
const express = require('express');

const port = 3000;
const app = express();

// We should always be using the NGINX reverse proxy
// So, this lets us get client IPs using X-Forwarded-* headers
app.set('trust proxy', 'loopback');

// Load middleware - use & GET
app.use(cookieParser());
app.use(decryptCookieTokens);
app.get('/*', csrfd.ensureCookie); // Visitor query in footer should make sure a backend get() is called regularly
// PUT
app.put('/*', csrfd.checkHeaderAndQuery);
app.put('/*', csrfd.resetCookie);
// POST
app.post('/*', csrfd.checkHeaderAndQuery);
app.post('/*', csrfd.resetCookie);

// Load routes
app.get('/visitors', baseRequire('route/visitors'));

// Not-found handler
// Express doesn't consider not-found an error condition (see issues/2718), so use non-err signature
app.use(function (req, res, next) {
  let obj = {
    msg: `Invalid request '${req.originalUrl}'`
  , ip: req.ip
  , query: req.query};

  res.status(400).send(); //(obj);
});

app.listen(port, () => logger.log(`Express app listening on port ${port}!`));
