// Configurable app config

'use strict';
const assert = require('assert').strict;

// Create a logger that we can replace or disable for tests
global.logger = console;

var config = {
  database_connection_params: {
    socketPath      : '/var/run/mysqld/mysqld.sock'
  , user            : 'goodlyalbums-app'
  , password        : 'goodlyalbums-app'
  , database        : 'GOODLYALBUMS'
  }

, database_pool_params: {
    min: 2
  , max: 50
  }

// Default password hashing options
, password_salt_bytes: 16
, password_hash_iterations: 100000
, password_hash_bytes: 32
, password_hash_method: 'sha256'

// Default password requirements: 8-40 ASCII printable characters
, password_regex: /^[\ -~]{8,40}$/

/* Regex to check if a username obeys the following rules:
  Only contains alphanumeric characters, underscore and dot.
  Underscore and dot can't be at the end or start of a username (e.g _username / username_ / .username / username.).
  Underscore and dot can't be next to each other (e.g user_.name).
  Underscore or dot can't be used multiple times in a row (e.g user__name / user..name).
  Number of characters must be between 5 and 20 (inclusive).
  Regex courtesy of SO: https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username */
, username_regex: /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/

// Role name default regex. Similar to username one, except allowing 4 characters minimum
, rolename_regex: /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){2,18}[a-zA-Z0-9]$/
};


function set(name, value) {
  assert(typeof(name) === 'string');
  assert(typeof(value) !== 'undefined');

  if (config.hasOwnProperty(name))
    config[name] = value;
};


function get(name) {
  return config[name];
};


module.exports = {
  set
, get
};
