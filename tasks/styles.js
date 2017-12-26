'use strict';

module.exports = function (gulp, $) {

    gulp.task('css::min-css', function () {
        return gulp.src('src/*.css')
            .pipe($.concat('ng-tree-dnd.css'))
            .pipe($.autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(gulp.dest('dist'))
            .pipe($.minifyCss({compatibility: 'ie8'}))
            .pipe($.rename('ng-tree-dnd.min.css'))
            .pipe(gulp.dest('dist'));
    });
};
