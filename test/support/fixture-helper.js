const fixtures = require('path').join(__dirname, '../fixtures');
const fs = require('fs');
const path = require('path');

const ext = {};

ext.loadFixture = function(name, cb) {
  const pathToFixture = path.join(fixtures, "/", name);

  return new Promise (function(resolve, reject) {
    fs.readFile(pathToFixture, "utf8", function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = ext;
