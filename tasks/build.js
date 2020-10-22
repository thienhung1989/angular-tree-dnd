'use strict';

module.exports = function (gulp, $, pkg) {
    gulp.task('doc', async (cb) => {
        var config = require('./../jsdoc.json');

        gulp.src(['./dist/ng-tree-dnd.debug.js'], {
            read: false,
            allowEmpty: true,
        })
            .pipe($.jsdoc3(config, cb));
    });

    gulp.task('release', async () => {
        return gulp.series('js::concat', gulp.parallel('js::min-js', 'css::min-css'), gulp.parallel('js::jshint-dist'/*, 'dev::test'*/))(function () {
            return gulp.src([
                'dist/**/*'
            ], {
                allowEmpty: true,
            })
                .pipe(gulp.dest(pkg.version));
        })
    });

    gulp.task('clean', async () => {
        return gulp.src('dist', {
            allowEmpty: true,
        })
            .pipe($.clean());
    });

    gulp.task('build', gulp.series('js::concat', gulp.parallel('js::min-js', 'css::min-css'), gulp.parallel('js::jshint-dist'/*, 'dev::test'*/), 'doc'));

    gulp.task('watch', gulp.series('build', async () => {
        return gulp.watch([
                'src/**/*.js',
                'src/**/*.scss',
                'src/**/*.css'
            ]
        );
    }));
};