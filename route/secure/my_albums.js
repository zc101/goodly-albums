// Route to get the user's albums and return them

'use strict';
const albummgr = baseRequire('manage/albums');

module.exports = async function (req, res) {
  let auth = res.locals.cookieTokens.auth_token;
  let albums = await albummgr.getAlbumsByUserID(auth.userID);
  res.status(200).send(albums);
};
