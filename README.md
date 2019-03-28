# intro_to_programming_final_project
This repository stores all files related to the Final Project for the Berklee Online course, "Introduction to Computer Programming for Musicians".

The name of this project is: "Fan Central Station".

**PLEASE NOTE THAT THIS IS A WORK IN PROGRESS!**

Fan Central Station features a search box where users can look up their favorite artists.

The search reaches out to several APIs to pull in various content about the artist.

From an outside-in level, each "artist fan page" includes the following::

* [DONE!] Random art from the "fan.art.tv" site
* [DONE!] Top 5 songs from the artist, pulled in from the "musixmatch" site
* [DONE!] A summary of the artist from "Lastfm"
* [DONE!] Tour dates for the artist (from the "Ticketmaster" API)
* [IN PROGRESS] An optional signup sheet for users to be kept informed about their favorite artist

**THINGS LEFT TO DO**
* Add names and email addresses to a database
  - I've got a sign up sheet, now all I need to do is connect it to an API data store and start collecting information. But first I need to get authentication! I'll send another request in that direction.
* Most recent tweets about the artist from Twitter
  - This will be a great addition in the future. The Twitter search API now requires server-side scripting in order for it to return data. If this project ever gets placed on a web server, I'll be sure to add this Twitter piece.
* News about the artist (api TBD)
  - I might or might not add this feature in the future. The web page is looking pretty crammed right now. But if I can think of a layout configuration that will allow for more elements on the page, then I'll try to add this. In the meantime, I can still at least search to see if there is even an API that returns current events about an artist.
