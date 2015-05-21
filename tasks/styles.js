'use strict';

module.exports = function (gulp, $) {

  gulp.task('styles', function () {
    return gulp.src('src/*.css')
      .pipe($.minifyCss({ compatibility: 'ie8' }))
      .pipe($.rename('ng-tree-dnd.min.css'))
      .pipe(gulp.dest('dist'));
  });

};
