angular.module('ntt.TreeDnD')
    .directive(
    'treeDnd', [
        '$timeout', '$http', '$compile', '$window', '$document', '$templateCache',
        '$TreeDnDTemplate', '$TreeDnDClass', '$TreeDnDHelper', '$TreeDnDOrderBy', '$TreeDnDFilter',
        function ($timeout, $http, $compile, $window, $document, $templateCache,
                  $TreeDnDTemplate, $TreeDnDClass, $TreeDnDHelper, $TreeDnDOrderBy, $TreeDnDFilter) {

            return {
                restrict:   'E',
                scope:      true,
                replace:    true,
                controller: [
                    '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                        $scope.dragEnabled = true;
                        $scope.dropEnabled = true;
                        $scope.dragDelay = 0;
                        $scope.indent = 20;
                        $scope.indent_plus = 15;
                        $scope.indent_unit = 'px';
                        $scope.$tree_class = 'table';
                        $scope.primary_key = '__uid__';
                        $scope.enabledMove = true;
                        $scope.statusMove = true;
                        $scope.enabledHotkey = false;
                        $scope.enabledCollapse = null;
                        $scope.enabledFilter = null;
                        $scope.dragBorder = 30;

                        $scope.horizontal = null;
                        $scope.$type = 'TreeDnD';
                        $scope.colDefinitions = [];
                        $scope.$globals = {};
                        $scope.$class = {};
                        $scope.tree_nodes = [];

                        $scope.statusElm = null;
                        $scope.placeElm = null;
                        $scope.dragging = null;

                        $scope.targeting = false;

                        $scope.for_all_descendants = function (node, fn) {
                            if (angular.isFunction(fn)) {
                                var _i, _len, _nodes;

                                if (fn(node)) {
                                    return false;
                                }
                                _nodes = node.__children__;
                                _len = _nodes.length;
                                for (_i = 0; _i < _len; _i++) {
                                    if (!$scope.for_all_descendants(_nodes[_i], fn)) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        };
                        var _clone;
                        $scope.$callbacks = {
                            for_all_descendants: $scope.for_all_descendants,
                            accept:              function (dragInfo, moveTo, isChanged) {
                                return true;
                            },
                            beforeDrag:          function (scopeDrag) {
                                return true;
                            },
                            dragStart:           function (event) {},
                            dragMove:            function (event) {},
                            dragStop:            function (event, skiped) {},
                            beforeDrop:          function (event) {
                                return true;
                            },
                            calsIndent:          function (level, skipUnit, skipEdge) {
                                var unit = 0,
                                    edge = (skipEdge) ? 0 : $scope.indent_plus;
                                if (!skipUnit) {
                                    unit = $scope.indent_unit ? $scope.indent_unit : 'px';
                                }

                                if (level - 1 < 1) {
                                    return edge + unit;
                                } else {
                                    return $scope.indent * (level - 1) + edge + unit;
                                }
                            },
                            droppable:           function () {
                                return $scope.dropEnabled;
                            },
                            draggable:           function () {
                                return $scope.dragEnabled;
                            },
                            changeKey:           function (node) {
                                var _key = node.__uid__;
                                node.__uid__ = Math.random();
                                if (node.__selected__) {
                                    delete(node.__selected__);
                                }

                                if ($scope.primary_key !== '__uid__') {
                                    _key = '' + node[$scope.primary_key];
                                    _key = _key.replace(/_#.+$/g, '') + '_#' + node.__uid__;

                                    node[$scope.primary_key] = _key;
                                }
                                // delete(node.__hashKey__);
                            },
                            clone:               function (node, _this) {
                                _clone = angular.copy(node);
                                this.for_all_descendants(_clone, this.changeKey);
                                return _clone;
                            },
                            remove:              function (node, parent, _this) {
                                return parent.splice(node.__index__, 1)[0];
                            },
                            add:                 function (node, pos, parent, _this) {
                                if (parent) {
                                    if (parent.length > -1) {
                                        if (pos > -1) {
                                            parent.splice(pos, 0, node);
                                        } else {
                                            // todo If children need load crazy
                                            parent.push(node);
                                        }
                                    } else {
                                        parent.push(node);
                                    }
                                }
                            },

                            dropped: function (info, pass, isMove) {
                                if (!info) {
                                    return null;
                                }

                                if (!info.changed && isMove) {
                                    return false;
                                }
                                var _node = info.node,
                                    _nodeAdd = null,
                                    _move = info.move,
                                    _parent = null,
                                    _parentRemove = (info.parent || info.drag.treeData),
                                    _parentAdd = (_move.parent || info.target.treeData);

                                if (info.target.$callbacks.accept(info, info.move, info.changed)) {
                                    if (isMove) {
                                        _parent = _parentRemove;
                                        if (!angular.isUndefinedOrNull(_parent.__children__)) {
                                            _parent = _parent.__children__;
                                        }
                                        _nodeAdd = info.drag.$callbacks.remove(_node, _parent, info.drag.$callbacks);
                                    } else {
                                        _nodeAdd = info.drag.$callbacks.clone(_node, info.drag.$callbacks);
                                    }

                                    // if node dragging change index in sample node parent
                                    // and index node decrement
                                    if (isMove &&
                                        info.drag === info.target &&
                                        _parentRemove === _parentAdd &&
                                        _move.pos >= info.node.__index__) {
                                        _move.pos--;
                                    }

                                    _parent = _parentAdd;
                                    if (_parent.__children__) {
                                        _parent = _parent.__children__;
                                    }

                                    info.target.$callbacks.add(_nodeAdd, _move.pos, _parent, info.drag.$callbacks);

                                    return true;
                                }

                                return false;
                            }
                        };

                        $scope.setDragging = function (dragInfo) {
                            $scope.dragging = dragInfo;
                        };

                        $scope.toggleExpand = function (node) {
                            if (node.__children__.length > 0) {
                                node.__expanded__ = !node.__expanded__;
                            }
                        };

                        $scope.getScopeTree = function () {
                            return $scope;
                        };

                        $scope.getPrevSibling = function (node) {
                            if (node && node.__index__ > 0) {
                                var _parent, _index = node.__index__ - 1;

                                if (!angular.isUndefinedOrNull(node.__parent_real__)) {
                                    _parent = $scope.tree_nodes[node.__parent_real__];
                                    return _parent.__children__[_index];
                                } else {
                                    return $scope.treeData[_index];
                                }
                            }
                            return null;
                        };

                        $scope.getNode = function (index) {
                            if (angular.isUndefinedOrNull(index)) {
                                return null;
                            }
                            return $scope.tree_nodes[index];
                        };

                        $scope.getHash = function (node) {
                            if ($scope.primary_key === '__uid__') {
                                return '#' + node.__parent__ + '#' + node.__uid__;
                            } else {
                                return '#' + node.__parent__ + '#' + node[$scope.primary_key];
                            }
                        };

                        $scope.setScope = function (scope, node) {
                            var _hash = $scope.getHash(node);
                            if ($scope.$globals[_hash] !== scope) {
                                $scope.$globals[_hash] = scope;
                            }
                        };

                        $scope.getScope = function (node) {
                            if (node) {
                                return $scope.$globals[$scope.getHash(node)];
                            } else {
                                return $scope;
                            }
                        };

                        $scope.enableMove = function (val) {
                            if ((typeof val) === "boolean") {
                                $scope.enabledMove = val;
                            } else {
                                $scope.enabledMove = true;
                            }
                        };

                        $scope.visible = function (node) {
                            if (node) {
                                return node.__visible__ ? node : $scope.visible($scope.tree_nodes[node.__parent_real__]);
                            }
                            return null;
                        };

                        if ($attrs.enableStatus) {
                            $scope.enabledStatus = false;

                            $scope.hideStatus = function () {
                                if ($scope.statusElm) {
                                    $scope.statusElm.addClass($scope.$class.hidden);
                                }
                            };

                            $scope.refreshStatus = function () {
                                if (!$scope.dragging) {
                                    return;
                                }

                                if ($scope.enabledStatus) {
                                    var statusElmOld = $scope.statusElm;
                                    if ($scope.enabledMove) {
                                        $scope.statusElm = angular.element($TreeDnDTemplate.getMove($scope));
                                    } else {
                                        $scope.statusElm = angular.element($TreeDnDTemplate.getCopy($scope));
                                    }

                                    if (statusElmOld !== $scope.statusElm) {
                                        if (statusElmOld) {
                                            $scope.statusElm.attr('class', statusElmOld.attr('class'));
                                            $scope.statusElm.attr('style', statusElmOld.attr('style'));
                                            statusElmOld.remove();
                                        }
                                        $document.find('body').append($scope.statusElm);

                                    }

                                    $scope.statusElm.removeClass($scope.$class.hidden);
                                }
                            };

                            $scope.setPositionStatus = function (e, _scope) {
                                if ($scope.statusElm) {
                                    $scope.statusElm.css(
                                        {
                                            'left':    e.pageX + 10 + 'px',
                                            'top':     e.pageY + 15 + 'px',
                                            'z-index': 9999
                                        }
                                    );
                                    $scope.statusElm.addClass($scope.$class.status);
                                }
                            };

                        } else {
                            $scope.enabledStatus = null;
                        }

                        $scope.initPlace = function (element, dragElm) {

                            var tagName = null,
                                isTable = false;

                            if (element) {
                                tagName = element.prop('tagName').toLowerCase();
                                isTable = (tagName === 'tr' || tagName === 'td');
                            } else {
                                tagName = $scope.getElementChilds().prop('tagName').toLowerCase();
                                isTable = (tagName === 'tbody' || tagName === 'table');
                            }

                            if (!$scope.placeElm) {

                                if (isTable) {
                                    $scope.placeElm = angular.element($window.document.createElement('tr'));
                                    var _len_down = $scope.colDefinitions.length;
                                    $scope.placeElm.append(
                                        angular.element($window.document.createElement('td'))
                                            .addClass($scope.$class.empty)
                                            .addClass('indented')
                                            .addClass($scope.$class.place)
                                    );
                                    while (_len_down-- > 0) {
                                        $scope.placeElm.append(
                                            angular.element($window.document.createElement('td'))
                                                .addClass($scope.$class.empty)
                                                .addClass($scope.$class.place)
                                        );
                                    }
                                } else {
                                    $scope.placeElm = angular.element($window.document.createElement('li'))
                                        .addClass($scope.$class.empty)
                                        .addClass($scope.$class.place);
                                }

                            }

                            if (dragElm) {
                                $scope.placeElm.css('height', $TreeDnDHelper.height(dragElm) + 'px');
                            }

                            if (element) {
                                element[0].parentNode.insertBefore($scope.placeElm[0], element[0]);
                            } else {
                                $scope.getElementChilds().append($scope.placeElm);
                            }

                            return $scope.placeElm;
                        };

                        $scope.hidePlace = function () {
                            if ($scope.placeElm) {
                                $scope.placeElm.addClass($scope.$class.hidden);
                            }
                        };

                        $scope.showPlace = function () {
                            if ($scope.placeElm) {
                                $scope.placeElm.removeClass($scope.$class.hidden);
                            }
                        };

                        $scope.$safeApply = function (fn) {
                            var phase = this.$root.$$phase;
                            if (phase === '$apply' || phase === '$digest') {
                                if (fn && (typeof(fn) === 'function')) {
                                    fn();
                                }
                            } else {
                                this.$apply(fn);
                            }
                        };

                        $scope.generateWatch = function (type, nameAttr, valDefault, nameScope, fnNotExist, fnAfter) {
                            nameScope = nameScope || nameAttr;
                            if (typeof type === 'string' || typeof type === 'array' || typeof type === 'object') {
                                if ($attrs[nameAttr]) {
                                    $scope.$watch(
                                        $attrs[nameAttr], function (val) {
                                            if ((typeof type === 'string' && typeof val === type) ||
                                                ((typeof type === 'array' || typeof type === 'object') && type.indexOf(typeof val) > -1)
                                            ) {
                                                $scope[nameScope] = val;
                                            } else {
                                                if (angular.isFunction(valDefault)) {
                                                    $scope[nameScope] = valDefault(val);
                                                } else {
                                                    $scope[nameScope] = valDefault;
                                                }
                                            }
                                            if (angular.isFunction(fnAfter)) {
                                                fnAfter($scope[nameScope]);
                                            }
                                        }, true
                                    );
                                } else {

                                    if (angular.isFunction(fnNotExist)) {
                                        $scope[nameScope] = fnNotExist();
                                    } else if (!angular.isUndefined(fnNotExist)) {
                                        $scope[nameScope] = fnNotExist;
                                    }
                                }
                            }
                        }

                    }],
                compile:    function compile(tElement, tAttrs, transclude) {
                    var $_Template = '',
                        _element = tElement.html().trim();
                    if (_element.length > 0) {
                        $_Template = _element;
                        tElement.html('');
                    }

                    return function fnPost(scope, element, attrs) {
                        var getExpandOn = function () {
                                if (scope.treeData.length) {
                                    var _firstNode = scope.treeData[0], _keys = Object.keys(_firstNode),
                                        _regex = new RegExp("^__([a-zA-Z0-9_\-]*)__$"),
                                        _len,
                                        i;
                                    // Auto get first field with type is string;
                                    for (i = 0, _len = _keys.length; i < _len; i++) {
                                        if (typeof (_firstNode[_keys[i]]) === 'string' && !_regex.test(_keys[i])) {
                                            scope.expandingProperty = _keys[i];
                                            return;
                                        }
                                    }

                                    // Auto get first
                                    if (angular.isUndefinedOrNull(scope.expandingProperty)) {
                                        scope.expandingProperty = _keys[0];
                                    }

                                }
                            },
                            getColDefs = function () {
                                // Auto get Defs except attribute __level__ ....
                                if (scope.treeData.length) {
                                    var _col_defs = [], _firstNode = scope.treeData[0],
                                        _regex = new RegExp("(^__([a-zA-Z0-9_\-]*)__$|^" + scope.expandingProperty + "$)"),
                                        _keys = Object.keys(_firstNode),
                                        i, _len;
                                    // Auto get first field with type is string;
                                    for (i = 0, _len = _keys.length; i < _len; i++) {
                                        if (typeof (_firstNode[_keys[i]]) === 'string' && !_regex.test(_keys[i])) {
                                            _col_defs.push(
                                                {
                                                    field: _keys[i]
                                                }
                                            );
                                        }
                                    }
                                    scope.colDefinitions = _col_defs;
                                }
                            },
                            do_f = function (root, node, parent, parent_real, level, visible, index) {
                                var _i, _len, _icon, _index_real, _dept, _hashKey;
                                if (!angular.isArray(node.__children__)) {
                                    node.__children__ = [];
                                }

                                node.__parent_real__ = parent_real;
                                node.__parent__ = parent;
                                _len = node.__children__.length;

                                if (angular.isUndefinedOrNull(node.__expanded__) && _len > 0) {
                                    node.__expanded__ = level < scope.expandLevel;
                                }

                                if (_len === 0) {
                                    _icon = -1;
                                } else {
                                    if (node.__expanded__) {
                                        _icon = 1;
                                    } else {
                                        _icon = 0;
                                    }
                                }
                                // Insert item vertically
                                _index_real = root.length;
                                node.__index__ = index;
                                node.__index_real__ = _index_real;
                                node.__level__ = level;
                                node.__icon__ = _icon;
                                node.__visible__ = visible;

                                if (angular.isUndefinedOrNull(node.__uid__)) {
                                    node.__uid__ = "" + Math.random();
                                }

                                root.push(node);

                                // Check node children
                                _dept = 1;
                                if (_len > 0) {
                                    for (_i = 0; _i < _len; _i++) {
                                        _dept += do_f(
                                            root,
                                            node.__children__[_i],
                                            (scope.primary_key === '__uid__') ? node.__uid__ : node[scope.primary_key],
                                            _index_real,
                                            level + 1,
                                            visible && node.__expanded__,
                                            _i
                                        );
                                    }
                                }

                                _hashKey = scope.getHash(node);

                                if (angular.isUndefinedOrNull(node.__hashKey__) || node.__hashKey__ !== _hashKey) {
                                    node.__hashKey__ = _hashKey;
                                    // delete(scope.$globals[_hashKey]);
                                }

                                node.__dept__ = _dept;

                                return _dept;
                            },
                            reload_data = function () {
                                var _data = scope.treeData,
                                    _len = _data.length,
                                    _tree_nodes = [];

                                if (!attrs.expandOn) {
                                    getExpandOn();
                                }

                                if (!attrs.columnDefs) {
                                    getColDefs();
                                }

                                if (!angular.isUndefinedOrNull(scope.orderBy)) {
                                    _data = $TreeDnDOrderBy(_data, scope.orderBy);
                                }

                                if (!angular.isUndefinedOrNull(scope.filter)) {
                                    _data = $TreeDnDFilter(_data, scope.filter, scope.filterOptions);
                                }

                                if (_len > 0) {
                                    var _i,
                                        _offset, _max, _min, _keys,
                                        _deptTotal = 0;

                                    for (_i = 0; _i < _len; _i++) {
                                        _deptTotal += do_f(_tree_nodes, _data[_i], null, null, 1, true, _i);
                                    }

                                    // clear Element Empty
                                    _keys = Object.keys(scope.$globals);
                                    _len = scope.$globals.length;
                                    _offset = _len - _deptTotal;

                                    if (_offset !== 0) {
                                        _max = _len - _offset;
                                        _min = _max - Math.abs(_offset);
                                        for (_i = _min; _i < _max; _i++) {
                                            delete(scope.$globals[_keys[_i]]);
                                        }
                                    }
                                }
                                scope.tree_nodes = _tree_nodes;

                                return scope.tree_nodes;
                            },
                            _defaultFilterOption = {
                                showParent: true,
                                showChild:  false
                            },
                            _watches = [
                                ['boolean', 'enableStatus', null, 'enabledStatus'],
                                ['boolean', 'enableMove', null, 'enabledMove'],
                                ['boolean', 'horizontal', null],
                                [['object', 'string', 'array', 'function'], 'orderBy', attrs.orderBy],
                                ['string', 'primaryKey', attrs.primaryKey, 'primary_key', '__uid__'],
                                ['string', 'indentUnit', attrs.indentUnit, 'indent_unit'],
                                [
                                    'boolean', 'enableCollapse',
                                    (typeof attrs.enableCollapse) === "boolean" ? attrs.enableCollapse : null,
                                    'enabledCollapse'
                                ],
                                [
                                    'boolean', 'enableDrag',
                                    (typeof attrs.enableDrag) === "boolean" ? attrs.enableDrag : null
                                    , 'dragEnabled'
                                ],
                                [
                                    'boolean', 'enableDrop',
                                    (typeof attrs.enableDrop) === "boolean" ? attrs.enableDrop : null,
                                    'dropEnabled'
                                ],

                                [
                                    'number', 'dragBorder',
                                    (typeof attrs.dragBorder) === "number" ? attrs.dragBorder : null
                                ],

                                ['number', 'indent', (typeof attrs.indent) === "number" ? attrs.indent : 0],
                                [
                                    'number', 'indentPlus',
                                    (typeof attrs.indentPlus) === "number" ? attrs.indentPlus : 0, 'indent_plus'],
                                ['number', 'dragDelay', (typeof attrs.dragDelay) === "number" ? attrs.dragDelay : 0],
                                [
                                    'null', 'callbacks',
                                    function (optCallbacks) {
                                        angular.forEach(
                                            optCallbacks, function (value, key) {
                                                if (typeof value === "function") {
                                                    if (scope.$callbacks[key]) {
                                                        scope.$callbacks[key] = value;
                                                    }
                                                }
                                            }
                                        )
                                        return scope.$callbacks;
                                    },
                                    '$callbacks'
                                ],
                                [
                                    'boolean', 'enableHotkey', null, 'enabledHotkey', null, function (isHotkey) {
                                    if (isHotkey) {
                                        scope.enabledMove = false;
                                    } else {
                                        scope.enabledMove = scope.statusMove;
                                    }
                                }],
                                [['object', 'string'], 'expandOn', getExpandOn, 'expandingProperty', getExpandOn],
                                [['array', 'object'], 'columnDefs', getColDefs, 'colDefinitions', getColDefs],

                                [
                                    'string', 'templateCopy', attrs.templateCopy, 'templateCopy', null,
                                    function (_url) {
                                        if (_url && $templateCache.get(_url)) {
                                            $TreeDnDTemplate.setCopy(_url, scope);
                                        }
                                    }],

                                [
                                    'string', 'templateMove', attrs.templateMove, 'templateMove', null,
                                    function (_url) {
                                        if (_url && $templateCache.get(_url)) {
                                            $TreeDnDTemplate.setMove(_url, scope);
                                        }
                                    }],
                                [
                                    ['object', 'array'], 'filter', null, 'filter', null, function (filters) {
                                    var _passed = false;
                                    if (angular.isObject(filters) && !angular.isArray(filters)) {
                                        var _keysF = Object.keys(filters),
                                            _lenF = _keysF.length, _iF;
                                            _first = true;

                                        if (_lenF > 0) {
                                            for (_iF = 0; _iF < _lenF; _iF++) {

                                                if ((typeof filters[_keysF[_iF]]) === 'string' && filters[_keysF[_iF]].length === 0) {
                                                    continue;
                                                }
                                                _passed = true;
                                                break;
                                            }
                                        }
                                    }

                                    scope.enabledFilter = _passed;
                                    reload_data();
                                }],
                                [
                                    'object', 'filterOptions', _defaultFilterOption, 'filterOptions',
                                    _defaultFilterOption, function (option) {
                                    if (typeof option === "object") {
                                        scope.filterOptions = angular.extend(_defaultFilterOption, option);
                                    }
                                }],
                                [
                                    'number', 'expandLevel', 3, 'expandLevel', 3, function () {
                                    reload_data();
                                }]
                            ], w, lenW = _watches.length,
                            _typeW, _nameW, _defaultW, _scopeW, _NotW, _AfterW;

                        for (w = 0; w < lenW; w++) {
                            _typeW = _watches[w][0];
                            _nameW = _watches[w][1];
                            _defaultW = _watches[w][2];
                            _scopeW = _watches[w][3];
                            _NotW = _watches[w][4];
                            _AfterW = _watches[w][5];
                            scope.generateWatch(_typeW, _nameW, _defaultW, _scopeW, _NotW, _AfterW);
                        }

                        if (attrs.treeData) {
                            var _first = true,
                                fnWatchTreeData = function () {
                                    var unWatchTreeData = scope.$watch(
                                        attrs.treeData, function (val, oldValue) {
                                            if (!angular.equals(val, oldValue) || _first) {
                                                if (typeof val === 'object' || typeof val === 'array') {
                                                    scope.treeData = val;
                                                } else {
                                                    scope.treeData = [];
                                                }

                                                unWatchTreeData();
                                                _first = false;
                                                reload_data();
                                                fnWatchTreeData();
                                            }
                                        }, true
                                    );
                                }
                            fnWatchTreeData();
                        }

                        if (attrs.treeClass) {
                            if (/^(\s+[\w\-]+){2,}$/g.test(" " + attrs.treeClass)) {
                                scope.$tree_class = attrs.treeClass.trim();
                            } else {
                                scope.$watch(
                                    attrs.treeClass, function (val) {
                                        switch (typeof val) {
                                            case 'string':
                                                scope.$tree_class = val;
                                                break;
                                            case 'object':
                                                angular.extend(scope.$class, val);
                                                scope.$tree_class = scope.$class.tree;
                                                break;
                                            default:
                                                scope.$tree_class = attrs.treeClass;
                                                break;
                                        }
                                    }
                                );
                            }
                        }else{
                            scope.$tree_class = scope.$class.tree + ' table';
                        }

                        // End watch
                        //

                        scope.getElementChilds = function () {
                            return angular.element(element[0].querySelector('[tree-dnd-nodes]'));
                        };

                        scope.$class = angular.copy($TreeDnDClass);

                        var n, tree;

                        angular.extend(
                            scope.$class.icon, {
                                '1':  attrs.iconExpand || 'glyphicon glyphicon-minus',
                                '0':  attrs.iconCollapse || 'glyphicon glyphicon-plus',
                                '-1': attrs.iconLeaf || 'glyphicon glyphicon-file'
                            }
                        );

                        if (!scope.treeData) {
                            scope.treeData = [];
                        }

                        scope.onClick = function (node) {
                            if (angular.isFunction(scope.on_click)) {
                                $timeout(
                                    function () {
                                        scope.on_click({node: node});
                                    }
                                );
                            }
                        };

                        scope.onSelect = function (node) {
                            if (node !== tree.selected_node) {
                                tree.select_node(node);
                            }
                        };

                        if (!scope.tree || !angular.isObject(scope.tree)) {
                            scope.tree = {};
                        }
                        tree = {
                            selected_node:                     null,
                            for_all_descendants:               scope.for_all_descendants,
                            select_node:                       function (node) {
                                if (!node) {
                                    if (tree.selected_node) {
                                        delete(tree.selected_node.__selected__);
                                    }
                                    tree.selected_node = null;
                                    return null;
                                }

                                if (node !== tree.selected_node) {
                                    if (tree.selected_node) {
                                        delete(tree.selected_node.__selected__);
                                    }
                                    node.__selected__ = true;
                                    tree.selected_node = node;
                                    tree.expand_all_parents(node);
                                    if (angular.isFunction(scope.on_select)) {
                                        $timeout(
                                            function () {
                                                scope.on_select({node: node});
                                            }
                                        );
                                    }
                                }
                                return node;
                            },
                            deselect_node:                     function () {
                                var node = null;
                                if (tree.selected_node) {
                                    delete(tree.selected_node.__selected__);
                                    node = tree.selected_node;
                                    tree.selected_node = null;
                                }
                                return node;
                            },
                            get_parent:                        function (node) {
                                if (node && node.__parent_real__ !== null) {
                                    return scope.tree_nodes[node.__parent_real__];
                                }
                                return null;
                            },
                            for_all_ancestors:                 function (child, fn) {
                                var parent;
                                parent = tree.get_parent(child);
                                if (parent) {
                                    if (fn(parent)) {
                                        return false;
                                    }

                                    return tree.for_all_ancestors(parent, fn);
                                }
                                return true;
                            },
                            expand_all_parents:                function (child) {
                                return tree.for_all_ancestors(
                                    child, function (node) {
                                        node.__expanded__ = true;
                                    }
                                );
                            },
                            reload_data:                       function () {
                                return reload_data();
                            },
                            add_node:                          function (parent, new_node, index) {
                                if ((typeof index) !== "number") {
                                    if (parent) {
                                        parent.__children__.push(new_node);
                                        parent.__expanded__ = true;
                                    } else {
                                        scope.treeData.push(new_node);
                                    }
                                } else {
                                    if (parent) {
                                        parent.__children__.splice(index, 0, new_node);
                                        parent.__expanded__ = true;
                                    } else {
                                        scope.treeData.splice(index, 0, new_node);
                                    }
                                }
                                return new_node;
                            },
                            add_node_root:                     function (new_node) {
                                tree.add_node(null, new_node);
                                return new_node;
                            },
                            expand_all:                        function () {
                                var i = 0,
                                    len = scope.treeData.length,
                                    fnCallback = function (node) {
                                        node.__expanded__ = true;
                                    };
                                for (i = 0; i < len; i++) {
                                    tree.for_all_descendants(
                                        scope.treeData[i], fnCallback
                                    );
                                }
                            },
                            collapse_all:                      function () {
                                var i = 0,
                                    len = scope.treeData.length,
                                    fnCallback = function (node) {
                                        node.__expanded__ = false;
                                    };
                                for (i = 0; i < len; i++) {
                                    tree.for_all_descendants(
                                        scope.treeData[i], fnCallback
                                    );
                                }
                            },
                            remove_node:                       function (node) {
                                node = node || tree.selected_node;
                                if (node) {
                                    var parent;
                                    if (node.__parent_real__) {
                                        parent = tree.get_parent(node).__children__;
                                    } else {
                                        parent = scope.treeData;
                                    }

                                    parent.splice(node.__index__, 1);

                                    if (tree.selected_node === node) {
                                        tree.selected_node = null;
                                    }
                                }
                            },
                            expand_node:                       function (node) {
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    node.__expanded__ = true;
                                    return node;
                                }
                            },
                            collapse_node:                     function (node) {
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    node.__expanded__ = false;
                                    return node;
                                }
                            },
                            get_selected_node:                 function () {
                                return tree.selected_node;
                            },
                            get_first_node:                    function () {
                                n = scope.treeData.length;
                                if (n > 0) {
                                    return scope.treeData[0];
                                }
                                return null;
                            },
                            get_children:                      function (node) {
                                return node.__children__;
                            },
                            get_siblings:                      function (node) {
                                var p, siblings;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    p = tree.get_parent(node);
                                    if (p) {
                                        siblings = p.__children__;
                                    } else {
                                        siblings = scope.treeData;
                                    }
                                    return siblings;
                                }
                            },
                            get_next_sibling:                  function (node) {
                                var siblings;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    siblings = tree.get_siblings(node);
                                    n = siblings.length;
                                    if (node.__index__ < n) {
                                        return siblings[node.__index__ + 1];
                                    }
                                }
                            },
                            get_prev_sibling:                  function (node) {
                                var siblings;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                siblings = tree.get_siblings(node);
                                if (node.__index__ > 0) {
                                    return siblings[node.__index__ - 1];
                                }
                            },
                            get_first_child:                   function (node) {
                                var _ref;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    if (((_ref = node.__children__) ? _ref.length : void 0) > 0) {
                                        return node.__children__[0];
                                    }
                                }
                                return null;
                            },
                            get_closest_ancestor_next_sibling: function (node) {
                                var next, parent;
                                next = tree.get_next_sibling(node);
                                if (next) {
                                    return next;
                                } else {
                                    parent = tree.get_parent(node);
                                    return tree.get_closest_ancestor_next_sibling(parent);
                                }
                            },
                            get_next_node:                     function (node) {
                                var next;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    next = tree.get_first_child(node);
                                    if (next) {
                                        return next;
                                    } else {
                                        return tree.get_closest_ancestor_next_sibling(node);
                                    }
                                }
                            },
                            get_prev_node:                     function (node) {
                                var parent, prev_sibling;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    prev_sibling = tree.get_prev_sibling(node);
                                    if (prev_sibling) {
                                        return tree.get_last_descendant(prev_sibling);
                                    } else {
                                        parent = tree.get_parent(node);
                                        return parent;
                                    }
                                }
                            },
                            get_last_descendant:               function (node) {
                                var last_child;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                n = node.__children__.length;
                                if (n === 0) {
                                    return node;
                                } else {
                                    last_child = node.__children__[n - 1];
                                    return tree.get_last_descendant(last_child);
                                }
                            },
                            select_parent_node:                function (node) {
                                var p;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    p = tree.get_parent(node);
                                    if (p) {
                                        return tree.select_node(p);
                                    }
                                }
                            },
                            select_first_node:                 function () {
                                return tree.select_node(tree.get_first_node());
                            },
                            select_next_sibling:               function (node) {
                                var next;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    next = tree.get_next_sibling(node);
                                    if (next) {
                                        return tree.select_node(next);
                                    }
                                }
                            },
                            select_prev_sibling:               function (node) {
                                var prev;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    prev = tree.get_prev_sibling(node);
                                    if (prev) {
                                        return tree.select_node(prev);
                                    }
                                }
                            },
                            select_next_node:                  function (node) {
                                var next;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    next = tree.get_next_node(node);
                                    if (next) {
                                        return tree.select_node(next);
                                    }
                                }
                            },
                            select_prev_node:                  function (node) {
                                var prev;
                                if (!node) {
                                    node = tree.selected_node;
                                }
                                if (node) {
                                    prev = tree.get_prev_node(node);
                                    if (prev) {
                                        return tree.select_node(prev);
                                    }
                                }
                            }
                        };
                        angular.extend(scope.tree, tree);
                        tree = scope.tree;

                        var hasTouch = 'ontouchstart' in window,
                            startPos, firstMoving, dragInfo, pos,
                            placeElm, dragElm,
                            dragDelaying = true, dragStarted = false, dragTimer = null,
                            body = document.body, html = document.documentElement,
                            document_height, document_width,
                            offsetEdge,
                            dragStart = function (e) {
                                if (!hasTouch && (e.button === 2 || e.which === 3)) {
                                    // disable right click
                                    return;
                                }
                                if (e.uiTreeDragging || (e.originalEvent && e.originalEvent.uiTreeDragging)) { // event has already fired in other scope.
                                    return;
                                }
                                // the element which is clicked.
                                var eventElm = angular.element(e.target),
                                    eventScope = eventElm.scope();

                                if (!eventScope || !eventScope.$type) {
                                    return;
                                }
                                // if (eventScope.$type !== 'TreeDnDNode') { // Check if it is a node or a handle
                                //     return;
                                // }

                                if (eventScope.$type !== 'TreeDnDNodeHandle') { // If the node has a handle, then it should be clicked by the handle
                                    return;
                                }

                                var eventElmTagName = eventElm.prop('tagName').toLowerCase(),
                                    dragScope = null;
                                if (eventElmTagName === 'input'
                                    || eventElmTagName === 'textarea'
                                    || eventElmTagName === 'button'
                                    || eventElmTagName === 'select') { // if it's a input or button, ignore it
                                    return;
                                }
                                // check if it or it's parents has a 'data-nodrag' attribute
                                while (eventElm && eventElm[0] && eventElm[0] !== element) {
                                    if ($TreeDnDHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                                        return;
                                    }
                                    eventElm = eventElm.parent();
                                }

                                e.uiTreeDragging = true; // stop event bubbling
                                if (e.originalEvent) {
                                    e.originalEvent.uiTreeDragging = true;
                                }
                                e.preventDefault();

                                dragScope = eventScope.getScopeNode();

                                firstMoving = true;

                                if (!scope.$callbacks.beforeDrag(dragScope)) {
                                    return;
                                }

                                var eventObj = $TreeDnDHelper.eventObj(e),
                                    tagName = dragScope.$element.prop('tagName').toLowerCase(),
                                    isTable = (tagName === 'tr');

                                dragInfo = $TreeDnDHelper.dragInfo(dragScope);

                                scope.setDragging(dragInfo);

                                pos = $TreeDnDHelper.positionStarted(eventObj, dragScope.$element);

                                if (isTable) {
                                    dragElm = angular.element($window.document.createElement('table'))
                                        .addClass(scope.$class.tree)
                                        .addClass(scope.$class.drag)
                                        .addClass(scope.$tree_class);
                                } else {
                                    dragElm = angular.element($window.document.createElement('ul'))
                                        .addClass(scope.$class.drag)
                                        .addClass('tree-dnd-nodes')
                                        .addClass(scope.$tree_class);
                                }

                                dragElm.css(
                                    {
                                        'width':   $TreeDnDHelper.width(dragScope.$element) + 'px',
                                        'z-index': 9995
                                    }
                                );

                                offsetEdge = 0;
                                var _width = $TreeDnDHelper.width(dragScope.$element),
                                    _scope = dragScope,
                                    _element = _scope.$element,
                                    _clone = null,
                                    _needCollapse = scope.enabledCollapse,
                                    _copied = false,
                                    _tbody = null;

                                if (isTable) {
                                    offsetEdge = dragInfo.node.__level__ - 1;
                                    _tbody = angular.element($window.document.createElement('tbody'));

                                    scope.for_all_descendants(
                                        dragInfo.node, function (_node) {
                                            _scope = scope.getScope(_node);
                                            _element = _scope.$element;

                                            if (!_copied) {
                                                _clone = _element.clone();

                                                $TreeDnDHelper.replaceIndent(
                                                    _scope,
                                                    _clone,
                                                    _node.__level__ - offsetEdge,
                                                    'padding-left'
                                                );

                                                _tbody.append(_clone);

                                                // skip all, just clone parent
                                                if (_needCollapse) {
                                                    _copied = true;
                                                }
                                            }

                                            if (scope.enabledMove && scope.$class.hidden) {
                                                _element.addClass(scope.$class.hidden);
                                            }
                                        }
                                    );

                                    dragElm.append(_tbody);
                                } else {

                                    if (!_needCollapse) {
                                        _clone = _element.clone();
                                    } else {
                                        var _holder = _scope.getElementChilds(),
                                            _swaper = angular.element("<swaped />");

                                        // Insert tag `<holder>` & move _holder into tag `<swaper>`;
                                        _holder.after(angular.element("<holder />"));
                                        _swaper.append(_holder);

                                        // Clone without Children & remove tag `<holder>`
                                        _clone = _element.clone();
                                        _clone.find("holder").remove();

                                        // bring childs back frome `swaper` & remove tag `<swaper>`
                                        _element.find("holder").replaceWith(_holder);

                                        // Reset & clear all;
                                        _swaper.remove();
                                        _holder = null;
                                    }

                                    dragElm.append(_clone);
                                    if (scope.enabledMove && scope.$class.hidden) {
                                        _element.addClass(scope.$class.hidden);
                                    }
                                }

                                dragElm.css(
                                    {
                                        'left': eventObj.pageX - pos.offsetX + scope.$callbacks.calsIndent(
                                            offsetEdge + 1,
                                            true,
                                            true
                                        )       + 'px',
                                        'top':  eventObj.pageY - pos.offsetY + 'px'
                                    }
                                );
                                // moving item with descendant
                                $document.find('body').append(dragElm);
                                if (scope.$callbacks.droppable()) {
                                    placeElm = scope.initPlace(dragScope.$element, dragElm);

                                    if (isTable) {
                                        $TreeDnDHelper.replaceIndent(scope, placeElm, dragInfo.node.__level__);
                                    }

                                    placeElm.css('width', _width);
                                }

                                scope.showPlace();
                                scope.targeting = true;

                                if (scope.enabledStatus) {
                                    scope.refreshStatus();
                                    scope.setPositionStatus(e);
                                }

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
                                    body.scrollWidth,
                                    body.offsetWidth,
                                    html.clientWidth,
                                    html.scrollWidth,
                                    html.offsetWidth
                                );
                            },
                            dragMove = function (e) {
                                if (!dragStarted) {
                                    if (!dragDelaying) {
                                        dragStarted = true;
                                        scope.$safeApply(
                                            function () {
                                                scope.$callbacks.dragStart(dragInfo);
                                            }
                                        );
                                    }
                                    return;
                                }

                                if (dragElm) {
                                    e.preventDefault();
                                    if ($window.getSelection) {
                                        $window.getSelection().removeAllRanges();
                                    } else if ($window.document.selection) {
                                        $window.document.selection.empty();
                                    }

                                    var eventObj = $TreeDnDHelper.eventObj(e),
                                        prev,
                                        leftElmPos = eventObj.pageX - pos.offsetX,
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
                                            'left': leftElmPos + scope.$callbacks.calsIndent(
                                                offsetEdge + 1,
                                                true,
                                                true
                                            )       + 'px',
                                            'top':  topElmPos + 'px'
                                        }
                                    );

                                    if (scope.enabledStatus) {
                                        scope.setPositionStatus(e);
                                    }

                                    var top_scroll = window.pageYOffset || $window.document.documentElement.scrollTop,
                                        bottom_scroll = top_scroll + (window.innerHeight || $window.document.clientHeight || $window.document.clientHeight);
                                    // to scroll down if cursor y-position is greater than the bottom position the vertical scroll
                                    if (bottom_scroll < eventObj.pageY && bottom_scroll <= document_height) {
                                        window.scrollBy(0, 10);
                                    }
                                    // to scroll top if cursor y-position is less than the top position the vertical scroll
                                    if (top_scroll > eventObj.pageY) {
                                        window.scrollBy(0, -10);
                                    }

                                    $TreeDnDHelper.positionMoved(e, pos, firstMoving);

                                    if (firstMoving) {
                                        firstMoving = false;
                                        return;
                                    }
                                    // check if add it as a child node first

                                    var targetX = eventObj.pageX - $window.document.body.scrollLeft,
                                        targetY = eventObj.pageY - (window.pageYOffset || $window.document.documentElement.scrollTop),

                                        targetElm = null,
                                        targetScope = null,
                                        targetBefore = null,
                                        targetOffset = null,
                                        tagName = null,
                                        isTable = false,
                                        isChanged = true,
                                        isVeritcal = true,
                                        isEmpty = false,
                                        isSwapped = false,
                                        _scope = null,
                                        _target = null,
                                        _move = dragInfo.move,
                                        _level = 1,
                                        _drag = dragInfo.node,
                                        _drop = dragInfo.drop,
                                        treeScope = dragInfo.target,
                                        fnSwapTree = null,
                                        isHolder = false,
                                        fnPlaceHolder = function () {
                                            if (placeElm) {
                                                var _offset = $TreeDnDHelper.offset(placeElm);
                                                if (_offset.top <= e.pageY && e.pageY <= _offset.top + _offset.height &&
                                                    _offset.left <= e.pageX && e.pageX <= _offset.left + _offset.width
                                                ) {
                                                    isHolder = true;
                                                } else {
                                                    isHolder = false;
                                                }
                                            }
                                        };
                                    fnPlaceHolder();
                                    if (!isHolder) {

                                        // when using elementFromPoint() inside an iframe, you have to call
                                        // elementFromPoint() twice to make sure IE8 returns the correct value
                                        // $window.document.elementFromPoint(targetX, targetY);

                                        targetElm = angular.element(
                                            $window.document.elementFromPoint(
                                                targetX,
                                                targetY
                                            )
                                        );

                                        targetScope = targetElm.scope();
                                        if (!targetScope) {
                                            return;
                                        }

                                        fnSwapTree = function () {
                                            treeScope = targetScope.getScopeTree();
                                            _target = dragInfo.target;
                                            if (dragInfo.target !== treeScope) {
                                                if (treeScope.$callbacks.droppable()) {
                                                    // Replace by place-holder new
                                                    _target.hidePlace();
                                                    _target.targeting = false;
                                                    treeScope.targeting = true;

                                                    dragInfo.target = treeScope;
                                                    placeElm = treeScope.initPlace(targetScope.$element, dragElm);

                                                    _target = null;
                                                    isSwapped = true;
                                                } else {
                                                    // Not allowed Drop Item
                                                    return false;
                                                }
                                            }
                                            return true;
                                        };

                                        if (angular.isFunction(targetScope.getScopeNode)) {
                                            targetScope = targetScope.getScopeNode();
                                            if (!fnSwapTree()) {
                                                return;
                                            }
                                        } else {
                                            if (targetScope.$type === 'TreeDnDNodes' || targetScope.$type === 'TreeDnD') {
                                                if (targetScope.tree_nodes) {
                                                    if (targetScope.tree_nodes.length === 0) {
                                                        if (!fnSwapTree()) {
                                                            return;
                                                        }
                                                        // Empty
                                                        isEmpty = true;
                                                    }
                                                } else {
                                                    return;
                                                }
                                            } else {
                                                return;
                                            }
                                        }
                                    }

                                    if (pos.dirAx && !isSwapped || isHolder) {
                                        isVeritcal = false;
                                        targetScope = dragInfo.scope;
                                    }

                                    if (!targetScope.$element && !targetScope) {
                                        return;
                                    }

                                    if (isEmpty) {
                                        tagName = targetScope.$element.prop('tagName').toLowerCase();
                                        isTable = (tagName === 'tbody' || tagName === 'table' || tagName === 'tr' || tagName === 'td');

                                        _move.parent = null;
                                        _move.pos = 0;

                                        _drop = null;
                                    } else {
                                        tagName = targetScope.$element.prop('tagName').toLowerCase();
                                        isTable = (tagName === 'tr' || tagName === 'tbody' || tagName === 'td');

                                        // move vertical
                                        if (isVeritcal) {
                                            targetElm = targetScope.$element; // Get the element of tree-dnd-node

                                            targetOffset = $TreeDnDHelper.offset(targetElm);

                                            if (targetScope.horizontal && !isTable) {
                                                targetBefore = eventObj.pageX < (targetOffset.left + $TreeDnDHelper.width(targetElm) / 2);
                                            } else {
                                                if (isTable) {
                                                    targetBefore = eventObj.pageY < (targetOffset.top + $TreeDnDHelper.height(targetElm) / 2);
                                                } else {
                                                    var _height = $TreeDnDHelper.height(targetElm)
                                                    if (targetScope.getElementChilds()) {
                                                        _height -= -$TreeDnDHelper.height(targetScope.getElementChilds());
                                                    }

                                                    if (eventObj.pageY > targetOffset.top + _height) {
                                                        return;
                                                    }

                                                    targetBefore = eventObj.pageY < (targetOffset.top + _height / 2);
                                                }
                                            }

                                            _target = targetScope.getData();
                                            _parent = targetScope.getNode(_target.__parent_real__);

                                            if (targetBefore) {
                                                var _prev = targetScope.getPrevSibling(_target);

                                                _move.parent = _parent;
                                                _move.pos = (angular.isUndefinedOrNull(_prev)) ? 0 : _prev.__index__ + 1;

                                                _drop = _prev;
                                            } else {
                                                if (_target.__expanded__ && !(_target.__children__.length === 1 && _target.__index_real__ === _drag.__parent_real__)) {

                                                    _move.parent = _target;
                                                    _move.pos = 0;
                                                    _drop = null;
                                                } else {

                                                    _move.parent = _target;
                                                    _move.pos = _target.__index__ + 1;

                                                    _drop = _target;
                                                }
                                            }
                                        } else {
                                            // move horizontal
                                            if (pos.dirAx && pos.distAxX >= treeScope.dragBorder) {
                                                pos.distAxX = 0;
                                                // increase horizontal level if previous sibling exists and is not collapsed
                                                if (pos.distX > 0) {
                                                    _parent = _drop;
                                                    if (!_parent) {
                                                        if (_move.pos - 1 >= 0) {
                                                            _parent = _move.parent.__children__[_move.pos - 1];
                                                        } else {
                                                            return;
                                                        }
                                                    }

                                                    if (dragInfo.drag === dragInfo.target && _parent === _drag && scope.enabledMove) {
                                                        _parent = treeScope.getPrevSibling(_parent);
                                                    }

                                                    if (_parent && _parent.__visible__) {
                                                        var _len = _parent.__children__.length;

                                                        _move.parent = _parent;
                                                        _move.pos = _len;

                                                        if (_len > 0) {
                                                            _drop = _parent.__children__[_len - 1];
                                                        } else {
                                                            _drop = null;
                                                        }
                                                    } else {
                                                        // Not changed
                                                        return;
                                                    }
                                                } else if (pos.distX < 0) {
                                                    _target = _move.parent;
                                                    if (_target &&
                                                        (_target.__children__.length === 0 ||
                                                         _target.__children__.length - 1 < _move.pos ||
                                                         (_target.__children__.length - 1 === _drag.__index__ &&
                                                          _target.__index__real__ === _drag.__parent_real__ && scope.enabledMove))
                                                    ) {
                                                        _parent = treeScope.getNode(_target.__parent_real__);

                                                        _move.parent = _parent;
                                                        _move.pos = _target.__index__ + 1;

                                                        _drop = _target;
                                                    } else {
                                                        // Not changed
                                                        return;
                                                    }
                                                } else {
                                                    return;
                                                }
                                            } else {
                                                // limited
                                                return;
                                            }
                                        }
                                    }

                                    if (dragInfo.drag === dragInfo.target && _move.parent &&
                                        _drag.__parent_real__ === _move.parent.__index_real__ &&
                                        _drag.__index__ === _move.pos
                                    ) {
                                        isChanged = false;
                                    }

                                    if (treeScope.$callbacks.accept(dragInfo, _move, isChanged)) {
                                        dragInfo.move = _move;
                                        dragInfo.drop = _drop;
                                        dragInfo.changed = isChanged;
                                        dragInfo.scope = targetScope;

                                        if (isTable) {
                                            _level = (angular.isUndefinedOrNull(_move.parent)) ? 1 : _move.parent.__level__ + 1;

                                            $TreeDnDHelper.replaceIndent(
                                                treeScope,
                                                placeElm,
                                                _level
                                            );

                                            if (_drop) {
                                                var _parent = (_move.parent ? _move.parent.__children__ : null ) || dragInfo.target.treeData;

                                                if (_drop.__index__ < _parent.length - 1) {
                                                    // Find fast
                                                    _drop = _parent[_drop.__index__ + 1];
                                                    _scope = dragInfo.target.getScope(_drop);
                                                    _scope.$element[0].parentNode.insertBefore(
                                                        placeElm[0],
                                                        _scope.$element[0]
                                                    );
                                                } else {
                                                    _target = dragInfo.target.tree.get_last_descendant(_drop);
                                                    _scope = dragInfo.target.getScope(_target);
                                                    _scope.$element.after(placeElm);
                                                }
                                            } else {
                                                _scope = dragInfo.target.getScope(_move.parent);
                                                if (_scope) {
                                                    if (_move.parent) {
                                                        _scope.$element.after(placeElm);

                                                    } else {
                                                        _scope.getElementChilds().prepend(placeElm);
                                                    }
                                                }
                                            }
                                        } else {
                                            _scope = dragInfo.target.getScope(_drop || _move.parent);

                                            if (_drop) {
                                                _scope.$element.after(placeElm);
                                            } else {
                                                _scope.getElementChilds().prepend(placeElm);
                                            }
                                        }

                                        treeScope.showPlace();

                                        scope.$safeApply(
                                            function () {
                                                scope.$callbacks.dragMove(dragInfo);
                                            }
                                        );
                                    }

                                }
                            },
                            dragEnd = function (e) {
                                e.preventDefault();
                                if (dragElm) {
                                    var _passed = false,
                                        _scope = scope.getScope(dragInfo.node),
                                        tagName = _scope.$element.prop('tagName').toLowerCase(),
                                        _isTable = (tagName === 'tr'),
                                        _element = _scope.$element;

                                    scope.$safeApply(
                                        function () {
                                            _passed = scope.$callbacks.beforeDrop(dragInfo);
                                        }
                                    );

                                    // rollback all
                                    if (_isTable) {
                                        scope.for_all_descendants(
                                            dragInfo.node, function (_node) {
                                                _scope = scope.getScope(_node);
                                                _element = _scope.$element;

                                                if (_scope.$class.hidden) {
                                                    _element.removeClass(scope.$class.hidden);
                                                }
                                            }
                                        );
                                    } else {
                                        if (scope.$class.hidden) {
                                            _element.removeClass(scope.$class.hidden);
                                        }
                                    }
                                    dragElm.remove();
                                    dragElm = null;

                                    if (scope.enabledStatus) {
                                        scope.hideStatus();
                                    }

                                    var _status = false;
                                    if (scope.$$apply) {
                                        scope.$safeApply(
                                            function () {
                                                _status = scope.$callbacks.dropped(
                                                    dragInfo,
                                                    _passed,
                                                    scope.enabledMove
                                                );
                                            }
                                        );
                                    } else {
                                        bindDrag();
                                    }

                                    scope.$safeApply(
                                        function () {
                                            scope.$callbacks.dragStop(dragInfo, _status);
                                        }
                                    );

                                    dragInfo.target.hidePlace();
                                    dragInfo.target.targeting = false;

                                    dragInfo = null;
                                    scope.$$apply = false;
                                    scope.setDragging(null);
                                }
                                angular.element($document).unbind('touchend', dragEndEvent); // Mobile
                                angular.element($document).unbind('touchcancel', dragEndEvent); // Mobile
                                angular.element($document).unbind('touchmove', dragMoveEvent); // Mobile
                                angular.element($document).unbind('mouseup', dragEndEvent);
                                angular.element($document).unbind('mousemove', dragMoveEvent);
                                angular.element($window.document.body).unbind('mouseleave', dragCancelEvent);
                            },
                            dragStartEvent = function (e) {
                                if (scope.$callbacks.draggable()) {
                                    dragStart(e);
                                }
                            },
                            dragMoveEvent = function (e) {
                                dragMove(e);
                            },
                            dragEndEvent = function (e) {
                                scope.$$apply = true;
                                scope.dragEnd(e);
                            },
                            dragCancelEvent = function (e) {
                                scope.dragEnd(e);
                            },
                            bindDrag = function () {
                                element.bind(
                                    'touchstart mousedown', function (e) {
                                        dragDelaying = true;
                                        dragStarted = false;
                                        dragStartEvent(e);
                                        dragTimer = $timeout(
                                            function () {
                                                dragDelaying = false;
                                            }, scope.dragDelay
                                        );
                                    }
                                );
                                element.bind(
                                    'touchend touchcancel mouseup', function () {
                                        $timeout.cancel(dragTimer);
                                    }
                                );
                            },
                            keydownHandler = function (e) {
                                if (e.keyCode === 27) {
                                    if (scope.enabledStatus) {
                                        scope.hideStatus();
                                    }

                                    scope.$$apply = false;
                                    scope.dragEnd(e);
                                } else {
                                    if (scope.enabledHotkey && e.shiftKey) {
                                        scope.enableMove(true);
                                        if (scope.enabledStatus) {
                                            scope.refreshStatus();
                                        }

                                        if (!dragInfo) {
                                            return;
                                        }

                                        var _scope = scope.getScope(dragInfo.node),
                                            tagName = _scope.$element.prop('tagName').toLowerCase(),
                                            _element = _scope.$element;

                                        if (tagName === 'tr') {
                                            scope.for_all_descendants(
                                                dragInfo.node, function (_node) {
                                                    _scope = scope.getScope(_node);
                                                    _element = _scope.$element;

                                                    if (scope.$class.hidden) {
                                                        _element.addClass(scope.$class.hidden);
                                                    }
                                                }
                                            );
                                        } else {
                                            if (scope.$class.hidden) {
                                                _element.addClass(scope.$class.hidden);
                                            }
                                        }
                                    }
                                }
                            },
                            keyupHandler = function (e) {
                                if (scope.enabledHotkey && !e.shiftKey) {
                                    scope.enableMove(false);

                                    if (scope.enabledStatus) {
                                        scope.refreshStatus();
                                    }

                                    if (!dragInfo) {
                                        return;
                                    }

                                    var _scope = scope.getScope(dragInfo.node),
                                        tagName = _scope.$element.prop('tagName').toLowerCase(),
                                        _element = _scope.$element;

                                    if (tagName === 'tr') {
                                        scope.for_all_descendants(
                                            dragInfo.node, function (_node) {

                                                _scope = scope.getScope(_node);
                                                _element = _scope.$element;

                                                if (scope.$class.hidden) {
                                                    _element.removeClass(scope.$class.hidden);
                                                }
                                            }
                                        );
                                    } else {
                                        if (scope.$class.hidden) {
                                            _element.removeClass(scope.$class.hidden);
                                        }
                                    }
                                }
                            };

                        scope.dragEnd = function (e) {
                            dragEnd(e);
                        };

                        bindDrag();

                        angular.element($window.document.body).bind("keydown", keydownHandler);
                        angular.element($window.document.body).bind("keyup", keyupHandler);
                        //unbind handler that retains scope
                        scope.$on(
                            '$destroy', function () {
                                angular.element($window.document.body).unbind("keydown", keydownHandler);
                                angular.element($window.document.body).unbind("keyup", keyupHandler);
                                if (scope.statusElm) {
                                    scope.statusElm.remove();
                                }

                                if (scope.placeElm) {
                                    scope.placeElm.remove();
                                }
                            }
                        );

                        scope.$safeApply(
                            function () {
                                if ($_Template.length > 0) {
                                    element.append($compile($_Template)(scope));
                                } else {
                                    $http.get(
                                        attrs.templateUrl || $TreeDnDTemplate.getPath(),
                                        {cache: $templateCache}
                                    ).success(
                                        function (data) {
                                            element.append($compile(data.trim())(scope));
                                        }
                                    );
                                }
                            }
                        );
                    };
                }
            };
        }]
);