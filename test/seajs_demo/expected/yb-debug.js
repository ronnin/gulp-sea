define('yb-debug', [
  'jquery/jquery/1.9.1/jquery',
  'lodash/lodash/2.1.0/lodash'
], function (require, module, exports) {
  var $ = require('jquery/jquery/1.9.1/jquery');
  $.fn.classOnHover = function (hoverClass) {
    hoverClass = hoverClass || 'hover';
    return this.each(function () {
      $(this).focus(function () {
        $(this).addClass(hoverClass);
      }).blur(function () {
        $(this).removeClass(hoverClass);
      });
    });
  };
  $(function () {
    require('lodash/lodash/2.1.0/lodash').each($('a[href]').classOnHover(), function () {
    });
  });
});