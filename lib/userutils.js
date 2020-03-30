// User ID retrieval, username checking/validation, etc. utils

'use strict';
const assert = require('assert').strict;
const db = require('./db');
const pwutils = require('./pwutils');

let userutils = {

  /* Check if a username obeys the following rules:
    Only contains alphanumeric characters, underscore and dot.
    Underscore and dot can't be at the end or start of a username (e.g _username / username_ / .username / username.).
    Underscore and dot can't be next to each other (e.g user_.name).
    Underscore or dot can't be used multiple times in a row (e.g user__name / user..name).
    Number of characters must be between 5 and 20 (inclusive). */
  isValidUsername: function(username) {
    // This is part of the validation, so return instead of asserting
    if (typeof(username) !== 'string') return false;

    // Regexp courtesy of SO: https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
    const rexp = /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/;
    if (username.match(rexp) === null)
      return false;
    else
      return true;
  }


  // Send callback a user ID given a username, or null if it doesn't exist
, getUserID: function(username, cb) {
    assert(typeof(username) === 'string', 'getUserID: username must be a string');
    assert(typeof(cb) === 'function', 'getUserID: Callback must be a function');

    if (userutils.isValidUsername(username)) {
      try {
        const q = 'SELECT user_id FROM users WHERE user_name = ' + db.escape(username) + ';';
        db.query(q, function (err, results, fields) {
          if (err) throw err;
          if (results.length) {
            if (results.length > 1) console.warn("Multiple records returned for username '" + username + "'");
            cb(results[0].user_id);
          }
          else cb(null);
        });
      }
      catch (err) {
        cb(null);
      }
    }
    else cb(null);
  }


  // Adds a new user and passes the user ID to the optional callback
  // Can optionally pass userID parameter
, addUser: function(username, password, cb, userID) {
    if (userutils.isValidUsername(username) && pwutils.isValidPassword(password)) {
      userutils.getUserID(username, function(existing_id) {
        try {
          if (typeof(existing_id) === 'number')
            throw new Error('ID ' + existing_id + ' already exists for username');

          let salt = pwutils.generateSalt();
          let hash = pwutils.hashPassword(password, salt);
          var q;

          if (typeof(userID) === 'number' && userID > 0)
            q = 'INSERT INTO users (user_id, user_name, password_hash, password_salt) VALUES (' + db.escape(userID) + ',' + db.escape(username) + ',' + db.escape(hash) + ',' + db.escape(salt) + ');';
          else
            q = 'INSERT INTO users (user_name, password_hash, password_salt) VALUES (' + db.escape(username) + ',' + db.escape(hash) + ',' + db.escape(salt) + ');';

          db.query(q, function (err, results, fields) {
            if (err) throw err;

            // If the insert failed, results are undefined
            // On success, insertId should be returned whether we specified an ID (primary key) or used autoincrement
            if (results && results.insertId) {
              if (typeof(cb) === 'function') cb(results.insertId);
            }
            else {
              console.log(results);
              throw new Error('INSERT failed (userID ' + userID + ' likely already in use)');
            }
          });
        }
        catch (err) {
          console.error('Thrown while adding user "' + username + '": ' + err);
          if (typeof(cb) === 'function') cb(null);
        }
      });
    }
    else {
      console.warn('addUser: Received invalid username or password params');
      if (typeof(cb) === 'function') cb(null);
    }
  }


  // Deletes a given user by userID
  // Optionally calls a given callback with a Boolean when done
, deleteUserByID: function(userID, cb) {
    assert(typeof(userID) === 'number', 'deleteUserByID: userID must be a number');
    try {
      const q = 'DELETE FROM users WHERE user_id = ' + db.escape(userID) + ';';
      db.query(q, function (err, results, fields) {
        if (err) throw err;
        if (results.affectedRows) {
          if (results.affectedRows > 1) console.warn('Updated multiple password rows for userID ' + userID);
          if (typeof(cb) === 'function') cb(true);
        }
        else
          throw new Error('No rows updated');
      });
    }
    catch (err) {
      console.error('Thrown while updating password for userID ' + userID + ': ' + err);
      if (typeof(cb) === 'function') cb(false);
    }
  }


  // Deletes a given user by name or ID
  // Optionally calls a given callback when done
, deleteUser: function(user, cb) {
    if (typeof(user) === 'number')
      userutils.deleteUserByID(user, cb);
    else {
      assert(typeof(user) === 'string', 'deleteUser: user must be a number or string');
      userutils.getUserID(user, function(id) {
        if (id === null) {
          console.warn('deleteUser: ID could not be found for username "' + user + '"');
          if (typeof(cb) === 'function') cb(false);
          return;
        }
        userutils.deleteUserByID(id, cb);
      });
    }
  }
};
module.exports = userutils;
