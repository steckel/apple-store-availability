/* jshint esnext: true */

var $__Object$defineProperties = Object.defineProperties;

var Part = require('./part'),
    Promise = require('promise'),
    request = require('request'),
    querystring = require('querystring');

var Store = function() {
  "use strict";

  function Store(arg$0) {
    var address = arg$0.address, parts = arg$0.parts, city = arg$0.city, storeNumber = arg$0.storeNumber;
    this.address = address;
    this.parts = parts;
    this.city = city;
    this.storeNumber = storeNumber;
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
    deserialize: {
      value: function(body) {
        try {
          var responseBody = JSON.parse(body);
        } catch (e) {
          return e;
        }

        // FIXME
        var firstStore = responseBody.body.stores[0],
            parts = Object.keys(firstStore.partsAvailability);

        return responseBody.body.stores.map(function(store) {
          store.parts = parts.map(function(key) {
            var partAvailability = store.partsAvailability[key],
                id = key,
                available = partAvailability.storeSelectionEnabled;
            return new Part({id: id, available: available});
          });

          return new Store(store);
        });
      },

      enumerable: false,
      writable: true
    },

    _requestStoresWithParts: {
      value: function(arg$1) {
        var zip = arg$1.zip, parts = arg$1.parts;
        var url = this._availabilitySearchURL({zip: zip, parts: parts});

        return new Promise(function(resolve, reject) {
          request(url, function(error, arg$2) {
            var body = arg$2.body;

            if (error) {
              return reject(error);
            } else {
              var stores = this.deserialize(body);
              if (typeof stores === Error) {
                reject(error);
              } else {
                resolve(stores);
              }
            }
          }.bind(this));
        }.bind(this));
      },

      enumerable: false,
      writable: true
    },

    findStoresWithParts: {
      value: function(arg$3) {
        var zip = arg$3.zip, parts = arg$3.parts;

        return this._requestStoresWithParts({zip: zip, parts: parts})
        .then(function(stores) {
          return stores.filter(function(store) {
            return store.hasAvailableParts;
          });
        });
      },

      enumerable: false,
      writable: true
    },

    _availabilitySearchURL: {
      value: function(arg$4) {
        var zip = arg$4.zip, parts = arg$4.parts;
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
