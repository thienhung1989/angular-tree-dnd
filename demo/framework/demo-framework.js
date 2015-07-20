var app, deps;

deps = ['ntt.TreeDnD', 'ngRoute'];

app = angular.module('TreeDnDTest', deps)
    .config(
    [
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when(
                '/basic', {
                    templateUrl: 'basic/basic-frame.html',
                    controller:  'BasicController'
                }
            )
                .when(
                '/filter', {
                    templateUrl: 'filter/filter-frame.html',
                    controller:  'FilterController'
                }
            )
                .when(
                '/list', {
                    templateUrl: 'list/list-frame.html',
                    controller:  'ListController'
                }
            )
                .when(
                '/multi', {
                    templateUrl: 'multi/multi-frame.html',
                    controller:  'MultiController'
                }
            )
                .when(
                '/custom-options', {
                    templateUrl: 'custom/custom-frame.html',
                    controller:  'CustomController'
                }
            )
                .otherwise({redirectTo: '/basic'});
        }]
).
    directive(
    'navigation', function ($rootScope, $location) {
        return {
            template: '<li ng-repeat="option in options" ng-class="{active: isActive(option)}">' +
                      '    <a ng-href="{{option.href}}">{{option.label}}</a>' +
                      '</li>',
            link:     function (scope, element, attr) {
                scope.options = [
                    {
                        label: 'Basic',
                        href:  '#/basic'
                    },
                    {
                        label: 'Filter',
                        href:  '#/filter'
                    },
                    {
                        label: 'List Tree',
                        href:  '#/list'
                    },
                    {
                        label: 'Multi',
                        href:  '#/multi'
                    },
                    {

                        label: 'Custom Options',
                        href:  '#/custom-options'
                    },
                    {
                        label: 'Github',
                        href:  'https://github.com/thienhung1989/angular-tree-dnd'
                    }
                ];

                scope.isActive = function (option) {
                    return option.href.indexOf(scope.location) === 1;
                };

                $rootScope.$on(
                    '$locationChangeSuccess', function (event, next, current) {
                        scope.location = $location.path();
                    }
                );
            }
        };
    }
).directive(
    'panel', function () {
        return {
            restrict: 'E',
            scope:    true,
            replace:  true,
            template: '<div class="panel" ng-class="\'panel-\' + type">' +
                        '   <div ng-if="title && title.length > 0" class="panel-heading">' +
                        '       <h3 class="panel-title">{{ title }}</h3>' +
                        '   </div>' +
                        '   <div class="panel-body" ng-transclude></div>' +
                        '</div>',
            transclude: true,
            link:       function fnPost(scope, element, attrs) {
                scope.title = attrs.title || '';
                scope.type = attrs.type || 'info';
            }
        };
    }
).directive(
    'showCode', [
        '$compile', '$timeout', function ($compile, $timeout) {
            return {
                restrict: 'E',
                replace:  true,
                link:     function (scope, element, attr) {
                    var _temp =
                            [
                                '<pre class="line-numbers">',
                                '<code class="language-' + (attr.type || 'markup') + '">',
                                '{{ data }}',
                                '</code>',
                                '</pre>'].join('')
                        ;
                    scope.data = '';

                    scope.$watch(
                        attr.source, function (val) {
                            if (val) {
                                scope.data = val;
                                element.html('');
                                element.append($compile(_temp)(scope));
                                $timeout(Prism.highlightAll, 0);
                            }
                        }, true
                    );
                }
            };
        }]
).factory(
    'DataDemo', function () {
        return {
            getDatas: function () {
                return [
                    {
                        'DemographicId': 1,
                        'ParentId':      null,
                        'Name':          'United States of America',
                        'Description':   'United States of America',
                        'Area':          9826675,
                        'Population':    318212000,
                        'TimeZone':      'UTC -5 to -10'
                    }, {
                        'DemographicId': 2,
                        'ParentId':      1,
                        'Name':          'California',
                        'Description':   'The Tech State',
                        'Area':          423970,
                        'Population':    38340000,
                        'TimeZone':      'Pacific Time'
                    }, {
                        'DemographicId': 3,
                        'ParentId':      2,
                        'Name':          'San Francisco',
                        'Description':   'The happening city',
                        'Area':          231,
                        'Population':    837442,
                        'TimeZone':      'PST'
                    }, {
                        'DemographicId': 4,
                        'ParentId':      2,
                        'Name':          'Los Angeles',
                        'Description':   'Disco city',
                        'Area':          503,
                        'Population':    3904657,
                        'TimeZone':      'PST'
                    }, {
                        'DemographicId': 5,
                        'ParentId':      1,
                        'Name':          'Illinois',
                        'Description':   'Not so cool',
                        'Area':          57914,
                        'Population':    12882135,
                        'TimeZone':      'Central Time Zone'
                    }, {
                        'DemographicId': 6,
                        'ParentId':      5,
                        'Name':          'Chicago',
                        'Description':   'Financial City',
                        'Area':          234,
                        'Population':    2695598,
                        'TimeZone':      'CST'
                    }, {
                        'DemographicId': 7,
                        'ParentId':      1,
                        'Name':          'Texas',
                        'Description':   'Rances, Oil & Gas',
                        'Area':          268581,
                        'Population':    26448193,
                        'TimeZone':      'Mountain'
                    }, {
                        'DemographicId': 8,
                        'ParentId':      1,
                        'Name':          'New York',
                        'Description':   'The largest diverse city',
                        'Area':          141300,
                        'Population':    19651127,
                        'TimeZone':      'Eastern Time Zone'
                    }, {
                        'DemographicId': 14,
                        'ParentId':      8,
                        'Name':          'Manhattan',
                        'Description':   'Time Square is the place',
                        'Area':          269.403,
                        'Population':    0,
                        'TimeZone':      'EST'
                    }, {
                        'DemographicId': 15,
                        'ParentId':      14,
                        'Name':          'Manhattan City',
                        'Description':   'Manhattan island',
                        'Area':          33.77,
                        'Population':    0,
                        'TimeZone':      'EST'
                    }, {
                        'DemographicId': 16,
                        'ParentId':      14,
                        'Name':          'Time Square',
                        'Description':   'Time Square for new year',
                        'Area':          269.40,
                        'Population':    0,
                        'TimeZone':      'EST'
                    }, {
                        'DemographicId': 17,
                        'ParentId':      8,
                        'Name':          'Niagra water fall',
                        'Description':   'Close to Canada',
                        'Area':          65.7,
                        'Population':    0,
                        'TimeZone':      'EST'
                    }, {
                        'DemographicId': 18,
                        'ParentId':      8,
                        'Name':          'Long Island',
                        'Description':   'Harbour to Atlantic',
                        'Area':          362.9,
                        'Population':    0,
                        'TimeZone':      'EST'
                    }, {
                        'DemographicId': 51,
                        'ParentId':      1,
                        'Name':          'All_Other',
                        'Description':   'All_Other demographics',
                        'Area':          0,
                        'Population':    0,
                        'TimeZone':      0
                    }, {
                        'DemographicId': 201,
                        'ParentId':      null,
                        'Name':          'India',
                        'Description':   'Hydrabad tech city',
                        'Area':          9826675,
                        'Population':    318212000,
                        'TimeZone':      'IST'
                    }, {
                        'DemographicId': 301,
                        'ParentId':      null,
                        'Name':          'Bangladesh',
                        'Description':   'Country of love',
                        'Area':          9826675,
                        'Population':    318212000,
                        'TimeZone':      'BST'
                    }];
            },
            getBigData: function (sample, number, deptMax, fn, keyId, keyParent) {

                function forDept(obj, fn, opt, deptParent) {
                    'use strict';
                    var childs = [], data, width;

                    if (angular.isFunction(fn)) {
                        width = getRandomInt(2, 6);
                        for (var i = 1; i < width && opt.amount <= opt.limit; i++) {
                            opt.amount++;
                            data = fn(obj, angular.copy(obj), opt);

                            // random children
                            if (deptParent < opt.deptMax && getRandomInt(-2, 2) > 0) {
                                forDept(data, fn, opt, ++deptParent);
                            }

                            childs.push(data);
                        }
                    }

                    obj.__children__ = childs;
                    return obj;
                }

                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min)) + min;
                }

                console.time('Generate_BigData');
                var data       = [], opt = {
                        amount:  0,
                        deptMax: deptMax,
                        limit:   number
                    }, patern,
                    fnGenerate = fn || function (parent, cloned, _opt) {
                            'use strict';
                            var keyO = Object.keys(cloned),
                                lenO = keyO.length;
                            if (keyParent) {
                                cloned[keyParent] = parent && parent[keyId] || null;
                            }

                            cloned[keyId] = _opt.amount;

                            for (var i = 0; i < lenO; i++) {
                                if (keyO[i] !== keyParent && keyO[i] !== keyId) {
                                    cloned[keyO[i]] += '#' + _opt.amount;
                                }
                            }

                            return cloned;
                        };


                while (opt.amount < number) {
                    opt.amount++;
                    patern = fnGenerate(null, angular.copy(sample), opt);
                    data.push(forDept(patern, fnGenerate, opt, 1));
                }

                console.timeEnd('Generate_BigData');
                return data;
            }
        }
    }
);