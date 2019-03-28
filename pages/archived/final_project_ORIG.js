//================================================================================
// CONSTANTS / GLOBAL VARIABLES
//================================================================================
const API_URL_TICKETMASTER = "https://app.ticketmaster.com/discovery/v2/events.json?sort=date,asc&apikey=" + API_KEY_TICKETMASTER;
const API_URL_TWITTER = "https://api.twitter.com/1.1/search/tweets.json?count=10";
const API_URL_FANART = "http://webservice.fanart.tv/v3/music/"
const API_URL_LASTFM = "http://ws.audioscrobbler.com/2.0/?autocorrect=1&format=json&api_key=" + API_KEY_LASTFM;
//================================================================================
$("document").ready(function()
  {
    submit_search();
  }
);

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
  display_tweets(artist_val);
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
        div_content = "<h2>About " + artist_name + "</h2>";
        div_content += "<img align=\"left\" class=\"artist_portrait\" src=\"" +
        json.artist.image[3]["#text"] + "\" />" +
        "<p>" + json.artist.bio.summary + "</p>";
    } else {
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

function display_tweets(artist_val)
{
  // See https://www.sitepoint.com/twitter-search-api/ for guidance.
  let api_url = API_URL_TWITTER + "&q=" + artist_val;
  let test_json = twitter_response_example();
  let div_content = "";
  let div_twitter = $("#div_twitter_results");
  let tweet_date;

  div_twitter.hide();
  div_twitter.empty();
  for (i of test_json.statuses)
  {
    tweet_date = new Date(i.created_at);
    tweet_date = tweet_date.getFullYear() + "-" +
                 (tweet_date.getMonth() + 1) + "-" +
                 tweet_date.getDate();
    //console.log(i.text);
    div_content += "<p><b><a href=\"" + i.user.url + "\" target=\"_blank\">" +
                   i.user.name + "</a></b><br />" +
                   "<span class=\"twitter_user_name\">@" + i.user.screen_name +
                   " * " + format_date(tweet_date) + "</span><br />" +
                   urlify(i.text) + "</p>";
  }
  if (div_content.length > 0)
  {
    div_twitter.append("<h2>Recent Tweets</h2>");
    div_twitter.append("<small><i>Note: These are test tweets; API authentication is pending</i></small>");
    div_twitter.append(div_content);
    div_twitter.show();
  }
}

function display_art(artist_val, artist_mbid)
{
  // console.log(encodeURIComponent(artist_val));
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

function strip_non_alphanum_chars(str_input)
{
  let result = str_input.trim().replace(/[^0-9a-z_]/gi, " ");
  return result.trim();
}
//================================================================================
// TEMPORARY FUNCTIONS
//================================================================================
function twitter_response_example()
{
  return {
      "statuses": [
          {
              "created_at": "Sun Feb 25 18:11:01 +0000 2018",
              "id": 967824267948773377,
              "id_str": "967824267948773377",
              "text": "From pilot to astronaut, Robert H. Lawrence was the first African-American to be selected as an astronaut by any na… https://t.co/FjPEWnh804",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/FjPEWnh804",
                          "expanded_url": "https://twitter.com/i/web/status/967824267948773377",
                          "display_url": "twitter.com/i/web/status/9…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "result_type": "popular",
                  "iso_language_code": "en"
              },
              "source": "<a href='https://www.sprinklr.com' rel='nofollow'>Sprinklr</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 11348282,
                  "id_str": "11348282",
                  "name": "NASA",
                  "screen_name": "NASA",
                  "location": "",
                  "description": "Explore the universe and discover our home planet with @NASA. We usually post in EST (UTC-5)",
                  "url": "https://t.co/TcEE6NS8nD",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/TcEE6NS8nD",
                                  "expanded_url": "http://www.nasa.gov",
                                  "display_url": "nasa.gov",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 28605561,
                  "friends_count": 270,
                  "listed_count": 90405,
                  "created_at": "Wed Dec 19 20:20:32 +0000 2007",
                  "favourites_count": 2960,
                  "utc_offset": -18000,
                  "time_zone": "Eastern Time (US & Canada)",
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 50713,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "000000",
                  "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/11348282/1518798395",
                  "profile_link_color": "205BA7",
                  "profile_sidebar_border_color": "000000",
                  "profile_sidebar_fill_color": "F3F2F2",
                  "profile_text_color": "000000",
                  "profile_use_background_image": true,
                  "has_extended_profile": true,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": null,
                  "follow_request_sent": null,
                  "notifications": null,
                  "translator_type": "regular"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 988,
              "favorite_count": 3875,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          {
              "created_at": "Sun Feb 25 19:31:07 +0000 2018",
              "id": 967844427480911872,
              "id_str": "967844427480911872",
              "text": "A magnetic power struggle of galactic proportions - new research highlights the role of the Sun's magnetic landscap… https://t.co/29dZgga54m",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/29dZgga54m",
                          "expanded_url": "https://twitter.com/i/web/status/967844427480911872",
                          "display_url": "twitter.com/i/web/status/9…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "result_type": "popular",
                  "iso_language_code": "en"
              },
              "source": "<a href='https://www.sprinklr.com' rel='nofollow'>Sprinklr</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 11348282,
                  "id_str": "11348282",
                  "name": "NASA",
                  "screen_name": "NASA",
                  "location": "",
                  "description": "Explore the universe and discover our home planet with @NASA. We usually post in EST (UTC-5)",
                  "url": "https://t.co/TcEE6NS8nD",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/TcEE6NS8nD",
                                  "expanded_url": "http://www.nasa.gov",
                                  "display_url": "nasa.gov",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 28605561,
                  "friends_count": 270,
                  "listed_count": 90405,
                  "created_at": "Wed Dec 19 20:20:32 +0000 2007",
                  "favourites_count": 2960,
                  "utc_offset": -18000,
                  "time_zone": "Eastern Time (US & Canada)",
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 50713,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "000000",
                  "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/11348282/1518798395",
                  "profile_link_color": "205BA7",
                  "profile_sidebar_border_color": "000000",
                  "profile_sidebar_fill_color": "F3F2F2",
                  "profile_text_color": "000000",
                  "profile_use_background_image": true,
                  "has_extended_profile": true,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": null,
                  "follow_request_sent": null,
                  "notifications": null,
                  "translator_type": "regular"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 2654,
              "favorite_count": 7962,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          {
              "created_at": "Mon Feb 26 19:21:43 +0000 2018",
              "id": 968204446625869827,
              "id_str": "968204446625869827",
              "text": "Someone's got to be first. In space, the first explorers beyond Mars were Pioneers 10 and 11, twin robots who chart… https://t.co/SUX30Y45mr",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/SUX30Y45mr",
                          "expanded_url": "https://twitter.com/i/web/status/968204446625869827",
                          "display_url": "twitter.com/i/web/status/9…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "result_type": "popular",
                  "iso_language_code": "en"
              },
              "source": "<a href='https://www.sprinklr.com' rel='nofollow'>Sprinklr</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 11348282,
                  "id_str": "11348282",
                  "name": "NASA",
                  "screen_name": "NASA",
                  "location": "",
                  "description": "Explore the universe and discover our home planet with @NASA. We usually post in EST (UTC-5)",
                  "url": "https://t.co/TcEE6NS8nD",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/TcEE6NS8nD",
                                  "expanded_url": "http://www.nasa.gov",
                                  "display_url": "nasa.gov",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 28605561,
                  "friends_count": 270,
                  "listed_count": 90405,
                  "created_at": "Wed Dec 19 20:20:32 +0000 2007",
                  "favourites_count": 2960,
                  "utc_offset": -18000,
                  "time_zone": "Eastern Time (US & Canada)",
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 50713,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "000000",
                  "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/590922434682880000/3byPYvqe.jpg",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/188302352/nasalogo_twitter_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/11348282/1518798395",
                  "profile_link_color": "205BA7",
                  "profile_sidebar_border_color": "000000",
                  "profile_sidebar_fill_color": "F3F2F2",
                  "profile_text_color": "000000",
                  "profile_use_background_image": true,
                  "has_extended_profile": true,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": null,
                  "follow_request_sent": null,
                  "notifications": null,
                  "translator_type": "regular"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 729,
              "favorite_count": 2777,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          },
          {
              "created_at": "Mon Feb 26 06:42:50 +0000 2018",
              "id": 968013469743288321,
              "id_str": "968013469743288321",
              "text": "宇宙ステーションでも、日本と9時間の時差で月曜日が始まりました。n今週は6人から3人にクルーのサイズダウンがありますが、しっかりと任されているタスクをこなしたいと思います。nn写真は、NASAの実験施設「ディスティニー」のグローブ… https://t.co/2CYoPV6Aqx",
              "truncated": true,
              "entities": {
                  "hashtags": [],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/2CYoPV6Aqx",
                          "expanded_url": "https://twitter.com/i/web/status/968013469743288321",
                          "display_url": "twitter.com/i/web/status/9…",
                          "indices": [
                              117,
                              140
                          ]
                      }
                  ]
              },
              "metadata": {
                  "result_type": "popular",
                  "iso_language_code": "ja"
              },
              "source": "<a href='http://twitter.com' rel='nofollow'>Twitter Web Client</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 842625693733203968,
                  "id_str": "842625693733203968",
                  "name": "金井 宣茂",
                  "screen_name": "Astro_Kanai",
                  "location": "",
                  "description": "宇宙飛行士。2017年12月19日から国際宇宙ステーションに長期滞在中。 応援いただいているフォロワーのみなさまと一緒に、宇宙滞在を楽しみたいと思います！",
                  "url": "https://t.co/rWU6cxY9iL",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "https://t.co/rWU6cxY9iL",
                                  "expanded_url": "https://ameblo.jp/astro-kanai/",
                                  "display_url": "ameblo.jp/astro-kanai/",
                                  "indices": [
                                      0,
                                      23
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 51512,
                  "friends_count": 59,
                  "listed_count": 655,
                  "created_at": "Fri Mar 17 06:36:35 +0000 2017",
                  "favourites_count": 7075,
                  "utc_offset": 32400,
                  "time_zone": "Tokyo",
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 1035,
                  "lang": "ja",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "000000",
                  "profile_background_image_url": "http://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_image_url_https": "https://abs.twimg.com/images/themes/theme1/bg.png",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/879071738625232901/u0nlrr4Y_normal.jpg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/879071738625232901/u0nlrr4Y_normal.jpg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/842625693733203968/1492509582",
                  "profile_link_color": "E81C4F",
                  "profile_sidebar_border_color": "000000",
                  "profile_sidebar_fill_color": "000000",
                  "profile_text_color": "000000",
                  "profile_use_background_image": false,
                  "has_extended_profile": true,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": null,
                  "follow_request_sent": null,
                  "notifications": null,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 226,
              "favorite_count": 1356,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "ja"
          },
          {
              "created_at": "Mon Feb 26 01:07:05 +0000 2018",
              "id": 967928974960545793,
              "id_str": "967928974960545793",
              "text": "Congratulations to #Olympics athletes who won gold! Neutron stars like the one at the heart of the Crab Nebula may… https://t.co/vz4SnPupe2",
              "truncated": true,
              "entities": {
                  "hashtags": [
                      {
                          "text": "Olympics",
                          "indices": [
                              19,
                              28
                          ]
                      }
                  ],
                  "symbols": [],
                  "user_mentions": [],
                  "urls": [
                      {
                          "url": "https://t.co/vz4SnPupe2",
                          "expanded_url": "https://twitter.com/i/web/status/967928974960545793",
                          "display_url": "twitter.com/i/web/status/9…",
                          "indices": [
                              116,
                              139
                          ]
                      }
                  ]
              },
              "metadata": {
                  "result_type": "popular",
                  "iso_language_code": "en"
              },
              "source": "<a href='https://studio.twitter.com' rel='nofollow'>Media Studio</a>",
              "in_reply_to_status_id": null,
              "in_reply_to_status_id_str": null,
              "in_reply_to_user_id": null,
              "in_reply_to_user_id_str": null,
              "in_reply_to_screen_name": null,
              "user": {
                  "id": 19802879,
                  "id_str": "19802879",
                  "name": "NASA JPL",
                  "screen_name": "NASAJPL",
                  "location": "Pasadena, Calif.",
                  "description": "NASA Jet Propulsion Laboratory manages many of NASA's robotic missions exploring Earth, the solar system and our universe. Tweets from JPL's News Office.",
                  "url": "http://t.co/gcM9d1YLUB",
                  "entities": {
                      "url": {
                          "urls": [
                              {
                                  "url": "http://t.co/gcM9d1YLUB",
                                  "expanded_url": "http://www.jpl.nasa.gov",
                                  "display_url": "jpl.nasa.gov",
                                  "indices": [
                                      0,
                                      22
                                  ]
                              }
                          ]
                      },
                      "description": {
                          "urls": []
                      }
                  },
                  "protected": false,
                  "followers_count": 2566921,
                  "friends_count": 379,
                  "listed_count": 15065,
                  "created_at": "Sat Jan 31 03:19:43 +0000 2009",
                  "favourites_count": 1281,
                  "utc_offset": -32400,
                  "time_zone": "Alaska",
                  "geo_enabled": false,
                  "verified": true,
                  "statuses_count": 6328,
                  "lang": "en",
                  "contributors_enabled": false,
                  "is_translator": false,
                  "is_translation_enabled": false,
                  "profile_background_color": "0B090B",
                  "profile_background_image_url": "http://pbs.twimg.com/profile_background_images/8479565/twitter_jpl_bkg.009.jpg",
                  "profile_background_image_url_https": "https://pbs.twimg.com/profile_background_images/8479565/twitter_jpl_bkg.009.jpg",
                  "profile_background_tile": false,
                  "profile_image_url": "http://pbs.twimg.com/profile_images/2305452633/lg0hov3l8g4msxbdwv48_normal.jpeg",
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/2305452633/lg0hov3l8g4msxbdwv48_normal.jpeg",
                  "profile_banner_url": "https://pbs.twimg.com/profile_banners/19802879/1398298134",
                  "profile_link_color": "0D1787",
                  "profile_sidebar_border_color": "100F0E",
                  "profile_sidebar_fill_color": "74A6CD",
                  "profile_text_color": "0C0C0D",
                  "profile_use_background_image": true,
                  "has_extended_profile": false,
                  "default_profile": false,
                  "default_profile_image": false,
                  "following": null,
                  "follow_request_sent": null,
                  "notifications": null,
                  "translator_type": "none"
              },
              "geo": null,
              "coordinates": null,
              "place": null,
              "contributors": null,
              "is_quote_status": false,
              "retweet_count": 325,
              "favorite_count": 1280,
              "favorited": false,
              "retweeted": false,
              "possibly_sensitive": false,
              "lang": "en"
          }
      ],
      "search_metadata": {
          "completed_in": 0.057,
          "max_id": 0,
          "max_id_str": "0",
          "next_results": "?max_id=967574182522482687&q=nasa&include_entities=1&result_type=popular",
          "query": "nasa",
          "count": 3,
          "since_id": 0,
          "since_id_str": "0"
      }
  }
}
