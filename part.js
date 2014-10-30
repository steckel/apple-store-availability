/* jshint esnext: true */


var $__Object$defineProperties = Object.defineProperties;

var Part = function() {
  "use strict";

  function Part(arg$0) {
    var id = arg$0.id, available = arg$0.available;
    this.id = this.constructor.parseID(id);
    this.available = available;
  }

  $__Object$defineProperties(Part.prototype, {
    id: {
      set: function(id) {
        Object.defineProperty(this, '_id', {
          value: this.constructor.parseID(id)
        });
      },

      get: function() {
        return this._id;
      },

      enumerable: true,
      configurable: true
    },

    toString: {
      value: function() {
        return this.id;
      },

      enumerable: false,
      writable: true
    }
  });

  $__Object$defineProperties(Part, {
    parseID: {
      value: function(id) {
        var _id = id;
        if (typeof id !== "undefined" && id !== null) {
          id = id.toString().toUpperCase();
          if (id.match('/A') !== null) {
            _id = id;
          } else {
            _id = "" + id + "/A";
          }
        }

        return _id;
      },

      enumerable: false,
      writable: true
    }
  });

  return Part;
}();

module.exports = Part;
