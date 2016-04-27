(function () {
    'use strict';
    app.controller(
        'CustomController', [
            '$scope', '$timeout', '$TreeDnDConvert', 'DataDemo',
            function ($scope, $timeout, $TreeDnDConvert, DataDemo) {
                var tree;
                $scope.tree_data = {};
                $scope.tree_Opt = {};
                $scope.my_tree = tree = {};

                $scope.expandOn = {
                    displayName: 'Name',
                    field: 'title'
                };

                $scope.defs = [
                    {
                        displayName:  'Attribute',
                        cellTemplate: '<p>{{ nameAttr[node.def] }}</p>'
                    },
                    {
                        field: 'Init',
                        titleStyle:   {
                            'width': '30pt'
                        },
                        titleClass:   'text-center',
                        cellClass:    'v-middle text-center',
                        displayName:  'Init',
                        cellTemplate: '<input '
                                      + 'type="checkbox" '
                                      + 'ng-checked="!!node.init" '
                                      + 'ng-model="node.init" />'
                    }, {
                        displayName:  'Option',
                        cellTemplate: '<input ' +
                                      ' ng-if="node.type === \'checkbox\' || node.type === \'text\'" ' +
                                      ' type="{{ node.type }}" ' +
                                      ' ng-checked="!!node.value" ' +
                                      ' ng-model="node.value" ' +
                                      ' ng-click="node.init = false" />'
                    }, {
                        titleStyle:   {
                            'width': '30pt'
                        },
                        titleClass:   'text-center',
                        cellClass:    'v-middle text-center',
                        displayName:  'Scope',
                        cellTemplate: '<input '
                                      + '   type="checkbox" '
                                      + '     ng-checked="!!node.scope" '
                                      + '     ng-model="node.scope" '
                                      + '     ng-click="node.init = false" />'
                    }, {
                        displayName:  'Desciption',
                        cellTemplate: '<p compile-replace="node.defaultTmp"></p>'
                    }
                ];

                $scope.options = [
                    {
                        def:   'class',
                        title: 'Tree Class',
                        type:  'text',
                        init:  false,
                        value: 'table'
                    },
                    {
                        def:   'treeData',
                        title: 'Tree Data',
                        type:  'text',
                        init:  false,
                        value: 'tree_data'
                    },
                    {
                        def:   'treeControl',
                        title: 'Tree Control',
                        type:  'text',
                        init:  false,
                        value: 'my_tree'
                    },
                    {
                        def:        'primary',
                        title:      'Key Primary',
                        type:       'text',
                        init:       true,
                        defaultTmp: '<p>Auto generate with __uid___</p>',
                        value:      ''
                    },
                    {
                        def:        'columnDefs',
                        title:      'Defs Column',
                        type:       'text',
                        init:       false,
                        defaultTmp: '<p>Auto generate</p>',
                        value:      ''
                    },
                    {
                        def:   'expandOn',
                        title: 'Expand On',
                        type:  'text',
                        init:  false,
                        value: 'Name'
                    },
                    {
                        def:        'expandLevel',
                        title:      'Level Expand',
                        type:       'text',
                        init:       true,
                        defaultTmp: '<p>3</p>',
                        value:      3
                    },
                    {
                        def:   'callbacks',
                        title: 'Callbacks',
                        type:  'text',
                        init:  true,
                        value: ''
                    },
                    {
                        def:   'orderBy',
                        title: 'Order By',
                        type:  'text',
                        init:  true,
                        value: ''
                    },
                    {
                        def:          'filter',
                        title:        'Filter',
                        type:         'text',
                        init:         true,
                        value:        '',
                        __children__: [
                            {
                                def:        'filterOpt',
                                title:      'Filter Options',
                                type:       'text',
                                init:       true,
                                defaultTmp: '<p>3</p>',
                                value:      3
                            }
                        ]
                    },
                    {
                        def:          'drag',
                        title:        'Drag Enable',
                        type:         'checkbox',
                        init:         true,
                        value:        false,
                        __children__: [
                            {
                                def:   'delay',
                                title: 'Drag Delay',
                                type:  'checkbox',
                                init:  true,

                                defaultTmp: '<p>0</p>',
                                value:      false
                            },
                            {
                                def:   'collapse',
                                title: 'Drag Collapse',
                                type:  'checkbox',
                                init:  true,
                                value: ''
                            },
                            {
                                def:   'move',
                                title: 'Enable Move',
                                type:  'checkbox',
                                init:  true,
                                value: false
                            },
                            {
                                def:          'status',
                                title:        'Enable Status',
                                type:         'checkbox',
                                init:         true,
                                value:        false,
                                __children__: [

                                    {
                                        def:   'templateCopy',
                                        title: 'Template Copy',
                                        type:  'text',
                                        init:  true,
                                        value: ''
                                    },
                                    {
                                        def:   'templateMove',
                                        title: 'Template Move',
                                        type:  'text',
                                        init:  true,
                                        value: ''
                                    }
                                ]
                            },
                            {
                                def:   'hotkey',
                                title: 'Enable Hotkey',
                                type:  'checkbox',
                                init:  true,
                                value: false
                            }
                        ]
                    },

                    {
                        def:   'drop',
                        title: 'Enable Drop',
                        type:  'checkbox',
                        init:  true,
                        value: false
                    },

                    {
                        def:   'border',
                        title: 'Drag Border',
                        type:  'checkbox',
                        init:  true,

                        defaultTmp: '<p>30</p>',
                        value:      false
                    },
                    {
                        def:        'indent',
                        title:      'Indent',
                        type:       'text',
                        init:       true,
                        defaultTmp: '<p>30</p>',
                        value:      30
                    },
                    {
                        def:        'indentPlus',
                        title:      'Indent Plus',
                        type:       'text',
                        init:       true,
                        defaultTmp: '<p>20</p>',
                        value:      20
                    },
                    {
                        def:        'indentUnit',
                        title:      'Indent Unit',
                        type:       'text',
                        init:       true,
                        defaultTmp: '<p>px</p>',
                        value:      'px'
                    },
                    {
                        def: 'horizontal',
                        title: 'Horizontal',
                        type: 'checkbox',
                        init: true,
                        value: false
                    }
                ];

                $scope.data = {};

                var _convert = {
                        class:       'tree-class',
                        treeData:    'tree-data',
                        treeControl: 'tree-control',

                        primary: 'primary-key',

                        columnDefs: 'column-defs',

                        expandOn:    'expand-on',
                        expandLevel: 'expand-level',

                        callbacks: 'callbacks',
                        orderBy:   'order-by',

                        filter:    'filter',
                        filterOpt: 'filter-options',

                        drag:     'enable-drag',
                        delay:    'drag-delay',
                        move:     'enable-move',
                        collapse: 'enable-collapse',
                        status:   'enable-status',
                        hotkey:   'enable-hotkey',

                        drop: 'enable-drop',

                        border: 'drag-border',

                        indent:     'indent',
                        indentPlus: 'indent-plus',
                        indentUnit: 'indent-unit',

                        horizontal:   'horizontal',
                        templateCopy: 'template-copy',
                        templateMove: 'template-move'
                    },
                    _temp,
                    key,
                    i, len,
                    tab = '\n\t\t',
                    parent,
                    fnOptions = function (node) {
                        parent = $scope.tree_Opt.get_parent(node);
                        key = node.def;
                        if (key && angular.isDefined(node.value) && !node.init &&
                            (parent === null || !!parent.value === true)) {
                            $scope.data[key] = node.value;
                            _temp += [
                                tab,
                                (_convert[key] || key),
                                '="',
                                (node.scope) ? 'data.' + key : node.value,
                                '"'
                            ].join('');
                        }
                    },
                    reload = function (val) {
                        _temp = '<tree-dnd';
                        len = val.length;
                        for (i = 0; i < len; i++) {
                            if (angular.isFunction($scope.tree_Opt.for_all_descendants)) {
                                $scope.tree_Opt.for_all_descendants(val[i], fnOptions);
                            }
                        }
                        _temp += '\n></tree-dnd>';

                        $scope.generated = _temp;
                    };
                $scope.nameAttr = _convert;

                $scope.$watch(
                    'options', reload, true
                );

                $scope.expanding_property = {
                    /*template: "<td>OK All</td>",*/
                    field: 'Name',
                    titleClass:  'text-center',
                    cellClass:   'v-middle',
                    displayName: 'Name'
                };
                // DataDemo.getDatas() can see in 'Custom Option' -> Tab 'Data Demo'
                $scope.dataDemo = DataDemo.getDatas();
                $scope.col_defs = [
                    {
                        field: 'Description'
                    }, {
                        field: 'Description',
                        titleStyle:   {
                            'width': '80pt'
                        },
                        titleClass:   'text-center',
                        cellClass:    'v-middle text-center',
                        displayName:  'Description',
                        cellTemplate: '<i class="fa {{ !node.Description ? \'fa-times text-danger-lter\' : \'fa-check text-success\' }} text"></i>'
                    }, {
                        displayName:  'Function',
                        cellTemplate: '<button ng-click="tree.addFunction(node)" class="btn btn-default btn-sm">Added Controller!</button>'
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="tree.remove_node(node)" class="btn btn-default btn-sm">Remove</button>'
                    }];
                $scope.tree_data = $TreeDnDConvert.line2tree(angular.copy($scope.dataDemo), 'DemographicId', 'ParentId');
            }
        ]
    ).directive(
        'demoOtion', function () {
            return {
                restrict: 'E',
                template: ''
            };
        }
    ).directive(
        'optionTree', [
            '$compile', function ($compile) {
                return {
                    restrict: 'E',
                    scope:    true,
                    template: '' +
                              '   <button class="btn btn-sm btn-success" ng-click="loadData()">Reload with the new otpions is generated!</button>' +
                              '   <demo-option></demo-option>' +
                              '',
                    link:     function fnPost(scope, element, attrs) {
                        scope.with = '';
                        scope.$watch(
                            attrs.with, function (val) {
                                scope.with = val;
                            }, true
                        );

                        var _target;
                        scope.loadData = function () {
                            _target = angular.element(element[0].querySelector('demo-option'));

                            if (_target) {
                                _target.html('');
                                _target.append($compile(scope.with)(scope));
                            }
                        };
                    }
                };
            }]
    );
})
();
