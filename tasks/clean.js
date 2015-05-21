'use strict';

module.exports = function (gulp, $) {
  gulp.task('clean', function () {
    return gulp.src('dist', { read: false })
      .pipe($.clean());
  });

  gulp.task('clean:demo', function () {
    return gulp.src('demo/src', { read: false })
      .pipe($.clean());
  });
};
