# What is this ?

This is a web interface to simplify management of the reservations at the Centre International Marie de Nazareth.

# Install / Setup

* run npm install
* download phantomjs here http://phantomjs.org/download.html (for pdf generation), extract the folder at the root of the app and rename it simply "phantomjs".
* create an empty folder public/downloads
* create an empty folder services/sync_calendar/\_credentials, paste in it the json with the private key of the google service account you want to use to access the Google calendar and rename this file to "accueil_service_account.json"
* create JSON file at services/auth/auth.json with "{}" inside

# Useful links

* Schema of the Vue components lifecycle : https://alligator.io/vuejs/component-lifecycle/

# To add new field in invoice Modal form

1. In ModalInvoice.vue,
  * add the new field and put a v-model="myField"
  * add myField in the tobesent object in the data() of the vue script
2. In emit_invoice.js, in function parseDossierObj, add myField to the returned object
3. Modify the EJS invoice template to take myField into account
