var gulp = require('gulp');
var karma = require('karma').server;

var uglify = require('gulp-uglifyjs');
var bump = require('gulp-bump');
var rename = require("gulp-rename");


/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('bump', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('dist', function() {
  gulp.src(__dirname + '/src/*.js')
    .pipe(gulp.dest(__dirname + '/dist'))
    .pipe(uglify('ducker.min.js', {
      'outSourceMap': true
    }))
    .pipe(gulp.dest(__dirname + '/dist'));
});

gulp.task('build', ['bump', 'dist']);

gulp.task('default', ['tdd']);