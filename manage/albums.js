// Album utilities

'use strict';
const assert = require('assert').strict;
const conf = require('./config');
const db = require('./db');
const usermgr = require('./users');


// Check if an album name matches the configured format
function isValidAlbumName(albumName) {
  // This is part of the validation, so return instead of asserting
  if (typeof(albumName) !== 'string') return false;

  if (albumName.match(conf.get('albumName_regex')) === null)
    return false;
  else
    return true;
};


// Return an album ID given an album name, or null if not found
async function getAlbumID(albumName) {
  if (isValidAlbumName(albumName)) {
    let results = await db.select('album_id').from('albums').where('album_name', albumName);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getAlbumID: Found ' + String(results.length) + ' rows for album name "' + albumName + '"');
      return results[0].album_id;
    }
  }

  return null;
};


// Return an album name given an album ID, or null if not found
async function getAlbumName(albumID) {
  if (typeof(albumID) === 'number') {
    let results = await db.select('album_name').from('albums').where('album_id', albumID);
    if (results && results.length) {
      if (results.length > 1) logger.warn('getAlbumName: Found ' + String(results.length) + ' rows for albumID ' + String(albumID));
      return results[0].album_name;
    }
  }

  return null;
};


// Return the data associated with the given album ID
async function getAlbumDetailsByID(albumID) {
  if (typeof(albumID) === 'number') {
    let results = await db.select().from('albums').where('album_id', albumID);
    if (results && results.length) {
      return results[0];
    }
  }

  return null;
};


// Return a list of album objects given a userID (empty list if none found)
async function getAlbumsByUserID(userID) {
  if (typeof(userID) === 'number') {
    let results = await db.select('album_id', 'album_name', 'album_desc', 'album_cover', 'album_private').from('albums').where('owner_id', userID);
    if (results && results.length) {
      return results;
    }
  }

  return [];
};


// Return a boolean value indicating whether the given user ID owns a given album ID
async function isAlbumOwnedByUserID(albumID, userID) {
  if (!!albumID && typeof(albumID) === 'number' && !!userID && typeof(userID) === 'number') {
    let results = await db.select('album_id').from('albums').where({'album_id': albumID, 'owner_id': userID});
    if (results && results.length)
      return true;
  }

  return false;
};


// Return a list of public album objects (empty list if none found)
async function getPublicAlbums() {
  let results = await db.select('album_id', 'album_name', 'album_desc', 'album_cover').from('albums').where('album_private', 0);
  if (results && results.length) {
    return results;
  }

  return [];
};


// Adds a new album linked to the given userID and returns an albumID, or null on failure
// Can optionally pass in a description and a specific albumID to use
async function createAlbum(userID, albumName, desc, isPrivate, albumID) {
  if (isValidAlbumName(albumName)) {
    // Make sure the album name doesn't already exist
    let existingID = await getAlbumID(albumName);
    if (existingID !== null) {
      logger.error('createAlbum: album name "' + albumName + '" already exists under ID ' + String(existingID));
      return null;
    }

    // Make sure the userID is valid
    let username = await usermgr.getUsername(userID);
    if (username === null) {
      logger.error('createAlbum: given invalid userID ' + String(userID));
      return null;
    }

    let albumRow = {
      album_name: albumName
    , owner_id: userID
    , album_private: isPrivate ? 1 : 0
    };

    // If we were passed a description string, truncate it to the max length and use it
    if (typeof(desc) === 'string')
      albumRow.album_desc = desc.slice(0, conf.get('album_desc_maxlen'));

    // If we were passed a specific album ID...
    if (typeof(albumID) === 'number' && albumID > 0) {
      // Make sure it isn't already in use
      let existingName = await getAlbumName(albumID);
      if (existingName !== null) {
        logger.error('createAlbum: Given albumID ' + String(albumID) + ', but it\'s already in use under album name "' + existingName + '"');
        return null;
      }
      // Use it
      albumRow.album_id = albumID;
    }

    let results = await db('albums').insert(albumRow);

    // On success, results should contain the ID (the primary key), whether we specified one or used autoincrement
    if (results && results.length)
      return results[0];
    else
      logger.error('createAlbum: INSERT returned nothing on album name "' + albumName + '", albumID <' + String(albumID) + '>');
  }
  else
    logger.error('createAlbum: Received invalid album name');

  return null;
};


// Updates album details and returns a Boolean success value
async function updateAlbumByID(albumID, fields) {
  if (typeof(albumID) === 'number' && typeof(fields) === 'object') {

    // Copy acceptable fields to a new object
    var newDetails = {};
    if (isValidAlbumName(fields.album_name))
      newDetails.album_name = fields.album_name;
    if (typeof(fields.album_desc) === 'string' && fields.album_desc.length < conf.get("album_desc_maxlen"))
      newDetails.album_desc = fields.album_desc;
    if (typeof(fields.album_cover) === 'string' && fields.album_cover.length === 36)
      newDetails.album_cover = fields.album_cover;
    if (typeof(fields.album_private) !== 'undefined')
      newDetails.album_private = fields.album_private ? 1 : 0;

    let affectedRows = await db('albums').where('album_id', albumID).update(newDetails);

    if (affectedRows) {
      if (affectedRows > 1) logger.warn('updateAlbumByID: Updated ' + String(affectedRows) + ' album rows for albumID ' + String(albumID));
      return true;
    }
    else
      logger.error('updateAlbumByID: No rows updated for albumID ' + String(albumID));
  }

  return false;
};


// Deletes a given album by albumID and returns a Boolean success value
async function deleteAlbumByID(albumID) {
  assert(typeof(albumID) === 'number', 'deleteAlbumByID: albumID must be a number');

  // First delete any media linkages
  await db('media').where('album_id', albumID).del();

  // TODO: Delete any media files not linked by other albums

  // Then delete the actual album
  let affectedRows = await db('albums').where('album_id', albumID).del();

  if (affectedRows) {
    if (affectedRows > 1) logger.warn('deleteAlbumByID: Deleted ' + String(affectedRows) + ' album rows for albumID ' + String(albumID));
    return true;
  }
  else
    logger.error('deleteAlbumByID: No rows updated (albumID ' + String(albumID) + ' probably didn\'t exist)');

  return false;
};


// Deletes a given album by name or ID and returns a Boolean success value
async function deleteAlbum(album) {
  if (typeof(album) === 'number')
    return deleteAlbumByID(album);
  else {
    let id = await getAlbumID(album);
    if (id === null)
      logger.warn('deleteAlbum: ID could not be found for album name "' + album + '"');
    else
      return deleteAlbumByID(id);
  }

  return false;
};


module.exports = {
  isValidAlbumName
, getAlbumID
, getAlbumName
, getAlbumDetailsByID
, getAlbumsByUserID
, isAlbumOwnedByUserID
, getPublicAlbums
, createAlbum
, updateAlbumByID
, deleteAlbumByID
, deleteAlbum
};
