// User/role linking management

'use strict';
const assert = require('assert').strict;
const conf = require('./config');
const db = require('./db');
const rolemgr = require('./roles');
const usermgr = require('./users');

// Return a (possibly empty) list of role IDs given a user name or ID, or null on failure
async function getUserRoleIDs(user) {
  var userID = 0;

  if (typeof(user) === 'number')
    userID = user;
  else {
    userID = await usermgr.getUserID(user);
    if (userID === null)
      logger.warn('getUserRoles: userID could not be found for username "' + String(user) + '"');
  }

  if (userID && userID > 0) {
    let rows = await db.select('role_id').from('user_roles').where('user_id', userID);
    let ids = [];
    for (var n = 0; n < rows.length; ++n)
      ids.push(rows[n].role_id);

    return ids;
  }

  return null;
};


// Adds a new user-role link by IDs and returns a Boolean success flag
async function addUserRoleByID(userID, roleID) {
  assert(typeof(userID) === 'number', 'addUserRoleByID: userID must be a number');
  assert(typeof(roleID) === 'number', 'addUserRoleByID: roleID must be a number');

  // Make sure there isn't already a matching entry
  let results = await db.select().from('user_roles').where('user_id', userID).andWhere('role_id', roleID);
  if (results && results.length)
    return false;

  let newRow = { user_id: userID, role_id: roleID };

  // If the userID and/or roleID don't exist, this
  // should throw a foreign key constraint failure
  try {
    results = await db('user_roles').insert(newRow);
  }
  catch (err) {
    logger.error('addUserRoleByID: INSERT failed (probably either the userID or roleID didn\'t exist)');
    return false;
  }

  // On success, results should contain the ID (the primary key), whether we specified one or used autoincrement
  if (results && results.length)
    return true;
  else
    logger.error('addUserRoleByID: INSERT returned nothing');

  return false;
};


// Adds a new user-role link using names or IDs and returns a Boolean success flag
async function addUserRole(user, role) {
  var userID, roleID;

  if (typeof(user) === 'number')
    userID = user;
  else {
    userID = await usermgr.getUserID(user);
    if (userID === null) {
      logger.warn('addUserRole: ID could not be found for username "' + String(user) + '"');
      return false;
    }
  }

  if (typeof(role) === 'number')
    roleID = role;
  else {
    roleID = await rolemgr.getRoleID(role);
    if (roleID === null) {
      logger.warn('addUserRole: ID could not be found for role name "' + String(role) + '"');
      return false;
    }
  }

  return addUserRoleByID(userID, roleID);
};


// Deletes a user-role link by IDs and returns a Boolean success flag
async function deleteUserRoleByID(userID, roleID) {
  assert(typeof(userID) === 'number', 'deleteUserRoleByID: userID must be a number');
  assert(typeof(roleID) === 'number', 'deleteUserRoleByID: roleID must be a number');

  let affectedRows = await db('user_roles').where('user_id', userID).andWhere('role_id', roleID).del();

  if (affectedRows)
    return true;
  else
    logger.warn('deleteUserRoleByID: No rows deleted (row probably didn\'t exist)');

  return false;
};


// Deletes a user-role link using names or IDs and returns a Boolean success flag
async function deleteUserRole(user, role) {
  var userID, roleID;

  if (typeof(user) === 'number')
    userID = user;
  else {
    userID = await usermgr.getUserID(user);
    if (userID === null) {
      logger.warn('deleteUserRole: ID could not be found for username "' + String(user) + '"');
      return false;
    }
  }

  if (typeof(role) === 'number')
    roleID = role;
  else {
    roleID = await rolemgr.getRoleID(role);
    if (roleID === null) {
      logger.warn('deleteUserRole: ID could not be found for role name "' + String(role) + '"');
      return false;
    }
  }

  return deleteUserRoleByID(userID, roleID);
};


module.exports = {
  getUserRoleIDs
, addUserRoleByID
, addUserRole
, deleteUserRoleByID
, deleteUserRole
};
