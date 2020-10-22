'use strict';

module.exports = function (gulp, $) {

    gulp.task('dev::connect', async () => {
        var livereloadPort = 35723;

        $.connect.server(
            {
                port: 9000,
                livereload: {
                    port: livereloadPort
                },
                root: './',
                middleware: function (connect) {
                    function mountFolder(connect, dir) {
                        return connect.static(require('path').resolve(dir));
                    }

                    return [
                        // mountFolder(connect, 'dist'),
                        // mountFolder(connect, 'demo'),
                        require('connect-livereload')({port: livereloadPort})
                    ];
                }
            }
        );
    });

    gulp.task('dev::open', async () => {
        require('open')('http://localhost:9000/demo');
    });

    gulp.task('dev::run', gulp.series('dev::connect', 'dev::open'));
};