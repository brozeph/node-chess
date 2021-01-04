import babel from 'gulp-babel';
import del from 'gulp-clean';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';

function build () {
  return gulp
    .src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function clean () {
  return gulp
    .src(['dist', 'reports'], { allowEmpty: true, read: false })
    .pipe(del());
}

function lint () {
  return gulp
    .src(['gulpfile.babel.js', 'src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

exports.build = build;
exports.clean = clean;
exports.default = gulp.series(clean, lint, build);
exports.lint = lint;