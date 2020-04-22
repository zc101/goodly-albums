// Load my_albums page

antiCSRF(function() {
  $.getJSON("/en/srv/secure/my_albums")
    .done(function(data) {
      var contents = '';
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
        contents = contents + card + '</div></div>';
      }
      $("#album-list").html(contents);
      $("#alert_msg").addClass("hidden");
    })
    .fail(function(jqxhr, textStatus, error) {
      if (jqxhr.status === 403)
        window.location.href = "/en/user_login.html?return_to=" + encodeURIComponent(window.location.href);
      else
        $("#alert_msg").removeClass("alert-primary").addClass("alert-danger").html("Error: " + error);
    });
});
