import del from 'gulp-clean';
import eslint from 'gulp-eslint';
import gulp from 'gulp';

function clean () {
  return gulp
    .src(['reports'], { allowEmpty: true, read: false })
    .pipe(del());
}

function lint () {
  return gulp
    .src(['gulpfile.js', 'src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

export {
  clean,
  lint
}

export default () => gulp.series(clean, lint);
