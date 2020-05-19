// Album updates endpoint

'use strict';
const albummgr = baseRequire('manage/albums');
const config = baseRequire('manage/config');
const validator = require('validator');

// Route handler
module.exports = async function (req, res) {
  let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
  let albumName = (req.body && req.body.album_name) || req.query.album_name;
  let albumDesc = (req.body && req.body.album_desc) || req.query.album_desc;
  let albumCover = (req.body && req.body.album_cover) || req.query.album_cover;
  let albumPrivate = (req.body && req.body.album_private) || req.query.album_private;
  let userID = res.locals.cookieTokens.auth_token.userID;
  let fields = {};

  // Make sure the album exists and the owner matches
  if (albumID >= 1) { // '!== NaN' won't work
    let album = await albummgr.getAlbumDetailsByID(albumID);
    if (!album || album.owner_id !== userID) {
      res.status(400).send("Invalid album or ownership");
      return;
    }
  }
  else {
    res.status(400).send("Invalid album ID");
    return;
  }

  // Validate new album name, if given
  if (typeof(albumName) !== 'undefined') {
    if (albummgr.isValidAlbumName(albumName)) {
      let existingID = await albummgr.getAlbumID(albumName);
      if (existingID === albumID || existingID === null) {
        fields.album_name = albumName;
      }
      else {
        res.status(400).send("That album name is already taken");
        return;
      }
    }
    else {
      res.status(400).send("Invalid album name");
      return;
    }
  }

  // Validate new album description, if given
  if (typeof(albumDesc) === 'string') {
    let descMaxLen = config.get("album_desc_maxlen");
    if (albumDesc.length <= descMaxLen) {
      fields.album_desc = validator.escape(albumDesc); // Sanitize it
    }
    else {
      res.status(400).send("Album description too long (must be " + String(descMaxLen) + " characters or less)");
      return;
    }
  }

  // Validate new album cover, if given
  if (typeof(albumCover) === 'string') {
    if (mediamgr.isValidCover(albumCover)) {
      fields.album_cover = albumCover;
    }
    else {
      res.status(400).send("Invalid album cover");
      return;
    }
  }

  // Use new album privacy flag, if given
  if (typeof(albumPrivate) !== 'undefined')
    fields.album_private = !!albumPrivate;

  // Perform the update if there's anything to update
  if (Object.keys(fields).length) {
    let success = await albummgr.updateAlbumByID(albumID, fields);
    if (!success) {
      res.status(500).send("An unknown error occurred");
      return;
    }
  }

  res.status(200).send();
};
