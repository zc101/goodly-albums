// Endpoint for getting the media in an album (if the user is authorized to view it)

'use strict';
const albummgr = baseRequire('manage/albums');
const config = baseRequire('manage/config');
const errors = baseRequire('utils/error_codes');
const mediamgr = baseRequire('manage/media');


async function sendResponse (res, albumID, isOwner) {
  let mediaList = await mediamgr.getMediaByAlbumID(albumID);
  let response = {
    isOwner: isOwner
  , media: mediaList
  };
  res.status(200).send(response);
}


module.exports = async function (req, res) {
  let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
  let userID = null;
  if (res.locals.cookieTokens && res.locals.cookieTokens.auth_token)
    userID = res.locals.cookieTokens.auth_token.userID;

  let isOwner = await albummgr.isAlbumOwnedByUserID(albumID, userID);
  if (isOwner)
    sendResponse(res, albumID, isOwner);
  else {
    let isAuthorized = await albummgr.isAlbumAccessibleToUserID(albumID, userID);
    if (isAuthorized)
      sendResponse(res, albumID, isOwner);
    else
      res.status(400).send(errors.NOT_ALBUM_AUTHORIZED);
  }
};
