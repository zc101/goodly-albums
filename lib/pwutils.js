// Password hashing, checking, and updating utilities

'use strict';
const assert = require('assert').strict;
const crypto = require('crypto');
const db = require('./db');
const userutils = require('./userutils');

// Check if a password string is 8-40 ASCII printable characters
function isValidPassword(password) {
  // This is part of the validation, so return instead of asserting
  if (typeof(password) !== 'string') return false;

  const rexp = /^[\ -~]{8,40}$/;
  if (password.match(rexp) === null)
    return false;
  else
    return true;
};


// Generates a 16-byte (32 hex character) random salt
function generateSalt() {
  try {
    return crypto.randomBytes(16).toString('hex');
  }
  catch (err) {
    console.error('Caught crypto error while generating salt');
    console.error(err);
    return null;
  }
};


// Hash a password synchronously using SHA256 PBKDF2 and the given salt
function hashPassword(password, salt, iterations) {
  assert(typeof(salt) === 'string', 'hashPassword: salt must be a string');
  if (isValidPassword(password)) {
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
};


// Check for a password match on the given user ID
// Returns a Boolean value
async function checkPasswordByID(userID, password) {
  assert(typeof(userID) === 'number', 'checkPasswordByID: userID must be a number');
  assert(typeof(password) === 'string', 'checkPasswordByID: password must be a string');

  let results = await db.select('password_hash', 'password_salt').from('users').where('user_id', userID);

  if (results && results.length) {
    if (results.length > 1) console.warn('checkPasswordByID: Found ' + String(results.length) + ' rows for userID ' + String(userID));
    let stored_hash = results[0].password_hash;
    let salt = results[0].password_salt;
    let hash = hashPassword(password, salt);
    if (hash === stored_hash)
      return true;
  }
  else
    console.warn('checkPasswordByID: No rows found for userID ' + String(userID));

  return false;
};


// Check for a password match using either a user ID or username
// Returns a Boolean value
async function checkPassword(user, password) {
  if (typeof(user) === 'number')
    return checkPasswordByID(user, password);
  else {
    assert(typeof(user) === 'string', 'checkPassword: user must be a number or string');

    let id = await userutils.getUserID(user);
    if (id === null)
      console.warn('checkPassword: Failed to get userID for user "' + user + '"');
    else
      return checkPasswordByID(id, password);
  }

  return false;
};


// Updates the password for a given user ID
// Returns a Boolean value
async function updatePasswordByID(userID, password) {
  assert(typeof(userID) === 'number', 'updatePasswordByID: userID must be a number');
  assert(typeof(password) === 'string', 'updatePasswordByID: password must be a string');

  let salt = generateSalt();
  let hash = hashPassword(password, salt);
  if (hash === null)
    return false;

  let affectedRows = 
    await db('users')
    .where('user_id', userID)
    .update({password_salt: salt, password_hash: hash});

  if (affectedRows) {
    if (affectedRows > 1) console.warn('updatePasswordByID: Updated ' + String(affectedRows) + ' rows for userID ' + String(userID));
    return true;
  }
  else
    console.warn('updatePasswordByID: No rows updated on userID ' + String(userID));

  return false;
}


// Updates the password for a given user name or ID
// Returns a Boolean value
async function updatePassword(user, password) {
  if (typeof(user) === 'number')
    return updatePasswordByID(user, password);
  else {
    assert(typeof(user) === 'string', 'updatePassword: user must be a number or string');

    let id = await userutils.getUserID(user);

    if (id === null)
      console.warn('updatePassword: ID could not be found for username "' + user + '"');
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
