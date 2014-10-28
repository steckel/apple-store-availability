/* jshint esnext: true */

var $__Object$defineProperties = Object.defineProperties;

var Part = require('./part'),
    Promise = require('promise'),
    request = require('request'),
    querystring = require('querystring');

var Store = function() {
  "use strict";

  function Store(arg$0) {
    var address = arg$0.address, parts = arg$0.parts;
    this.address = address;
    this.parts = parts;
  }

  $__Object$defineProperties(Store.prototype, {
    availableParts: {
      get: function() {
        return this.parts.filter(function(part) {
          return part.available;
        });
      },

      enumerable: true,
      configurable: true
    },

    hasAvailableParts: {
      get: function() {
        return this.availableParts.length > 0;
      },

      enumerable: true,
      configurable: true
    },

    toString: {
      value: function() {
        return this.address.address;
      },

      enumerable: false,
      writable: true
    }
  });

  $__Object$defineProperties(Store, {
    findStoresWithParts: {
      value: function(arg$1, cb) {
        var zip = arg$1.zip, parts = arg$1.parts;
        var url = this.availabilitySearchURL({zip: zip, parts: parts});

        return new Promise(function(resolve, reject) {
          request(url, function(error, response) {
            if (error) return reject(error);

            try {
              var responseBody = JSON.parse(response.body);
            } catch (e) {
              return reject(e);
            }

            var stores = responseBody.body.stores.map(function(store) {
              store.parts = parts.map(function(key) {
                var partAvailability = store.partsAvailability[key],
                    id = key,
                    available = partAvailability.storeSelectionEnabled;

                return new Part({id: id, available: available});
              });

              return new Store(store);
            });

            stores = stores.filter(function(store) {
              return store.hasAvailableParts;
            });

            return resolve(stores);
          });
        });
      },

      enumerable: false,
      writable: true
    },

    availabilitySearchURL: {
      value: function(arg$2) {
        var zip = arg$2.zip, parts = arg$2.parts;
        var url = 'http://store.apple.com/us/retailStore/availabilitySearch?';

        parts.forEach(function(part, index) {
          if (index) url += '&';
          var partString = querystring.escape(part);
          url += "parts." + index + "=" + partString + "";
        });

        url += "&zip=" + zip + "";
        return url;
      },

      enumerable: false,
      writable: true
    }
  });

  return Store;
}();

module.exports = Store;
