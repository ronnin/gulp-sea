var fs = require('fs');
var path = require('path');
var async = require('async');
var should = require('should');
var script = require('../lib/script');

function logJson (json, file) {
  fs.writeFile(file, JSON.stringify(json, null, 2));
}

describe('job on scripts', function () {

  describe('extracts', function(){
    function logExtraction(file, data) {
      var fileNameBase = file.substr(0, file.length - path.extname(file).length);
      logJson(data.defines, fileNameBase + '-defines.json');
      logJson(data.ast, fileNameBase + '-ast.json');
    }

    function testExtraction(file, callback) {
      async.waterfall([
        function (cb) {
          fs.readFile(file, cb);
        },
        script.extract
      ], callback);
    }

    function assertDataValid(data) {
      should(data).have.properties('defines', 'ast');
    }

    function assertDefineValid(def) {
      should(def).have.properties('id', 'dependencies', 'factory', 'node', 'idNode', 'dependencyNode', 'requireNodes', 'asyncNodes');
    }

    it('1 "define" from seajs_demo/src/x.js', function (done) {
      var testFile = path.join(__dirname, 'seajs_demo/src/x.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        //logExtraction(testFile, data);

        assertDataValid(data);

        should(data.defines).be.an.Array.and.have.length(1);
        var def = data.defines[0];
        assertDefineValid(def);
        should.not.exist(def.id);
        should.not.exist(def.idNode);

        should(def.node).be.an.Object.and.not.be.empty;
        should(def.node.arguments).be.an.Array.and.have.length(1);
        should(def.factory).exactly(def.node.arguments[0]);


        should(def.dependencies).be.an.Array.and.eql([ 'jquery', /*'xa', 'xb', 'xc', 'xd', 'xe', 'xf', */'lodash']);

        should.not.exist(def.dependencyNode);
        should(def.requireNodes).be.an.Array.and.have.length(2);
        should(def.asyncNodes).be.an.Array.and.have.length(4);

        done();
      });
    });

    it('1 "define" from seajs_demo/src/ya.js', function (done) {
      var testFile = path.join(__dirname, 'seajs_demo/src/ya.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        assertDataValid(data);
        //logExtraction(testFile, data);

        should(data.defines).be.an.Array.and.have.length(1);
        var def = data.defines[0];
        assertDefineValid(def);
        should.not.exist(def.id);
        should.not.exist(def.idNode);

        should(def.node).be.an.Object.and.not.be.empty;
        should(def.node.arguments).be.an.Array.and.have.length(2);
        should(def.factory).exactly(def.node.arguments[1]);

        should(def.dependencies).be.an.Array.and.eql(['jquery', './x', 'lodash']);

        should.exist(def.dependencyNode);
        should(def.requireNodes).be.an.Array.and.have.length(2);
        should(def.asyncNodes).be.an.Array.and.be.empty;

        done();
      });
    });

    it('1 "define" from seajs_demo/src/yb.js', function (done) {
      var testFile = path.join(__dirname, 'seajs_demo/src/yb.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        assertDataValid(data);
        //logExtraction(testFile, data);

        should(data.defines).be.an.Array.and.have.length(1);
        var def = data.defines[0];
        assertDefineValid(def);
        should(def.id).eql('yb');
        should.exist(def.idNode);

        should(def.node).be.an.Object.and.not.be.empty;
        should(def.node.arguments).be.an.Array.and.have.length(2);
        should(def.factory).exactly(def.node.arguments[1]);

        should(def.dependencies).be.an.Array.and.eql(['jquery', 'lodash']);
        should.not.exist(def.dependencyNode);
        should(def.requireNodes).be.an.Array.and.have.length(2);
        should(def.asyncNodes).be.an.Array.and.be.empty;

        done();
      });
    });

    it('1 "define" from seajs_demo/src/z.js', function (done) {
      var testFile = path.join(__dirname, 'seajs_demo/src/z.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        assertDataValid(data);
        //logExtraction(testFile, data);

        should(data.defines).be.an.Array.and.have.length(1);
        var def = data.defines[0];
        assertDefineValid(def);
        should(def.id).eql('z');
        should.exist(def.idNode);

        should(def.node).be.an.Object.and.not.be.empty;
        should(def.node.arguments).be.an.Array.and.have.length(3);
        should(def.factory).exactly(def.node.arguments[2]);

        should(def.dependencies).be.an.Array.and.eql(['jquery', './x' , 'lodash']);
        should.exist(def.dependencyNode);
        should(def.requireNodes).be.an.Array.and.have.length(2);
        should(def.asyncNodes).be.an.Array.and.be.empty;

        done();
      });
    });

    it('1 "define" from seajs_demo/src/lib/sub.js', function (done) {
      var testFile = path.join(__dirname, 'seajs_demo/src/lib/sub.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        assertDataValid(data);
        //logExtraction(testFile, data);

        should(data.defines).be.an.Array.and.have.length(1);
        var def = data.defines[0];
        assertDefineValid(def);
        should.not.exists(def.id);
        should.not.exists(def.idNode);

        should(def.node).be.an.Object.and.not.be.empty;
        should(def.node.arguments).be.an.Array.and.have.length(1);
        should(def.factory).exactly(def.node.arguments[0]);

        should(def.dependencies).be.an.Array.and.eql(['xa', 'lodash']);
        should.not.exist(def.dependencyNode);
        should(def.requireNodes).be.an.Array.and.have.length(2);
        should(def.asyncNodes).be.an.Array.and.be.empty;

        done();
      });
    });

    it('6 "define"s from seajs_demo/sea-modules/demo/mmodule/0.0.1/mmodule.js', function (done) {
      var expectedIds = [
        'demo/mmodule/0.0.1/a',
        'demo/mmodule/0.0.1/b',
        'gal/inject/0.0.1/inject',
        'x/y/0.0.1/z',
        'demo/mmodule/0.0.1/e',
        'demo/mmodule/0.0.1/f'
      ];

      var dependencyCount = [0, 1, 1, 0, 0, 0];

      var testFile = path.join(__dirname, 'seajs_demo/sea-modules/demo/mmodule/0.0.1/mmodule.js');
      testExtraction(testFile, function (err, data) {
        should.not.exist(err);

        assertDataValid(data);
        //logExtraction(testFile, data);

        should(data.defines).be.an.Array.and.have.length(expectedIds.length);
        data.defines.forEach(function(def, index){
          assertDefineValid(def);

          should(data.defines[index].id).eql(expectedIds[index]);
          should.exist(data.defines[index].idNode);

          should(def.node).be.an.Object.and.not.be.empty;
          should(def.node.arguments).be.an.Array.and.have.length(2);
          should(def.factory).exactly(def.node.arguments[1]);

          should(def.dependencies).is.Array.and.have.length(dependencyCount[index]);
          should.not.exist(def.dependencyNode);
          should(def.requireNodes).is.Array.and.have.length(dependencyCount[index]);
          should(def.asyncNodes).be.an.Array.and.be.empty;
        });

        done();
      });
    });
  });

  describe('transforms', function() {
    var alias = {
      jquery: 'jquery/jquery/1.9.1/jquery',
      lodash: 'lodash/lodash/2.1.0/lodash',
      xa: 'demo/demo/0.0.1/xa',
      'xa-debug': 'demo/demo/0.0.1/xa-debug',
      xb: 'demo/demo/0.0.1/xb',
      'xb-debug': 'demo/demo/0.0.1/xb-debug',
      xc: 'demo/demo/0.0.1/xc',
      xd: 'demo/demo/0.0.1/xd',
      xe: 'demo/demo/0.0.1/xe',
      xf: 'demo/demo/0.0.1/xf'
    };

    function logTransform(baseName, debug) {
      return function(output, cb) {
        fs.writeFile(
          path.join(__dirname, 'seajs_demo/build', baseName + (debug ? '-debug.js' : '.js')),
          output.code || output
        );

        cb(null, output);
      }
    }

    var idLeading = '$$/';
    var srcBase = path.join(__dirname, 'seajs_demo/src');
    function testTransform(srcFile, expectedFile, debug, done) {
      var baseName = path.relative(srcBase, srcFile).replace(/\.js$/, '');

      async.waterfall([
        function(cb){
          fs.readFile(srcFile, cb);
        },
        script.extract,
        function(data, cb) {
          script.transform(data.defines, data.ast, {
            id: function(id){
              return id || (idLeading + baseName);
            },
            alias: alias,
            debug: debug
          }, cb);
        },
        function(ast, cb) {
          script.generateCode(ast, !debug, cb);
        }
        //, logTransform(baseName, debug)
      ],
      function(err, output) {
        should.not.exists(err);
        fs.readFile(expectedFile, function(err, expectedCode) {
          should.not.exists(err);

          should((output.code || output).toString()).eql(expectedCode.toString());
          done();
        });
      });
    }

    it('1 "define" at seajs_demo/src/x.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/src/x.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/x.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/x-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

    it('1 "define" at seajs_demo/src/ya.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/src/ya.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/ya.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/ya-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

    it('1 "define" at seajs_demo/src/yb.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/src/yb.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/yb.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/yb-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

    it('1 "define" at seajs_demo/src/z.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/src/z.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/z.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/z-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

    it('1 "define" at seajs_demo/src/lib/sub.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/src/lib/sub.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/lib/sub.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/lib/sub-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

    it('6 "define"s at seajs_demo/sea-modules/demo/mmodule/0.0.1/mmodule.js', function(done){
      var testFile = path.join(__dirname, 'seajs_demo/sea-modules/demo/mmodule/0.0.1/mmodule.js');
      var expected = path.join(__dirname, 'seajs_demo/expected/mmodule.js');
      var expectedDebug = path.join(__dirname, 'seajs_demo/expected/mmodule-debug.js');

      async.each([false, true], function(debug, cb){
        testTransform(testFile, debug ? expectedDebug : expected , debug, cb);
      }, done);
    });

  });


});
