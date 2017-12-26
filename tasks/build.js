'use strict';

module.exports = function (gulp, $, pkg) {
    gulp.task('release', function () {
        return $.sequence('js::concat', ['js::min-js', 'css::min-css'], ['js::jshint-dist'/*, 'dev::test'*/])(function () {
            return gulp.src(
                [
                    'dist/**/*'
                ]
            ).pipe(gulp.dest(pkg.version));
        })
    });

    gulp.task('build', $.sequence('js::concat', ['js::min-js', 'css::min-css'], ['js::jshint-dist'/*, 'dev::test'*/]));

    gulp.task('clean', function () {
        return gulp.src('dist', {read: false})
            .pipe($.clean());
    });


    gulp.task('watch', function () {
        return gulp.watch(
            [
                'src/**/*.js',
                'src/**/*.scss',
                'src/**/*.css'
            ], ['build']
        );
    });
};