# intro_to_programming_final_project
This repository stores all files related to the Final Project for the Berklee Online course, "Introduction to Computer Programming for Musicians".

The name of this project is: "Fan Central Station".

**HOW TO VIEW THE SITE**

To get the full experience of the site, download the repo into a local directory on your computer, and then launch "index.html" into a browser.
*NOTE: You will need to acquire your own API Keys in order to see the API data that is pulled into the site.*

**PLEASE NOTE THAT THIS IS A WORK IN PROGRESS!**

Fan Central Station features a search box where users can look up their favorite artists.

The search reaches out to several APIs to pull in various content about the artist.
The ultimate goal of this site is to scour the internet for important news and events related to the current artist, and pull it all into a central site (i.e., Fan Central Station), saving time for users who want to know both current events and history tied to their favorite artists.

From an outside-in level, each "artist fan page" includes the following::

* [DONE!] Random art from the "fan.art.tv" API
* [DONE!] Top 10 songs from the artist, pulled in from the "musixmatch" API
* [DONE!] A summary of the artist, from the "Lastfm" API
* [DONE!] Tour dates for the artist, from the "Ticketmaster" API
* [DONE!] A signup sheet for users to be kept informed about their favorite artist
* [DONE!] Add contractually obligated images/links to API sites where the API blurbs appear

**UPDATES COMING UP IN THE NEAR FUTURE**
* News about the artist (Google News API)
  - The site will include news items about the artist via Google's News API
* Add Jasmine to the site for Unit Testing
* Refactor API calls to Last.fm, Musixmatch, Ticketmaster, etc., so that they use aync await, seeing as Last.fm needs to be queried first in order to obtain the artist_mbid value before moving on to to other API calls.

**DREAM UPDATES FOR A TIME IN THE DISTANT FUTURE**
* Improve CSS for a more updated user experience
* Get this web site up on a web server
  - Much of the power (and security) of this site will require a web server, so it will be a priority to decide on a server type and server language, and update the web site accordingly
* Put information into a different database
  - Data is currently stored in Patrick McNeill's API Data Store; an updated site will use its own database
* Expand site from "just music artists" to all kinds of entertainers
* Localize results by user
  - Determine where the user is by I.P., and display "News/Events in your area!" based on what we can whittle down in our APIs
* Internationalize the site
  - Ticketmaster allows us to pull in concert events for artists happening all over the world. I've started small here, and just filtered info to events occurring in the U.S. But it would be good to check the user's location via I.P. address, and default information to based on the country we receive from the I.P.
* Allow users to choose countries
  - Add a dropdown that will allow users to see news/events for their artists in the countries of their choice
* Actually send emails to users
  - Because currently we're just storing email info in the database
* Create a log in for users
  - This will allow users to update their profile information
  - This will also allow for more personalized API data, based on the user's stored address
* Create an admin interface
  - This will allow web administrators to update information about users and artists
* Add most recent tweets about the artist from Twitter
      - This will be a great addition in the future. The Twitter search API now requires server-side scripting in order for it to return data. If this project ever gets placed on a web server, I'll be sure to add this Twitter piece
* Keep scouring the internet for APIs that could improve the usefulness of this site. Some ideas:
  - Instagram
  - Facebook
  - Live Nation
  - Artist web pages
  - Spotify
  - And whatever else we might find!
