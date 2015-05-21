'use strict';

module.exports = function (gulp, $) {

    gulp.task(
        'connect', [
            'clean:demo',
            'scripts:setup',
            'styles'
        ], function () {
            var livereloadPort = 35729;

            $.connect.server(
                {
                    port:       9000,
                    livereload: {
                        port: livereloadPort
                    },
                    root:       'demo',
                    middleware: function (connect) {
                        function mountFolder(connect, dir) {
                            return connect.static(require('path').resolve(dir));
                        }

                        return [
                            require('connect-livereload')({port: livereloadPort}),
                            mountFolder(connect, 'src'),
                            mountFolder(connect, 'dist'),
                            mountFolder(connect, 'bower_components'),
                            mountFolder(connect, 'demo')
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
                    'src/**/*.js',
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
                ], ['jshint', 'jscs']
            );

            gulp.watch(
                [
                    'src/**/*.scss'
                ], ['styles']
            );

            gulp.watch(
                [
                    'demo/**/*.scss'
                ], ['styles:demo']
            );
        }
    );

    gulp.task(
        'open', ['connect'], function () {
            require('open')('http://localhost:9000');
        }
    );

};