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

      // 'Delete' button
      var card = '<div class="card"><button class="btn album-delete-btn" data-toggle="modal" data-target="#confirm-delete-modal" data-album-name="' + album.album_name + '" data-album-id="' + String(album.album_id) + '">&times;</button>';

      // Album cover
      if (album.album_cover)
        card = card + '<img src="' + album.album_cover + '" class="card-img-top" alt="Album thumbnail">';
      else
        card = card + '<div class="empty-cover">(No Preview Available)</div>';

      // Editable album name and description
      card = card + '<div class="card-body"><input type="text" class="form-control border rounded mb-2" id="album_' + album.album_id + '_name" minlength="5" maxlength="30" pattern="[a-zA-Z0-9]([_|\'|`|-|:|\(|\)| ]|[a-zA-Z0-9]){3,28}[a-zA-Z0-9]" placeholder="Album name" value="' + album.album_name + '">';
      card = card + '<textarea class="form-control border rounded mb-2" id="album_' + album.album_id + '_desc" rows="2">' + (album.album_desc || '') + '</textarea>';

      // 'Save' and Make Public / Private buttons
      card = card + '</div><div class="card-footer d-flex justify-content-around"><button class="btn btn-sm shadow-sm btn-themed flex-fill w-100 mr-1" data-album-id="' + String(album.album_id) + '" onclick="saveAlbumDetails(this)">Save</button>';
      if (album.album_private)
        card = card + '<button class="btn btn-sm shadow-sm btn-success flex-fill w-100 ml-1" data-album-id="' + String(album.album_id) + '" onclick="toggleAlbumPrivacy(this)">Make Public</button>';
      else
        card = card + '<button class="btn btn-sm shadow-sm btn-danger flex-fill w-100 ml-1" data-album-id="' + String(album.album_id) + '" onclick="toggleAlbumPrivacy(this)">Make Private</button>';

      newContents = newContents + card + '</div></div>';
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


// Save album name and optional description
function saveAlbumDetails(context) {
  var albumID = $(context).data('album-id');
  var data = {
    album_id: albumID
  , album_name: document.getElementById("album_" + albumID + "_name").value
  , album_desc: document.getElementById("album_" + albumID + "_desc").value
  };

  requestPost("/en/srv/secure/update_album", data, function () {
    loadAlbums(function () {
      $("#alert_msg").setAlertClass("alert-success").html("'" + data.album_name + "' saved successfully");
    });
  });
};

// Perform an initial load
loadAlbums();
