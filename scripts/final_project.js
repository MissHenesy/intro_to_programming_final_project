//================================================================================
// CONSTANTS / GLOBAL VARIABLES
//================================================================================
const API_URL_TICKETMASTER = "https://app.ticketmaster.com/discovery/v2/events.json?sort=date,asc&apikey=" + API_KEY_TICKETMASTER;
const API_URL_MUSIXMATCH = "https://api.musixmatch.com/ws/1.1/track.search?page_size=10&page=1&format=jsonp&callback=callback&s_track_rating=desc&apikey=" + API_KEY_MUSIXMATCH;
const API_URL_FANART = "http://webservice.fanart.tv/v3/music/"
const API_URL_LASTFM = "http://ws.audioscrobbler.com/2.0/?autocorrect=1&format=json&api_key=" + API_KEY_LASTFM;
//================================================================================
$("document").ready(function()
  {
    submit_search();
  }
);

$(function() {
  $(".button").click(function() {
      alert("HI!");
      $("#myform #valueFromMyButton").text($(this).val().trim());
      $("#myform input[type=text]").val('');
      $("#valueFromMyModal").val('');
      $("#myform").show(500);
  });
  $("#btnOK").click(function() {
      $("#valueFromMyModal").val($("#myform input[type=text]").val().trim());
      $("#myform").hide(400);
  });
});

function submit_search()
{
  $("#txt_artist_name").mouseleave(function()
    {
      validate_input();
    }
  );
  $("#txt_artist_name").keyup(function()
    {
      validate_input();
    }
  );

  $("form").submit(function(event)
    {
      let artist_val = $("#txt_artist_name").val().replace("&","and");
      artist_val = strip_non_alphanum_chars(artist_val);
      find_artist_info(artist_val);
      event.preventDefault();
    }
  );
}

function find_artist_info(artist_val)
{
  display_lastfm_info(artist_val);
  display_ticketmaster_info(artist_val);
  display_top_hits(artist_val);
}

function display_lastfm_info(artist_val)
{
  let api_url = API_URL_LASTFM + "&method=artist.getInfo&artist=" + artist_val;
  let div_artist_summary = $("#div_artist_summary");
  let div_lastfm = $("#div_lastfm_results");
  let div_content;
  let bln_content_exists = false;
  let artist_name;
  let artist_mbid;

  div_lastfm.empty();
  $.getJSON(api_url, function(json) {
    if (json.artist)
    {
      artist_name = json.artist.name;
      artist_mbid = json.artist.mbid;
      if (json.artist.bio.content)
      {
        bln_content_exists = true;
      }
    } else {
      artist_name = artist_val;
    }
    if (bln_content_exists)
    {
        $("#div_artist_signup").show();
        $("#sp_artist_name").text(artist_name);
        div_content = "<h2>About " + artist_name + "</h2>";
        div_content += "<img align=\"left\" class=\"artist_portrait\" src=\"" +
        json.artist.image[3]["#text"] + "\" />" +
        "<p>" + json.artist.bio.summary + "</p>";
    } else {
      $("#div_artist_signup").hide();
      div_content = "<h2>" + artist_name + "</h2>" +
                    "<img align=\"left\" class=\"artist_portrait\" src=\"" +
                    get_random_image() + "\" />" +
                    "<p>Aww, bummer! We could not find any bio info for " +
                    artist_name + ".</p>"
    }
    $("#div_artist_container").show();
    div_lastfm.append(div_content);
    $("a").attr("target","_blank");
    display_art(artist_val, artist_mbid);
  });
}

function display_ticketmaster_info(artist_val)
{
  let api_url = API_URL_TICKETMASTER +
                "&keyword=" + artist_val +
                "&countryCode=US";
  let div_tm = $("#div_ticketmaster_results");
  let div_content = "";
  div_tm.hide();
  div_tm.empty();
  fetch(api_url)
    .then(response => response.json())
    .then(data => {
      if (data._embedded)
      {
        for (i of data._embedded.events)
        {
          div_content += "<p><a href=\"" + i.url + "\" target=\"_blank\">" +
                         i.name + "</a><br />" +
                         "<span><b>Date:</b></span>&nbsp;" +
                         format_date(i.dates.start.localDate) + "<br />" +
                         "<span><b>Time:</b></span>&nbsp;" +
                         format_time(i.dates.start.localTime) + "<br />" +
                         "<b>" + i._embedded.venues[0].name + "</b><br />" +
                         i._embedded.venues[0].address.line1 + "<br />" +
                         i._embedded.venues[0].city.name + ", " +
                         i._embedded.venues[0].state.stateCode + " " +
                         i._embedded.venues[0].postalCode +
                         "</p>"
        }
        if (div_content.length > 0)
        {
          div_tm.append("<h2>Upcoming Events</h2>");
          div_tm.append(div_content);
          div_tm.show();
        }
      }
    }).catch(err => {
      console.log("Oops! An unexpected error occurred: " + err.message);
    });
}

function display_top_hits(artist_val)
{
  let div_content = "";
  let div_musixmatch = $("#div_musixmatch_results");
  $.ajax(
    {
      type: "GET",
      data: {
          apikey: API_KEY_MUSIXMATCH,
          q_artist: artist_val,
          s_track_rating: "desc",
          page_size: 10,
          page: 1,
          format:"jsonp",
          callback:"jsonp_callback"
      },
      url: "http://api.musixmatch.com/ws/1.1/track.search",
      dataType: "jsonp",
      jsonpCallback: "jsonp_callback",
      contentType: "application/json",
      success: function(data)
        {
          div_content = "<h2>Top 10 Songs</h2>";
          div_content += "<ol id=\"ol_top_songs\">";
          let track_list = data.message.body.track_list;
          let i_ctr = 0
          track_list.forEach(function(item)
            {
              div_content += `<li>${item.track.track_name}`;
              div_content += `<ul><li>(from the album: ${item.track.album_name})</li></ul>`
            }
          )
          div_content += "</ol>";
          div_musixmatch.html(div_content);
        },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
      }
    }
  );

  // fetch(api_url)
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data.body.track_list)
  //     {
  //       console.log("yay!");
  //     }
  //   }).catch(err => {
  //     console.log("Oops! An unexpected error occurred: " + err.message);
  //   })

}

function display_art(artist_val, artist_mbid)
{
  let img_fanart;
  let div_fanart = $("#div_fanart_results");
  let i_ctr = 0;

  div_fanart.hide();
  div_fanart.empty();
  if (artist_mbid)
  {
    api_url = API_URL_FANART + artist_mbid + "?api_key=" + API_KEY_FANART;
    $.getJSON(api_url, function(json_art)
      {
        for (i in json_art.artistthumb)
        {
          if (json_art.artistthumb[i] && i_ctr < 8)
          {
            img_fanart = "<img src=\"" + json_art.artistthumb[i].url + "\" />\n"
            div_fanart.append(img_fanart);
            i_ctr += 1;
          }
        }
        if (i_ctr < 8)
        {
          for (i in json_art.albums)
          {
            if (json_art.albums[i].albumcover && i_ctr < 8)
            {
              img_fanart = "<img src=\"" + json_art.albums[i].albumcover[0].url + "\" />\n"
              div_fanart.append(img_fanart);
              i_ctr += 1;
            }
          }
        }
        if (div_fanart)
        {
          div_fanart.show();
        }
      }
    );
  }
}
//================================================================================
// HELPER FUNCTIONS
//================================================================================
function format_date(date_val)
{
  let month_names = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November",
                     "December"];

  let date_parts = date_val.split("-");
  let yyyy = date_parts[0];
  let mm = date_parts[1];
  let dd = date_parts[2];

  let result = month_names[parseInt(mm)-1] + " " + dd + ", " + yyyy;

  return result;
}

function format_time(time_val)
{
  let time_parts = time_val.split(":");
  let hh = time_parts[0];
  let h = hh;
  let meridian = "AM";

  if (hh >= 12)
  {
    h = hh - 12;
    meridian = "PM";
  }
  if (h === 0)
  {
    h = 12;
  }

  let result = h + ":" + time_parts[1] + " " + meridian;

  return result;
}
//-----------------------------------------------------------------------------
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url)
      {
        return "<a href=\"" + url + "\" target=\"_blank\">" + url + "</a>";
      }
    );
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}
//-----------------------------------------------------------------------------
function get_random_image()
{
  let dir = "images/tear_gifs/";
  let random_images = ["benedict_cumberbatch_tears.gif",
                       "colbert_tears.gif",
                       "david_tennant_tears.gif",
                       "dorothy_tears.gif",
                       "judy_garland1.gif",
                       "justin_long_tears.gif",
                       "ron_burgundy_tears.gif",
                       "spock_tears.gif",
                       "tobey_maguire_tears.gif"];

  let num = Math.floor(Math.random() * random_images.length);
  let img = random_images[num];

   return dir + img;
}
//-----------------------------------------------------------------------------
function validate_input()
{
  let str_input = $("#txt_artist_name").val();
  if (str_input.length > 0)
  {
    $("#btn_submit").attr("disabled", false);
  } else {
    $("#btn_submit").attr("disabled", true);
  }
}
//-----------------------------------------------------------------------------
function strip_non_alphanum_chars(str_input)
{
  let result = str_input.trim().replace(/[^0-9a-z_]/gi, " ");
  return result.trim();
}
//-----------------------------------------------------------------------------
