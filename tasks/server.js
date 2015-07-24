'use strict';

module.exports = function (gulp, $) {

    gulp.task(
        'connect', [], function () {
            var livereloadPort = 35723;

            $.connect.server(
                {
                    port:       9000,
                    livereload: {
                        port: livereloadPort
                    },
                    root:       './',
                    middleware: function (connect) {
                        function mountFolder(connect, dir) {
                            return connect.static(require('path').resolve(dir));
                        }

                        return [
                            mountFolder(connect, 'dist'),
                            mountFolder(connect, 'demo'),
                            require('connect-livereload')({port: livereloadPort})
                        ];
                    }
                }
            );
        }
    );

    gulp.task(
        'watch', ['connect'], function () {
            gulp.watch(
                [
                    '.jshintrc',
                    'dist/**/*.js',
                    'dist/**/*.css',
                    'demo/**/*.js',
                    'demo/**/*.css',
                    'demo/**/*.html'
                ], function (event) {
                    return gulp.src(event.path)
                        .pipe($.connect.reload());
                }
            );

            gulp.watch(
                [
                    '.jshintrc',
                    'src/**/*.js'
                ], ['jshint']
            );

            gulp.watch(
                [
                    'src/**/*.scss',
                    'src/**/*.css'
                ], ['styles']
            );
        }
    );

    gulp.task(
        'open', ['connect'], function () {
            require('open')('http://localhost:9000');
        }
    );

};