/* jshint esnext:true */

const AppleStore = require('./store'),
      notifier = require('node-notifier'),
      nc = new notifier.NotificationCenter(),
      parts = ['MG632LL/A'/*, 'MG602LL/A'*/],
      zip = 94117,
      minutes = 2;

function timestamp() {
  var now = new Date();
  return `${now.getHours()}:${now.getMinutes()}`;
}

console.log(`Watching the Apple store for part(s) ${parts} in ${zip}`);
console.log(`Checking every ${minutes} minutes.`);
console.log('-----------------------------');

var timer = setInterval(function() {
  AppleStore.findStoresWithParts({parts, zip}).then(function(stores) {
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

      clearInterval(timer);

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
