var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');
var esmangle = require('esmangle');
var async = require('async');

var astCallExp  = esprima.Syntax.CallExpression,
  astFuncExp    = esprima.Syntax.FunctionExpression,
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

function resolveDependencies(dependencies, alias) {
  return dependencies.map(function(dep){
    if (dep.charAt(0) !== '.') {
      if (dep in alias) {
        return alias[dep];
      }
    }
    return dep.replace(/\.js$/, '');
  });
}

function resolveModuleId(id, pkg) {
  /*if (typeof pkg !== 'object') return id;
   var f = pkg.family,
   n = pkg.name,
   v = pkg.version;*/


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
      case astLiteral: // define('id', function(require, exports, module){});
        def.id = arg0.value;
        def.idNode = arg0;
        break;
      case astArrayExp: // define(['dep1', 'dep2'], function(require, exports, module){});
        def.dependencies = arg0.elements.map(function(el){return el.value});
        def.dependencyNode = arg0;
        break;
    }
  } else if (argLen > 2) { // define('id', ['dep1', 'dep2'], function(require, exports, module){});
    arg0 = defineNode.arguments[0];
    arg1 = defineNode.arguments[1];
    if (arg0.type === astLiteral) {
      def.id = arg0.value;
      def.idNode = arg0;
    }
    if (arg1.type === astArrayExp) {
      def.dependencies = arg1.elements.map(function(el){return el.value});
      def.dependencyNode = arg0;
    }
  }

  return def;
}


/**
 * parse js script, and return the defines on success.
 * @param code: js script
 * @param cb: function(err, defines){}
 * defines: [
 *  {
 *     id: '',
 *     dependencies: [],
 *     factory: null,
 *     node: null,
 *     dependencyNode: null,
 *     requireNodes: []
 *  }
 * ]
 *
 */
exports.getDefines = function(code, cb){
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
  return function(preset) {
    return !fn ? preset :
      (typeof fn === 'function' ? fn(preset) : fn);
  }
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

exports.transform = function (defines, ast, options, cb) {
  var idFnc = makeTransformFunction(options.id),
      dependenciesFnc = makeTransformFunction(options.dependencies),
      requireFnc = makeTransformFunction(options.requires),
      asyncFnc = makeTransformFunction(options.async);

  defines.each(function(def){
    var defArgs = def.node.arguments;

    var id = idFnc(def.id);
    if (def.idNode) {
      if (id) {
        def.idNode.value = id;
      } else {
        defArgs.shift();
        def.idNode = null;
      }
    } else if (id) {
      def.idNode = translateToLiteralNode(id);
      defArgs.unshift(def.idNode);
    }

    var dependencies = def.dependencies.length ? translateToLiteralNodes(dependenciesFnc(def.dependencies)) : [];
    if (def.dependencyNode) {
      def.dependencyNode.elements = dependencies;
    } else {
      def.dependencyNode = {
        type: astArrayExp,
        elements: dependencies
      };
      def.node.arguments = insertIntoArray(defArgs, def.idNode ? 0 : 1, def.dependencyNode);
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

  cb(ast, function(){});
};

exports.mangle = function(ast, options, cb) {

};

exports.concat = function(ast, options, cb) {

};
