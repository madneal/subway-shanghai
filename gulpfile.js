var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('script', function() {
	gulp.src(['app.js', 'alloy_finger.js'])
	.pipe(uglify())
	.pipe(gulp.dest('dist/'))
});

gulp.task('auto', function() {
	gulp.watch('app.js', ['script']);
});

gulp.task('default', ['script', 'auto'])