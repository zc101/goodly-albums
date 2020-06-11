// Main JS file used by every page
'use strict';

/********************************/
// Parts functions
/********************************/

// Automates the flipping of hamburgers. Popular functionality among college students.
function toggleBurger() {
    $('.navlist').toggleClass('responsive');
}


/********************************/
// Error code functions
/********************************/

// Load the JSON table of error code strings (if needed) and send it to the callback
function loadErrorTable(cb) {
  var errorTableURL = "/en/js/error-messages.json";
  if (typeof(cb) === 'function') {
    if (window.errorTable)
      cb(window.errorTable);
    else {
      $.getJSON(errorTableURL)
        .done(function (data) {
          window.errorTable = data;
          cb(data);
        })
        .fail(function(jqxhr, textStatus, error) {
          console.log("Problem while loading error code table: " + jqxhr.responseText);
        });
    }
  }
}


// Gets the details of a specific error code and sends it to the callback.
// Loads the JSON table of error code strings first if needed.
function getErrorDetails(errorCode, cb) {
  if (typeof(cb) === 'function') {
    loadErrorTable(function (table) {
      var errText = table[errorCode] || table[Number(errorCode)];
      if (errText)
        cb(errText);
      else
        console.log("Couldn't find details for error code '" + String(errorCode) + "'");
    });
  }
}


/********************************/
// Alert box functions
/********************************/

// Updates the page's alert box with the given text and optional alert type.
// Defaults to 'success' alert type if none given.
function alertMessage(msg, alertType) {
  if (typeof(alertType) === 'string')
    $("#alert_msg").setAlertClass('alert-' + alertType).html(msg);
  else
    $("#alert_msg").setAlertClass('alert-success').html(msg);
}


// Updates the page's alert box using an error code and optional alert type.
// Defaults to 'danger' i.e. error alert type if none given.
function alertErrorCode(errorCode, alertType) {
  getErrorDetails(errorCode, function (details) {
    if (typeof(alertType) === 'string')
      alertMessage(details, alertType);
    else
      alertMessage(details, 'danger');
  });
}
