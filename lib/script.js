var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var esmangle = require('esmangle');
var async = require('async');
var isObject = require('utils').isObject;

var astCallExp  = esprima.Syntax.CallExpression,
  astArrayExp   = esprima.Syntax.ArrayExpression,
  astMemberExp  = esprima.Syntax.MemberExpression,
  astLiteral    = esprima.Syntax.Literal;


function isDefineNode(node) {
  return node.type === astCallExp && node.callee.name === 'define'
    && Array.isArray(node.arguments) && node.arguments.length;
}

function isRequireNode(node) {
  return node.type === astCallExp && node.callee.name === 'require'
    && Array.isArray(node.arguments) && node.arguments.length && node.arguments[0].type === astLiteral;
}

function isRequireAsyncNode(node) {
  return node.type === astCallExp
    && node.callee.type === astMemberExp && node.callee.object.name === 'require' && node.callee.property.name === 'async'
    && Array.isArray(node.arguments) && node.arguments.length
    && (node.arguments[0].type === astLiteral || node.arguments[0].type === astArrayExp);
}

function addDependency(def, dependency) {
  if (!~def.dependencies.indexOf(dependency)) {
    def.dependencies.push(dependency);
  }
}

function translateToLiteralNode(str) {
  return {
    type: astLiteral,
    value: str
  }
}

function translateToLiteralNodes(strArray) {
  return strArray.map(translateToLiteralNode);
}

function extractDefine(defineNode) {
  var def = {
    id: null,
    dependencies: [],
    factory: null,
    node: defineNode,
    idNode: null,
    dependencyNode: null,
    requireNodes: [],
    asyncNodes: []
  };

  var argLen = defineNode.arguments.length;
  def.factory = defineNode.arguments[argLen - 1]; // function(require, exports, module){}; / instant value
  var arg0, arg1;
  if (argLen == 2) {
    arg0 = defineNode.arguments[0];
    switch (arg0.type) {
      case astLiteral: // define('id', factory);
        def.id = arg0.value;
        def.idNode = arg0;
        break;
      case astArrayExp: // define(['dep1', 'dep2'], factory);
        def.dependencies = arg0.elements.map(function(el){return el.value});
        def.dependencyNode = arg0;
        break;
    }
  } else if (argLen > 2) { // define('id', ['dep1', 'dep2'], factory);
    arg0 = defineNode.arguments[0];
    arg1 = defineNode.arguments[1];
    if (arg0.type === astLiteral) {
      def.id = arg0.value;
      def.idNode = arg0;
    }
    if (arg1.type === astArrayExp) {
      def.dependencies = arg1.elements.map(function(el){return el.value});
      def.dependencyNode = arg1;
    }
  }

  return def;
}


/**
 * parse js script, and return the defines on success.
 * @param code: js script
 * @param cb: function(err, {{defines, ast}}){}
 * defines: [
 *  {
 *     id: '',
 *     dependencies: [],
 *     factory: null,
 *     node: null,
 *     dependencyNode: null,
 *     requireNodes: [],
 *     asyncNodes: []
 *  }
 * ]
 *
 */
exports.extract = function(code, cb){
  var ast;
  try {
    ast = esprima.parse(code);
  } catch (e) {
    cb('parse error:' + e);
    return;
  }

  var defines = [], defineStack = [];
  estraverse.traverse(ast, {
    enter: function(node) {
      if (isDefineNode(node)) {
        defineStack.push(extractDefine(node));
      } else
      if (defineStack.length) {
        var def = defineStack[defineStack.length - 1];
        if (isRequireNode(node)) {
          addDependency(def, node.arguments[0].value);
          def.requireNodes.push(node);
        } else if (isRequireAsyncNode(node)) {
          /*if (node.arguments[0].type === astArrayExp) {
            node.arguments[0].elements.forEach(function(dp) {
              addDependency(def, dp.value);
            });
          } else {
            addDependency(def, node.arguments[0].value);
          }*/
          def.asyncNodes.push(node);
        }
      }
    },
    leave: function(node) {
      if (defineStack.length && isDefineNode(node)) {
        defines.push(defineStack.pop());
      }
    }
  });

  cb(null, {
    defines: defines,
    ast: ast
  });
};

function makeTransformFunction(fn) {
  if (!fn) {
    return function(v){return v};
  }

  if (typeof fn === 'function') {
    return fn;
  }

  return function(){
    return fn;
  };
}

function insertIntoArray(array, index, newItem) {
  if (index == 0) {
    array.unshift(newItem);
  } else if (index > 0) {
    if (index >= array.length) {
      array[index] = newItem;
    } else {
      array = array.slice(0, index).concat(newItem).concat(array.slice(index));
    }
  }
  return array;
}

/**
 *
 * @param defines extracted "define"s, referring to exports.extract() for details (WARNING: modified after function call!)
 * @param ast which "define"s extracted from, and transformed (WARNING: modified after function call!)
 * @param options {{
 *            id: String/Function,
 *            dependencies: String/Array/Function,
 *            require: String/Function,
 *            async: String/Function,
 *            alias: Object,
 *            debug: Boolean
 *            }}
 * @param cb
 */
exports.transform = function (defines, ast, options, cb) {
  options = options || {};
  var transformByAlias = isObject(options.alias) &&
    function(v) {
      return (options.debug && options.alias[v + '-debug']) || options.alias[v] || v;
    };
  var idFnc = makeTransformFunction(options.id),
      dependenciesFnc = makeTransformFunction(options.dependencies || (transformByAlias && function(deps){
        return Array.isArray(deps) ? deps.map(transformByAlias) : (deps ? transformByAlias(deps) : []);
      })),
      requireFnc = makeTransformFunction(options.require || transformByAlias),
      asyncFnc = makeTransformFunction(options.async || transformByAlias);

  defines.forEach(function(def){
    var defArgs = def.node.arguments;

    def.id = idFnc(def.id);
    if (def.id) {
      if (options.debug && !/-debug$/.test(def.id)) {
        def.id += '-debug';
      }

      if (def.idNode) {
        def.idNode.value = def.id;
      } else {
        def.idNode = translateToLiteralNode(def.id);
        defArgs.unshift(def.idNode);
      }
    } else {
      if (def.idNode) {
        defArgs.shift();
        def.idNode = null;
      }
    }

    def.dependencies = def.dependencies.length ? dependenciesFnc(def.dependencies) : [];
    var dependencies = translateToLiteralNodes(def.dependencies);
    if (def.dependencyNode) {
      def.dependencyNode.elements = dependencies;
    } else {
      def.dependencyNode = {
        type: astArrayExp,
        elements: dependencies
      };
      def.node.arguments = insertIntoArray(defArgs, def.idNode ? 1 : 0, def.dependencyNode);
    }

    def.requireNodes.forEach(function(requireNode){
      requireNode.arguments[0].value = requireFnc(requireNode.arguments[0].value);
    });

    def.asyncNodes.forEach(function(asyncNode){
      var arg0 = asyncNode.arguments[0];
      if (arg0.type === astArrayExp) {
        arg0.elements.forEach(function(dp) {
          dp.value = asyncFnc(dp.value);
        });
      } else {
        arg0.value = asyncFnc(arg0.value);
      }
    });
  });

  cb(null, ast);
};

var codeStyleBeautify = {
  format: {
    indent: {
      style: '  '
    }
  },
  sourceMapWithCode: true
};

var codeStyleUgly = {
  format: {
    indent: {
      style: ''
    },
    compact: true
  },
  sourceMapWithCode: true
};


exports.generateCode = function(ast, optimized, sourceFile, cb) {
  if (optimized) {
    ast = esmangle.mangle(esmangle.optimize(ast));
  }

  var codeStyle = optimized ? codeStyleUgly : codeStyleBeautify;
  if (!cb && typeof sourceFile === 'function') {
    cb = sourceFile;
  } else {
    codeStyle.sourceMap = sourceFile;
  }

  cb(null, escodegen.generate(ast, codeStyle));
};

exports.concat = function(ast, options, cb) {

};
