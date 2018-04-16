/*eslint no-invalid-this: 0*/
import 'babel-polyfill';

const
	babel = require('gulp-babel'),
	del = require('del'),
	eslint = require('gulp-eslint'),
	gulp = require('gulp'),
	sourcemaps = require('gulp-sourcemaps');

module.exports = (() => {
	gulp.task('build', ['clean-build'], () => {
		return gulp
			.src('src/**/*.js')
			.pipe(sourcemaps.init())
			.pipe(babel({
				presets: ['es2015', 'stage-0']
			}))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest('dist'));
	});

	gulp.task('clean-build', () => del('dist'));

	gulp.task('clean-reports', () => del('reports'));

	gulp.task('coveralls', () => {
		return gulp
			.src('reports/lcov.info')
			.pipe(coveralls());
	});

	gulp.task('default', ['build', 'lint']);

	gulp.task('lint', () => {
		return gulp
			.src(['src/**/*.js', 'test/**/*.js', '!node_modules/**', '!reports/**'])
			.pipe(eslint())
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
	});
})();
