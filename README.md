gulp-seajs
=========

A [SeaJs](https://seajs.org) plugin for Gulp

>   It's experimental project, which only supports javascripts temporarily.

[![Build Status](https://travis-ci.org/ronnin/gulp-seajs.png?branch=master)](https://travis-ci.org/ronnin/gulp-seajs)

## Install

```
npm install gulp-seajs
```

## Usage
```javascript
var seajs = require('gulp-seajs');

gulp.task('seajs', function () {
  gulp.src('src/**/*.js')
      .pipe(seajs({
        mode: 2,
        alias: {
          '$': 'jquery/jquery/1.9.1/jquery',
          '_': 'lodash/lodash/2.1.0/lodash'
        }
        idleading: 'http://www.mysite.com'
      }))
      .pipe(gulp.dest('dist'));

});
```

## Options

+ mode

    if 1, just code in debug style;

    if 2, just code in minified & obufuscated style;

    if 0, both. which is default.

+ alias

    module alias.

+ pkgAliasEnabled

    if true, merge **spm.alias** from ./package.json into options.alias. default true.

+ idleading

    used for id-non-specified module, generate id by idleading+file.relative(no file extname)

+ id

    function or instant value for transforming module id.

+ dependencies:

    function or instant value for transforming dependencies.

    if function, will called with an argument Array(String), aka, alias.

    if not provided, transformed by alias

+ require

    function or instant value for transforming **require('')**.

    if function, will called with an argument String, aka, an alias of module required.

    if not provided, transformed by alias

+ async

    function or instant value for transforming **require.async()**

    if function, will called with an argument String, aka, an alias of module required.

    if not provided, transformed by alias

## Error handling

By default, a gulp task will fail and all streams will halt when an error happens. To change this behavior check out the error handling documentation [here](https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md)

## License

(MIT License)

Copyright (c) 2014 ronnin@outlook.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
