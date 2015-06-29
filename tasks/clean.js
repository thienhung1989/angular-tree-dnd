'use strict';

module.exports = function (gulp, $) {
  gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
      .pipe($.clean());
  });

  gulp.task('clean:vendor', function () {
    return gulp.src('demo/framework/vendor', { read: false })
      .pipe($.clean());
  });
};
