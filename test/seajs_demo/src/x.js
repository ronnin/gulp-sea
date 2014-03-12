define(function (require, module, exports) {
  var $ = require('jquery');

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

  require.async(['xa', 'xb'], function(a, b){});
  require.async('xc', function(c){});
  require.async(['xd', 'xe']);
  require.async('xf');

  $(function () {
    require('lodash').each($('a[href]').classOnHover(), function () {
    });
  });
});