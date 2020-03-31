// Role utils

'use strict';
const assert = require('assert').strict;
const conf = require('./config');
const db = require('./db');

// Check if a role name matches the configured format
function isValidRoleName(rolename) {
  // This is part of the validation, so return instead of asserting
  if (typeof(rolename) !== 'string') return false;

  if (rolename.match(conf.get('rolename_regex')) === null)
    return false;
  else
    return true;
};


// Return a role ID given a role name, or null if not found
async function getRoleID(rolename) {
  if (isValidRoleName(rolename)) {
    let results = await db.select('role_id').from('roles').where('role_name', rolename);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getRoleID: Found ' + String(results.length) + ' rows for role name "' + rolename + '"');
      return results[0].role_id;
    }
  }

  return null;
};


// Return a role name given a role ID, or null if not found
async function getRoleName(roleID) {
  if (typeof(roleID) === 'number') {
    let results = await db.select('role_name').from('roles').where('role_id', roleID);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getRoleName: Found ' + String(results.length) + ' rows for roleID ' + String(roleID));
      return results[0].role_name;
    }
  }

  return null;
};


// Adds a new role and returns the role ID, or null on failure
// Can optionally pass in a specific roleID to use
async function addRole(rolename, roleID) {
  if (isValidRoleName(rolename)) {
    // Make sure the role name doesn't already exist
    let existingID = await getRoleID(rolename);
    if (existingID !== null) {
      logger.error('addRole: role name "' + rolename + '" already exists under ID ' + String(existingID));
      return null;
    }

    let roleRow = { role_name: rolename };

    // If we were passed a specific role ID...
    if (typeof(roleID) === 'number' && roleID > 0) {
      // Make sure it isn't already in use
      let existingName = await getRoleName(roleID);
      if (existingName !== null) {
        logger.error('addRole: Given roleID ' + String(roleID) + ', but it\'s already in use under role name "' + existingName + '"');
        return null;
      }

      // Use it
      roleRow.role_id = roleID;
    }

    let results = await db('roles').insert(roleRow);

    // On success, results should contain the ID (the primary key), whether we specified one or used autoincrement
    if (results && results.length)
      return results[0];
    else
      logger.error('addRole: INSERT returned nothing on role name "' + rolename + '", roleID <' + String(roleID) + '>');
  }
  else
    logger.error('addRole: Received invalid role name');

  return null;
};


// Deletes a given role by roleID and returns a Boolean success value
async function deleteRoleByID(roleID) {
  assert(typeof(roleID) === 'number', 'deleteRoleByID: roleID must be a number');

  // First delete any user linkage
  await db('user_roles').where('role_id', roleID).del();

  // Then delete the actual role
  let affectedRows = await db('roles').where('role_id', roleID).del();

  if (affectedRows) {
    if (affectedRows > 1) logger.warn('deleteRoleByID: Deleted ' + String(affectedRows) + ' role rows for roleID ' + String(roleID));
    return true;
  }
  else
    logger.error('deleteRoleByID: No rows updated (roleID ' + String(roleID) + ' probably didn\'t exist)');

  return false;
};


// Deletes a given role by name or ID and returns a Boolean success value
async function deleteRole(role) {
  if (typeof(role) === 'number')
    return deleteRoleByID(role);
  else {
    let id = await getRoleID(role);
    if (id === null)
      logger.warn('deleteRole: ID could not be found for role name "' + role + '"');
    else
      return deleteRoleByID(id);
  }

  return false;
};


module.exports = {
  isValidRoleName
, getRoleID
, getRoleName
, addRole
, deleteRoleByID
, deleteRole
};
