// Currently just a stub to test login flow

module.exports = function (req, res) {
  let auth = res.locals.cookieTokens && res.locals.cookieTokens.auth_token;

  if (auth)
    res.status(200).send('<h3>Your Albums Here</h3>');
  else
    res.status(200).send('<script>location.href="/en/user_login.html?return_to=/en/my_albums.html"</script>');
};
