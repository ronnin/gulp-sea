define('$$/x-debug', [
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
  require.async([
    'demo/demo/0.0.1/xa-debug',
    'demo/demo/0.0.1/xb-debug'
  ], function (a, b) {
  });
  require.async('demo/demo/0.0.1/xc', function (c) {
  });
  require.async([
    'demo/demo/0.0.1/xd',
    'demo/demo/0.0.1/xe'
  ]);
  require.async('demo/demo/0.0.1/xf');
  $(function () {
    require('lodash/lodash/2.1.0/lodash').each($('a[href]').classOnHover(), function () {
    });
  });
});