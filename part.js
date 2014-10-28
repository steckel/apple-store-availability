/* jshint esnext: true */

var $__Object$defineProperties = Object.defineProperties;

var Part = function() {
  "use strict";

  function Part(arg$0) {
    var id = arg$0.id, available = arg$0.available;

    if ( (typeof id === undefined || id === null) ||
         (typeof available === undefined || available === null)) {
      throw new Error("That part is invalid.");
    }

    this.id = id;
    this.available = available;
  }

  $__Object$defineProperties(Part.prototype, {
    toString: {
      value: function() {
        return this.id;
      },

      enumerable: false,
      writable: true
    }
  });

  return Part;
}();

module.exports = Part;
