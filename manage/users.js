// User ID retrieval, username checking/validation, etc. functionality

'use strict';
const assert = require('assert').strict;
const conf = require('./config');
const db = require('./db');
const pwmgr = require('./passwords');

// Check if a username matches the configured format
function isValidUsername(username) {
  // This is part of the validation, so return instead of asserting
  if (typeof(username) !== 'string') return false;

  if (username.match(conf.get('username_regex')) === null)
    return false;
  else
    return true;
};


// Return a user ID given a username, or null if not found
async function getUserID(username) {
  if (isValidUsername(username)) {
    let results = await db.select('user_id').from('users').where('user_name', username);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getUserID: Found ' + String(results.length) + ' rows for username "' + username + '"');
      return results[0].user_id;
    }
  }

  return null;
};


// Return a username given a userID, or null if not found
async function getUsername(userID) {
  if (typeof(userID) === 'number') {
    let results = await db.select('user_name').from('users').where('user_id', userID);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getUsername: Found ' + String(results.length) + ' rows for userID ' + String(userID));
      return results[0].user_name;
    }
  }

  return null;
};


// Adds a new user and returns the user ID, or null on failure
// Can optionally pass in a specific userID to use
async function addUser(username, password, userID) {
  if (isValidUsername(username) && pwmgr.isValidPassword(password)) {
    let existingID = await getUserID(username);
    if (existingID !== null) {
      logger.error('addUser: username "' + username + '" already exists under ID ' + String(existingID));
      return null;
    }

    let userRow = { user_name: username };

    if (typeof(userID) === 'number' && userID > 0) {
      let idCheck = await db.select('user_name').from('users').where('user_id', userID);
      if (idCheck.length) {
        logger.error('addUser: Given userID ' + String(userID) + ', but it\'s already in use under username "' + idCheck[0].user_name + '"');
        return null;
      }
      userRow.user_id = userID;
    }

    userRow.password_salt = pwmgr.generateSalt();
    userRow.password_hash = pwmgr.hashPassword(password, userRow.password_salt);
    let results = await db('users').insert(userRow);

    // On success, results should contain the ID (the primary key), whether we specified one or used autoincrement
    if (results && results.length)
      return results[0];
    else
      logger.error('addUser: INSERT returned nothing on username "' + username + '", userID <' + String(userID) + '>');
  }
  else
    logger.error('addUser: Received invalid username or password');

  return null;
};


// Deletes a given user by userID and returns a Boolean success value
async function deleteUserByID(userID) {
  assert(typeof(userID) === 'number', 'deleteUserByID: userID must be a number');

  let affectedRows = await db('users').where('user_id', userID).del();

  if (affectedRows) {
    if (affectedRows > 1) logger.warn('deleteUserByID: Deleted ' + String(affectedRows) + ' user rows for userID ' + String(userID));
    return true;
  }
  else
    logger.error('deleteUserByID: No rows updated (userID ' + String(userID) + ' probably doesn\'t exist)');

  return false;
};


// Deletes a given user by name or ID and returns a Boolean success value
async function deleteUser(user) {
  if (typeof(user) === 'number')
    return deleteUserByID(user);
  else {
    let id = await getUserID(user);
    if (id === null)
      logger.warn('deleteUser: ID could not be found for username "' + String(user) + '"');
    else
      return deleteUserByID(id);
  }

  return false;
};


module.exports = {
  isValidUsername
, getUserID
, getUsername
, addUser
, deleteUserByID
, deleteUser
};
