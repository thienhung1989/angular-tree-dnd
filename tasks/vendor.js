'use strict';

module.exports = function (gulp, $) {
    var filter = {
            view:                '**/*.twig',
            sass:                ['**/*{.scss,.sass}'],
            vendor:              ['**/@(*{.js,.css,.swf,.eot,.png,.svg,.ttf,.woff,.woff2,.less})'],
            // ext:                 '@(!(protractor*|server*|Gruntfile|example|examples|test|tests|karma*|package|index|*spec|*Spec|npm|grunt){.map,.png,.js,.swf,.css,.eot,.svg,.ttf,.woff,.woff2}|jsencrypt.js|Blob.js|sha.js|sha1.js|sha256.js|sha512.js|angular-debounce.js)',
            ext:                 '@(!(protractor*|server*|Gruntfile|example|examples|test|tests|karma*|package|index|*spec|*Spec|npm|grunt).min{.js,.css}|*{.map,.swf,.eot,.png,.svg,.ttf,.woff,.woff2,.less}|jsencrypt.js|Blob.js|sha.js|sha1.js|sha256.js|sha512.js|angular-debounce.js)',
            regexReplacePath:    [/[\/]+(release|bin|src|lib|dist|min|build|media|less)[\/]*$/gi, '$2'],
            regexReplaceObsPath: /\//
        },
        path   = {
            component: {
                vendor: [
                    {
                        src: './bower_components/@(angular|angularjs-toaster)/' + filter.ext,
                        dst: undefined
                    },
                    {
                        src: './bower_components/@(angular)@(-animate|-bootstrap|-route)/' + filter.ext,
                        dst: undefined
                    },
                    {
                        src: './bower_components/@(bootstrap-css)/**/' + filter.ext,
                        dst: undefined
                    }
                ]
            },
            build:     {
                base:   './demo/libs',
                vendor: 'vendor'
            }
        };

    var getOpt   = function (opts, type) {
            switch (typeof opts) {
                case 'string':
                    return opts;
                case 'object':
                    return opts[type];
            }
        },
        makePath = function () {
            var i      = 0,
                len    = arguments.length || 0,
                result = '.',
                path;

            for (i; i < len; i++) {
                path = arguments[i] || '';
                result += '/' + path.replace(/\/+$/, '')
            }

            return result
                .replace(/\/+/, '/')
                .replace(/(\/?)(\.\/)+/, '$1./')
                .replace(/\/.\//, '/');
        };

    var fnCopy = function (src, dst, opts) {
        dst      = dst || '';
        var base = getOpt(opts, 'base');

        if (Array.isArray(src)) {
            for (var i = 0; i < src.length; i++) {
                fnCopy(src[i], dst, base);
            }
            return; // jmp out
        }


        if (typeof opts !== 'object') {
            opts = {
                clearPath: true,
                filter:    '**'
            };
        }

        var _src = '';
        switch (typeof src) {
            case 'function':
                _src = src() || '';
                break;
            case 'object':
                _src = src.src;
                dst  = makePath(src.dst, dst);
        }

        dst = dst.replace(/\/+$/, '') + '/';

        return gulp.src(_src, {base: base})
            .pipe($.filter(opts.filter || '**'))
            .pipe($.rename(function (path) {
                console.log(path);
                if (opts.clearPath) {
                    path.dirname = (path.dirname || '').replace(filter.regexReplacePath[0], filter.regexReplacePath[1]);
                }
            }))
            .pipe($.changed(dst))
            .pipe(gulp.dest(dst))
    };

    const tasks = [
        {
            name: 'dev::vendor',
            src:  path.component.vendor,
            dst:  makePath(path.build.base, path.build.vendor),
            opts: {
                clearPath: true,
                filter:    filter.vendor
            },
            do:   fnCopy
        },
    ];

    for (var i = 0; i < tasks.length; i++) {
        (function (task) {
            // wrapper
            gulp.task(task.name, function () {
                return task.do(task.src, task.dst, task.opts);
            });
        })(tasks[i]);
    }
};
