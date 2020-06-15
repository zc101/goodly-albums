// Endpoint for getting the media in an album (if the user is authorized to view it)

'use strict';
const albummgr = baseRequire('manage/albums');
const config = baseRequire('manage/config');
const errors = baseRequire('utils/error_codes');
const mediamgr = baseRequire('manage/media');

module.exports = async function (req, res) {
  let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
  let userID = res.locals.cookieTokens.auth_token.userID;

  let authorized = await albummgr.isAlbumAccessibleToUserID(albumID, userID);
  if (authorized) {
    let mediaList = await mediamgr.getMediaByAlbumID(albumID);
    res.status(200).send(mediaList);
  }
  else
    res.status(400).send(errors.NOT_ALBUM_AUTHORIZED);
};
