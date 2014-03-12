define('demo/mmodule/0.0.1/a-debug', [], function (require, exports, module) {
  console.log(module.uri, 'loaded');
  return module.uri;
});
define('demo/mmodule/0.0.1/b-debug', ['demo/demo/0.0.1/xa-debug'], function (require, exports, module) {
  console.log(module.uri, 'loaded');
  var xa = require('demo/demo/0.0.1/xa-debug');
  return module.uri;
});
define('gal/inject/0.0.1/inject-debug', ['demo/demo/0.0.1/xb-debug'], function (require, exports, module) {
  var xb = require('demo/demo/0.0.1/xb-debug');
  console.log(module.uri, 'loaded');
});
define('x/y/0.0.1/z-debug', [], function (require, exports, module) {
  console.log(module.uri, 'loaded');
});
define('demo/mmodule/0.0.1/e-debug', [], function (require, exports, module) {
  console.log(module.uri, 'loaded');
});
define('demo/mmodule/0.0.1/f-debug', [], function (require, exports, module) {
  console.log(module.uri, 'loaded');
});