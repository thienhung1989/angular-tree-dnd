'use strict';

module.exports = function (gulp, $) {

    gulp.task('dev::connect', [], function () {
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
                        // mountFolder(connect, 'dist'),
                        // mountFolder(connect, 'demo'),
                        require('connect-livereload')({port: livereloadPort})
                    ];
                }
            }
        );
    });

    gulp.task('dev::open', function () {
        require('open')('http://localhost:9000');
    });
    gulp.task('dev::run', ['dev::connect', 'dev::open']);
/*
    gulp.task('dev::test', function (cb) {
        return require('karma').server.start(
            {
                configFile: __dirname + '/../karma.conf.js',
                singleRun:  true,
                autoWatch:  true
            }, function (exitCode) {
                $.util.log('Karma has exited with ' + exitCode);
                cb();
            }
        );
    });
*/
};