'use strict';

const fs = require('fs');
const path = require('path');
const assign = require('object-assign');

module.exports = function () {
  let my = {};
  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
    my = require(path.join(process.cwd(), 'tsconfig.json'));
  } else {
    throw new Error('"tsconfig.json" not found!');
  }
  return my.compilerOptions;
};
