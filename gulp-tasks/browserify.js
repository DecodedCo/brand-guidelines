/**
 * Builds the various app bundles with Browserify. Additionally the 'NODE_FAIL' env var is used to
 * control whether the task should just beep the shell when a Browserify bundling error is
 * encountered (for development), or cause the process to exit with an error (for continuous
 * integration).
 */

var browserify = require('browserify');
var srcStream = require('vinyl-source-stream');
var partialify = require('partialify/custom');
var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge-stream');

function bundle (entrypoint, bundleFilename, outputDir) {

    var stream = browserify(entrypoint)
        .transform(partialify.alsoAllow('hbs'))
        .bundle();

    if (!process.env.NODE_FAIL) {
        stream.on('error', function (err) {
            gutil.log(gutil.colors.red(err.toString()));
            gutil.beep();
            this.emit('end');
        });
    }

    return stream
        .pipe(srcStream(bundleFilename))
        .pipe(gulp.dest(outputDir));
}

module.exports = function () {

    var mainApp = bundle(
        global.config.jsDir + '/main.js',
        'main.js',
        global.config.outputDir + '/js'
    );

    var nav = bundle(
        global.config.componentsDir + '/nav/nav.js',
        'nav.js',
        global.config.outputDir + '/js'
    );


    return merge(mainApp, nav);

};