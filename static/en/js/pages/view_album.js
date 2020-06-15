// Album Viewer page functionality

'use strict';

// Shared variables
var baseContents = $("#media-list").html();
var mediaDir = '/media';
var deletingMediaName = null;
var deletingMediaAlbumID = null;
var params = new URLSearchParams(window.location.search);
var albumID = parseInt(params.get('album_id'));


function addEventHandlers() {
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


function refreshMedia(cb) {
  requestJSON("/en/srv/secure/get_media?album_id=" + albumID, function(data) {
    var newContents = '';
    for (var i = 0; i < data.length; ++i) {
      // Stretch TODO: Support other media besides images (i.e., videos)
      var mediaFile = mediaDir + '/' + data[i].media_file;
      var card = '<div class="card"><img src="' + mediaFile + '" class="card-img-top" alt="Album thumbnail">';

      // 'Delete' button
      // var card = '<div class="card"><button class="btn album-delete-btn" data-toggle="modal" data-target="#confirm-delete-modal" data-album-name="' + album.album_name + '" data-album-id="' + String(albumID) + '">&times;</button>';

      // Editable media caption
      card = card + '<div class="card-body">';
      // '<textarea class="form-control border rounded mb-2" id="album_' + albumID + '_desc" rows="2">' + (data[i].media_caption || '') + '</textarea>';

      // 'Save' button
      // card = card + '</div><div class="card-footer d-flex justify-content-around"><button class="btn btn-sm shadow-sm btn-themed flex-fill w-100 mr-1" data-album-id="' + String(albumID) + '" onclick="saveAlbumDetails(this)">Save</button>';

      newContents = newContents + card + '</div></div>';
    }

    $("#media-list").html(baseContents + newContents);
    $("#alert_msg").setAlertClass("hidden");
    addEventHandlers();
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
