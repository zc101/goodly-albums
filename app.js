
'use strict';

// Create a global way to 'require' relative to the base directory
global._baseDir = __dirname;
global.baseRequire = name => require(`${__dirname}/${name}`);

const conf = baseRequire('manage/config');
const cookieParser = require('cookie-parser');
const csrfd = baseRequire('middleware/csrf_defense');
const decryptCookieTokens = baseRequire('middleware/decrypt_cookie_tokens');
const express = require('express');

const port = 3000;
const app = express();

// We should always be using the NGINX reverse proxy
// So, this lets us get client IPs using X-Forwarded-* headers
app.set('trust proxy', 'loopback');


// Load middleware - Use
app.use(cookieParser());
app.use(decryptCookieTokens);
// GET
app.get('/refresh', csrfd.ensureCookie);
app.get('/user_login', csrfd.checkHeaderAndQuery);
// PUT
app.put('/*', csrfd.checkHeaderAndQuery);
// POST
app.post('/*', csrfd.checkHeaderAndQuery);


// Load routes
app.get('/refresh', (req, res) => res.status(200).send()); // Stub route to simply invoke middleware
app.get('/user_login', baseRequire('route/user_login'));
app.get('/visitors', baseRequire('route/visitors'));


// Not-found handler
// Express doesn't consider not-found an error condition (see issues/2718), so use non-err signature
app.use(function (req, res, next) {
  logger.log('Invalid request "' + req.originalUrl + '" from ' + req.ip);
  res.status(400).send();
});

app.listen(port, () => logger.log(`Express app listening on port ${port}!`));
