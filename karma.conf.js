module.exports = function (config) {
    'use strict';

    var cfg = {
        bowerComponents: 'demo/framework/vendor'
    };

    config.set(
        {
            basePath:   './',
            frameworks: ['jasmine'],
            autoWatch:  false,
            browsers:   ['Chrome', 'Firefox', 'PhantomJS'],

            // files to load in the browser
            files:      [
                // components
                cfg.bowerComponents + '/angular/angular.js',
                cfg.bowerComponents + '/angular-mocks/angular-mocks.js',
                cfg.bowerComponents + '/angular-route/angular-route.js',
                cfg.bowerComponents + '/bootstrap-css/js/bootstrap.js',

                // source files
                'dist/**/*.js',
                'demo/**/*.js'
            ],

            plugins:               [
                'karma-phantomjs-launcher',
                'karma-jasmine'
            ],

            // generate js files from html templates to expose them during testing
            preprocessors:         {
                '**/*.html': 'ng-html2js'
            },

            // https://github.com/karma-runner/karma-ng-html2js-preprocessor#configuration
            ngHtml2JsPreprocessor: {
                // setting this option will create only a single module that contains templates
                // from all the files, so you can load them all with module('foo')
            },

            // files to exclude
            exclude:               [],

            // level of logging
            // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
            //    logLevel:     config.LOG_ERROR || config.LOG_WARN || config.LOG_DEBUG,

            port:      9876,
            reporters: 'dots',
            singleRun: true
        }
    );
};
