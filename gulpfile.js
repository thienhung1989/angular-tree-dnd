'use strict';

var gulp       = require('gulp'),
    requireDir = require('require-dir'),
    $          = require('gulp-load-plugins')(),
    pkg        = require('./package.json'),
    through    = require('through2');

    // Load application tasks
(
    function () {
        var dir = requireDir('./tasks');

        Object.keys(dir).forEach(
            function (key) {
                dir[key] = dir[key](gulp, $, pkg, through);
            }
        );
    }()
);

// $.karma = require('karma');

gulp.task(
    'build', ['min-css', 'jshint', 'min-js'], function () {
        return gulp.start('jshint-dist', 'test');
    }
);

gulp.task(
    'run-server', function () {
        return gulp.start('connect', 'watch', 'open');
    }
);
