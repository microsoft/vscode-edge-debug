const gulp = require('gulp');
const path = require('path');
const ts = require('gulp-typescript');
const log = require('gulp-util').log;
const typescript = require('typescript');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-mocha');
const tslint = require('gulp-tslint');

var sources = [
    'src',
    'test',
    'typings/main'
].map(function(tsFolder) { return tsFolder + '/**/*.ts'; });

var projectConfig = {
    noImplicitAny: false,
    target: 'ES6',
    module: 'commonjs',
    declaration: true,
    typescript: typescript,
    moduleResolution: "node"
};

gulp.task('build', function () {
	return gulp.src(sources, { base: '.' })
         .pipe(sourcemaps.init())
         .pipe(ts(projectConfig)).js
         .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: 'file:///' + __dirname }))
         .pipe(gulp.dest('out'));
});

gulp.task('watch', ['build'], function(cb) {
    log('Watching build sources...');
    return gulp.watch(sources, ['build']);
});

gulp.task('default', ['build']);

gulp.task('tslint', function() {
    return gulp.src(lintSources, { base: '.' })
         .pipe(tslint())
         .pipe(tslint.report('verbose'));
});

function test() {
    return gulp.src('out/test/**/*.test.js', { read: false })
        .pipe(mocha({ ui: 'tdd' }))
        .on('error', function(e) {
            log(e ? e.toString() : 'error in test task!');
            this.emit('end');
        });
}

gulp.task('build-test', ['build'], test);
gulp.task('test', test);

gulp.task('watch-build-test', ['build', 'build-test'], function() {
    return gulp.watch(sources, ['build', 'build-test']);
});