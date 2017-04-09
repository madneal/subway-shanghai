var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var minifycss = require('gulp-minify-css');

gulp.task('script', function() {
	gulp.src(['app.js', 'alloy_finger.js'])
	.pipe(uglify())
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

gulp.task('default', ['script', ,'sass', 'auto'])