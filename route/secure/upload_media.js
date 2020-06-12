// Endpoint for uploading and assigning media to albums

'use strict';
const albummgr = baseRequire('manage/albums');
const config = baseRequire('manage/config');
const crypto = require('crypto');
const errors = baseRequire('utils/error_codes');
const filetype = require('file-type');
const fs = require('fs');
const mediamgr = baseRequire('manage/media');
const multer  = require('multer');
const path = require('path');
const validator = require('validator');


// Keep track of the range of incoming files
let incomingLow = 0;
let incomingHigh = 0;

// Use current incomingHigh as the initial filename and increment
function computeMediaFilename(req, file, cb) {
  cb(null, String(incomingHigh++));
}

let multerOpts = {
  storage: multer.diskStorage({
    destination: 'media-incoming'
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
  let albumID = parseInt((req.body && req.body.album_id) || req.query.album_id);
  let userID = res.locals.cookieTokens.auth_token.userID;
  let returnPage = '/en/view_album.html?status=';

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
    // Check for errors
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
    // TODO: Move this into a separate async process which the client can check periodically, and return a status immediately
    // Also check Multer's provided MIME type first, as that's available earlier than file magic and few clients will maliciously fake the MIME type
    var acceptedTypes = config.get('media_accepted_types');
    for (var file of req.files) {
      var fileBuf = fs.readFileSync(file.path);
      var ft = await filetype.fromBuffer(fileBuf);
      if (ft.ext in acceptedTypes) {
        const hash = crypto.createHash(config.get('media_hash_method'));
        hash.update(fileBuf);
        var newFn = hash.digest('hex') + acceptedTypes[ft.ext];
        var newPath = path.join('static', 'media', newFn);
        console.log(file.path + " -> " + newPath);
        fs.renameSync(file.path, newPath);
      }
      else {
        // TODO: Delete all uploaded files? Or only the ones we can't process?
        // Even better, just find a way to check type *as Multer receives form chunks*
        res.status(415).send(errors.FILE_TYPE_NOT_ACCEPTED);
        return;
      }
    }

    res.status(200).send();
  });
}
