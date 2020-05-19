// My Albums page functionality

'use strict';

// Shared variables
var baseContents = $("#album-list").html();
var deletingAlbumName = null;
var deletingAlbumID = null;


// Load list of albums
function loadAlbums(cb) {
  requestJSON("/en/srv/secure/my_albums", function(data) {
    var newContents = '';
    for (var i = 0; i < data.length; ++i) {
      var album = data[i];
      var card = '<div class="card"><button class="btn album-delete-btn" data-toggle="modal" data-target="#confirm-delete-modal" data-album-name="' + album.album_name + '" data-album-id="' + String(album.album_id) + '">&times;</button>';
      if (album.album_thumbnail)
        card = card + '<img src="' + album.album_thumbnail + '" class="card-img-top" alt="Album thumbnail">';
      else
        card = card + '<div class="empty-thumbnail">(No Preview Available)</div>';

      card = card + '<div class="card-body"><h5 class="card-title">' + album.album_name + '</h5>';

      if (album.album_desc)
        card = card + '<p class="card-text">' + album.album_desc + '</p>';

      if (album.album_private)
        card = card + '</div><div class="card-footer"><button class="btn btn-sm shadow-sm btn-success w-100" data-album-id="' + String(album.album_id) + '" onclick="toggleAlbumPrivacy(this)">Make Public</button></div>';
      else
        card = card + '</div><div class="card-footer"><button class="btn btn-sm shadow-sm btn-danger w-100" data-album-id="' + String(album.album_id) + '" onclick="toggleAlbumPrivacy(this)">Make Private</button></div>';

      newContents = newContents + card + '</div>';
    }
    $("#album-list").html(baseContents + newContents);
    $("#alert_msg").setAlertClass("hidden");

    if (typeof(cb) === "function")
      cb();
  });
};


// Button handler to create a new album
function createAlbum() {
  var data = {
    album_name: document.getElementById("new_album_name").value
  , album_desc: document.getElementById("new_album_desc").value
  };

  if (document.getElementById("new_album_private").checked)
    data.album_private = true;

  requestPost("/en/srv/secure/new_album", data, function () {
    loadAlbums(function () {
      $("#alert_msg").setAlertClass("alert-success").html("'" + data.album_name + "' created successfully");
    });
  });
};


// Button handler to delete an album
function deleteAlbum() {
  var data = {
    album_id: deletingAlbumID
  , album_name: deletingAlbumName
  };
  requestPost("/en/srv/secure/delete_album", data, function () {
    loadAlbums(function () {
      $("#alert_msg").setAlertClass("alert-success").html("'" + data.album_name + "' deleted successfully");
    });
  });
};


// Handle album deletion modal dialog events
$("#confirm-delete-modal").on('show.bs.modal', function (event) {
  // Get the specific album information
  var button = $(event.relatedTarget); // Button that triggered the modal
  deletingAlbumID = button.data('album-id');
  deletingAlbumName = button.data('album-name');

  // Fill it in
  $("#confirm-delete-name").text(deletingAlbumName);
});


// Handle album privacy toggling
function toggleAlbumPrivacy(context) {
  var data = {
    album_id: $(context).data('album-id')
  };

  requestPost("/en/srv/secure/toggle_album_private", data, function () {
    loadAlbums();
  });
};

// Perform an initial load
loadAlbums();
