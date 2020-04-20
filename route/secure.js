// Redirect to the login form if we can't find a decrypted auth token

module.exports = function (req, res, next) {
  let auth = res.locals.cookieTokens && res.locals.cookieTokens.auth_token;

  if (auth)
    next();
  else
    res.status(200).send('<script>window.location.href = "/en/user_login.html?return_to=" + encodeURIComponent(window.location.href)</script>');
};
