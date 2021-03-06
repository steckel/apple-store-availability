/* jshint esnext:true */

var Table = require('cli-table'),
    colors = require('colors/safe');

/**
 * @param {array<store>} collection
 * @return {string}
 *
 * TODO: Ensure that parts and store.parts are in the same order...fuck
 */
function storesAndPartsTable({stores, parts}) {
  var head = [''].concat(parts),
      style = { head:[], border:[] },
      table = new Table({head, style});

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

  return table;
}

module.exports = storesAndPartsTable;
