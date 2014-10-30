/* jshint esnext: true */

var Part = require('./part'),
    Promise = require('promise'),
    request = require('request'),
    querystring = require('querystring');

class Store {
  constructor({address, parts, city, storeNumber}) {
    this.address = address;
    this.parts = parts;
    this.city = city;
    this.storeNumber = storeNumber;
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

  static deserialize(body) {
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
        return new Part({id, available});
      });

      return new Store(store);
    });
  }

  static _requestStoresWithParts({zip, parts}) {
    var url = this._availabilitySearchURL({zip, parts});
    return new Promise((resolve, reject) => {
      request(url, function(error, {body}) {
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
    });
  }

  static queryForParts({zip, parts}) {
    return this._requestStoresWithParts({zip, parts});
  }

  static findStoresWithParts({zip, parts}) {
    return this._requestStoresWithParts({zip, parts})
    .then(function(stores) {
      return stores.filter((store) => store.hasAvailableParts);
    });
  }

  static _availabilitySearchURL({zip, parts}) {
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
