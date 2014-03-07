var gulpUtil = require('gulp-util');
var PluginError = gulpUtil.PluginError;
var path = require('path');
var fs = require('fs');
var through2 = require('through2');
var defaults = require('lodash.defaults');

module.exports = function(options) {
  options = defaults(options || {}, {
    a: 1,
    b: 2
  });

  return through2.obj(function(file, enc, cb){
    var self = this;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-seajs', 'Streaming not supported'));
      return cb();
    }

    var code = file.contents.toString('utf8');
    console.log(file.isBuffer());

    this.push(file);
    cb();
  });
};