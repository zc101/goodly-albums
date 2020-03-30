// Password hashing, checking, and updating utilities

'use strict';
const assert = require('assert').strict;
const crypto = require('crypto');
const db = require('./db');
const userutils = require('./userutils');

let pwutils = {

  // Check if a password string is 8-40 ASCII printable characters
  isValidPassword: function(password) {
    // This is part of the validation, so return instead of asserting
    if (typeof(password) !== 'string') return false;

    const rexp = /^[\ -~]{8,40}$/;
    if (password.match(rexp) === null)
      return false;
    else
      return true;
  }


  // Generates a 16-byte (32 hex character) random salt
, generateSalt: function() {
    try {
      return crypto.randomBytes(16).toString('hex');
    }
    catch (err) {
      console.error('Caught crypto error while generating salt');
      console.error(err);
      return null;
    }
  }


  // Hash a password synchronously using SHA256 PBKDF2 and the given salt
, hashPassword: function(password, salt, iterations) {
    assert(typeof(salt) === 'string', 'hashPassword: salt must be a string');
    if (pwutils.isValidPassword(password)) {
      if (typeof(iterations) == 'number' && iterations > 0)
        var iters = iterations;
      else
        var iters = 100000;
      try {
        return crypto.pbkdf2Sync(password, salt, iters, 32, 'sha256').toString('hex');
      }
      catch (err) {
        console.error('Caught crypto error while hashing password');
        console.error(err);
        return null;
      }
    }
    else return null;
  }


  // Match a user password against the database using specifically a user ID
  // Passes a Boolean value to the callback
, checkPasswordForID: function(userID, password, cb) {
    assert(typeof(userID) === 'number', 'checkPasswordForID: userID must be a number');
    assert(typeof(password) === 'string', 'checkPasswordForID: password must be a string');
    assert(typeof(cb) === 'function', 'checkPasswordForID: Callback must be a function');

    try {
      const q = 'SELECT password_hash, password_salt FROM users WHERE user_id = ' + db.escape(userID) + ';';
      db.query(q, function (err, results, fields) {
        if (err) throw err;
        if (results.length) {
          let stored_hash = results[0].password_hash;
          let salt = results[0].password_salt;
          let hash = pwutils.hashPassword(password, salt);
          if (hash === stored_hash)
            cb(true);
          else
            cb(false);
        }
        else cb(false);
      });
    }
    catch (err) {
      // A connection error doesn't mean it's a bad password; just skip callback altogether
      //cb(false);
      return;
    }
  }


  // Match a user password against the database using either a user ID or username
  // Passes a Boolean value to the callback
, checkPassword: function(user, password, cb) {
    assert(typeof(cb) === 'function', 'checkPasswordForID: Callback must be a function');
    if (typeof(user) === 'number')
      pwutils.checkPasswordForID(user, password, cb);
    else {
      assert(typeof(user) === 'string', 'checkPassword: user must be a number or string');
      userutils.getUserID(user, function(id) {
        if (id === null) {
          console.warn('checkPassword: Failed to get userID for user "' + user + '"');
          cb(false); // Could be a connection error, but more likely a bad username
        }
        else
          pwutils.checkPasswordForID(id, password, cb);
      });
    }
  }


  // Updates the password for a given user ID
  // Optionally calls a given callback with a Boolean when done
, updatePasswordForID: function(userID, password, cb) {
    assert(typeof(userID) === 'number', 'checkPasswordForID: userID must be a number');
    assert(typeof(password) === 'string', 'checkPasswordForID: password must be a string');

    try {
      let salt = pwutils.generateSalt();
      let hash = pwutils.hashPassword(password, salt);
      if (hash === null)
        throw new Error('Bad password or salt');

      const q = 'UPDATE users SET password_hash = ' + db.escape(hash) + ', password_salt = ' + db.escape(salt) + ' WHERE user_id = ' + db.escape(userID) + ';';
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


  // Updates the password for a given user name or ID
  // Optionally calls a given callback when done
, updatePassword: function(user, password, cb) {
    if (typeof(user) === 'number')
      pwutils.updatePasswordForID(user, password, cb);
    else {
      assert(typeof(user) === 'string', 'updatePassword: user must be a number or string');
      userutils.getUserID(user, function(id) {
        if (id === null) {
          console.warn('updatePassword: ID could not be found for username "' + user + '"');
          if (typeof(cb) === 'function') cb(false);
        }
        else
          pwutils.updatePasswordForID(id, password, cb);
      });
    }
  }
};
module.exports = pwutils;
