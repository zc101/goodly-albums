// Toggle an album's 'private' status

'use strict';
const albummgr = baseRequire('manage/albums');

// Route handler
module.exports = async function (req, res) {
  let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
  let userID = res.locals.cookieTokens.auth_token.userID;

  // Get the album details
  if (albumID >= 1) { // '!== NaN' won't work
    let album = await albummgr.getAlbumDetailsByID(albumID);

    // Make sure the album exists and the owner matches
    if (album && album.owner_id === userID) {

      // Flip the current value
      let newPrivacy = !album.album_private;
      let success = await albummgr.updateAlbumByID(albumID, {album_private: newPrivacy});

      if (success) {
        res.status(200).send();
        return;
      }
      else {
        res.status(500).send("An unknown error occurred");
        return;
      }
    }
  }

  res.status(400).send();
};
