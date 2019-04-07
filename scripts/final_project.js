//=============================================================================
// CONSTANTS / GLOBAL VARIABLES
//=============================================================================
const API_URL_TICKETMASTER = "https://app.ticketmaster.com/discovery/v2/events.json" +
                              "?sort=date,asc" +
                              "&apikey=" + API_KEY_TICKETMASTER;
const API_URL_MUSIXMATCH =  "https://api.musixmatch.com/ws/1.1/track.search" +
                            "?page_size=10&page=1" +
                            "&format=jsonp" +
                            "&callback=callback" +
                            "&s_track_rating=desc" +
                            "&apikey=" + API_KEY_MUSIXMATCH;
const API_URL_FANART = "http://webservice.fanart.tv/v3/music/";
const API_URL_LASTFM = "http://ws.audioscrobbler.com/2.0/" +
                        "?autocorrect=1" +
                        "&format=json" +
                        "&api_key=" + API_KEY_LASTFM;
//=============================================================================
$("document").ready(function()
  {
    attach_dom_events();
  }
);
//-----------------------------------------------------------------------------
function attach_dom_events()
{
  $("#fld_artist_name").mouseleave(function()
    {
      validate_input();
    }
  );
  $("#fld_artist_name").keyup(function()
    {
      validate_input();
    }
  );
  $("#frm_artist_search").submit(function(event)
    {
      event.preventDefault();
      let artist_val = $("#fld_artist_name").val().replace("&","and");
      artist_val = strip_non_alphanum_chars(artist_val);
      find_artist_info(artist_val);
    }
  );
  $("a[href='#frm_sign_up']").click(function(event) {
    event.preventDefault();
    $(this).modal({
      fadeDuration: 500,
      fadeDelay: 0.50
    });
  });
  $("#frm_sign_up").submit(function(event)
    {
      event.preventDefault();
      sign_up_handler();
    }
  );
  $("#frm_sign_up").on($.modal.BEFORE_CLOSE, function(event, modal)
    {
      $("#frm_sign_up :input").each(function()
        {
          $(this).val("");
        }
      );
      $("#frm_sign_up #p_sign_up_message").removeClass().html("");
    }
  );
}
//-----------------------------------------------------------------------------
function find_artist_info(artist_val)
{
  artist_mbid = display_lastfm_info(artist_val);
  display_ticketmaster_info(artist_val);
  display_top_hits(artist_val);
}
//-----------------------------------------------------------------------------
function display_lastfm_info(artist_val)
{
  try
  {
    let api_url = API_URL_LASTFM + "&method=artist.getInfo&artist=" + artist_val;
    let div_artist_summary = $("#div_artist_summary");
    let div_lastfm = $("#div_lastfm_results");
    let hdn_artist_mbid;
    let div_content = "";
    let bln_content_exists = false;
    let artist_name;
    let artist_mbid;

    div_lastfm.empty();
    $("#div_artist_container #hdn_artist_name").val("");
    $("#div_artist_container #hdn_artist_mbid").val("");

    $.getJSON(api_url)
      .done(function(json)
        {
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
              $("#div_artist_container #hdn_artist_name").val(artist_name);
              $("#div_artist_container #hdn_artist_mbid").val(artist_mbid);
              $("#div_artist_signup").show();
              $("#sp_artist_name").text(artist_name);
              div_content += `<h2>About ${artist_name}</h2>`;
              div_content += `<img align="left" class="artist_portrait"
                             src="${json.artist.image[3]["#text"]}" />`;
              div_content += `<p>${json.artist.bio.summary}</p>`;
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
          div_lastfm.append(`<a href="https://www.last.fm/home" target="_blank">
                            <img id="img_lastfm_logo" class="api_logo"
                            src="images/api/audioscrobbler_logo2.png" /></a>`);
          $("a").attr("target","_blank");
          display_art(artist_val, artist_mbid);
        }
      )
      .fail(function(jqXHR, textStatus, errorThrown)
        {
          err_handler(null, jqXHR, textStatus, errorThrown)
        }
      );
  }
  catch (err)
  {
    err_handler(err);
  }
}
//-----------------------------------------------------------------------------
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
          div_tm.append(`<img id="img_tm_logo" src="images/api/ticketmaster_blue_logo2.png"
                         class="api_logo" align="left" /><br />`);
          div_tm.append("<h2>Upcoming Events</h2>");
          div_tm.append(`<div id="div_ticketmaster_content">${div_content}</div>`);
          div_tm.show();
        }
      }
    }).catch(err => {
      err_handler(err);
    });
}
//-----------------------------------------------------------------------------
function display_top_hits(artist_val)
{
  let div_content = "";
  let div_musixmatch = $("#div_musixmatch_results");
  div_musixmatch.hide();
  div_musixmatch.empty();
  try
  {
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
            if (typeof(data.message.body) === "object" &&
                data.message.body.track_list.length > 0)
            {
              div_content += "<h2>Top 10 Songs</h2>";
              div_content += `<ol id="ol_top_songs">`;
              let track_list = data.message.body.track_list;
              let i_ctr = 0
              track_list.forEach(function(item)
                {
                  div_content += `<li>${item.track.track_name}`;
                  div_content += `<ul><li>(from the album: ${item.track.album_name})</li></ul>`
                }
              )
              div_content += "</ol>";
              div_musixmatch.append(`<a href="https://www.musixmatch.com/" target="_blank">
                                    <img id="img_musixmatch_logo" class="api_logo"
                                    src="images/api/musixmatch_logo3.png" /></a><br />`);
              div_musixmatch.append(div_content);
              div_musixmatch.show();
            }
          },
        error: function(jqXHR, textStatus, errorThrown) {
          err_handler(null, jqXHR, textStatus, errorThrown);
        }
      }
    );
  }
  catch (err)
  {
    err_handler(err);
  }
}
//-----------------------------------------------------------------------------
function display_art(artist_val, artist_mbid)
{
  let img_fanart;
  let div_fanart = $("#div_fanart_results");
  let i_ctr = 0;

  div_fanart.hide();
  div_fanart.empty();

  try
  {
    if (artist_mbid)
    {
      api_url = API_URL_FANART + artist_mbid + "?api_key=" + API_KEY_FANART;
      $.getJSON(api_url)
        .done(function(json_art)
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
              div_fanart.append(`<a href="https://fanart.tv/" target="_blank">
                                <img id="img_fanarttv_logo" class="api_logo"
                                src="images/api/fanarttv_logo1.png" /></a>`);
              div_fanart.show();
            }
          }
        )
        .fail(function(jqXHR, textStatus, errorThrown)
          {
            err_handler(null, jqXHR, textStatus, errorThrown)
          }
        );
    }
  }
  catch (err)
  {
    err_handler(err);
  }
}
//-----------------------------------------------------------------------------
function sign_up_handler()
{
  let artist_mbid = $("#hdn_artist_mbid").val(),
      person_email = $("#fld_email").val(),
      result = false;

  await_getAllIDs(person_email, artist_mbid)
    .catch(err => { err_handler(err) })
    .then(await_createSignUp)
    .catch(err => { err_handler(err) })
    .then(display_sign_up_results)
    .catch(err => { err_handler(err) });
}
//-----------------------------------------------------------------------------
async function await_getAllIDs(person_email, artist_mbid)
{
    try
    {
      let promises = [];
      let p1 = getPersonID(person_email);
      let p2 = getArtistID(artist_mbid);
      let p3 = null;
      let result = null;

      promises.push(p1,p2);
      result = await Promise.all(promises)
                            .catch((err) => err_handler(err));

      if (result[0] && result[1])
      {
        p3 = await getSignupID(result[0], result[1]);
      }
      result.push(p3);
      return result;
    }
    catch(err)
    {
      err_handler(err);
    }
}
//-----------------------------------------------------------------------------
function display_sign_up_results(sign_up_status)
{
  let result_txt,
      class_type;

  switch(sign_up_status)
  {
    case "sign_up_created":
      result_text = "Awesome, you're all signed up!";
      class_type = "success_msg";
      break;
    case "sign_up_exists":
      result_text = "Nothing to do here!<br /> Our records indicate that <u>" +
                    $("#fld_email").val() + "</u> is already receiving " +
                    "alerts about " + $("#hdn_artist_name").val();
      class_type = "error_msg";
      break;
    default:
      result_text = "Yikes! We were unable to sign you up, due to an " +
                    "unexpected error in our system. " +
                    "Please try again later.";
      class_type = "error_msg";
  }

  $("#p_sign_up_message").removeClass().addClass(class_type);
  $("#p_sign_up_message").html(result_text);
}
//================================================================================
// DATABASE FUNCTIONS
//================================================================================
function getPersonID(person_email)
{
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://itp.patrickmcneill.com/where/persons/email/${person_email}`,
      method: "GET",
      headers: { key: API_KEY_DATABASE },
      success: function(response) {
        if (response.length > 0)
        {
          resolve(response.slice(-1)[0].id);
        } else {
          resolve(null);
        }
      },
      error: reject
    });
  });
}
//-----------------------------------------------------------------------------
function getArtistID(artist_mbid)
{
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://itp.patrickmcneill.com/where/artists/artist_mbid/${artist_mbid}`,
      method: "GET",
      headers: { key: API_KEY_DATABASE },
      success: function(response) {
        if (response.length > 0)
        {
          resolve(response.slice(-1)[0].id);
        } else {
          resolve(null);
        }
      },
      error: reject
    });
  });
}
//-----------------------------------------------------------------------------
function getSignupID(person_id, artist_id)
{
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://itp.patrickmcneill.com/where/persons_artists_signups/person_id/${person_id}`,
      method: "GET",
      headers: { key: API_KEY_DATABASE },
      success: function(response) {
        let result = null;
        for (let i of response)
        {
          if (i.artist_id == artist_id)
          {
            result = i.id;
            break;
          }
        }
        resolve(result);
      },
      error: reject
    });
  });
}
//-----------------------------------------------------------------------------
async function await_createSignUp(ids)
{
  let person_id = ids[0],
      artist_id = ids[1],
      signup_id = ids[2];

    if (signup_id && artist_id && person_id)
    {
      // A sign up already exists for this person/artist.
      // Nothing to do here, let's leave!
      return "sign_up_exists";
    } else {
      // Let's create a signup!
      let artist_name  = $("#hdn_artist_name").val(),
          artist_mbid  = $("#hdn_artist_mbid").val(),
          person_fname = $("#fld_fname").val(),
          person_lname = $("#fld_lname").val(),
          person_email = $("#fld_email").val();

      if (!person_id)
      {
        let person = await createPersonID(person_fname, person_lname, person_email);
        person_id = person.id;
        console.log(`Created person_id: ${person_id}`);
      }
      if (!artist_id)
      {
        let artist = await createArtistID(artist_name, artist_mbid);
        artist_id = artist.id;
        console.log(`Created artist_id: ${artist_id}`);
      }
      if (!signup_id && person_id && artist_id)
      {
        let signup = await createSignupID(person_id, artist_id);
        signup_id = signup.id;
        console.log(`Created signup_id: ${signup_id} using person_id ${person_id} and artist_id ${artist_id}.`);
        if (signup_id)
        {
          result = "sign_up_created";
        }
      }
    }
    return result;
}
//-----------------------------------------------------------------------------
function createPersonID(person_fname, person_lname, person_email)
{
  console.log("---------------------------------------------------------");
  console.log("Creating new Person record for... " + person_email.trim());
  let person_id = null,
      result = null;

  return person_data = $.ajax({
    url: "https://itp.patrickmcneill.com/data/persons",
    method: "POST",
    headers: { key: API_KEY_DATABASE },
    data: {
      first_name: person_fname,
      last_name: person_lname,
      name: `${person_fname} ${person_lname}`,
      email: person_email,
      created_date: Date.now(),
      last_modified_date: Date.now()
    },
    success: function(result) {
      person_id = result.id;
      console.log("Successfully created record for " + person_email);
    }
  });
}
//-----------------------------------------------------------------------------
function createArtistID(artist_name, artist_mbid)
{
  console.log("---------------------------------------------------------");
  console.log("Creating new Artist record for... " + artist_name.trim());
  let artist_id = null,
      result = null;

  return artist_data = $.ajax({
    url: "https://itp.patrickmcneill.com/data/artists",
    method: "POST",
    headers: { key: API_KEY_DATABASE },
    data: {
      artist_name: artist_name,
      artist_mbid: artist_mbid,
      created_date: Date.now(),
      last_modified_date: Date.now()
    },
    success: function(result) {
      artist_id = result.id;
      console.log("Successfully created record for " + artist_name);
    }
  });
}
//-----------------------------------------------------------------------------
function createSignupID(person_id, artist_id)
{
  console.log("---------------------------------------------------------");
  console.log("Creating new Signup record...");
  let signup_id = null,
      result = null;

  return signup_data = $.ajax({
    url: "https://itp.patrickmcneill.com/data/persons_artists_signups",
    method: "POST",
    headers: { key: API_KEY_DATABASE },
    data: {
      person_id: person_id,
      artist_id: artist_id,
      created_date: Date.now(),
      last_modified_date: Date.now()
    },
    success: function(result) {
      signup_id = result.id;
      console.log("Successfully created new signup!");
    }
  });
}
//================================================================================
// GLOBAL FUNCTIONS
//================================================================================
function err_handler(err=null, err_jxhr=null, err_text="", err_thrown="")
{
  if (err_jxhr)
  {
    console.error(`Status: ${err_jxhr.status}`);
    console.error(`Response Text: ${err_jxhr.responseText}`);
    console.error(`Error: ${err_thrown}`);
    console.error(`Error Text: ${err_text}`);
    console.error(err_jxhr);
  }
  if (err)
  {
    if (err.responseText)
    {
      console.error(`Status: ${err.status}`);
      console.error(`Response Text: ${err.responseText}`);
    }
    console.error(err);
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
function urlify(text)
{
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
  let str_input = $("#fld_artist_name").val();
  if (str_input.length > 0)
  {
    $("#btn_artist_search").attr("disabled", false);
  } else {
    $("#btn_artist_search").attr("disabled", true);
  }
}
//-----------------------------------------------------------------------------
function strip_non_alphanum_chars(str_input)
{
  let result = str_input.trim().replace(/[^0-9a-z_]/gi, " ");
  return result.trim();
}
//-----------------------------------------------------------------------------
