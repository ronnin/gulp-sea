define('yb', function (require, module, exports) {
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

  $(function () {
    require('lodash').each($('a[href]').classOnHover(), function () {
    });
  });
});