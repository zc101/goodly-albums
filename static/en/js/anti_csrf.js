// Anti-CSRF functionality

// Makes sure we have a CSRF token cookie
// Passes the token to the optional callback
function antiCSRF(cb) {
  // See if the token already exists
  var token = Cookies.get('csrf_token');
  if (token && token.length) {

    // Only set the response cookie if given a callback,
    // to make sure it's used immediately. Otherwise,
    // anyone could just embed a page first to defeat CSRF.
    if (typeof(cb) === 'function') {
      Cookies.set('csrf_token_echo', token);
      cb();
    }
  }
  else {
    // Otherwise, get it via cookie refresh
    $.get('srv/refresh').always(function () {
      if (typeof(cb) === 'function') {
        var token = Cookies.get('csrf_token');
        if (token && token.length) {
          Cookies.set('csrf_token_echo', token);
          cb();
        }
      }
    });
  }
};

// Pre-load a token asynchronously
antiCSRF();
