'use strict';

module.exports = function (gulp, $) {

    gulp.task('css::min-css', async () => {
        return gulp.src('src/*.css', {
            allowEmpty: true,
        })
            .pipe($.concat('ng-tree-dnd.css'))
            .pipe($.autoprefixer({
                cascade: false
            }))
            .pipe(gulp.dest('dist'))
            .pipe($.cleanCss({compatibility: 'ie8'}))
            .pipe($.rename('ng-tree-dnd.min.css'))
            .pipe(gulp.dest('dist'));
    });
};
