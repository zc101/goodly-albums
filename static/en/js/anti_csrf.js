// Anti-CSRF functionality

// Makes sure we have a CSRF token cookie
// Passes the token to the optional callback
function antiCSRF(cb) {
  // See if the token already exists
  var token = Cookies.get('csrf_token');
  if (token && token.length) {

    // Only set the response cookie if given a callback,
    // to make sure it's used immediately. Otherwise,
    // anyone could just embed a page first to defeat CSRF protection.
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

// Pre-load a token
antiCSRF();

// Convenience function to wrap a JSON loader in antiCSRF
function requestJSON(url, cbSuccess, cbFail) {
  if (typeof(url) === 'string' && typeof(cbSuccess) === 'function') {
    antiCSRF(function() {
      if (typeof(cbFail) === 'function')
        $.getJSON(url).done(cbSuccess).fail(cbFail);
      else {
        $.getJSON(url).done(cbSuccess)
        .fail(function(jqxhr, textStatus, error) {
          if (jqxhr.status === 403)
            window.location.href = "/en/user_login.html?return_to=" + encodeURIComponent(window.location.href);
          else
            alertErrorCode(jqxhr.responseText);
        });
      }
    });
  }
}


// Convenience function to wrap a jQuery POST in antiCSRF
function requestPost(url, data, cbSuccess, cbFail) {
  if (typeof(url) === 'string') {
    antiCSRF(function() {
      if (typeof(cbFail) === 'function')
        $.post(url, data).done(cbSuccess).fail(cbFail);
      else {
        $.post(url, data).done(cbSuccess)
        .fail(function(jqxhr, textStatus, error) {
          if (jqxhr.status === 403)
            window.location.href = "/en/user_login.html?return_to=" + encodeURIComponent(window.location.href);
          else
            alertErrorCode(jqxhr.responseText);
        });
      }
    });
  }
}
