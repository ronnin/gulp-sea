var fs = require('fs');
var path = require('path');
var async = require('async');
var should = require('should');
var gulp = require('gulp');

describe('gulp-seajs', function(){
  before(function(){
    process.chdir(path.join(__dirname, 'seajs_demo'));
  });

  it('should be ok', function(done){
    var plugin = require('../');
    gulp.src('src/**/*.js')
      .on('error', done)
      .on('end', done)
      .pipe(plugin({
        a: 1,
        b: 2
      }));

  });
});


