var assert = require('assert'),
    Part = require('../part');

// Part id normalization & id getter/setter
assert((new Part({id:"XXXX/A"})).id === "XXXX/A", "XXXX/A");
assert((new Part({id:"XXXX/a"})).id === "XXXX/A", "XXXX/a");
assert((new Part({id:"XXXX"})).id === "XXXX/A", "XXXX");

// #toString()
assert((new Part({id:"XXXX/A"})).toString() === "XXXX/A");
