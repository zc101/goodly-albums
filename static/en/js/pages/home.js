// Homepage functionality

'use strict';

// Shared variables
var baseContents = $("#album-list").html();

// Load list of albums
function loadAlbums() {
  requestJSON("/en/srv/public_albums", function(data) {
    var newContents = '';
    for (var i = 0; i < data.length; ++i) {
      var album = data[i];

      var card = '<div class="card"><a href="/en/view_album.html?album_id=' + album.album_id + '">';
      if (album.album_cover)
        card = card + '<img src="' + album.album_cover + '" class="card-img-top" alt="Album thumbnail">';
      else
        card = card + '<div class="empty-cover">(No Preview Available)</div>';
      card = card + '</a><div class="card-body"><h5 class="card-title">' + album.album_name + '</h5>';

      if (album.album_desc)
        card = card + '<p class="card-text">' + album.album_desc + '</p>';

      newContents = newContents + card + '</div></div>';
    }
    $("#album-list").html(baseContents + newContents);
    $("#alert_msg").setAlertClass("hidden");
  });
};

// Perform an initial load
loadAlbums();
