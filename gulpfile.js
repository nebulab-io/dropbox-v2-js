const gulp = require('gulp');
const jscs = require('gulp-jscs');
const babel = require('gulp-babel');

gulp.task('default', () => {
    
});

gulp.task('lint', () => {
  return gulp.src('src/app.js')
    .pipe(jscs({fix: true}))
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(gulp.dest('src'));
});

gulp.task('babel', () => {
  gulp.src('src/app.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }))
    .pipe(gulp.dest('dist'));
});