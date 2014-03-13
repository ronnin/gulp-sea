define('$$/lib/sub-debug', [
  'demo/demo/0.0.1/xa-debug',
  'lodash/lodash/2.1.0/lodash'
], function (require, exports) {
  var xa = require('demo/demo/0.0.1/xa-debug');
  exports.seek = function (clue) {
    var _ = require('lodash/lodash/2.1.0/lodash');
    return _.some([
      'watermelon',
      'muskmelon'
    ], function (melon) {
      return melon == clue;
    });
  };
});