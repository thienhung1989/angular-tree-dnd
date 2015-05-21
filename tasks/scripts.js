'use strict';

module.exports = function (gulp, $, pkg, through) {

    var fnUglify, fnReplace;
    fnUglify = function () {
        return gulp.src('dist/ng-tree-dnd.js')
            .pipe(
            $.uglify(
                {
                    preserveComments: 'some'
                }
            )
        ).pipe($.replace(/\s*\*\s*@preserve/gi, ''))
            .pipe($.rename('ng-tree-dnd.min.js'))
            .pipe(gulp.dest('dist'));
    };
    fnReplace = function (stream, streamSrc, pattern, before, after) {
        return stream.pipe(
            through.obj(
                function (fileInput, enc, cb) {
                    if (fileInput.isStream()) {
                        return cb();
                    }

                    if (fileInput.isBuffer()) {
                        var replace = "";
                        if (before) {
                            replace += before + fileInput.contents;
                        } else {
                            replace += fileInput.contents;
                        }

                        if (after) {
                            replace += after;
                        }

                        streamSrc.pipe($.replace(pattern, function(match){
                            return replace;
                        }))
                            .pipe(
                            through.obj(
                                function (f, e, c) {

                                    if (f.isStream()) {
                                        return c();
                                    }

                                    if (f.isBuffer()) {
                                        fileInput.contents = f.contents;
                                        cb(null, fileInput);
                                    }
                                }
                            )
                        ).on('end', cb);
                    }
                }
            )
        );
    };

    gulp.task(
        'jshint', function () {
            return gulp.src(
                [
                    'src/**/*.js'
                ]
            )
                .pipe($.jshint())
                .pipe($.jshint.reporter('jshint-stylish'))
                .pipe($.jshint.reporter('fail'));
        }
    );

    gulp.task(
        'jshint-dist', function () {
            return gulp.src(
                [
                    'dist/**/*.js',
                    '!dist/**/*.min.js'
                ]
            )
                .pipe($.jshint())
                .pipe($.jshint.reporter('jshint-stylish'))
                .pipe($.jshint.reporter('fail'));
        }
    );

    gulp.task(
        'concat', function () {
            var streamInject = gulp.src(
                [
                    'src/**/*.js',
                    '!src/**/*.spec.js',
                    '!src/**/*.append.js',
                    '!src/main.js'
                ]
            )
                .pipe($.replace(/^\s*angular\.module\('ntt\.TreeDnD'\)\s*((.|\s)+\))[\s;]*/gm, '$1'))
                .pipe($.concat('ng-tree-dnd.js', {newLine: ''}));
            var streamMain = gulp.src(['src/main.js'])
                .pipe($.replace(/\/\/<!--Version-->/gi, pkg.version));

            var streamAppend = gulp.src(['src/**/*.append.js'])
                .pipe($.concat('ng-tree-dnd.js'))

            streamMain = fnReplace(
                streamAppend,
                streamMain,
                /;?\s*\/\/<!--Replace_Concat-->/gi,
                ';\/\/<!--Replace_Concat-->;\n\n'
            );

            return fnReplace(
                streamInject, streamMain,
                /;?\s*\/\/<!--Replace_Concat-->/gi
            ).pipe(gulp.dest('dist'))
        }
    );

    gulp.task(
        'uglify', ['concat'], fnUglify
    );

    gulp.task(
        'uglify-noconcat', fnUglify
    );

    gulp.task(
        'test', function () {
            return $.karma.server.start(
                {
                    configFile: __dirname + '/../karma.conf.js',
                    singleRun:  true
                }, function (err) {
                    process.exit(err ? 1 : 0);
                }
            );
        }
    );
}
;
