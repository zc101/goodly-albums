// Route to get and return a list of all public albums

'use strict';
const albummgr = baseRequire('manage/albums');

module.exports = async function (req, res) {
  let albums = await albummgr.getPublicAlbums();
  res.status(200).send(albums);
};
