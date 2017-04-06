var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('script', function() {
	gulp.src(['app.js', 'alloy_finger.js'])
	.pipe(uglify())
	.pipe(gulp.dest('dist/'))
})

