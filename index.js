var request = require('request'),
    notifier = require('node-notifier'),
    nc = new notifier.NotificationCenter();


function pingAppleStore(cb) {
  request('http://store.apple.com/us/retailStore/availabilitySearch?parts.0=MG632LL%2FA&zip=94117', function(error, response) {
    var bodyObject = JSON.parse(response.body);
    var sanFranciscoStore = bodyObject.body.stores.filter(function(store) {
      return store.storeName === "San Francisco";
    })[0];

    var available = sanFranciscoStore.partsAvailability["MG632LL/A"].storeSelectionEnabled;
    cb(error, available);
  });
}

(function main() {
  console.log("Watching the Apple store...");
  console.log("Checking every 2 minutes.");
  console.log("-----------------------------");
  var timer = setInterval(function() {
    pingAppleStore(function(error, available) {
      var now = new Date();
      var timestamp = now.getHours() + ":" +
                      now.getMinutes() + ":" +
                      now.getSeconds();
      if (available) {
        console.log("! " + timestamp + " – Available!");
        nc.notify({
          "title": "iPhone Availability",
          "message": "It's available! Go get it!",
          "sound": "Glass"
        });
        clearInterval(timer);
      } else {
        console.log("X " + timestamp + " – Unavailable");
      }
    });
  }, 120000);
})();
