#!/usr/bin/env node

var $__Array$prototype$slice = Array.prototype.slice;

const program = require('commander'),
      AppleStore = require('./store'),
      Part = require('./part'),
      storesAndPartsTable = require('./table'),
      notifier = require('node-notifier'),
      nc = new notifier.NotificationCenter();

function timestamp() {
  var now = new Date();
  var hour = now.getHours().toString();
  hour = hour.length === 1 ? "0" + hour + "" : ""+hour;
  var min = now.getMinutes().toString();
  min = min.length === 1 ? "0" + min + "" : ""+min;

  return "" + hour + ":" + min + "";
}

function parseOptions(defaults, program) {
  var args = Object.keys(defaults),
      options = Object.create(defaults);

  args.forEach(function(key) {
    options[key] = program[key] || defaults[key];
  });

  return options;
}

var defaults = {
  "watch": false,
  "watch-interval": 120,
  "watch-quit-on-success": false,
  "notify": false,
  "verbose": false
};

program
  .version('1.0.2')
  .usage('[options] [zip-code] [part-numbers...]')
  .option('-w, --watch', 'Watch (poll) for changes in availability')
  // Does <n> not work here...?
  // .option('-wi, --watch-interval <n>', 'The interval (in seconds) to watch (defaults to 120)', parseInt)
  .option('-wq, --watch-quit-on-success', 'Quit watching once availability is found')
  .option('-n, --notify', 'Trigger a OS notification on success')
  .option('-v, --verbose', 'Log activity')
  .parse(process.argv);

var options = parseOptions(defaults, program);

zip = program.args[0],
parts = program.args.slice(1);

/**
 * Without zip and part numbers simply return the help
 */
if ((typeof zip === "undefined" || zip === null) ||
    (typeof parts === "undefined" || parts === null)) {
  console.log(program.helpInformation());
  return;
}

// Meh
parts = parts.map(function(id) {
  return Part.parseID(id);
});

verbose("Querying the Apple Store for part(s) " + parts + " within the zip code " + zip + ".");

if (options.watch) {
  verbose("Watching (polling) every " + options["watch-interval"] + " seconds.");
  if (options['watch-quit-on-success']) {
    verbose('Will exit on success.');
  } else {
    verbose('Will continue watching on success.');
  }

}

if (options.watch || options.notify) {
  verbose('OSX Notifications on success and error.');
}

if (options.watch) {
  run({parts: parts, zip: zip});
  var interval = setInterval(function() {
    run({parts: parts, zip: zip}).then(function(success) {
      if(success && options["watch-quit-on-success"]) clearInterval(interval);
    }, function(error) {
      console.warn(error);
    });
  }, options["watch-interval"] * 1000);
} else {
  run({parts: parts, zip: zip}).then(null,function(error) {
    console.warn(error);
  });
}

function verbose() {
  var $__0;
  var $__arguments = arguments;
  var args = [].slice.call($__arguments, 0);
  if (options.verbose) ($__0 = console).log.apply($__0, [timestamp()].concat($__Array$prototype$slice.call(args)));
}

function run(arg$0) {
  var parts = arg$0.parts, zip = arg$0.zip;

  // Spacer
  console.log('');

  verbose('Querying...');

  return AppleStore.queryForParts({parts: parts, zip: zip}).then(function(stores) {
    verbose('...query complete.');
    if (options.verbose) console.log('');

    // TODO: Make this part of the .findStoresWithParts query
    // Further filter down the results by city...
    // stores = stores.filter((store) => store.city === "San Francisco");
    // stores = stores.filter((store) => store.storeNumber === "R075");

    var success = stores.filter(function(store) {
      return store.hasAvailableParts;
    }).length;
    if (success) {
      verbose("Part(s) available within " + zip + ".");
      if (options.notify || options.watch) {
        nc.notify({
          "title": "Apple Store Availability",
          "message": "Part(s) available.",
          "sound": "Glass"
        });
      }
    } else {
      verbose("Part(s) **not** available within " + zip + ".");
    }
    var table = storesAndPartsTable({stores: stores, parts: parts});
    console.log(table.toString());
    return success;
  }, function(error) {
    console.warn("Something seems to have gone wrong...");
    console.warn(error);

    if (options.notify || options.watch) {
      nc.notify({
        "title": "Apple Store Availability",
        "subtitle": "Error",
        "message": error
      });
    }
  });
}
