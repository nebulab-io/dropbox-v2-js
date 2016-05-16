const gulp = require('gulp');
const jscs = require('gulp-jscs');
const browserify = require('browserify');
const deamdify = require('deamdify');
const deglobalify = require('deglobalify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const es6ify = require('es6ify');

gulp.task('lint', () => {
  return gulp.src('src/*.js')
    .pipe(jscs({fix: true}))
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(gulp.dest('src'));
});

gulp.task('browserify', () => {
  var b = browserify({
    entries: [
      'index.js'
    ],
    debug: true,
    standalone: 'Dropbox'
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/'));
});