![capture](https://906ykq.db.files.1drv.com/y4m615wN_23ACsfjut8UzNNbJKJq7T20eqVwec5G3WpZBBEzld7Fk1NThedBq1mH6aDb8DmhBXdgd45-OdzkGzQYXFRtNLp8pMExDlE4xDiEsUtCgaQygUZku85Sk7r2Jbd64w_kH9TiDoOf2Wl5d6Ud_eWBgPHWisNDYMqIzrD1NZb93QRGIqlrt38E94dCZ1Ab7S8NEp5YNwIl0QO7dgm9A?width=660&height=307&cropmode=none)

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
