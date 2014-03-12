define('demo/mmodule/0.0.1/a', function(require, exports, module){
  console.log(module.uri, 'loaded');
  return module.uri;
});

define('demo/mmodule/0.0.1/b', function(require, exports, module){
  console.log(module.uri, 'loaded');
  var xa = require('xa');
  return module.uri;
});

define('gal/inject/0.0.1/inject', function(require, exports, module){
  var xb = require('xb');
  console.log(module.uri, 'loaded');
});

define('x/y/0.0.1/z', function(require, exports, module){
  console.log(module.uri, 'loaded');
});

define('demo/mmodule/0.0.1/e', function(require, exports, module){
  console.log(module.uri, 'loaded');
});

define('demo/mmodule/0.0.1/f', function(require, exports, module){
  console.log(module.uri, 'loaded');
});