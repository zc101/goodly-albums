// Functions to process, move, and assign media to albums

'use strict';
const albummgr = baseRequire('manage/albums');
const config = baseRequire('manage/config');
const crypto = require('crypto');
const db = require('./db');
const errors = baseRequire('utils/error_codes');
const filetype = require('file-type');
const fs = require('fs');
const path = require('path');

// Make media directories if needed
fs.mkdir(config.get('media_incoming_dir'), err => {});
fs.mkdir(config.get('media_processed_dir'), err => {});


/********************************/
// Helper functions
/********************************/

// Adds filename entries to the media table
async function insertMediaEntries(mediaFiles, albumID) {
  let mediaList = [];
  for (var fn of mediaFiles) {
    if (fn && fn.length === 44)
      mediaList.push({album_id: albumID, media_file: fn});
    else
      logger.error('media.addMediaEntries: Filename invalid and/or the wrong length');
  }

  // Just replace if some rows already exist so we don't have errors.
  // TODO: This is currently a hackish, fairly MySQL-specific way of doing it.
  let query = db('media').insert(mediaList).toString() + ' ON DUPLICATE KEY UPDATE album_id=album_id';
  let results = await db.raw(query);
  if (results && results.length)
    return true;
  else {
    logger.error('media.addMediaEntries: INSERT returned nothing on a media list going to albumID <' + String(albumID) + '>');
    return false;
  }
}


// Returns the appropriate file extension of a buffer if it's an acceptable file type; otherwise null
async function getFileExtension(fileBuf) {
  if (fileBuf instanceof Buffer) {
    var ft = await filetype.fromBuffer(fileBuf);
    return ft.ext;
  }
  else {
    logger.error('media.getFileExtension: Given a non-buffer parameter');
    return null;
  }
}


// Given a filename, returns an object containing a file buffer and validated extension, or null on failure
async function getValidatedFile(fn) {
  try {
    let fileBuf = await fs.promises.readFile(fn);
    let fileExt = await getFileExtension(fileBuf);
    let acceptedTypes = config.get('media_accepted_types');
    if (fileExt in acceptedTypes)
      return {buf: fileBuf, ext: acceptedTypes[fileExt]};
    else {
      // Remove bad file type
      fs.unlink(fn, err => {if (err) logger.warn(err)});
      return null;
    }
  }
  catch (e) {
    return null;
  }
}


// Given a buf+ext file object, returns a new hash+ext filename, or null on failure
function getHashFilename(file) {
  if (file && file.buf && file.ext) {
    const hash = crypto.createHash(config.get('media_hash_method'));
    hash.update(file.buf);
    var newFn = hash.digest('hex') + file.ext;
    return newFn;
  }
  else
    return null;
}


/********************************/
// Main module functions
/********************************/

// Processes incoming media, returning either 0 for success or an error code
async function addMedia(fileList, albumID, userID) {
  let returnCode = 0;
  let isOwner = await albummgr.isAlbumOwnedByUserID(albumID, userID);

  if (isOwner) {
    let mediaEntries = [];
    for (var fn of fileList) {
      let file = await getValidatedFile(fn);
      if (file) {
        let newFn = getHashFilename(file);
        let newPath = path.join(config.get('media_processed_dir'), newFn);
        await fs.promises.rename(fn, newPath);
        mediaEntries.push(newFn);
        logger.log("media.processMedia: " + fn + " -> " + newPath);
      }
      else {
        logger.warn("media.processMedia: Received unacceptable file '" + fn + "'");
        returnCode = errors.FILE_TYPE_NOT_ACCEPTED;
      }
    }
    await insertMediaEntries(mediaEntries, albumID);
  }
  else {
    // Delete unauthorized files
    for (var fn of fileList)
      fs.unlink(fn, err => {if (err) logger.warn(err)});
    returnCode = errors.NOT_ALBUM_OWNER;
  }

  return returnCode;
}


// Returns a list of media objects given an album ID (or an empty list if none found)
async function getMediaByAlbumID(albumID) {
  if (typeof(albumID) === 'number' && albumID > -1) {
    let results = await db.select('media_file', 'media_caption').from('media').where('album_id', albumID);
    if (results && results.length) {
      return results;
    }
  }

  return [];
};


module.exports = {
  addMedia
, getMediaByAlbumID
};
