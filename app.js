const express = require('express');
var cookieParser = require('cookie-parser');

const port = 3000;
const app = express();

// Load middleware
app.use(cookieParser());

// We should always be using the NGINX reverse proxy
// So, this lets us get client IPs using X-Forwarded-* headers
app.set('trust proxy', 'loopback');

app.get('/*', function (req, res) {
  let obj = {
    msg: `Hello World from backend page '${req.originalUrl}'`
  , ip: req.ip
  , cookies: req.cookies
  , query: req.query};

  res.status(418).send(obj);
});

app.listen(port, () => console.log(`Express app listening on port ${port}!`));
