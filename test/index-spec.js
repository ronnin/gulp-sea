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

  it('scripts as expected', function(done){
    var seajs = require('../');

    gulp.src('dist').pipe(clean({force:true}));

    gulp.src(['src/**/*.js'])
      .on('error', done)
      .pipe(seajs({ idleading: '$$' }))
      .pipe(gulp.dest('dist'))
      .on('data', function(file){
        should.exists(file);
        should.exists(file.path);
        should.exists(file.contents);

        var expectedFile = path.join(file.base, '../expected', file.relative);
        should(fs.readFileSync(expectedFile).toString('utf8')).eql(file.contents.toString('utf8'));
      })
      .pipe(clean({force: true}))
      .on('end', done)
    ;
  });
});


