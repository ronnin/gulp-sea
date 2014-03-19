var format = require('util').format;
var cssParse = require('css-parse');
var cssStringify = require('css-stringify');

var wrapTemplate = [
  'define("%s", [], function() {',
  '  seajs.importStyle("$s");',
  '});'
].join('\n');

/**
 *
 * @param css
 * @param options {{
 *  id: String,
 *  idleading: String,
 *  styleBox: Boolean,
 *  clean: Boolean
 * }}
 * @returns {*}
 */
exports.wrapCssAsJs = function(css, options) {
  options = options || {};

  if (options.clean) {
    css = require('clean-css').process(css, {
      keepSpecialComments: 0,
      removeEmpty: true
    })
  }

  if (options.styleBox && options.idleading) {
    // ex. arale/widget/1.0.0/ => .arale-widget-1_0_0
    var context = [
      '.',
      options.idleading.replace(/\\/g, '/')
                       .replace(/\/$/, '')
                       .replace(/\//g, '-')
                       .replace(/\./g, '_'),
      ' '
    ].join('');

    var ast = cssParse(css);
    putIntoContext(ast.stylesheet.rules, context);
    css = cssStringify(ast);
  }

  css = css.split(/\r\n|\r|\n/)
           .map(function(line) {
                return line.replace(/\\/g, '\\\\');
           }).join('\n')
        .replace(/'/g, '\\\'');

  return format(wrapTemplate, options.id || '', css);
};

/**
 *
 * @param css
 * @param options {{
 *  id:
 *  import:
 *  alias:
 *  debug: Boolean
 * }}
 */
exports.transform = function(css, options){

};

function putIntoContext(rules, context) {
  rules.forEach(function(rule) {
    if (rule.selectors) {
      rule.selectors = rule.selectors.map(function(selector) {
        if (/^:root/.test(selector.trim())) {
          return [':root ', context, selector.replace(':root', '').trim()].join('');
        }
        return context + selector;
      });
    }
    if (rule.rules) {
      putIntoContext(rule.rules, context);
    }
  });
}