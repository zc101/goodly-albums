// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());


// Set the target to have only the specific classes given
// Courtesy of https://stackoverflow.com/questions/5205052/set-class-with-jquery
$.fn.setClass = function(classes) {
  this.attr('class', classes);
  return this;
};


// Sets the target to have only some classes universal to alerts, in addition to the given ones
$.fn.setAlertClass = function(classes) {
  this.setClass("mb-0 alert " + classes);
  return this;
};
