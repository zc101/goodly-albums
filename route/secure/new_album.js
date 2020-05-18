// New album creation

'use strict';
const albummgr = baseRequire('manage/albums');

// Route handler
module.exports = async function (req, res) {
  let albumName = (req.body && req.body.album_name) || req.query.album_name;
  let albumDesc = (req.body && req.body.album_desc) || req.query.album_desc;
  let userID = res.locals.cookieTokens.auth_token.userID;

/* Currently createAlbum() just truncates the desc if too long
  // Make sure the description is the right length, if we were given one
  if (typeof(albumDesc) === 'string') {
    let descMaxLen = config.get("album_desc_maxlen");
    if (albumDesc.length > descMaxLen) {
      res.status(400).send("Album description too long (must be " + String(descMaxLen) + " characters or less)");
      return;
    }
  }
*/

  // Make sure the album name is valid and doesn't already exist
  if (albummgr.isValidAlbumName(albumName)) {
    let existingID = await albummgr.getAlbumID(albumName);
    if (existingID === null) {
      let newID = await albummgr.createAlbum(userID, albumName, albumDesc);
      if (newID === null)
        res.status(400).send("An unknown error occurred");
      else
        res.status(200).send();
    }
    else
      res.status(400).send("An album already exists with that name");
  }
  else
    res.status(400).send("Invalid album name");
};
