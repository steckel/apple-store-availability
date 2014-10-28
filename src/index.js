/* jshint esnext:true */

const AppleStore = require('./store'),
      notifier = require('node-notifier'),
      nc = new notifier.NotificationCenter();

/**
 * Options
 */
const parts = ['MG632LL/A', 'MG602LL/A'],
      zip = 94117,
      minutes = 2,
      quitOnSuccess = false;

function timestamp() {
  var now = new Date();
  var hour = now.getHours().toString();
  hour = hour.length === 1 ? `0${hour}` : ""+hour;
  var min = now.getMinutes().toString();
  min = min.length === 1 ? `0${min}` : ""+min;

  return `${hour}:${min}`;
}

console.log(`Watching the Apple store for part(s) ${parts} in ${zip}`);
console.log(`Checking every ${minutes} minutes.`);
console.log('-----------------------------');

var timer = setInterval(function() {
  AppleStore.findStoresWithParts({parts, zip}).then(function(stores) {

    // TODO: Make this part of the .findStoresWithParts query
    // Further filter down the results by city...
    // stores = stores.filter((store) => store.city === "San Francisco");
    stores = stores.filter((store) => store.storeNumber === "R075");

    if (stores.length > 0) {
      console.log(`SUCCESS ${timestamp()} – Available!`);
      console.log('-----------------------------');
      stores.forEach(function(store) {
        console.log(store.toString());
        store.availableParts.forEach(function(part) {
          console.log(part.toString());
          console.log('');
        });
      });

      nc.notify({
        "title": "Apple Store Availability",
        "message": `Available at ${stores.length} store(s)`,
        "sound": "Glass"
      });

      if (quitOnSuccess) clearInterval(timer);

    } else {
      console.log(`X ${timestamp()} – Unavailable`);
    }
  }, function(error) {
    console.warn(`! ${timestamp()} – ${error}`);
    nc.notify({
      "title": "iPhone Availability",
      "subtitle": "Error",
      "message": error
    });
  });
}, minutes * 10000);
