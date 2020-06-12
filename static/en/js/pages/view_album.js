// Album Viewer page functionality

'use strict';

// Shared variables
var baseContents = $("#media-list").html();
var deletingMediaName = null;
var deletingMediaAlbumID = null;


// Checks if file uploads have finished processing
function checkUploads() {
  alertMessage('Files uploaded successfully');
}


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


// Perform an initial load
//loadAlbumMedia();
