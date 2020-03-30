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


  // Return a user ID given a username, or null if not found
, getUserID: async function(username) {
    if (userutils.isValidUsername(username)) {
      let results = await db.select('user_id').from('users').where('user_name', username);
      if (results && results.length) {
        if (results.length > 1) console.warn('getUserID: Found ' + String(results.length) + ' rows for username "' + username + '"');
        return results[0].user_id;
      }
    }

    return null;
  }


  // Adds a new user and returns the user ID, or null on failure
  // Can optionally pass in a specific userID to use
, addUser: async function(username, password, userID) {
    if (userutils.isValidUsername(username) && pwutils.isValidPassword(password)) {
      let existingID = await userutils.getUserID(username);
      if (existingID !== null) {
        console.error('addUser: username "' + username + '" already exists under ID ' + String(existingID));
        return null;
      }

      let userRow = { user_name: username };

      if (typeof(userID) === 'number' && userID > 0) {
        let idCheck = await db.select('user_name').from('users').where('user_id', userID);
        if (idCheck.length) {
          console.error('addUser: Given userID ' + String(userID) + ', but it\'s already in use under username "' + idCheck[0].user_name + '"');
          return null;
        }
        userRow.user_id = userID;
      }

      userRow.password_salt = pwutils.generateSalt();
      userRow.password_hash = pwutils.hashPassword(password, userRow.password_salt);
      let results = await db('users').insert(userRow);

      // On success, results should contain the ID (the primary key), whether we specified one or used autoincrement
      if (results && results.length)
        return results[0];
      else
        console.error('addUser: INSERT returned nothing on username "' + username + '", userID <' + String(userID) + '>');
    }
    else
      console.error('addUser: Received invalid username or password');

    return null;
  }


  // Deletes a given user by userID and returns a Boolean success value
, deleteUserByID: async function(userID) {
    assert(typeof(userID) === 'number', 'deleteUserByID: userID must be a number');

    let affectedRows = await db('users').where('user_id', userID).del();

    if (affectedRows) {
      if (affectedRows > 1) console.warn('deleteUserByID: Deleted ' + String(affectedRows) + ' user rows for userID ' + String(userID));
      return true;
    }
    else
      console.error('deleteUserByID: No rows updated (userID ' + String(userID) + ' probably doesn\'t exist)');

    return false;
  }


  // Deletes a given user by name or ID and returns a Boolean success value
, deleteUser: async function(user) {
    if (typeof(user) === 'number')
      return userutils.deleteUserByID(user);
    else {
      let id = await userutils.getUserID(user);
      if (id === null)
        console.warn('deleteUser: ID could not be found for username "' + String(user) + '"');
      else
        return userutils.deleteUserByID(id);
    }

    return false;
  }
};
module.exports = userutils;
