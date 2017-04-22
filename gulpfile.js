var gulp = require('gulp');
// var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');
// var gutil = require('gulp-util');
gulp.task('script', function() {
	gulp.src(['app.js'])
	.pipe(babel({presets: ['babili']}))
	// .pipe(gulp.dest('dist/'))
	// .pipe(uglify())
	.on('error', function(err) {
		console.error(err.toString());
	})
	.pipe(gulp.dest('dist/'))
});

gulp.task('sass', function() {
	return gulp.src('app.scss')
		.pipe(sass())
		.on('error', function(err) {
			console.error('Error!', err.message);
		})
		.pipe(gulp.dest('dist/'))
		.pipe(minifycss())
		.pipe(gulp.dest('dist/'))
})

gulp.task('auto', function() {
	gulp.watch(['app.js'], ['script']);
});

gulp.task('sass-watch', function() {
	gulp.watch('app.scss', ['sass'])
})

gulp.task('generate-sw', function(callback) {
	var path = require('path');
	var swPrecache = require('sw-precache');

	swPrecache.write(path.join('sw.js'), {
		staticFileGlobs: [
			'app.js',
			'dist/alloy_finger.js',
			'dist/app.css',
			'image/*.{png}'
		]
	}, callback)
})

gulp.task('default', ['script', ,'sass', 'auto'])