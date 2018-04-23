'use strict';

module.exports = function (gulp, $, pkg, through, fs) {
    gulp.task('release', function () {
        return $.sequence('js::concat', ['js::min-js', 'css::min-css'], ['js::jshint-dist'/*, 'dev::test'*/])(function () {
            return gulp.src(
                [
                    'dist/**/*'
                ]
            ).pipe(gulp.dest(pkg.version));
        });
    });

    gulp.task('build', function (e) {
        $.sequence('js::concat', ['js::min-js', 'css::min-css'], ['js::jshint-dist'/*, 'dev::test'*/], 'doc')(e);
    });

    gulp.task('clean', function () {
        return gulp.src('dist', {read: false})
            .pipe($.clean());
    });


    gulp.task('watch', ['build'], function () {
        return gulp.watch(
            [
                'src/**/*.js',
                'src/**/*.scss',
                'src/**/*.css'
            ], ['build']
        );
    });

    gulp.task('doc', function (cb) {
        var config = require('./../jsdoc.json');

        gulp.src(['./dist/ng-tree-dnd.debug.js'], {read: false})
            .pipe($.jsdoc3(config, cb));
    });
};