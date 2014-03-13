define(function(require, exports){
  var xa = require('xa');
  exports.seek = function(clue) {
    var _ = require('lodash');
    return _.some(['watermelon', 'muskmelon'], function(melon) {
      return melon == clue;
    })
  };
});