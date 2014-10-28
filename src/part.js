/* jshint esnext: true */

class Part {
  constructor({id, available}) {
    if ( (typeof id === undefined || id === null) ||
         (typeof available === undefined || available === null)) {
      throw new Error("That part is invalid.");
    }

    this.id = id;
    this.available = available;
  }

  toString() {
    return this.id;
  }
}

module.exports = Part;
