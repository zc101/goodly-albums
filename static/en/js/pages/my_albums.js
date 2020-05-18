// My Albums page functionality

'use strict';
var baseContents = $("#album-list").html();

// Load list of albums
function loadAlbums(cb) {
  requestJSON("/en/srv/secure/my_albums", function(data) {
    var newContents = '';
    for (var i = 0; i < data.length; ++i) {
      var album = data[i];
      var card = '<div class="card">';
      if (album.album_thumbnail)
        card = card + '<img src="' + album.album_thumbnail + '" class="card-img-top" alt="Album thumbnail">';
      else
        card = card + '<div class="empty-thumbnail">(No Preview Available)</div>';
      card = card + '<div class="card-body"><h5 class="card-title">' + album.album_name + '</h5>';
      if (album.album_desc)
        card = card + '<p class="card-text">' + album.album_desc + '</p>';
      newContents = newContents + card + '</div></div>';
    }
    $("#album-list").html(baseContents + newContents);
    $("#alert_msg").addClass("hidden");

    if (typeof(cb) === "function")
      cb();
  });
};


// Button handler to create a new album
function createAlbum() {
  console.log("POSTing album");
  var data = {
    album_name: document.getElementById("new_album_name").value
  , album_desc: document.getElementById("new_album_desc").value
  };
  requestPost("/en/srv/secure/new_album", data, function () {
    loadAlbums(function () {
      $("#alert_msg").removeClass("hidden").removeClass("alert-primary").addClass("alert-success").html("'" + data.album_name + "' created successfully");
    });
  });
};


// Perform an initial load
loadAlbums();
