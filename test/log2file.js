var fs = require('fs');

module.exports = function (json, file) {
  fs.writeFile(file, JSON.stringify(json, null, 2));
};