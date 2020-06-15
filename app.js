
'use strict';

// Create a global way to 'require' relative to the base directory
global._baseDir = __dirname;
global.baseRequire = name => require(`${__dirname}/${name}`);

const conf = baseRequire('manage/config');
const cookieParser = require('cookie-parser');
const csrfd = baseRequire('middleware/csrf_defense');
const express = require('express');

const port = 3000;
const app = express();


// We should always be using the NGINX reverse proxy
// So, this lets us get client IPs using X-Forwarded-* headers
app.set('trust proxy', 'loopback');


// Load middleware
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrfd.checkCookie); // Should reset CSRF cookie on failure, so it's useful even for /refresh
app.use(baseRequire('middleware/decrypt_cookie_tokens'));


// Load main routes
app.get('/refresh', (req, res) => res.status(200).send()); // Stub route to simply invoke middleware
app.post('/user_login', baseRequire('route/user_login'));
app.get('/visitors', baseRequire('route/visitors'));
app.get('/public_albums', baseRequire('route/public_albums'));


// Load "secure" (auth required) routes
let routeSecure = express.Router({mergeParams: true, strict: true});
app.use('/secure', routeSecure);
routeSecure.use(baseRequire('route/secure'));
routeSecure.get('/my_albums', baseRequire('route/secure/my_albums'));
routeSecure.get('/get_media', baseRequire('route/secure/get_media'));
routeSecure.post('/new_album', baseRequire('route/secure/new_album'));
routeSecure.post('/update_album', baseRequire('route/secure/update_album'));
routeSecure.post('/delete_album', baseRequire('route/secure/delete_album'));
routeSecure.post('/toggle_album_private', baseRequire('route/secure/toggle_album_private'));
routeSecure.post('/upload_media', baseRequire('route/secure/upload_media'));



// Not-found handler
// Express doesn't consider not-found an error condition (see issues/2718), so use non-err signature
app.use(function (req, res, next) {
  logger.log('Invalid request "' + req.originalUrl + '" from ' + req.ip);
  res.status(400).send();
});

app.listen(port, () => logger.log(`Express app listening on port ${port}!`));
