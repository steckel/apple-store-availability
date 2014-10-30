/* jshint esnext: true */


class Part {
  constructor({id, available}) {
    this.id = this.constructor.parseID(id);
    this.available = available;
  }

  set id(id) {
    Object.defineProperty(this, '_id', {
      value: this.constructor.parseID(id)
    });
  }

  get id() {
    return this._id;
  }

  toString() {
    return this.id;
  }

  static parseID(id) {
    var _id = id;
    if (typeof id !== "undefined" && id !== null) {
      id = id.toString().toUpperCase();
      if (id.match('/A') !== null) {
        _id = id;
      } else {
        _id = `${id}/A`;
      }
    }

    return _id;
  }
}

module.exports = Part;
