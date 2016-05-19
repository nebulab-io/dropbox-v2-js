const gulp = require('gulp'),
      jscs = require('gulp-jscs'),
      browserify = require('browserify'),
      deamdify = require('deamdify'),
      deglobalify = require('deglobalify'),
      source = require('vinyl-source-stream'),
      babelify = require('babelify'),
      es6ify = require('es6ify');

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