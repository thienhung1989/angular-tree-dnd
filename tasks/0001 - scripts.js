'use strict';

let log = require('fancy-log');

module.exports = function (gulp, $, pkg, through, fs) {
    gulp.task('js::jshint', async () => {
            return gulp.src([
                'src/**/*.js'
            ], {
                allowEmpty: true,
            })
                .pipe($.jshint())
                .pipe($.jshint.reporter('jshint-stylish'))
                .pipe($.jshint.reporter('fail'));
        }
    );

    gulp.task('js::jshint-dist', async () => {
        return gulp.src([
            'dist/**/*.js',
            '!dist/**/*.min.js'
        ], {
            allowEmpty: true,
        })
            .pipe($.jshint('.jshintrc'))
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.jshint.reporter('fail'));
    });

    gulp.task('js::concat', async () => {
        return fs.readFile(__dirname + '/../LICENSE', function (err, data) {
            if (err) {
                throw err;
            }

            var copyright = data.toString();

            // copyright = copyright.replace('^', ' * ');

            // init files include
            var streamInject = gulp.src([
                'src/**/*.js',
                '!src/**/*.spec.js',
                '!src/**/*.append.js',
                '!src/main.js'
            ], {
                allowEmpty: true,
            })
                //.pipe($.replace(/^\s*angular\.module\('ntt\.TreeDnD'\)\s*((.|\s)+\))[\s;]*/gm, '$1'))
                .pipe($.concat('ng-tree-dnd.js', {newLine: '\n\n'}));

            // replace `version` by `version` of package.json in file `main.js`
            var streamMain = gulp.src(['src/main.js'], {
                    allowEmpty: true,
                })
                    .pipe($.replace(/\/\/<!--Version-->/gi, pkg.version))
                    .pipe($.replace(/\n?(\s*\*\s*)?\/\/<!--License-->/gi, function (str, seq) {
                        if (seq !== undefined) {
                            copyright = copyright.replace(/(^|\n)/g, "\n" + seq);
                        }

                        return copyright;
                    }));


            // join all file `*.append.js` to  file `ng-tree-dnd.js`
            var streamAppend = gulp.src(['src/**/*.append.js'], {
                allowEmpty: true,
            })
                .pipe($.concat('ng-tree-dnd.js'));

            // replace
            streamMain = fnReplace(
                streamAppend, // stream insert
                streamMain, // insert into stream
                /\s*\/\/<!--Replace_Concat-->/gi, // parent to insert stream
                '\/\/<!--Replace_Concat-->\n\n' // insert after place
            );

            var cloneSink = $.clone.sink();
            // return stream final concated
            return fnReplace(
                streamInject,
                streamMain,
                /\s*\/\/<!--Replace_Concat-->/gi
            )
                .pipe($.replace(/\s*\*\s*@preserve/gi, ''))
                .pipe($.concat('ng-tree-dnd.debug.js')) //<- rename file
                .pipe($.removeCode({nodebug: false})) // keep debug
                .pipe(cloneSink) //<- clone objects streaming through this point

                .pipe($.concat('ng-tree-dnd.js')) //<- restore file name
                .pipe($.removeCode({nodebug: true})) // clear all debug in file main.
                .pipe($.replace(/\$log.debug\([\]]*\);?\s*/gmi, ''))// remove all $log.debug();

                .pipe($.replace(/\s*\*\s*@preserve/gi, ''))
                .pipe(cloneSink.tap()) //<- output cloned objects + ng-tree-dnd.debug.js
                .pipe(gulp.dest('dist')); // move to dist
        });
    });

    gulp.task('js::min-js', async () => {
        return gulp.src('dist/ng-tree-dnd.js', {
            allowEmpty: true,
        })
            .pipe($.sourcemaps.init())
            .pipe(
                $.uglify(
                    {
                        // preserveComments: 'some'
                    }
                ).on('error', log)
            )
            .pipe($.replace(/\s*\*\s*@preserve/gi, ''))
            .pipe($.rename('ng-tree-dnd.min.js'))
            .pipe($.sourcemaps.write('/'))
            .pipe(gulp.dest('dist'));
    });

    function fnReplace(stream, streamSrc, pattern, before, after) {
        return stream.pipe(
            through.obj(
                function (fileInput, enc, cb) {
                    if (fileInput.isStream()) {
                        return cb();
                    }

                    if (fileInput.isBuffer()) {
                        var replace = '';
                        if (before) {
                            replace += before + fileInput.contents;
                        } else {
                            replace += fileInput.contents;
                        }

                        if (after) {
                            replace += after;
                        }

                        streamSrc
                            .pipe(
                                $.replace(
                                    pattern, function (/*match*/) {
                                        return replace;
                                    }
                                )
                            )
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
                            )
                            .on('end', cb);
                    }
                }
            )
        );
    }
};
