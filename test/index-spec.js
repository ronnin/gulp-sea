var fs = require('fs');
var path = require('path');
var async = require('async');
var should = require('should');
var gulp = require('gulp');
var clean = require('gulp-clean');

describe('gulp-seajs transforms ', function(){
  before(function(){
    process.chdir(path.join(__dirname, 'seajs_demo'));
  });

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

  it('scripts as expected', function(done){
    var seajs = require('../');

    gulp.src('build').pipe(clean({force:true}));

    gulp.src(['src/**/*.js'])
      .on('error', done)
      .pipe(seajs({ alias: alias, idleading: '$$' }))
      .pipe(gulp.dest('build'))
      .on('data', function(file){
        should.exists(file);
        should.exists(file.path);
        should.exists(file.contents);

        var basename = path.basename(file.path);
        var expectedFile = path.join(file.path, '../../expected', basename);
        should(fs.readFileSync(expectedFile).toString('utf8')).eql(file.contents.toString('utf8'));
      })
      .pipe(clean({force: true}))
      .on('end', done)
    ;
  });
});


