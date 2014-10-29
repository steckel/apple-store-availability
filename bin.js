#!/usr/bin/env node

const program = require('commander'),
      colors = require('colors/safe'),
      AppleStore = require('./store'),
      Table = require('cli-table'),
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
  "notify": false
};

program
  .version('1.0.0')
  .usage('[options] [zip] [part-numbers...]')
  .option('-w, --watch',
          'Watch (poll) for changes in availability')
  .option('-wi, --watch-interval <n>',
          'The interval (in seconds) to watch (defaults to 120)')
  .option('-wq, --watch-quit-on-success',
          'Quit watching once availability is found')
  .option('-n, --notify',
          'Trigger a OS notification on success')
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

if (options.watch) {
  run({parts: parts, zip: zip});
  var interval = setTimeout(function() {
    run({parts: parts, zip: zip}).then(function(success) {
      if(success && options["watch-quit-on-success"]) clearInterval(interval);
    });
  }, options["watch-interval"] * 100);
} else {
  run({parts: parts, zip: zip});
}

function run(arg$0) {
  var parts = arg$0.parts, zip = arg$0.zip;

  return AppleStore.findStoresWithParts({parts: parts, zip: zip}).then(function(stores) {

    // TODO: Make this part of the .findStoresWithParts query
    // Further filter down the results by city...
    // stores = stores.filter((store) => store.city === "San Francisco");
    // stores = stores.filter((store) => store.storeNumber === "R075");

    if (stores.length > 0) {
      var headerRow = parts.slice(0);
      headerRow.unshift("");

      var table = new Table({
        head: headerRow,
        style: {
          head:[],
          border:[]
        }
      });

      stores.forEach(function(store) {
        var tableRow = {};
        tableRow[store.toString()] = store.parts.map(function(part) {
          if (part.available) {
            return colors.green("Available");
          } else {
            return colors.red("Unavailable");
          }
        });
        table.push(tableRow);
      });

      console.log("" + timestamp() + " - SUCCESS");
      console.log(table.toString());
      if (options.notify || options.watch) {
        nc.notify({
          "title": "Apple Store Availability",
          "message": "Part(s) available.",
          "sound": "Glass"
        });
      }

      return true;
    } else {
      return false;
    }
  }, function(error) {
    console.warn("Something seems to have gone wrong...");
    console.warn(error);

    if (options.notify || options.watch) {
      nc.notify({
        "title": "Apple Store Availability",
        "subtitle": "Error",
        "message": error
      });
    };
  });
}
