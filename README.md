# What is this ?

This is a web interface to simplify management of the reservations at the Centre International Marie de Nazareth.

# Install / Setup

* run npm install
* download phantomjs here http://phantomjs.org/download.html (for pdf generation), extract the folder at the root of the app and rename it simply "phantomjs".
* create an empty folder public/downloads
* create an empty folder services/sync_calendar/\_credentials, paste in it the json with the private key of the google service account you want to use to access the Google calendar and rename this file to "accueil_service_account.json"

# Useful links

* Schema of the Vue components lifecycle : https://alligator.io/vuejs/component-lifecycle/
