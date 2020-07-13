// Album Viewer page functionality

'use strict';

// Shared variables
var mediaDir = '/media';
var deletingMediaName = null;
var deletingMediaAlbumID = null;
var params = new URLSearchParams(window.location.search);
var albumID = parseInt(params.get('album_id'));
var mediaUploadCard = '<div class="card"><form id="media-upload" action="/en/srv/secure/upload_media" method="post" enctype="multipart/form-data"><div class="card-body"><h5 class="card-title">Upload Media</h5><input id="media-album-id" type="hidden" name="album_id" /><label for="media-files">Select up to 10 photos to upload to this album (max 10MB each).</label><input id="media-files" type="file" name="media" multiple /></div><div class="card-footer"><input id="media-submit" type="submit" class="btn btn-sm btn-themed shadow-sm w-100" value="Submit" /></div></form></div>';
var nothingHereMsg = '<div class="placeholder-msg">Nothing has been added to this album yet; please check back later!</div>';

function addEventHandlers(isOwner) {
  if (isOwner) {
    // Add album ID to upload form
    $('#media-album-id')[0].value = albumID;

    // Handle media upload form
    $('#media-submit')[0].addEventListener('click', function () {
      alertMessage('Uploading...', 'primary');
    });

    listenForMultipartSubmit('#media-upload', function () {
      $('#media-upload')[0].reset();
      //  alertMessage('Processing...', 'primary');
      //  setTimeout(checkUploads, 500);
      checkUploads();
    });
  }
}


function refreshMedia(cb) {
  requestJSON("/en/srv/get_media?album_id=" + albumID, function(data) {
    if (data.isOwner) // Add the "Upload Media" box
      var newContents = mediaUploadCard;
    else
      var newContents = '';
    var media = data.media;
    for (var i = 0; i < media.length; ++i) {
      // Stretch TODO: Support other media besides images (i.e., videos)
      var mediaFile = mediaDir + '/' + media[i].media_file;
      var mediaCaption = media[i].media_caption;
      var card = '<div class="card"><img src="' + mediaFile + '" class="card-img-top" alt="Album thumbnail">';

      // 'Delete' button
      // var card = '<div class="card"><button class="btn album-delete-btn" data-toggle="modal" data-target="#confirm-delete-modal" data-album-name="' + album.album_name + '" data-album-id="' + String(albumID) + '">&times;</button>';

      // Media caption (editable if owner)
      if (data.isOwner)
        card = card + '<textarea class="form-control border rounded media-caption" data-media="' + media[i].media_file + '" rows="2">' + (mediaCaption || '') + '</textarea>';
      else {
        if (mediaCaption)
          card = card + '<div class="card-body">' + mediaCaption + '</div>';
      }

      // 'Save' button
      // card = card + '</div><div class="card-footer d-flex justify-content-around"><button class="btn btn-sm shadow-sm btn-themed flex-fill w-100 mr-1" data-album-id="' + String(albumID) + '" onclick="saveAlbumDetails(this)">Save</button>';

      newContents = newContents + card + '</div>';
    }

    if (newContents.length === 0)
      $("#media-list").html(nothingHereMsg);
    else {
      $("#media-list").html(newContents);
      addEventHandlers(data.isOwner);
    }
    $("#alert_msg").setAlertClass("hidden");
    if (typeof(cb) === 'function')
      cb();
  });
}


// Checks if file uploads have finished processing
// TODO: Actually implement an async process to do this
function checkUploads() {
  refreshMedia(function () {
    alertMessage('Files uploaded successfully');
  });
}


if (typeof(albumID) === 'number' && albumID > -1) {
  // Perform an initial load
  refreshMedia();
}
else {
  // Page doesn't have any meaning if it wasn't passed an album ID
  window.location.href = "/en/my_albums.html";
}
