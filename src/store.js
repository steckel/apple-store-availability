/* jshint esnext: true */

var Part = require('./part'),
    Promise = require('promise'),
    request = require('request'),
    querystring = require('querystring');

class Store {
  constructor({address, parts}) {
    this.address = address;
    this.parts = parts;
  }

  get availableParts() {
    return this.parts.filter((part) => part.available);
  }

  get hasAvailableParts() {
    return this.availableParts.length > 0;
  }

  toString() {
    return this.address.address;
  }

  static findStoresWithParts({zip, parts}, cb) {
    var url = this.availabilitySearchURL({zip, parts});

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

            return new Part({id, available});
          });

          return new Store(store);
        });

        stores = stores.filter((store) => store.hasAvailableParts);

        return resolve(stores);
      });
    });
  }

  static availabilitySearchURL({zip, parts}) {
    var url = 'http://store.apple.com/us/retailStore/availabilitySearch?';

    parts.forEach(function(part, index) {
      if (index) url += '&';
      var partString = querystring.escape(part);
      url += `parts.${index}=${partString}`;
    });

    url += `&zip=${zip}`;

    return url;
  }
}

module.exports = Store;
