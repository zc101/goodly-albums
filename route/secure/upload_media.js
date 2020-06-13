// Endpoint for uploading and assigning media to albums

'use strict';
const config = baseRequire('manage/config');
const errors = baseRequire('utils/error_codes');
const mediamgr = baseRequire('manage/media');
const multer  = require('multer');
const uuid = require('uuid').v4;
const validator = require('validator');


// Initially use a UUID as the incoming filename
function computeMediaFilename(req, file, cb) {
  cb(null, uuid());
}


let multerOpts = {
  storage: multer.diskStorage({
    destination: config.get('media_incoming_dir')
  , filename: computeMediaFilename
  })
, limits: {
    fields: 2
  , fieldSize: config.get('media_max_size')
  , fileSize: config.get('media_max_size')
  , files: config.get('media_max_uploads')
  }
};

let upload = multer(multerOpts).array('media');


// Route handler
module.exports = async function (req, res) {
  // Check the album owner first before calling Multer
  // Also remember that the route may be called multiple times (once per chunk)
  // Should we embed album list in a cookie token to reduce lookups?
  // Make sure the album exists and the owner matches
/*  if (albumID >= 1) { // '!== NaN' won't work
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
*/

  upload(req, res, async function (err) {
    // Check for upload errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT')
        res.status(431).send(errors.TOO_MANY_FILES);
      else {
        if (err.code === 'LIMIT_FILE_SIZE')
          res.status(413).send(errors.FILE_TOO_LARGE);
        else {
          console.log("upload_media unhandled Multer error:");
          console.log(err);
          res.status(400).send(errors.UNKNOWN_ERROR);
        }
      }

      // Multer won't save any files if there was an error, so no cleanup is needed
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(500).send(errors.UNKNOWN_ERROR);
      return;
    }

    // Handle the media now that Multer has finished saving it
    // TODO: Use a truly async process which the client can check periodically, and then just return a status immediately
    // Also check Multer's provided MIME type first, as that's available earlier than file magic and few clients will maliciously fake the MIME type
    let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
    let userID = res.locals.cookieTokens.auth_token.userID;
    let mediaList = [];
    for (var file of req.files)
      mediaList.push(file.path);

    let errorCode = await mediamgr.addMedia(mediaList, albumID, userID);
    if (errorCode)
      res.status(400).send(errorCode);
    else
      res.status(200).send();
  });
}
