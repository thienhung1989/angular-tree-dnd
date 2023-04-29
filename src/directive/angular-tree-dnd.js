angular.module('ntt.TreeDnD')
    .directive('treeDnd', fnInitTreeDnD);

fnInitTreeDnD.$inject = [
    '$timeout', '$http', '$compile', '$parse', '$window', '$document', '$templateCache',
    '$TreeDnDTemplate', '$TreeDnDClass', '$TreeDnDHelper', '$TreeDnDPlugin', '$TreeDnDViewport'
];

function fnInitTreeDnD($timeout, $http, $compile, $parse, $window, $document, $templateCache,
                       $TreeDnDTemplate, $TreeDnDClass, $TreeDnDHelper, $TreeDnDPlugin, $TreeDnDViewport) {
    return {
        restrict: 'E',
        scope: true,
        replace: true,
        controller: ['$scope', '$element', '$attrs', fnController],
        compile: fnCompile
    };

    function fnController($scope, $element, $attrs) {
        /**
         * Scope of tree
         * @namespace $scope
         */

        /**
         * Indent basic
         *
         * @type {number}
         * @default 20
         */
        $scope.indent = 20;

        /**
         * Indent plus each level
         *
         * @type {number}
         * @default 15
         */
        $scope.indent_plus = 15;

        /**
         * Indent unit
         *
         * @type {string}
         * @default 'px'
         */
        $scope.indent_unit = 'px';

        /**
         * Tree's class
         *
         * @type {string}
         * @default 'table'
         */
        $scope.$tree_class = 'table';


        /**
         * Primary key
         *
         * @type {string}
         * @default '__uid__'
         */
        $scope.primary_key = '__uid__';

        /**
         * Type of Tree
         *
         * @type {string}
         * @default 'TreeDnD'
         */
        $scope.$type = 'TreeDnD';
        // $scope.enabledFilter = undefined;
        $scope.colDefinitions = [];
        $scope.$globals = {};
        /**
         * Classes status
         * @type {Object}
         */
        $scope.$class = angular.copy($TreeDnDClass);

        angular.extend(
            $scope.$class.icon, {
                '1': $attrs.iconExpand || 'glyphicon glyphicon-minus',
                '0': $attrs.iconCollapse || 'glyphicon glyphicon-plus',
                '-1': $attrs.iconLeaf || 'glyphicon glyphicon-file'
            }
        );

        /**
         * Tree data
         * @type {Node[]}
         * @default []
         */
        $scope.treeData = [];

        /**
         * Tree nodes
         * @type {Node[]}
         * @default []
         */
        $scope.tree_nodes = [];


        /**
         * Function foreach all descendants
         * @callback $scope.for_all_descendants
         * @param {Node} node
         * @param {Function|$scope.for_all_descendants} fn
         * @param {Node} [parent]
         * @param {boolean} [checkSibling=false] Check sibling of node
         * @returns {boolean}
         */
        $scope.for_all_descendants = function (node, fn, parent, checkSibling) {
            if (angular.isFunction(fn)) {
                var _i, _len, _nodes;

                if (fn(node, parent)) {
                    // have error or need ignore children
                    return false;
                }

                if (typeof node !== 'object') {
                    return false;
                }

                _nodes = node.__children__;
                _len = _nodes ? _nodes.length : 0;
                for (_i = 0; _i < _len; _i++) {
                    if (!$scope.for_all_descendants(_nodes[_i], fn, node) && !checkSibling) {
                        // skip sibling of node checking
                        return false;
                    }
                }
            }

            // succeed then continue
            return true;
        };

        /**
         * Get last descendant
         *
         * @param {Node|undefined} [node]
         *
         * @returns {Node|undefined}
         */
        $scope.getLastDescendant = function (node) {
            var last_child, n;

            if (!node && typeof $scope.tree === 'object') {
                node = $scope.tree.selected_node;
            }

            if (typeof node === 'object') {
                if (angular.isArray(node.__children__)) {

                    n = node.__children__.length;

                    if (n === 0) {
                        return node;
                    } else {
                        last_child = node.__children__[n - 1];

                        return $scope.getLastDescendant(last_child);
                    }
                }
            }
        };

        /**
         * Get element children
         *
         * @returns {Object}
         */
        $scope.getElementChilds = function () {
            return angular.element($element[0].querySelector('[tree-dnd-nodes]'));
        };

        /**
         * Event onClick, will call function [on_click]{@link $scope.tree.on_click}
         *
         * @param {Node|undefined} node - For node
         */
        $scope.onClick = function (node) {
            if (angular.isDefined($scope.tree) && angular.isFunction($scope.tree.on_click)) {
                // We want to detach from Angular's digest cycle so we can
                // independently measure the time for one cycle.
                setTimeout(
                    function () {
                        $scope.tree.on_click(node);
                    },
                    0
                );
            }
        };

        /**
         * Event onSelect for node
         *
         * @param {Node|undefined} [node] - For node
         */
        $scope.onSelect = function (node) {
            if (angular.isDefined($scope.tree)) {
                if (node !== $scope.tree.selected_node) {
                    $scope.tree.select_node(node);
                }

                if (angular.isFunction($scope.tree.on_select)) {
                    setTimeout(
                        function () {
                            $scope.tree.on_select(node);
                        },
                        0
                    );
                }
            }
        };

        /**
         * Toggle Expand
         *
         * @param {Node|undefined} node - For node
         * @param {Function} fnCallback
         */
        $scope.toggleExpand = function (node, fnCallback) {
            if (typeof node !== 'object') {
                return; // jmp out
            }
            var passedExpand;

            if (angular.isFunction(fnCallback)) {
                passedExpand = !!fnCallback(node);
            } else if (typeof $scope.$callbacks === 'object' && angular.isFunction($scope.$callbacks.expand)) {
                passedExpand = !!$scope.$callbacks.expand(node);
            }

            // just for node has children
            if (node.__children__.length > 0) {
                if (typeof passedExpand !== 'undefined') {
                    node.__expanded__ = passedExpand;
                } else {
                    node.__expanded__ = !node.__expanded__;
                }
            }
        };


        /**
         * Get hash
         * @callback _fnGetHash
         *
         * @param {Node} node
         *
         * @returns {string}
         *
         * @private
         */
        var _fnGetHash = function (node) {
                return '#' + node.__parent__ + '#' + node[$scope.primary_key];
            },
            /**
             * Set hash
             * @param {Node} node
             * @returns {Node}
             * @private
             */
            _fnSetHash = function (node) {
                var _hashKey = _fnGetHash(node);

                if (angular.isUndefinedOrNull(node.__hashKey__) || node.__hashKey__ !== _hashKey) {
                    node.__hashKey__ = _hashKey;
                }

                return node;
            };

        /**
         * Get hash of node
         *
         * @type {_fnGetHash}
         */
        $scope.getHash = _fnGetHash;

        /**
         * Override callbacks
         * @namespace $scope.$callbacks
         * @type object
         */
        $scope.$callbacks = {
            getHash: _fnGetHash,
            setHash: _fnSetHash,
            for_all_descendants: $scope.for_all_descendants,
            /*expand:              function (node) {
             return true;
             },*/
            accept: function (/*dragInfo, moveTo, isChanged*/) {
                return $scope.dropEnabled === true;
            },

            /**
             * Calc indent
             *
             * @param {int} level
             * @param {boolean} skipUnit
             * @param {boolean} skipEdge
             * @returns {number|string}
             */
            calsIndent: function (level, skipUnit, skipEdge) {
                var unit = 0,
                    edge = skipEdge ? 0 : $scope.indent_plus;
                if (!skipUnit) {
                    unit = $scope.indent_unit ? $scope.indent_unit : 'px';
                }

                if (level - 1 < 1) {
                    return edge + unit;
                } else {
                    return $scope.indent * (level - 1) + edge + unit;
                }
            },

            /**
             * Is droppable
             *
             * @returns {boolean}
             */
            droppable: function () {
                return $scope.dropEnabled === true;
            },
            /**
             * Is draggable
             *
             * @returns {boolean}
             */
            draggable: function () {
                return $scope.dragEnabled === true;
            },
            /**
             * Before drop
             *
             * @returns {boolean}
             */
            beforeDrop: function (/*event*/) {
                return true;
            },

            /**
             * Change key for node
             *
             * @param node
             */
            changeKey: function (node) {
                var _key = node.__uid__;
                node.__uid__ = Math.random();
                if (node.__selected__) {
                    delete node.__selected__;
                }

                if ($scope.primary_key !== '__uid__') {
                    _key = '' + node[$scope.primary_key];
                    _key = _key.replace(/_#.+$/g, '') + '_#' + node.__uid__;

                    node[$scope.primary_key] = _key;
                }
                // delete(node.__hashKey__);
            },

            /**
             * Clone node
             *
             * @param node
             * @returns {*}
             */
            clone: function (node/*, _this*/) {
                var _clone = angular.copy(node);

                this.for_all_descendants(_clone, this.changeKey);

                return _clone;
            },

            /**
             * Remove node
             *
             * @param {Node} node
             * @param {Node[]} parent
             * @param {this} _this
             * @param {boolean} delayReload
             * @returns {Node[]}
             */
            remove: function (node, parent, _this, delayReload) {
                var temp = parent.splice(node.__index__, 1)[0];
                if (!delayReload) {
                    $scope.reload_data();
                }
                return temp;
            },

            /**
             * Clear info
             *
             * @param {Node} node
             */
            clearInfo: function (node) {
                delete node.__inited__;
                delete node.__visible__;

                // always changed after call reload_data
                //delete node.__hashKey__;
            },

            /**
             * Add node to
             *
             * @param {Node} node
             * @param {int} pos
             * @param {Node[]} parent
             * @param {this} _this
             */
            add: function (node, pos, parent/*, _this*/) {
                // clearInfo
                this.for_all_descendants(node, this.clearInfo);
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
            }
        };

        /**
         * Delete scope by node
         *
         * @param {$scope} scope
         * @param {Node} node
         */
        $scope.deleteScope = function (scope, node) {
            var _hash = node.__hashKey__;
            if ($scope.$globals[_hash] && $scope.$globals[_hash] === scope) {
                delete $scope.$globals[_hash];
            }
        };

        /**
         * Set scope for node
         *
         * @param {$scope} scope
         * @param {Node} node
         */
        $scope.setScope = function (scope, node) {
            var _hash = node.__hashKey__;
            if ($scope.$globals[_hash] !== scope) {
                $scope.$globals[_hash] = scope;
            }
        };

        /**
         * Get scope of node
         *
         * @param {Node} node
         * @returns {$scope}
         */
        $scope.getScope = function (node) {
            if (node) {
                var _hash = node.__hashKey__;
                //var _hash = typeof node === 'string' ? node : node.__hashKey__;
                return $scope.$globals[_hash];
            }

            return $scope;
        };

        if ($attrs.enableDrag || $attrs.enableDrop) {
            $scope.placeElm = undefined;
            //                            $scope.dragBorder = 30;
            $scope.dragEnabled = undefined;
            $scope.dropEnabled = undefined;
            $scope.horizontal = undefined;

            if ($attrs.enableDrag) {

                $scope.dragDelay = 0;
                $scope.enabledMove = true;
                $scope.statusMove = true;
                $scope.enabledHotkey = false;
                $scope.enabledCollapse = undefined;
                $scope.statusElm = undefined;
                $scope.dragging = undefined;

                angular.extend(
                    $scope.$callbacks, /** @lends $scope.$callbacks */ {
                        beforeDrag: function (/*scopeDrag*/) {
                            return true;
                        },
                        /**
                         * Callback when drag stop
                         *
                         * @param info
                         * @param {boolean} passed
                         */
                        dragStop: function (info, passed) {
                            if (!info || !info.changed && info.drag.enabledMove || !passed) {
                                return; // jmp out
                            }

                            info.target.reload_data();

                            if (info.target !== info.drag && info.drag.enabledMove) {
                                info.drag.reload_data();
                            }
                        },

                        /**
                         * Callback when node dropped
                         *
                         * @param info
                         * @returns {boolean}
                         */
                        dropped: function (info/*, pass*/) {
                            if (!info) {
                                return; // jmp out
                            }

                            var _node = info.node,
                                _nodeAdd,
                                _move = info.move,
                                _parent,
                                _parentRemove = info.parent || info.drag.treeData,
                                _parentAdd = _move.parent || info.target.treeData,
                                isMove = info.drag.enabledMove;

                            if (!info.changed && isMove) {
                                return false;
                            }

                            if (info.target.$callbacks.accept(info, info.move, info.changed)) {
                                if (isMove) {
                                    _parent = _parentRemove;
                                    if (angular.isDefined(_parent.__children__)) {
                                        _parent = _parent.__children__;
                                    }

                                    _nodeAdd = info.drag.$callbacks.remove(
                                        _node,
                                        _parent,
                                        info.drag.$callbacks,
                                        true // delay reload
                                    );
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

                                info.target.$callbacks.add(
                                    _nodeAdd,
                                    _move.pos,
                                    _parent,
                                    info.drag.$callbacks
                                );

                                return true;
                            }

                            return false;
                        },

                        /**
                         * Callback when before drag start
                         *
                         * @param event
                         */
                        dragStart: function (event) {
                        },

                        /**
                         * Callback when before drag move
                         *
                         * @param event
                         */
                        dragMove: function (event) {
                        }
                    }
                );

                /**
                 * Set status dragging
                 *
                 * @param dragInfo
                 */
                $scope.setDragging = function (dragInfo) {
                    $scope.dragging = dragInfo;
                };

                /**
                 * Get status node is enable move
                 *
                 * @param val
                 */
                $scope.enableMove = function (val) {
                    if (typeof val === 'boolean') {
                        $scope.enabledMove = val;
                    } else {
                        $scope.enabledMove = true;
                    }
                };

                if ($attrs.enableStatus) {
                    /**
                     * Enable status (moving, coping)
                     *
                     * @type {boolean}
                     */
                    $scope.enabledStatus = false;

                    /**
                     * Hide status
                     */
                    $scope.hideStatus = function () {
                        if ($scope.statusElm) {
                            $scope.statusElm.addClass($scope.$class.hidden);
                        }
                    };

                    /**
                     * Refresh Status
                     */
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

                    /**
                     * Set position status
                     *
                     * @param {Event} e
                     */
                    $scope.setPositionStatus = function (e) {
                        if ($scope.statusElm) {
                            $scope.statusElm.css(
                                {
                                    'left': e.pageX + 10 + 'px',
                                    'top': e.pageY + 15 + 'px',
                                    'z-index': 9999
                                }
                            );

                            $scope.statusElm.addClass($scope.$class.status);
                        }
                    };
                }
            }

            /**
             * Status targeting when drag & drop
             *
             * @type {boolean}
             */
            $scope.targeting = false;

            /**
             * Get node previous sibling
             *
             * @param node
             * @returns {Node|undefined}
             */
            $scope.getPrevSibling = function (node) {
                if (node && node.__index__ > 0) {
                    var _parent, _index = node.__index__ - 1;

                    if (angular.isDefined(node.__parent_real__)) {
                        _parent = $scope.tree_nodes[node.__parent_real__];

                        return _parent.__children__[_index];
                    }

                    return $scope.treeData[_index];

                }
            };

            /**
             * Get node by index
             *
             * @param {int} index
             * @returns {Node|undefined}
             */
            $scope.getNode = function (index) {
                if (angular.isUndefinedOrNull(index)) {
                    return; // jmp out
                }

                return $scope.tree_nodes[index];
            };

            /**
             * Init element place
             *
             * @param {DOMElement} element
             * @param {DOMElement} dragElm
             * @returns {*}
             */
            $scope.initPlace = function (element, dragElm) {

                if (!$scope.placeElm) {
                    if ($scope.isTable) {
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

            /**
             * Hide element place
             */
            $scope.hidePlace = function () {
                if ($scope.placeElm) {
                    $scope.placeElm.addClass($scope.$class.hidden);
                }
            };

            /**
             * Show element place
             */
            $scope.showPlace = function () {
                if ($scope.placeElm) {
                    $scope.placeElm.removeClass($scope.$class.hidden);
                }
            };

            /**
             * Get scope tree
             * @returns {$scope}
             */
            $scope.getScopeTree = function () {
                return $scope;
            };

        }

        /**
         * Function safe apply to avoid loop-depth
         *
         * @type {$safeApply}
         */
        $scope.$safeApply = $safeApply;

        /**
         * Hide children
         *
         * @param {Node} node
         * @param {Node} parent
         * @returns {boolean}
         */
        $scope.hiddenChild = function fnHiddenChild(node, parent) {
            var nodeScope = $scope.getScope(node);
            if (nodeScope) {
                if (parent && parent.__expanded__ && parent.__visible__) {
                    nodeScope.$element.removeClass($scope.$class.hidden);
                    node.__visible__ = true;
                } else {
                    nodeScope.$element.addClass($scope.$class.hidden);
                    node.__visible__ = false;
                }
            } else {
                // show node & init scope
                node.__visible__ = !!(parent && parent.__expanded__ && parent.__visible__);
            }

            // skip all child hiding... if not expaned
            return node.__expanded__ === false;
        };

        var _fnInitFilter,
            _fnInitOrderBy,
            _fnGetControl,
            _defaultFilterOption = {
                showParent: true,
                showChild: false,
                beginAnd: true
            },
            _watches = [
                [
                    'enableDrag',
                    [
                        ['boolean', 'enableStatus', undefined, 'enabledStatus'],
                        ['boolean', 'enableMove', undefined, 'enabledMove'],
                        ['number', 'dragDelay', 0, undefined, 0],
                        ['boolean', 'enableCollapse', undefined, 'enabledCollapse'],
                        ['boolean', 'enableHotkey', undefined, 'enabledHotkey', undefined, function (isHotkey) {
                            if (isHotkey) {
                                $scope.enabledMove = false;
                            } else {
                                $scope.enabledMove = $scope.statusMove;
                            }
                        }]
                    ]
                ],
                [
                    ['enableDrag', 'enableStatus'],
                    [
                        ['string', 'templateCopy', $attrs.templateCopy, 'templateCopy', undefined, function (_url) {
                            if (_url && $templateCache.get(_url)) {
                                $TreeDnDTemplate.setCopy(_url, $scope);
                            }
                        }],
                        ['string', 'templateMove', $attrs.templateMove, 'templateMove', undefined, function (_url) {
                            if (_url && $templateCache.get(_url)) {
                                $TreeDnDTemplate.setMove(_url, $scope);
                            }
                        }]
                    ]
                ],
                [
                    [['enableDrag', 'enableDrop']],
                    [
                        ['number', 'dragBorder', 30, 'dragBorder', 30]
                    ]
                ],
                [
                    '*',
                    [
                        ['boolean', 'treeTable', true, 'treeTable', undefined],
                        ['boolean', 'horizontal'],
                        [
                            'callback',
                            'treeClass',
                            function (val) {
                                switch (typeof val) {
                                    case 'string':
                                        $scope.$tree_class = val;
                                        break;
                                    case 'object':
                                        angular.extend($scope.$class, val);
                                        $scope.$tree_class = $scope.$class.tree;
                                        break;
                                    default:
                                        $scope.$tree_class = $attrs.treeClass;
                                        break;
                                }
                            },
                            'treeClass',
                            function () {
                                $scope.$tree_class = $scope.$class.tree + ' table';
                            },
                            undefined,
                            function () {
                                if (/^(\s+[\w\-]+){2,}$/g.test(' ' + $attrs.treeClass)) {
                                    $scope.$tree_class = $attrs.treeClass.trim();
                                    return true;
                                }
                            }
                        ],
                        [['object', 'string'], 'expandOn', getExpandOn, 'expandingProperty', getExpandOn, function (expandOn) {
                            if (angular.isUndefinedOrNull(expandOn)) {
                                $scope.expandingProperty = $attrs.expandOn;
                            }
                        }],
                        ['object', 'treeControl', angular.isDefined($scope.tree) ? $scope.tree : {}, 'tree', undefined, function (treeControl) {
                            if (!angular.isFunction(_fnGetControl)) {
                                _fnGetControl = $TreeDnDPlugin('$TreeDnDControl');
                            }

                            if (angular.isFunction(_fnGetControl)) {
                                angular.extend(
                                    $scope.tree,
                                    _fnGetControl($scope),
                                    treeControl
                                );
                            }
                        }],
                        [['array', 'object'], 'columnDefs', getColDefs, 'colDefinitions', getColDefs, function (colDefs) {
                            if (angular.isUndefinedOrNull(colDefs) || !angular.isArray(colDefs)) {
                                $scope.colDefinitions = getColDefs();
                            }
                        }],
                        [['object', 'string', 'array', 'function'], 'orderBy', $attrs.orderBy],
                        [['object', 'array'], 'filter', undefined, 'filter', undefined, function (filters) {
                            var _passed = false;
                            if (angular.isDefined(filters) && !angular.isArray(filters)) {
                                var _keysF = Object.keys(filters),
                                    _lenF = _keysF.length, _iF;

                                if (_lenF > 0) {
                                    for (_iF = 0; _iF < _lenF; _iF++) {

                                        if (typeof filters[_keysF[_iF]] === 'string' &&
                                            filters[_keysF[_iF]].length === 0) {
                                            continue;
                                        }
                                        _passed = true;
                                        break;
                                    }
                                }
                            }

                            $scope.enabledFilter = _passed;
                            reload_data();
                        }],
                        ['object', 'filterOptions', _defaultFilterOption, 'filterOptions', _defaultFilterOption, function (option) {
                            if (typeof option === 'object') {
                                $scope.filterOptions = angular.extend(_defaultFilterOption, option);
                            }
                        }],
                        ['string', 'primaryKey', $attrs.primaryKey, 'primary_key', '__uid__'],
                        ['string', 'indentUnit', $attrs.indentUnit, 'indent_unit'],
                        ['number', 'indent', 30, 'indent', 30],
                        ['number', 'indentPlus', 20, 'indent_plus', 20],
                        [
                            'object',
                            'callbacks',
                            function (optCallbacks) {
                                angular.forEach(
                                    optCallbacks, function (value, key) {
                                        if (typeof value === 'function') {
                                            if ($scope.$callbacks[key]) {
                                                $scope.$callbacks[key] = value;
                                            }
                                        }
                                    }
                                );

                                return $scope.$callbacks;
                            },
                            '$callbacks'
                        ],
                        ['number', 'expandLevel', 3, 'expandLevel', 3, function () {
                            reload_data();
                        }],
                        ['number', 'treeLimit', 100, '$TreeLimit', 100],
                        ['boolean', 'enableDrag', undefined, 'dragEnabled'],
                        ['boolean', 'enableDrop', undefined, 'dropEnabled']
                    ]
                ]
            ],

            w, lenW = _watches.length,
            i, len,
            _curW,
            _typeW, _nameW, _defaultW, _scopeW, _NotW, _AfterW, _BeforeW,

            // debounce reload_Data;
            timeReloadData, tmpTreeData;

        for (w = 0; w < lenW; w++) {
            // skip if not exist
            if (!check_exist_attr($attrs, _watches[w][0], true)) {
                continue;
            }

            _curW = _watches[w][1];
            for (i = 0, len = _curW.length; i < len; i++) {

                _typeW = _curW[i][0];
                _nameW = _curW[i][1];
                _defaultW = _curW[i][2];
                _scopeW = _curW[i][3];
                _NotW = _curW[i][4];
                _AfterW = _curW[i][5];
                _BeforeW = _curW[i][6];

                generateWatch(_typeW, _nameW, _defaultW, _scopeW, _NotW, _AfterW, _BeforeW);
            }
        }

        if ($attrs.treeData) {
            $scope.$watch(
                $attrs.treeData, function (val) {
                    if (angular.equals(val, $scope.treeData)) {
                        return; // jmp out
                    }

                    tmpTreeData = val;
                    if (angular.isUndefinedOrNull(timeReloadData)) {
                        timeReloadData = $timeout(timeLoadData, 350);
                    }
                }, true
            );
        }

        /**
         * Reload data with timeout
         * @callback timeLoadData
         */
        function timeLoadData() {
            $scope.treeData = tmpTreeData;
            reload_data();
            timeReloadData = undefined;
        }

        /**
         * Update limit
         */
        $scope.updateLimit = function updateLimit() {
            $scope.$TreeLimit += 50;
        };

        /**
         * Reload data
         * @type {reload_data}
         */
        $scope.reload_data = reload_data;

        /**
         * Check attribute exist
         * @callback check_exist_attr
         *
         * @param {object|array} attrs - Array attributes
         * @param {Array|string} existAttr - Criteria condition
         * @param {boolean} isAnd - Is condition AND
         * @returns {*}
         */
        function check_exist_attr(attrs, existAttr, isAnd) {
            if (angular.isUndefinedOrNull(existAttr)) {
                return false;
            }

            if (existAttr === '*' || !angular.isUndefined(attrs[existAttr])) {
                return true;
            }

            if (angular.isArray(existAttr)) {
                return for_each_attrs(attrs, existAttr, isAnd);
            }
        }

        /**
         * Foreach attributes with criteria
         * @callback for_each_attrs
         * @param {Object|Array} attrs - Array attributes
         * @param {Array|string} exist - Criteria condition
         * @param {boolean} isAnd  - Is condition AND
         * @returns {boolean}
         */
        function for_each_attrs(attrs, exist, isAnd) {
            var i, len = exist.length, passed = false;

            if (len === 0) {
                return; // jmp out
            }

            for (i = 0; i < len; i++) {
                if (check_exist_attr(attrs, exist[i], !isAnd)) {
                    passed = true;
                    if (!isAnd) {
                        return true;
                    }
                } else {
                    if (isAnd) {
                        return false;
                    }
                }
            }

            return passed;
        }

        /**
         * Function generate watch attribute by automatic
         *
         * @callback generateWatch
         * @param {*} type
         * @param {string} nameAttr - Name attribute
         * @param {*} valDefault - Value default
         * @param {string|undefined} nameScope - Name of attribute in $scope
         * @param {function} fnNotExist - Callback when attribute not exist
         * @param {function} fnAfter - Callback when attribute found
         * @param {function} fnBefore - Callback before attribute found (to prepare data)
         */
        function generateWatch(type, nameAttr, valDefault, nameScope, fnNotExist, fnAfter, fnBefore) {
            nameScope = nameScope || nameAttr;
            if (typeof type === 'string' || angular.isArray(type)) {
                if (angular.isFunction(fnBefore) && fnBefore()) {
                    return;//jmp
                }

                if (typeof $attrs[nameAttr] === 'string') {
                    $scope.$watch(
                        $attrs[nameAttr], function (val) {
                            if (typeof type === 'string' && typeof val === type ||
                                angular.isArray(type) && type.indexOf(typeof val) > -1
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
                                fnAfter($scope[nameScope], $scope);
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

        /**
         * Call safeApply
         *
         * @param fn
         * @callback $safeApply
         */
        function $safeApply(fn) {
            var phase = this.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && typeof fn === 'function') {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        }

        /**
         * Get Expand on
         * @callback getExpandOn
         */
        function getExpandOn() {
            if ($scope.treeData && $scope.treeData.length) {
                var _firstNode = $scope.treeData[0], _keys = Object.keys(_firstNode),
                    _regex = new RegExp('^__([a-zA-Z0-9_\-]*)__$'),
                    _len,
                    i;
                // Auto get first field with type is string;
                for (i = 0, _len = _keys.length; i < _len; i++) {
                    if (typeof _firstNode[_keys[i]] === 'string' && !_regex.test(_keys[i])) {
                        $scope.expandingProperty = _keys[i];

                        return; // jmp out
                    }
                }

                // Auto get first
                if (angular.isUndefinedOrNull($scope.expandingProperty)) {
                    $scope.expandingProperty = _keys[0];
                }

            }
        }

        /**
         * Get col defs
         *
         * @callback getColDefs
         */
        function getColDefs() {
            // Auto get Defs except attribute __level__ ....
            if ($scope.treeData.length) {
                var _col_defs = [], _firstNode = $scope.treeData[0],
                    _regex = new RegExp('(^__([a-zA-Z0-9_\-]*)__$|^' + $scope.expandingProperty + '$)'),
                    _keys = Object.keys(_firstNode),
                    i, _len;

                // Auto get first field with type is string;
                for (i = 0, _len = _keys.length; i < _len; i++) {
                    if (typeof _firstNode[_keys[i]] === 'string' && !_regex.test(_keys[i])) {
                        _col_defs.push(
                            {
                                field: _keys[i]
                            }
                        );
                    }
                }

                $scope.colDefinitions = _col_defs;
            }
        }

        /**
         * do_f
         *
         * @callback do_f
         *
         * @param {Node[]} root
         * @param {Node} node
         * @param {Node} parent
         * @param {int} parent_real
         * @param {int} level
         * @param {boolean|*} visible
         * @param {int} index
         * @returns {number}
         */
        function do_f(root, node, parent, parent_real, level, visible, index) {
            /**
             * Node of tree
             * @name Node
             * @type {NodeBase}
             * @property {int} __parent_real__
             * @property {Node} __parent__
             * @property {boolean} __expanded__
             * @property {int} __index__
             * @property {int} __index_real__
             * @property {int} __level__
             * @property {int} __icon__
             * @property {string} __icon_class__
             * @property {boolean} __visible__
             * @property {string} __uid__
             * @property {string} __hashKey__
             * @property {int} __dept__
             */
            if (typeof node !== 'object') {
                return 0;
            }

            var _i, _len, _icon, _index_real, _dept, _hashKey;

            if (!angular.isArray(node.__children__)) {
                node.__children__ = [];
            }

            node.__parent_real__ = parent_real;
            node.__parent__ = parent;
            _len = node.__children__.length;

            if (angular.isUndefinedOrNull(node.__expanded__) && _len > 0) {
                node.__expanded__ = level < $scope.expandLevel;
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
            node.__icon_class__ = $scope.$class.icon[_icon];
            node.__visible__ = !!visible;

            if (angular.isUndefinedOrNull(node.__uid__)) {
                node.__uid__ = '' + Math.random();
            }

            _hashKey = $scope.getHash(node);

            if (angular.isUndefinedOrNull(node.__hashKey__) || node.__hashKey__ !== _hashKey) {
                node.__hashKey__ = _hashKey;
            }

            root.push(node);

            // Check node children
            _dept = 1;
            if (_len > 0) {
                for (_i = 0; _i < _len; _i++) {
                    _dept += do_f(
                        root,
                        node.__children__[_i],
                        node[$scope.primary_key],
                        _index_real,
                        level + 1,
                        visible && node.__expanded__,
                        _i
                    );
                }
            }

            node.__dept__ = _dept;

            return _dept;
        }

        /**
         * Init data for tree
         *
         * @param {Node[]|undefined} data - Data for tree
         * @returns {Node[]|undefined}
         */
        function init_data(data) {

            // clear memory
            if (angular.isDefined($scope.tree_nodes)) {
                delete $scope.tree_nodes;
            }

            $scope.tree_nodes = data;

            return data;
        }

        /**
         * Reload data of tree
         *
         * @callback reload_data
         *
         * @param {Node[]|undefined} [data=undefined]
         * @returns {Node[]}
         */
        function reload_data(data) {
            var _data,
                _len,
                _tree_nodes = [];

            if (angular.isDefined(data)) {
                if (!angular.isArray(data) || data.length === 0) {
                    return init_data([]);
                } else {
                    _data = data;
                }
            } else if (!angular.isArray($scope.treeData) || $scope.treeData.length === 0) {
                return init_data([]);
            } else {
                _data = $scope.treeData;
            }

            if (!$attrs.expandOn) {
                getExpandOn();
            }

            if (!$attrs.columnDefs) {
                getColDefs();
            }

            if (angular.isDefined($scope.orderBy)) {
                if (!angular.isFunction(_fnInitOrderBy)) {
                    _fnInitOrderBy = $TreeDnDPlugin('$TreeDnDOrderBy');
                }

                if (angular.isFunction(_fnInitOrderBy)) {
                    _data = _fnInitOrderBy(_data, $scope.orderBy);
                }
            }

            if (angular.isDefined($scope.filter)) {
                if (!angular.isFunction(_fnInitFilter)) {
                    _fnInitFilter = $TreeDnDPlugin('$TreeDnDFilter');
                }

                if (angular.isFunction(_fnInitFilter)) {
                    _data = _fnInitFilter(_data, $scope.filter, $scope.filterOptions);
                }
            }

            _len = _data.length;
            if (_len > 0) {
                var _i,
                    _deptTotal = 0;

                for (_i = 0; _i < _len; _i++) {
                    _deptTotal += do_f(_tree_nodes, _data[_i], undefined, undefined, 1, true, _i);
                }

            }

            init_data(_tree_nodes);

            return _tree_nodes;
        }
    }

    function fnCompile(tElement) {

        var $_Template = '',
            _element = tElement.html().trim();

        if (_element.length > 0) {
            $_Template = _element;
            tElement.html('');
        }

        return function fnPost(scope, element, attrs) {

            if (typeof attrs === 'object' && attrs.enableDrag) {
                var _fnInitDrag = $TreeDnDPlugin('$TreeDnDDrag');
                if (angular.isFunction(_fnInitDrag)) {
                    _fnInitDrag(scope, element, $window, $document);
                }
            }

            // kick out $digest
            element.ready(function () {
                // apply Template
                function checkTreeTable(template, scope) {
                    var elemNode = template[0].querySelector('[tree-dnd-node]'),
                        attrInclude;

                    scope.isTable = undefined;
                    if (elemNode) {
                        elemNode = angular.element(elemNode);
                        attrInclude = elemNode.attr('ng-include');
                    } else {
                        return;
                    }

                    if (attrInclude) {
                        var treeInclude = $parse(attrInclude)(scope) || attrInclude;
                        if (typeof treeInclude === 'string') {
                            return $http.get(
                                treeInclude,
                                {cache: $templateCache}
                            ).then(function (response) {
                                    var data = response.data || '';
                                    data = data.trim();
                                    //scope.templateNode = data;
                                    var tempDiv = document.createElement('div');
                                    tempDiv.innerHTML = data;
                                    tempDiv = angular.element(tempDiv);
                                    scope.isTable = !tempDiv[0].querySelector('[tree-dnd-nodes]');
                                }
                            );
                        }
                    } else {
                        scope.isTable = !elemNode[0].querySelector('[tree-dnd-nodes]');
                        //scope.templateNode = elemNode.html();
                    }
                    $TreeDnDViewport.setTemplate(scope, scope.templateNode);
                    //elemNode.html('');
                }

                var promiseCheck;
                if ($_Template.length > 0) {
                    promiseCheck = checkTreeTable(angular.element($_Template.trim()), scope);
                    if (typeof promiseCheck === 'object') {
                        promiseCheck.then(function () {
                            element.append($compile($_Template)(scope));
                        });
                    } else {
                        element.append($compile($_Template)(scope));
                    }
                } else {
                    $http.get(
                        attrs.templateUrl || $TreeDnDTemplate.getPath(),
                        {cache: $templateCache}
                    ).then(function (response) {
                            var data = response.data || '';
                            data = angular.element(data.trim());
                            promiseCheck = checkTreeTable(data, scope);
                            if (typeof promiseCheck === 'object') {
                                promiseCheck.then(function () {
                                    element.append($compile(data)(scope));
                                });
                            } else {
                                element.append($compile(data)(scope));
                            }
                        }
                    );
                }
            });
        };
    }
}
