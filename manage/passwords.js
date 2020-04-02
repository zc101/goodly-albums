// Password hashing, checking, and updating functionality

'use strict';
const assert = require('assert').strict;
const conf = require('./config');
const crypto = require('crypto');
const db = require('./db');

// Include a local copy of users/getUserID() to avoid circular script dependencies.
// Return a user ID given a username, or null if not found
async function getUserID(username) {
  if (typeof(username) === 'string' && username.match(conf.get('username_regex')) !== null) {
    let results = await db.select('user_id').from('users').where('user_name', username);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getUserID: Found ' + String(results.length) + ' rows for username "' + username + '"');
      return results[0].user_id;
    }
  }

  return null;
};


// Check if a password string matches the configured format
function isValidPassword(password) {
  // This is part of the validation, so return instead of asserting
  if (typeof(password) !== 'string') return false;

  if (password.match(conf.get('password_regex')) === null)
    return false;
  else
    return true;
};


// Generate a random salt and return it as a Base64 string
function generateSalt() {
  try {
    let saltBytes = conf.get('password_salt_bytes');
    return crypto.randomBytes(saltBytes).toString('base64');
  }
  catch (err) {
    logger.error('Caught crypto error while generating salt');
    logger.error(err);
    return null;
  }
};


// Hash a password synchronously using PBKDF2 and the given salt and return it as a Base64 string
function hashPassword(password, salt) {
  assert(typeof(salt) === 'string', 'hashPassword: salt must be a string');
  if (isValidPassword(password)) {
    try {
      let iters = conf.get('password_hash_iterations');
      let hashBytes = conf.get('password_hash_bytes');
      let hashMethod = conf.get('password_hash_method');
      return crypto.pbkdf2Sync(password, salt, iters, hashBytes, hashMethod).toString('base64');
    }
    catch (err) {
      logger.error('Caught crypto error while hashing password');
      logger.error(err);
      return null;
    }
  }
  else return null;
};


// Check for a password match on the given user ID
// Returns a Boolean value
async function checkPasswordByID(userID, password) {
  assert(typeof(userID) === 'number', 'checkPasswordByID: userID must be a number');
  assert(typeof(password) === 'string', 'checkPasswordByID: password must be a string');

  let results = await db.select('password_hash', 'password_salt').from('users').where('user_id', userID);

  if (results && results.length) {
    if (results.length > 1) logger.warn('checkPasswordByID: Found ' + String(results.length) + ' rows for userID ' + String(userID));
    let stored_hash = results[0].password_hash;
    let salt = results[0].password_salt;
    let hash = hashPassword(password, salt);
    if (hash === stored_hash)
      return true;
  }
  else
    logger.warn('checkPasswordByID: No rows found for userID ' + String(userID));

  return false;
};


// Check for a password match using either a user ID or username
// Returns a Boolean value
async function checkPassword(user, password) {
  if (typeof(user) === 'number')
    return checkPasswordByID(user, password);
  else {
    assert(typeof(user) === 'string', 'checkPassword: user must be a number or string');

    let id = await getUserID(user);
    if (id === null)
      logger.warn('checkPassword: Failed to get userID for user "' + user + '"');
    else
      return checkPasswordByID(id, password);
  }

  return false;
};


// Updates the password for a given user ID if different than the existing one
// Returns a Boolean value
async function updatePasswordByID(userID, password) {
  assert(typeof(userID) === 'number', 'updatePasswordByID: userID must be a number');
  assert(typeof(password) === 'string', 'updatePasswordByID: password must be a string');

  // Verify that the password is different
  if (await checkPasswordByID(userID, password) === true)
    return false;

  let salt = generateSalt();
  let hash = hashPassword(password, salt);
  if (hash === null)
    return false;

  let affectedRows = 
    await db('users')
    .where('user_id', userID)
    .update({password_salt: salt, password_hash: hash});

  if (affectedRows) {
    if (affectedRows > 1) logger.warn('updatePasswordByID: Updated ' + String(affectedRows) + ' rows for userID ' + String(userID));
    return true;
  }
  else
    logger.warn('updatePasswordByID: No rows updated on userID ' + String(userID));

  return false;
}


// Updates the password for a given user name or ID
// Returns a Boolean value
async function updatePassword(user, password) {
  if (typeof(user) === 'number')
    return updatePasswordByID(user, password);
  else {
    assert(typeof(user) === 'string', 'updatePassword: user must be a number or string');

    let id = await getUserID(user);

    if (id === null)
      logger.warn('updatePassword: ID could not be found for username "' + user + '"');
    else
      return updatePasswordByID(id, password);
  }

  return false;
}


module.exports = {
  isValidPassword
, generateSalt
, hashPassword
, checkPasswordByID
, checkPassword
, updatePasswordByID
, updatePassword
};
