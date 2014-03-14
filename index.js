var path = require('path');
var fs = require('fs');

var gulpUtil = require('gulp-util');
var PluginError = gulpUtil.PluginError;
var through2 = require('through2');
var async = require('async');
var _defaults = require('lodash.defaults');
var _assign = require('lodash.assign');

var script = require('./lib/script');


/**
 *
 * @param options {{
 *  mode: if 1, just code in debug style; if 2, just code in minified & obufuscated style; if 0, both. default 0
 *  idleading: used for id-non-specified module, generate id by idleading+file.relative(no file extname),
 *  alias: module alias,
 *  id: function or instant value for transforming module id.
 *  dependencies: function or instant value for transforming dependencies.
 *                if function, will called with an argument Array(String), aka, alias.
 *                if not provided, transformed by alias
 *  require: function or instant value for transforming require('').
 *                if function, will called with an argument String, aka, an alias of module required.
 *                if not provided, transformed by alias
 *  async: function or instant value for transforming require.async('')
 *                if function, will called with an argument String, aka, an alias of module required.
 *                if not provided, transformed by alias
 *  pkgAliasEnabled: if true, merge spm.alias from ./package.json into options.alias. default true.
 *
 * }}
 * @returns {*}
 */
module.exports = function(options) {
  options = options || {};
  var idLeading = options.idleading ? ensureEndsWith(options.idleading.replace(/\\/g, '/'), '/') : '';

  options.alias = options.alias || {};

  if (options.pkgAliasEnabled !== false) {
    var pkgFile = path.join(process.cwd(), './package.json');
    if (fs.existsSync(pkgFile)) {
      var pkg = require(pkgFile);
      if (isObject(pkg) && isObject(pkg.spm) && isObject(pkg.spm.alias)) {
        options.alias = _assign(options.alias, pkg.spm.alias);
      }
    }
  }

  return through2.obj(function(file, enc, next){
    var self = this;

    if (file.isNull()) {
      this.push(file);
      return next();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-seajs', 'Streaming not supported'));
      return next();
    }

    var baseName = file.relative.replace(/\.js$/, '');
    var opt = _assign({
      id: function(id){
        return id || (idLeading + baseName);
      }
    }, options);

    var modes;
    switch (opt.mode) {
      case 1:
        modes = [true];  // module-debug
        break;
      case 2:
        modes = [false]; // module
        break;
      default:
        modes = [true, false]; // both
    }

    async.each(modes, function(mode, callback){
      transformScript(file, _defaults({debug: mode}, opt), function(err, f) {
        if (err) {
          callback(err);
        } else {
          self.push(f);
          callback();
        }
      });
    }, next);

  });
};

function transformScript(file, opt, callback) {
  async.waterfall([
    function(cb){
      script.extract(file.contents, cb);
    },
    function(extractedData, cb){
      script.transform(extractedData.defines, extractedData.ast, opt, cb)
    },
    function(ast, cb) {
      script.generateCode(ast, !opt.debug, cb);
    },
    function(output, cb){
      var destFile = opt.debug ? file.clone() : file;
      destFile.contents = new Buffer(output.code || output);
      if (opt.debug) {
        destFile.path = destFile.path.replace(/\.js$/, '-debug.js');
      }
      cb(null, destFile);
    }
  ], callback);

}

function ensureEndsWith(str, ends) {
  if (str.substring(str.length - ends.length) !== ends) {
    return str + ends;
  }
  return str;
}

function isObject(o) {
  return o && typeof o == 'object';
}