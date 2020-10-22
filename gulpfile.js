'use strict';

var gulp       = require('gulp'),
    requireDir = require('require-dir'),
    $          = require('gulp-load-plugins')(),
    pkg        = require('./package.json'),
    through    = require('through2'),
    fs = require('fs');

// Load application tasks
(
    function () {
        var dir = requireDir('./tasks');

        Object.keys(dir).forEach(
            function (key) {
                dir[key] = dir[key](gulp, $, pkg, through, fs);
            }
        );
    }()
);