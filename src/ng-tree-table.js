(function () {
    angular.module('template/treeTable/treeTable.html', []).run(
        [
            '$templateCache', function ($templateCache) {
            $templateCache.put(
                'template/treeTable/treeTable.html',
                "" + "<table ng-class=\"tree_class\">\n" + "	<thead>\n" + "	<tr>\n" + "		<th ng-class=\"expandingProperty.titleClass\" ng-style=\"expandingProperty.titleStyle\">\n" + "			{{expandingProperty.displayName || expandingProperty.field || expandingProperty}}\n" + "		</th>\n" + "		<th ng-repeat=\"col in colDefinitions\" ng-class=\"col.titleClass\" ng-style=\"col.titleStyle\">\n" + "			{{col.displayName || col.field}}\n" + "		</th>\n" + "	</tr>\n" + "	</thead>\n" + "	<tbody>\n" + "	<tr tree-table-node ng-repeat=\"row in tree_rows track by hashedTree(row) \" ng-show=\"row.__visible__\"\n" + "		ng-class=\"(row.__selected__ ? ' active':'')\" class=\"ng-animate \">\n" + "		<td ng-if=\"!expandingProperty.template\" tree-table-node-handle\n" + "			ng-style=\"expandingProperty.cellStyle ? expandingProperty.cellStyle : {'padding-left': $callbacks.calsIndent(row.__level__)}\"\n" + "			ng-click=\"user_clicks_branch(row)\" ng-class=\"expandingProperty.cellClass\"\n" + "			compile=\"expandingProperty.cellTemplate\">\n" + "				<a data-nodrag>\n" + "					<i ng-class=\"row.__tree_icon__\" ng-click=\"row.__expanded__ = !row.__expanded__\"\n" + "					   class=\"tree-icon\"></i>\n" + "				</a>\n" + "				{{row[expandingProperty.field] || row[expandingProperty]}}\n" + "		</td>\n" + "		<td ng-if=\"expandingProperty.template\" compile=\"expandingProperty.template\"></td>\n" + "		<td ng-repeat=\"col in colDefinitions\" ng-class=\"col.cellClass\" ng-style=\"col.cellStyle\"\n" + "			compile=\"col.cellTemplate\">\n" + "			{{row[col.field]}}\n" + "		</td>\n" + "	</tr>\n" + "	</tbody>\n" + "</table>"
            );
        }]
    );
    angular.module(
        'treeTable', [
            'template/treeTable/treeTable.html']
    ).directive(
        'compile', [
            '$compile', function ($compile) {
                return {
                    restrict: 'A',
                    link:     function (scope, element, attrs) {
                        // Watch for changes to expression.
                        scope.$watch(
                            attrs.compile, function (new_val) {
                                if (new_val != null) {
                                    /*
                                     * Compile creates a linking function
                                     * that can be used with any scope.
                                     */
                                    var link = $compile(new_val);
                                    /*
                                     * Executing the linking function
                                     * creates a new element.
                                     */
                                    var new_elem = link(scope);
                                    // Which we can then append to our DOM element.
                                    element.empty().append(new_elem);
                                }
                            }
                        );
                    }
                };
            }]
    ).directive(
        'treeTable', [
            '$timeout', '$window', 'treeTableTemplate', 'tgConfig', '$TreeTableHelper',
            function ($timeout, $window, treeTableTemplate, tgConfig, $helper) {
                return {
                    restrict:    'E',
                    replace:     true,
                    scope:       {
                        treeData:    '=',
                        columnDefs:  '=',
                        expandOn:    '=',
                        onSelect:    '&',
                        onClick:     '&',
                        treeControl: '=',
                        tree:        '=treeControl',
                        callbacks:   '=',
                        primaryKey:  '='
                    },
                    templateUrl: function (tElement, tAttrs) {
                        return tAttrs.templateUrl || treeTableTemplate.getPath();
                    },
                    controller:  [
                        '$scope', '$element', '$attrs', 'tgConfig', function ($scope, $element, $attrs, tgConfig) {
                            $scope.$type = 'TreeTable';
                            $scope.dragEnabled = true;
                            $scope.dragDelay = 0;
                            $scope.indent = 20;
                            $scope.indent_plus = 15;
                            $scope.indent_unit = 'px';
                            $scope.tree_rows = [];
                            $scope.tree_class = 'table';
                            $scope.primary_key = '__uid__';
                            $scope.$callbacks = {
                                accept:      function (scopeDrag, scopeTarget, align) {
                                    return true;
                                },
                                beforeDrag:  function (scopeDrag) {
                                    return true;
                                },
                                dropped:     function (info, accepted) {
                                    if (accepted) {
                                        var _node = info.node, _target = info.target;
                                        var _parent_remove = null;
                                        var new_index = 0;

                                        if (_node.__parent__ === null) {
                                            _parent_remove = $scope.treeData;
                                        } else {
                                            _parent_remove = $scope.tree_rows[_node.__parent__].__children__;
                                        }
                                        var _parent = _parent_remove;
                                        if (_target !== null) {
                                            if (_target.__level__ == info.level) {
                                                if (_node.__parent__ !== _target.__parent__) { // optimal code
                                                    if (_target.__parent__ === null) {
                                                        _parent = $scope.treeData;
                                                    } else {
                                                        _parent = $scope.tree_rows[_target.__parent__].__children__;
                                                    }
                                                }

                                                new_index = _target.__index__ + 1;
                                            } else {
                                                if (_target.__level__ < info.level) {
                                                    _parent = _target.__children__;
                                                } else {
                                                    while (_target.__level__ > info.level) {
                                                        if (_target.__parent__ !== null) {
                                                            _target = $scope.tree_rows[_target.__parent__];
                                                        } else {
                                                            break;
                                                        }
                                                    }

                                                    if (_target.__parent__ === null) {
                                                        _parent = $scope.treeData;
                                                    } else {
                                                        _parent = $scope.tree_rows[_target.__parent__].__children__;
                                                    }
                                                    new_index = _target.__index__ + 1;
                                                }
                                            }
                                        } else {
                                            _parent = $scope.treeData;
                                        }

                                        if (_parent != _parent_remove || _node.__index__ != new_index) {

                                            var _node_removed = _parent_remove.splice(_node.__index__, 1)[0];

                                            _parent.splice(new_index, 0, _node_removed);
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                dragStart:   function (event) {},
                                dragMove:    function (event) {},
                                dragStop:    function (event, skiped) {},
                                beforeDrop:  function (event) {
                                    return true;
                                },
                                calsIndent:  function (level, skipUnit) {
                                    var _unit = $scope.indent_unit ? $scope.indent_unit : 'px';
                                    if (!skipUnit) {
                                        _unit = $scope.indent_unit ? $scope.indent_unit : 'px';
                                    } else {
                                        _unit = '';
                                    }
                                    if (level - 1 < 1) {
                                        return $scope.indent_plus + _unit;
                                    } else {
                                        return ($scope.indent * (level - 1)) + $scope.indent_plus + _unit;
                                    }
                                },
                                dragEnabled: function () {
                                    return $scope.dragEnabled;
                                }
                            };

                            $scope.accept = function (sourceNode, destIndex) {
                                return $scope.$callbacks.accept(sourceNode, $scope, destIndex);
                            };

                            $scope.beforeDrag = function (sourceNode) {
                                return $scope.$callbacks.beforeDrag(sourceNode);
                            };
                            $scope.safeApply = function (fn) {
                                var phase = this.$root.$$phase;
                                if (phase == '$apply' || phase == '$digest') {
                                    if (fn && (typeof(fn) === 'function')) {
                                        fn();
                                    }
                                } else {
                                    this.$apply(fn);
                                }
                            };

                            $scope.prev = function (index) {
                                if (index > 0) {
                                    return $scope.tree_rows[index - 1];
                                }
                                return null;
                            }

                            $scope.next = function (index) {
                                if (index > 0) {
                                    return $scope.tree_rows[index - 1];
                                }
                                return null;
                            }

                            $scope.hashedTree = function (node) {
                                if ($scope.primary_key == '__uid__') {
                                    return node.__index_real__ + '#' + node.__index__ + '#' + node.__uid__
                                } else {
                                    return node.__index_real__ + '#' + node.__index__ + '#' + node[$scope.primary_key];
                                }
                            }
                        }],
                    link:        function (scope, element, attrs) {
                        $helper.calsIndent = scope.$callbacks.calsIndent;

                        scope.$watch(
                            attrs.primaryKey, function (value) {
                                if (typeof value === "string") {
                                    scope.primary_key = value;
                                }
                            }, true
                        );

                        scope.$watch(
                            attrs.callbacks, function (optCallbacks) {
                                angular.forEach(
                                    optCallbacks, function (value, key) {
                                        if (typeof value === "function") {
                                            if (scope.$callbacks[key]) {
                                                scope.$callbacks[key] = value;
                                            }
                                        }
                                    }
                                );

                                $helper.calsIndent = scope.$callbacks.calsIndent;
                            }, true
                        );

                        if (angular.isString(attrs['class'])) {
                            scope.tree_class = attrs['class'];
                        }

                        if (angular.isString(attrs['indentUnit'])) {
                            scope.indent_unit = attrs['indentUnit'];
                        }

                        scope.$watch(
                            attrs.dragEnabled, function (val) {
                                if ((typeof val) == "boolean") {
                                    scope.dragEnabled = val;
                                }
                            }
                        );

                        scope.$watch(
                            attrs.indent, function (val) {
                                if ((typeof val) == "number") {
                                    scope.indent = val;
                                }
                            }
                        );

                        scope.$watch(
                            attrs.indentPlus, function (val) {
                                if ((typeof val) == "number") {
                                    scope.indent_plus = val;
                                }
                            }
                        );

                        scope.$watch(
                            attrs.dragDelay, function (val) {
                                if ((typeof val) == "number") {
                                    scope.dragDelay = val;
                                }
                            }
                        );
                        // End watch
                        scope.config = {};
                        angular.extend(scope.config, tgConfig);

                        var expandingProperty, expand_level, n, tree;

                        attrs.iconExpand = attrs.iconExpand ? attrs.iconExpand : 'icon-plus  glyphicon glyphicon-plus  fa fa-plus';
                        attrs.iconCollapse = attrs.iconCollapse ? attrs.iconCollapse : 'icon-minus glyphicon glyphicon-minus fa fa-minus';
                        attrs.iconLeaf = attrs.iconLeaf ? attrs.iconLeaf : 'icon-file  glyphicon glyphicon-file  fa fa-file';
                        attrs.expandLevel = attrs.expandLevel ? attrs.expandLevel : '3';

                        expand_level = parseInt(attrs.expandLevel, 10);

                        if (!scope.treeData) {
                            scope.treeData = [];
                        }

                        if (attrs.expandOn) {
                            expandingProperty = scope.expandOn;
                            scope.expandingProperty = scope.expandOn;
                        } else {
                            if (scope.treeData.length) {
                                var _firstRow = scope.treeData[0], _keys = Object.keys(_firstRow);
                                for (var i = 0, len = _keys.length; i < len; i++) {
                                    if (typeof (_firstRow[_keys[i]]) === 'string') {
                                        expandingProperty = _keys[i];
                                        break;
                                    }
                                }
                                if (!expandingProperty) {
                                    expandingProperty = _keys[0];
                                }
                                scope.expandingProperty = expandingProperty;
                            }
                        }
                        //                        // Auto get Defs except attribute __level__ ....
                        //                        if (!attrs.columnDefs || !(attrs.columnDefs && angular.isArray(scope.columnDefs) && scope.columnDefs.length > 0)) {
                        //                            if (scope.treeData.length) {
                        //                                var _col_defs = [], _firstRow = scope.treeData[0];
                        //                                var regex = new RegExp("(__([a-zA-Z0-9_\-]*)__|^" + expandingProperty + "$)");
                        //                                for (var idx in _firstRow) {
                        //                                    if (!regex.test(idx)) {
                        //                                        _col_defs.push(
                        //                                            {
                        //                                                field: idx
                        //                                            }
                        //                                        );
                        //                                    }
                        //                                }
                        //                                scope.colDefinitions = _col_defs;
                        //                            }
                        //                        } else {
                        scope.colDefinitions = scope.columnDefs || [];
                        //                        }

                        var for_each_branch = function (f) {
                            var do_f, _i, _len, _ref;
                            do_f = function (branch, level) {
                                f(branch, level);
                                if (branch.__children__ != null) {
                                    var _i, _len, _ref;
                                    _ref = branch.__children__;
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        do_f(_ref[_i], level + 1);
                                    }
                                }
                            };
                            _ref = scope.treeData;
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                do_f(_ref[_i], 1);
                            }
                        };

                        var selected_branch = null;
                        var select_branch = function (branch) {
                            if (!branch) {
                                if (selected_branch != null) {
                                    selected_branch.__selected__ = false;
                                }
                                selected_branch = null;
                                return;
                            }
                            if (branch !== selected_branch) {
                                if (selected_branch != null) {
                                    selected_branch.__selected__ = false;
                                }
                                branch.__selected__ = true;
                                selected_branch = branch;
                                expand_all_parents(branch);
                                if (branch.onSelect != null) {
                                    return $timeout(
                                        function () {
                                            return branch.onSelect(branch);
                                        }
                                    );
                                } else {
                                    if (scope.onSelect != null) {
                                        return $timeout(
                                            function () {
                                                return scope.onSelect(
                                                    {
                                                        branch: branch
                                                    }
                                                );
                                            }
                                        );
                                    }
                                }
                            }
                        };
                        scope.on_user_click = function (branch) {
                            if (scope.onClick) {
                                scope.onClick(
                                    {
                                        branch: branch
                                    }
                                );
                            }
                        };
                        scope.user_clicks_branch = function (branch) {
                            if (branch !== selected_branch) {
                                return select_branch(branch);
                            }
                        };
                        var get_parent = function (node) {
                            if (node.__parent__ !== null && node.__parent__ > -1 && node.__parent__ < scope.tree_rows.length) {
                                return scope.tree_rows[node.__parent__];
                            }
                            return null;
                        };
                        var for_all_ancestors = function (child, fn) {
                            var parent;
                            parent = get_parent(child);
                            if (parent != null) {
                                fn(parent);
                                return for_all_ancestors(parent, fn);
                            }
                        };
                        var expand_all_parents = function (child) {
                            return for_all_ancestors(
                                child, function (b) {
                                    return b.__expanded__ = true;
                                }
                            );
                        };

                        scope.tree_rows = [];

                        var on_treeData_change = function () {
                            var _len, _data;
                            _data = scope.treeData;
                            _len = _data.length;

                            var _tree_rows = [];
                            if (_len > 0) {
                                var _i, do_f;
                                do_f = function (branch, parent, level, visible, index) {
                                    var _i, _len, _tree_icon;

                                    if (!angular.isArray(branch.__children__)) {
                                        branch.__children__ = []
                                    }

                                    branch.__parent__ = parent;

                                    _len = branch.__children__.length;

                                    if (branch.__expanded__ == null && _len > 0) {
                                        branch.__expanded__ = level < expand_level;
                                    }

                                    if (_len === 0) {
                                        _tree_icon = attrs.iconLeaf;
                                    } else {
                                        if (branch.__expanded__) {
                                            _tree_icon = attrs.iconCollapse;
                                        } else {
                                            _tree_icon = attrs.iconExpand;
                                        }
                                    }
                                    // Insert item vertically
                                    var _index_real = _tree_rows.length;
                                    branch.__index__ = index;
                                    branch.__index_real__ = _index_real;
                                    branch.__level__ = level;
                                    branch.__tree_icon__ = _tree_icon;
                                    branch.__visible__ = visible;

                                    if (branch.__uid__ == null) {
                                        branch.__uid__ = "" + Math.random();
                                    }

                                    _tree_rows.push(
                                        branch
                                    );

                                    // Check brach children

                                    var _dept = 1;
                                    if (_len > 0) {
                                        for (_i = 0; _i < _len; _i++) {
                                            _dept = _dept + do_f(
                                                branch.__children__[_i],
                                                _index_real,
                                                level + 1,
                                                visible && branch.__expanded__,
                                                _i
                                            );
                                        }
                                    }

                                    return branch.__dept__ = _dept;
                                };

                                for (_i = 0; _i < _len; _i++) {
                                    do_f(_data[_i], null, 1, true, _i);
                                }
                            }
                            scope.tree_rows = _tree_rows;
                            return scope.tree_rows;
                        };

                        scope.$watch('treeData', on_treeData_change, true);

                        if (scope.treeControl != null) {
                            if (angular.isObject(scope.treeControl)) {

                                tree = scope.treeControl;
                                tree.expand_all = function () {
                                    for_each_branch(
                                        function (b, level) {
                                            b.__expanded__ = true;
                                        }
                                    );
                                };
                                tree.collapse_all = function () {
                                    for_each_branch(
                                        function (b, level) {
                                            b.__expanded__ = false;
                                        }
                                    );
                                };
                                tree.get_first_branch = function () {
                                    n = scope.treeData.length;
                                    if (n > 0) {
                                        return scope.treeData[0];
                                    }
                                    return null;
                                };
                                tree.select_first_branch = function () {
                                    var b;
                                    b = tree.get_first_branch();
                                    return tree.select_branch(b);
                                };
                                tree.get_selected_branch = function () {
                                    return selected_branch;
                                };
                                tree.get_parent_branch = function (b) {
                                    return get_parent(b);
                                };
                                tree.select_branch = function (b) {
                                    select_branch(b);
                                    return b;
                                };
                                tree.get_children = function (b) {
                                    return b.__children__;
                                };
                                tree.select_parent_branch = function (b) {
                                    var p;
                                    if (b == null) {
                                        b = tree.get_selected_branch();
                                    }
                                    if (b != null) {
                                        p = tree.get_parent_branch(b);
                                        if (p != null) {
                                            tree.select_branch(p);
                                            return p;
                                        }
                                    }
                                };
                                tree.add_branch = function (parent, new_branch, index) {
                                    if ((typeof index) != "number") {
                                        if (parent != null) {
                                            parent.__children__.push(new_branch);
                                            parent.__expanded__ = true;
                                        } else {
                                            scope.treeData.push(new_branch);
                                        }
                                    } else {
                                        if (parent != null) {
                                            parent.__children__.splice(index, 0, new_branch);
                                            parent.__expanded__ = true;
                                        } else {
                                            scope.treeData.splice(index, 0, new_branch);
                                        }
                                    }
                                    return new_branch;
                                };
                                tree.add_root_branch = function (new_branch) {
                                    tree.add_branch(null, new_branch);
                                    return new_branch;
                                };
                                tree.remove_branch = function (branch) {
                                    branch = branch || tree.get_selected_branch();
                                    if (branch) {
                                        var parent;
                                        if (branch.__parent__ !== null) {
                                            parent = tree.get_parent_branch(branch).__children__;
                                        } else {
                                            parent = scope.treeData;
                                        }
                                        var index = parent.indexOf(branch);
                                        parent.splice(index, 1);
                                        selected_branch = null;
                                    }
                                };
                                tree.expand_branch = function (b) {
                                    if (b == null) {
                                        b = tree.get_selected_branch();
                                    }
                                    if (b != null) {
                                        b.__expanded__ = true;
                                        return b;
                                    }
                                };
                                tree.collapse_branch = function (b) {
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        b.__expanded__ = false;
                                        return b;
                                    }
                                };
                                tree.get_siblings = function (b) {
                                    var p, siblings;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        p = tree.get_parent_branch(b);
                                        if (p) {
                                            siblings = p.__children__;
                                        } else {
                                            siblings = scope.treeData;
                                        }
                                        return siblings;
                                    }
                                };
                                tree.get_next_sibling = function (b) {
                                    var i, siblings;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        siblings = tree.get_siblings(b);
                                        n = siblings.length;
                                        i = siblings.indexOf(b);
                                        if (i < n) {
                                            return siblings[i + 1];
                                        }
                                    }
                                };
                                tree.get_prev_sibling = function (b) {
                                    var i, siblings;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    siblings = tree.get_siblings(b);
                                    n = siblings.length;
                                    i = siblings.indexOf(b);
                                    if (i > 0) {
                                        return siblings[i - 1];
                                    }
                                };
                                tree.select_next_sibling = function (b) {
                                    var next;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        next = tree.get_next_sibling(b);
                                        if (next != null) {
                                            return tree.select_branch(next);
                                        }
                                    }
                                };
                                tree.select_prev_sibling = function (b) {
                                    var prev;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        prev = tree.get_prev_sibling(b);
                                        if (prev != null) {
                                            return tree.select_branch(prev);
                                        }
                                    }
                                };
                                tree.get_first_child = function (b) {
                                    var _ref;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        if (((_ref = b.__children__) != null ? _ref.length : void 0) > 0) {
                                            return b.__children__[0];
                                        }
                                    }
                                };
                                tree.get_closest_ancestor_next_sibling = function (b) {
                                    var next, parent;
                                    next = tree.get_next_sibling(b);
                                    if (next != null) {
                                        return next;
                                    } else {
                                        parent = tree.get_parent_branch(b);
                                        return tree.get_closest_ancestor_next_sibling(parent);
                                    }
                                };
                                tree.get_next_branch = function (b) {
                                    var next;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        next = tree.get_first_child(b);
                                        if (next != null) {
                                            return next;
                                        } else {
                                            next = tree.get_closest_ancestor_next_sibling(b);
                                            return next;
                                        }
                                    }
                                };
                                tree.select_next_branch = function (b) {
                                    var next;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        next = tree.get_next_branch(b);
                                        if (next != null) {
                                            tree.select_branch(next);
                                            return next;
                                        }
                                    }
                                };
                                tree.last_descendant = function (b) {
                                    var last_child;
                                    if (b == null) {
                                        debugger;
                                    }
                                    n = b.__children__.length;
                                    if (n === 0) {
                                        return b;
                                    } else {

                                        last_child = b.__children__[n - 1];
                                        return tree.last_descendant(last_child);
                                    }
                                };
                                tree.get_prev_branch = function (b) {
                                    var parent, prev_sibling;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        prev_sibling = tree.get_prev_sibling(b);
                                        if (prev_sibling != null) {
                                            return tree.last_descendant(prev_sibling);
                                        } else {
                                            parent = tree.get_parent_branch(b);
                                            return parent;
                                        }
                                    }
                                };
                                tree.reload_data = function () {
                                    return on_treeData_change();
                                };
                                return tree.select_prev_branch = function (b) {
                                    var prev;
                                    if (b == null) {
                                        b = selected_branch;
                                    }
                                    if (b != null) {
                                        prev = tree.get_prev_branch(b);
                                        if (prev != null) {
                                            tree.select_branch(prev);
                                            return prev;
                                        }
                                    }
                                };
                            }
                        }
                    }
                };
            }]
    ).directive(
        'treeTableNode', [
            '$window', '$document', '$timeout', '$TreeTableHelper', function ($window, $document, $timeout, $helper) {
                return {
                    restrict:   'A',
                    replace:    true,
                    require:    '^treeTable',
                    controller: [
                        '$scope', '$element', '$attrs', 'tgConfig', function ($scope, $element, $attrs, tgConfig) {
                            $scope.$element = $element;
                            $scope.$type = 'TreeTableNode';
                            $scope.$modelValue = null;
                            $scope.$nodeScope = $scope;

                            $scope.childNodesCount = function () {
                                return $scope.childNodes().length;
                            };

                            $scope.childNodes = function () {
                                return $scope.$modelValue.__children__;
                            };

                            $scope.init = function () {
                                $scope.$modelValue = $scope.tree_rows[$scope.$index];
                            }

                            $scope.safeApply = function (fn) {
                                var phase = this.$root.$$phase;
                                if (phase == '$apply' || phase == '$digest') {
                                    if (fn && (typeof(fn) === 'function')) {
                                        fn();
                                    }
                                } else {
                                    this.$apply(fn);
                                }
                            };

                            $scope.prev = function () {
                                return $scope.$parent.prev($scope.$modelValue.__index_real__);
                            }

                            $scope.next = function () {
                                return $scope.$parent.next($scope.$modelValue.__index_real__);
                            }

                            $scope.getPrev = function (index) {
                                return $scope.$parent.prev(index);
                            }

                            $scope.getNext = function (index) {
                                return $scope.$parent.next(index);
                            }

                            $scope.node = function () {
                                return $scope.$modelValue;
                            }

                            $scope.data = function () {
                                return $scope.$modelValue;
                            }

                            $scope.visible = function (node) {
                                if (node != null) {
                                    return node.__visible__ ? node : $scope.visible($scope.tree_rows[node.__parent__]);
                                }
                                return null;
                            }
                        }],
                    link:       function (scope, element, attrs) {
                        if (scope.config.nodeClass) {
                            element.addClass(scope.config.nodeClass);
                        }

                        scope.init();
                        var hasTouch = 'ontouchstart' in window;

                        // todo startPos is unused
                        var startPos, firstMoving, dragInfo, pos;
                        var placeElm, dragElm;
                        var dragDelaying = true;
                        var dragStarted = false;
                        var dragTimer = null;

                        var body = document.body, html = document.documentElement, document_height, document_width;

                        var dragStart = function (e) {

                            if (!hasTouch && (e.button == 2 || e.which == 3)) {
                                // disable right click
                                return;
                            }
                            if (e.uiTreeDragging || (e.originalEvent && e.originalEvent.uiTreeDragging)) { // event has already fired in other scope.
                                return;
                            }

                            // the element which is clicked.
                            var eventElm = angular.element(e.target);
                            var eventScope = eventElm.scope();

                            if (!eventScope || !eventScope.$type) {
                                return;
                            }

                            if (eventScope.$type != 'TreeTableNode' && eventScope.$type != 'TreeTableNodeHandle') { // Check if it is a node or a handle
                                return;
                            }

                            if (eventScope.$type != 'TreeTableNodeHandle') { // If the node has a handle, then it should be clicked by the handle
                                return;
                            }

                            var eventElmTagName = eventElm.prop('tagName').toLowerCase();
                            if (eventElmTagName == 'input' || eventElmTagName == 'textarea' || eventElmTagName == 'button' || eventElmTagName == 'select') { // if it's a input or button, ignore it
                                return;
                            }

                            // check if it or it's parents has a 'data-nodrag' attribute
                            while (eventElm && eventElm[0] && eventElm[0] != element) {
                                if ($helper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                                    return;
                                }
                                eventElm = eventElm.parent();
                            }

                            if (!scope.beforeDrag(scope)) {
                                return;
                            }

                            e.uiTreeDragging = true; // stop event bubbling
                            if (e.originalEvent) {
                                e.originalEvent.uiTreeDragging = true;
                            }
                            e.preventDefault();
                            var eventObj = $helper.eventObj(e);

                            firstMoving = true;

                            dragInfo = $helper.dragInfo(scope);

                            placeElm = angular.element($window.document.createElement('tr'));
                            var _len_down = scope.colDefinitions.length, _i;

                            placeElm.append(
                                angular.element($window.document.createElement('td')).addClass(scope.config.emptyTreeClass).addClass('indented').addClass(scope.config.placeHolderClass)
                            );
                            while (_len_down-- > 0) {
                                placeElm.append(
                                    angular.element($window.document.createElement('td')).addClass(scope.config.emptyTreeClass).addClass(scope.config.placeHolderClass)
                                );
                            }

                            pos = $helper.positionStarted(eventObj, scope.$element);
                            placeElm.css('width', $helper.width(scope.$element) + 'px');

                            $helper.replaceIndent(placeElm, dragInfo.level);

                            dragElm = angular.element(
                                $window.document.createElement('table')
                            ).addClass('table tree-table').addClass(scope.config.dragClass);

                            dragElm.css('width', ($helper.width(scope.$element) + 10) + 'px');
                            dragElm.css('z-index', 9999);

                            var _tbody = angular.element($window.document.createElement('tbody'));
                            // moving item with descendant

                            scope.$element[0].parentNode.insertBefore(placeElm[0], scope.$element[0]);
                            var height = 0;

                            var drag_descendant = function (element, len) {
                                var _i;
                                for (_i = 0; _i < len; _i++) {
                                    height = height + $helper.height(element);
                                    _tbody.append(element.clone());
                                    if (scope.config.hiddenClass) {
                                        element.addClass(scope.config.hiddenClass);
                                    }
                                    element = element.next();
                                }
                            }

                            drag_descendant(scope.$element, scope.node().__dept__);
                            dragElm.append(_tbody);

                            placeElm.css('height', height + 'px');

                            $document.find('body').append(dragElm);
                            dragElm.css(
                                {
                                    'left': eventObj.pageX - pos.offsetX + 'px',
                                    'top':  eventObj.pageY - pos.offsetY + 'px'
                                }
                            );

                            angular.element($document).bind('touchend', dragEndEvent);
                            angular.element($document).bind('touchcancel', dragEndEvent);
                            angular.element($document).bind('touchmove', dragMoveEvent);
                            angular.element($document).bind('mouseup', dragEndEvent);
                            angular.element($document).bind('mousemove', dragMoveEvent);
                            angular.element($document).bind('mouseleave', dragCancelEvent);

                            document_height = Math.max(
                                body.scrollHeight,
                                body.offsetHeight,
                                html.clientHeight,
                                html.scrollHeight,
                                html.offsetHeight
                            );
                            document_width = Math.max(
                                body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth
                            );
                        };

                        var dragMove = function (e) {
                            if (!dragStarted) {
                                if (!dragDelaying) {
                                    dragStarted = true;
                                    scope.$apply(
                                        function () {
                                            scope.$callbacks.dragStart(dragInfo);
                                        }
                                    );
                                }
                                return;
                            }

                            var eventObj = $helper.eventObj(e);
                            var prev, leftElmPos, topElmPos;

                            if (dragElm) {
                                e.preventDefault();

                                if ($window.getSelection) {
                                    $window.getSelection().removeAllRanges();
                                } else if ($window.document.selection) {
                                    $window.document.selection.empty();
                                }

                                leftElmPos = eventObj.pageX - pos.offsetX;
                                topElmPos = eventObj.pageY - pos.offsetY;

                                //dragElm can't leave the screen on the left
                                if (leftElmPos < 0) {
                                    leftElmPos = 0;
                                }

                                //dragElm can't leave the screen on the top
                                if (topElmPos < 0) {
                                    topElmPos = 0;
                                }

                                //dragElm can't leave the screen on the bottom
                                if ((topElmPos + 10) > document_height) {
                                    topElmPos = document_height - 10;
                                }

                                //dragElm can't leave the screen on the right
                                if ((leftElmPos + 10) > document_width) {
                                    leftElmPos = document_width - 10;
                                }
                                dragElm.css(
                                    {
                                        'left': leftElmPos + 'px',
                                        'top':  topElmPos + 'px'
                                    }
                                );

                                var top_scroll = window.pageYOffset || $window.document.documentElement.scrollTop;
                                var bottom_scroll = top_scroll + (window.innerHeight || $window.document.clientHeight || $window.document.clientHeight);

                                // to scroll down if cursor y-position is greater than the bottom position the vertical scroll
                                if (bottom_scroll < eventObj.pageY && bottom_scroll <= document_height) {
                                    window.scrollBy(0, 10);
                                }

                                // to scroll top if cursor y-position is less than the top position the vertical scroll
                                if (top_scroll > eventObj.pageY) {
                                    window.scrollBy(0, -10);
                                }

                                $helper.positionMoved(e, pos, firstMoving);

                                if (firstMoving) {
                                    firstMoving = false;
                                    return;
                                }

                                // check if add it as a child node first
                                // todo decrease is unused
                                var decrease = ($helper.offset(dragElm).left - $helper.offset(placeElm).left) >= scope.config.threshold;
                                var targetX = eventObj.pageX - $window.document.body.scrollLeft;
                                var targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop);

                                // Select the drag target. Because IE does not support CSS 'pointer-events: none', it will always
                                // pick the drag element itself as the target. To prevent this, we hide the drag element while
                                // selecting the target.
                                var displayElm;
                                if (angular.isFunction(dragElm.hide)) {
                                    dragElm.hide();
                                } else {
                                    displayElm = dragElm[0].style.display;
                                    dragElm[0].style.display = "none";
                                }
                                // when using elementFromPoint() inside an iframe, you have to call
                                // elementFromPoint() twice to make sure IE8 returns the correct value
                                $window.document.elementFromPoint(targetX, targetY);

                                var targetElm = angular.element($window.document.elementFromPoint(targetX, targetY));
                                if (angular.isFunction(dragElm.show)) {
                                    dragElm.show();
                                } else {
                                    dragElm[0].style.display = displayElm;
                                }

                                // move vertical

                                if (!pos.dirAx) {
                                    var targetBefore, targetNode;
                                    // check it's new position
                                    targetNode = targetElm.scope();
                                    if (!targetNode) {
                                        return;
                                    }

                                    if (targetNode.$type == 'TreeTable' && targetNode.$callbacks.dragEnabled()) {
                                        return;
                                    }

                                    if (targetNode.$type == 'TreeTableNodeHandle') { // Check if it is a TreeTableNode or it's an empty tree
                                        targetNode = targetElm.scope().$nodeScope;
                                    }

                                    if (targetNode.$type != 'TreeTableNode') {
                                        return;
                                    }

                                    if (targetNode.$callbacks.dragEnabled()) {
                                        targetElm = targetNode.$element; // Get the element of tree-table-node
                                        var targetOffset = $helper.offset(targetElm);

                                        targetBefore = targetNode.horizontal ? eventObj.pageX < (targetOffset.left + $helper.width(targetElm) / 2) : eventObj.pageY < (targetOffset.top + $helper.height(targetElm) / 2);
                                        if (targetNode.accept(scope, targetNode, targetBefore)) {
                                            dragInfo.level = targetNode.node().__level__;
                                            if (targetBefore) {
                                                // Insert Element before Target
                                                if (dragInfo.isDirty(targetNode.node().__index_real__ - 1)) {
                                                    dragInfo.target = scope.getPrev(dragInfo.node.__index_real__);
                                                } else {
                                                    dragInfo.target = targetNode.prev();
                                                }

                                                $helper.replaceIndent(placeElm, dragInfo.level);
                                                targetElm[0].parentNode.insertBefore(placeElm[0], targetElm[0]);
                                                //placeElm.insertBefore(targetElm);
                                            } else {
                                                targetElm.after(placeElm);
                                                dragInfo.target = targetNode.node();

                                                var _level = dragInfo.level;
                                                if (targetNode.data().__expanded__) {
                                                    _level++;
                                                    dragInfo.level = _level;
                                                }

                                                $helper.replaceIndent(placeElm, _level);
                                            }
                                        }
                                    }
                                } else {
                                    // move horizontal
                                    if (pos.dirAx && pos.distAxX >= scope.config.levelThreshold) {
                                        pos.distAxX = 0;
                                        var _target = dragInfo.target;
                                        if (_target) {
                                            // increase horizontal level if previous sibling exists and is not collapsed
                                            if (pos.distX > 0) {
                                                //get node visible
                                                var _visible = scope.visible(_target);
                                                if (_visible != null && _visible.__level__ >= dragInfo.level) {
                                                    dragInfo.level++;
                                                    $helper.replaceIndent(placeElm, dragInfo.level);
                                                }
                                            } else if (pos.distX < 0 && dragInfo.isTargetEmpty()) {
                                                dragInfo.level = dragInfo.level - 1;
                                                $helper.replaceIndent(placeElm, dragInfo.level);
                                            }
                                        }
                                    }
                                }

                                scope.$apply(
                                    function () {
                                        scope.$callbacks.dragMove(dragInfo);
                                    }
                                );
                            }
                        };

                        var dragEnd = function (e) {
                            e.preventDefault();

                            if (dragElm) {
                                var _passed = false;

                                scope.$apply(
                                    function () {
                                        _passed = scope.$callbacks.beforeDrop(dragInfo);
                                    }
                                );

                                var rollback_descendant = function (element, len) {
                                    var _i;
                                    for (_i = 0; _i < len; _i++) {
                                        if (scope.config.hiddenClass) {
                                            element.removeClass(scope.config.hiddenClass);
                                        }
                                        element = element.next();
                                    }
                                }
                                rollback_descendant(scope.$element, scope.node().__dept__);

                                placeElm.remove();
                                dragElm.remove();
                                dragElm = null;
                                var _status = false;
                                if (scope.$$apply) {
                                    scope.$apply(
                                        function () {
                                            _status = scope.$callbacks.dropped(dragInfo, _passed);
                                        }
                                    );
                                } else {
                                    bindDrag();
                                }

                                scope.$apply(
                                    function () {
                                        scope.$callbacks.dragStop(dragInfo, _status);
                                    }
                                );

                                scope.$$apply = false;
                                dragInfo = null;
                            }

                            angular.element($document).unbind('touchend', dragEndEvent); // Mobile
                            angular.element($document).unbind('touchcancel', dragEndEvent); // Mobile
                            angular.element($document).unbind('touchmove', dragMoveEvent); // Mobile
                            angular.element($document).unbind('mouseup', dragEndEvent);
                            angular.element($document).unbind('mousemove', dragMoveEvent);
                            angular.element($window.document.body).unbind('mouseleave', dragCancelEvent);
                        };

                        var dragStartEvent = function (e) {
                            if (scope.$callbacks.dragEnabled()) {
                                dragStart(e);
                            }
                        };

                        var dragMoveEvent = function (e) {
                            dragMove(e);
                        };

                        var dragEndEvent = function (e) {
                            scope.$$apply = true;
                            dragEnd(e);
                        };

                        var dragCancelEvent = function (e) {
                            dragEnd(e);
                        };

                        var bindDrag = function () {
                            element.bind(
                                'touchstart mousedown', function (e) {
                                    dragDelaying = true;
                                    dragStarted = false;
                                    dragStartEvent(e);
                                    dragTimer = $timeout(function () {dragDelaying = false;}, scope.dragDelay);
                                }
                            );
                            element.bind('touchend touchcancel mouseup', function () {$timeout.cancel(dragTimer);});
                        };

                        bindDrag();

                        var keydownHandler = function (e) {
                            if (e.keyCode == 27) {
                                scope.$$apply = false;
                                dragEnd(e);
                            }
                        };

                        angular.element($window.document.body).bind("keydown", keydownHandler);

                        //unbind handler that retains scope
                        scope.$on(
                            '$destroy', function () {
                                angular.element($window.document.body).unbind("keydown", keydownHandler);
                            }
                        );
                    }
                };
            }]
    ).directive(
        'treeTableNodeHandle', [
            '$window', function ($window) {
                return {
                    restrict:   'A',
                    scope:      true,
                    controller: [
                        '$scope', '$element', '$attrs', 'tgConfig', function ($scope, $element, $attrs, tgConfig) {
                            $scope.$element = $element;
                            $scope.$type = 'TreeTableNodeHandle';
                            $scope.$nodeScope = null;
                        }],
                    link:       function (scope, element, attrs) {
                        if (scope.$parent.$type == 'TreeTableNode') {
                            scope.$nodeScope = scope.$parent
                        } else {
                            scope.$nodeScope = scope;
                        }

                        if (scope.config.handleClass) {
                            element.addClass(scope.config.handleClass);
                        }
                    }
                };
            }]
    ).provider(
        'treeTableTemplate', function () {
            var templatePath = 'template/treeTable/treeTable.html';
            this.setPath = function (path) {
                templatePath = path;
            };
            this.$get = function () {
                return {
                    getPath: function () {
                        return templatePath;
                    }
                };
            };
        }
    ).factory(
        '$TreeTableHelper', [
            '$document', '$window', function ($document, $window) {
                return {
                    calsIndent:      null,
                    nodrag:          function (targetElm) {
                        return (typeof targetElm.attr('data-nodrag')) != "undefined";
                    },
                    eventObj:        function (e) {
                        var obj = e;
                        if (e.targetTouches !== undefined) {
                            obj = e.targetTouches.item(0);
                        } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                            obj = e.originalEvent.targetTouches.item(0);
                        }
                        return obj;
                    },
                    dragInfo:        function (scope) {
                        return {
                            node:          scope.node(),
                            scope:         scope,
                            level:         scope.node().__level__,
                            target:        scope.prev(),
                            isDirty:       function (index) {
                                return this.node.__index_real__ <= index && index <= this.node.__index_real__ + this.node.__dept__ - 1;
                            },
                            isTargetEmpty: function () {
                                if (this.level == 1) {
                                    return false;
                                }

                                var _target = this.target;
                                var _node = this.node;
                                while (_target) {
                                    if (_target.__level__ < this.level) {
                                        if (_target.__expanded__) {
                                            if (_target.__children__.length == 0) {
                                                return true;
                                            } else if ((_target.__index_real__ == this.target.__parent__ && _target.__children__.length - 1 == this.target.__index__) || (_target.__index_real__ == _node.__parent__ && _target.__children__.length - 1 == _node.__index__)) {
                                                return true;
                                            }
                                            return false;
                                        }
                                        return true;
                                    } else if (_target.__parent__ == null) {
                                        return false;
                                    } else {
                                        _target = this.scope.tree_rows[_target.__parent__];
                                    }
                                }
                                return false;
                            },
                            next:          function () {
                                if (this.node.__index_real__ < this.source.length - 1) {
                                    return this.source[this.node.__index_real__ + 1];
                                }
                                return null;
                            },
                            prev:          function () {
                                if (this.node.__index_real__ > 0) {
                                    return this.source[this.node.__index_real__ - 1];
                                }
                                return null;
                            }
                        };
                    },
                    height:          function (element) {
                        return element.prop('scrollHeight');
                    },
                    width:           function (element) {
                        return element.prop('scrollWidth');
                    },
                    offset:          function (element) {
                        var boundingClientRect = element[0].getBoundingClientRect();
                        return {
                            width:  element.prop('offsetWidth'),
                            height: element.prop('offsetHeight'),
                            top:    boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                            left:   boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
                        };
                    },
                    positionStarted: function (e, target) {
                        var pos = {};
                        pos.offsetX = e.pageX - this.offset(target).left;
                        pos.offsetY = e.pageY - this.offset(target).top;
                        pos.startX = pos.lastX = e.pageX;
                        pos.startY = pos.lastY = e.pageY;
                        pos.nowX = pos.nowY = pos.distX = pos.distY = pos.dirAx = 0;
                        pos.dirX = pos.dirY = pos.lastDirX = pos.lastDirY = pos.distAxX = pos.distAxY = 0;
                        return pos;
                    },
                    positionMoved:   function (e, pos, firstMoving) {
                        // mouse position last events
                        pos.lastX = pos.nowX;
                        pos.lastY = pos.nowY;
                        // mouse position this events
                        pos.nowX = e.pageX;
                        pos.nowY = e.pageY;
                        // distance mouse moved between events
                        pos.distX = pos.nowX - pos.lastX;
                        pos.distY = pos.nowY - pos.lastY;
                        // direction mouse was moving
                        pos.lastDirX = pos.dirX;
                        pos.lastDirY = pos.dirY;
                        // direction mouse is now moving (on both axis)
                        pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                        pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;
                        // axis mouse is now moving on
                        var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;
                        // do nothing on first move
                        if (firstMoving) {
                            pos.dirAx = newAx;
                            pos.moving = true;
                            return;
                        }
                        // calc distance moved on this axis (and direction)
                        if (pos.dirAx !== newAx) {
                            pos.distAxX = 0;
                            pos.distAxY = 0;
                        } else {
                            pos.distAxX += Math.abs(pos.distX);
                            if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                                pos.distAxX = 0;
                            }
                            pos.distAxY += Math.abs(pos.distY);
                            if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                                pos.distAxY = 0;
                            }
                        }
                        pos.dirAx = newAx;
                    },
                    replaceIndent:   function (e, indent, attr) {
                        attr = attr ? attr : 'left';
                        angular.element(e.children()[0]).css(attr, this.calsIndent(indent));
                    },

                    hidden: function (e) {
                        if (angular.isFunction(e.hide)) {
                            e.hide();
                        } else {
                            displayElm = e[0].style.display;
                            e[0].style.display = "none";
                        }
                    }
                };
            }]
    ).factory(
        '$TreeTableConvert', function () {
            return {
                line2tree: function (data, primaryKey, parentKey) {
                    if (!data || data.length == 0 || !primaryKey || !parentKey) {
                        return [];
                    }

                    var tree = [], rootIds = [], item = data[0], _primary = item[primaryKey], treeObjs = {}, parentId, parent, len = data.length, i = 0;
                    while (i < len) {
                        item = data[i++];
                        _primary = item[primaryKey];
                        treeObjs[_primary] = item;
                        parentId = item[parentKey];
                        if (parentId) {
                            parent = treeObjs[parentId];
                            if (parent.__children__) {
                                parent.__children__.push(item);
                            } else {
                                parent.__children__ = [item];
                            }
                        } else {
                            rootIds.push(_primary);
                        }
                    }
                    len = rootIds.length;
                    for (i = 0; i < len; i++) {
                        tree.push(treeObjs[rootIds[i]]);
                    }
                    return tree;
                },
                tree2tree: function (data, parentKey) {
                    var access_child = function (data) {
                        var _tree = [];
                        var _i, _len = data.length, _copy, _child;
                        for (_i = 0; _i < _len; _i++) {
                            _copy = angular.copy(data[_i]);
                            if (angular.isArray(_copy[parentKey]) && _copy[parentKey].length > 0) {
                                _child = access_child(_copy[parentKey]);
                                delete(_copy[parentKey]);
                                _copy.__children__ = _child;
                            }
                            _tree.push(_copy);
                        }
                        return _tree;
                    }
                    return access_child(data);
                }
            }
        }
    ).constant(
        'tgConfig', {
            treeClass:        'tree-table',
            emptyTreeClass:   'tree-table-empty',
            hiddenClass:      'tree-table-hidden',
            nodeClass:        'tree-table-row',
            handleClass:      'tree-table-handle',
            placeHolderClass: 'tree-table-placeholder',
            dragClass:        'tree-table-drag',
            levelThreshold:   30
        }
    );
}
).call(window);
