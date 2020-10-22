/**
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/**
 * Implementing TreeDnD & Event DrapnDrop (allow drag multi tree-table include all type: table, ol, ul)
 * Demo: http://thienhung1989.github.io/angular-tree-dnd
 * Github: https://github.com/thienhung1989/angular-tree-dnd
 * @version 3.0.10
 * (c) 2015 Nguyuễn Thiện Hùng - <nguyenthienhung1989@gmail.com>
 * @license
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Nguyễn Thiện Hùng
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
(function () {
    'use strict';
    /**
     * @namespace angular
     */

    /**
     * Is undefined or null
     * @param {*} val - Value
     * @returns {boolean}
     */
    angular.isUndefinedOrNull = function isUndefinedOrNull(val) {
        return angular.isUndefined(val) || val === null;
    };

    /**
     * Is defined
     *
     * @param {*} val - Value
     * @returns {boolean}
     */
    angular.isDefined = function isDefined(val) {
        return !(angular.isUndefined(val) || val === null);
    };

    /**
     * @namespace Factory
     * @type object
     */

    /**
     * @constant $TreeDnDClass
     * @type object
     * @default
     * @property {string} [tree=tree-dnd]           - Class tree
     * @property {string} [empty=tree-dnd-empty]    - Class tree empty
     * @property {string} [hidden=tree-dnd-hidden]  - Class tree hidden
     * @property {string} [node=tree-dnd-node]      - Class tree node
     * @property {string} [nodes=tree-dnd-nodes]    - Class tree nodes
     * @property {string} [handle=tree-dnd-handle]  - Class tree handle
     * @property {string} [place=tree-dnd-place]    - Class tree place
     * @property {string} [drag=tree-dnd-drag]      - Class tree drag
     * @property {string} [status=tree-dnd-status]  - Class tree status (coping, moving)
     * @property {object} icon
     */
    angular.module('ntt.TreeDnD', ['template/TreeDnD/TreeDnD.html'])
        .constant('$TreeDnDClass', {
            tree:   'tree-dnd',
            empty:  'tree-dnd-empty',
            hidden: 'tree-dnd-hidden',
            node:   'tree-dnd-node',
            nodes:  'tree-dnd-nodes',
            handle: 'tree-dnd-handle',
            place:  'tree-dnd-placeholder',
            drag:   'tree-dnd-drag',
            status: 'tree-dnd-status',
            icon:   {
                '1':  'glyphicon glyphicon-minus',
                '0':  'glyphicon glyphicon-plus',
                '-1': 'glyphicon glyphicon-file'
            }
        });angular.module('ntt.TreeDnD')
    .controller('treeDndNodeHandleController', [
        '$scope',
        function ($scope) {
            this.scope = $scope;
        }
    ]);

angular.module('ntt.TreeDnD')
    .controller('treeDndNodeController', [
        '$scope',
        function ($scope) {
            this.scope = $scope;
        }
    ]);

angular.module('ntt.TreeDnD')
    .controller('treeDndNodesController', [
        '$scope',
        function ($scope) {
            this.scope = $scope;
        }
    ]);

angular.module('ntt.TreeDnD')
    .directive('compile', [
        '$compile',
        function ($compile) {
            return {
                restrict: 'A',
                link:     function (scope, element, attrs) {
                    scope.$watch(
                        attrs.compile,
                        function (new_val) {
                            if (new_val) {
                                if (angular.isFunction(element.empty)) {
                                    element.empty();
                                } else {
                                    element.html('');
                                }

                                element.append($compile(new_val)(scope));
                            }
                        }
                    );
                }
            };
        }]
    )
    .directive('compileReplace', [
        '$compile',
        function ($compile) {
            return {
                restrict: 'A',
                link:     function (scope, element, attrs) {
                    scope.$watch(
                        attrs.compileReplace,
                        function (new_val) {
                            if (new_val) {
                                element.replaceWith($compile(new_val)(scope));
                            }
                        }
                    );
                }
            };
        }]
    );

angular.module('ntt.TreeDnD')    .directive('treeDndNodeHandle', function () {        return {            restrict:   'A',            scope:      true,            controller: 'treeDndNodeHandleController',            link:       fnLink        };        function fnLink(scope, element/*, attrs, controller*/) {            scope.$type = 'TreeDnDNodeHandle';            if (scope.$class.handle) {                element.addClass(scope.$class.handle);            }        }    });

angular.module('ntt.TreeDnD')
    .directive('treeDndNode', [
        '$TreeDnDViewport',
        function ($TreeDnDViewport) {
            return {
                restrict:   'A',
                replace:    true,
                controller: 'treeDndNodeController',
                link:       fnLink
            };

            /**
             * Link
             *
             * @param {Object} scope
             * @param {Object} element
             * @param {Object} attrs
             *
             * @private
             */
            function fnLink(scope, element, attrs) {

                scope.$node_class = '';

                if (scope.$class.node) {
                    element.addClass(scope.$class.node);
                    scope.$node_class = scope.$class.node;
                }
                var enabledDnD = typeof scope.dragEnabled === 'boolean' || typeof scope.dropEnabled === 'boolean',
                    keyNode    = attrs.treeDndNode,
                    childsElem;

                $TreeDnDViewport.add(scope, element);

                if (enabledDnD) {
                    scope.$type = 'TreeDnDNode';

                    scope.getData = function () {
                        return scope[keyNode];
                    };
                }

                scope.$element            = element;
                scope[keyNode].__inited__ = true;

                scope.getElementChilds = function () {
                    return angular.element(element[0].querySelector('[tree-dnd-nodes]'));
                };

                scope.setScope(scope, scope[keyNode]);

                scope.getScopeNode = function () {
                    return scope;
                };

                var objprops = [],
                    objexpr,
                    i, keyO  = Object.keys(scope[keyNode]),
                    lenO     = keyO.length,
                    hashKey  = scope[keyNode].__hashKey__,
                    skipAttr = [
                        '__visible__',
                        '__children__',
                        '__level__',
                        '__index__',
                        '__index_real__',

                        '__parent__',
                        '__parent_real__',
                        '__dept__',
                        '__icon__',
                        '__icon_class__'
                    ],
                    keepAttr = [
                        '__expanded__'
                    ],
                    lenKeep  = keepAttr.length;

                // skip __visible__
                for (i = 0; i < lenO + lenKeep; i++) {
                    if (i < lenO) {
                        if (skipAttr.indexOf(keyO[i]) === -1) {
                            objprops.push(keyNode + '.' + keyO[i]);
                        }
                    } else {
                        if (keyO.indexOf(keepAttr[i - lenO]) === -1) {
                            objprops.push(keyNode + '.' + keepAttr[i - lenO]);
                        }
                    }
                }

                objexpr = '[' + objprops.join(',') + ']';

                scope.$watch(objexpr, fnWatchNode, true);

                scope.$on('$destroy', function () {
                    scope.deleteScope(scope, scope[keyNode]);
                });

                function fnWatchNode(newVal, oldVal, scope) {
                    var nodeOf = scope[keyNode];

                    if (typeof nodeOf !== 'object') {
                        return; // jmp out
                    }

                    if (!nodeOf.__inited__) {
                        nodeOf.__inited__ = true;
                    }

                    if (nodeOf.__hashKey__ !== hashKey) {
                        // clear scope in $globals
                        scope.deleteScope(scope, nodeOf);

                        // add new scope into $globals
                        scope.setScope(scope, nodeOf);
                        hashKey = nodeOf.__hashKey__;
                    }

                    var _childs = nodeOf.__children__,
                        _len    = _childs.length,
                        _i;

                    var _icon;
                    if (_len === 0) {
                        _icon = -1;
                    } else {
                        if (nodeOf.__expanded__) {
                            _icon = 1;
                        } else {
                            _icon = 0;
                        }
                    }

                    nodeOf.__icon__       = _icon;
                    nodeOf.__icon_class__ = scope.$class.icon[_icon];

                    if (!scope.isTable) {
                        if (!childsElem) {
                            childsElem = scope.getElementChilds();
                        }

                        if (nodeOf.__expanded__) {
                            childsElem.removeClass(scope.$class.hidden);
                        } else {
                            childsElem.addClass(scope.$class.hidden);
                        }
                    }

                    for (_i = 0; _i < _len; _i++) {
                        scope.for_all_descendants(_childs[_i], scope.hiddenChild, nodeOf, true);
                    }

                }
            }
        }]
    );

angular.module('ntt.TreeDnD')
    .directive('treeDndNodes', function () {
        return {
            restrict:   'A',
            replace:    true,
            controller: 'treeDndNodesController',
            link:       fnLink
        };

        function fnLink(scope, element/*, attrs*/) {
            scope.$type = 'TreeDnDNodes';

            if (scope.$class.nodes) {
                element.addClass(scope.$class.nodes);
                scope.$nodes_class = scope.$class.nodes;
            } else {
                scope.$nodes_class = '';
            }
        }
    });

angular.module('ntt.TreeDnD')
    .directive('treeDnd', fnInitTreeDnD);

fnInitTreeDnD.$inject = [
    '$timeout', '$http', '$compile', '$parse', '$window', '$document', '$templateCache',
    '$TreeDnDTemplate', '$TreeDnDClass', '$TreeDnDHelper', '$TreeDnDPlugin', '$TreeDnDViewport'
];

function fnInitTreeDnD($timeout, $http, $compile, $parse, $window, $document, $templateCache,
                       $TreeDnDTemplate, $TreeDnDClass, $TreeDnDHelper, $TreeDnDPlugin, $TreeDnDViewport) {
    return {
        restrict:   'E',
        scope:      true,
        replace:    true,
        controller: ['$scope', '$element', '$attrs', fnController],
        compile:    fnCompile
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
        $scope.$globals       = {};
        /**
         * Classes status
         * @type {Object}
         */
        $scope.$class = angular.copy($TreeDnDClass);

        angular.extend(
            $scope.$class.icon, {
                '1':  $attrs.iconExpand || 'glyphicon glyphicon-minus',
                '0':  $attrs.iconCollapse || 'glyphicon glyphicon-plus',
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
                _len   = _nodes ? _nodes.length : 0;
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
            getHash:             _fnGetHash,
            setHash:             _fnSetHash,
            for_all_descendants: $scope.for_all_descendants,
            /*expand:              function (node) {
             return true;
             },*/
            accept:              function (/*dragInfo, moveTo, isChanged*/) {
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
            droppable:  function () {
                return $scope.dropEnabled === true;
            },
            /**
             * Is draggable
             *
             * @returns {boolean}
             */
            draggable:  function () {
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
                var _key     = node.__uid__;
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
            $scope.placeElm    = undefined;
            //                            $scope.dragBorder = 30;
            $scope.dragEnabled = undefined;
            $scope.dropEnabled = undefined;
            $scope.horizontal  = undefined;

            if ($attrs.enableDrag) {

                $scope.dragDelay       = 0;
                $scope.enabledMove     = true;
                $scope.statusMove      = true;
                $scope.enabledHotkey   = false;
                $scope.enabledCollapse = undefined;
                $scope.statusElm       = undefined;
                $scope.dragging        = undefined;

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
                        dragStop:   function (info, passed) {
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

                            var _node         = info.node,
                                _nodeAdd,
                                _move         = info.move,
                                _parent,
                                _parentRemove = info.parent || info.drag.treeData,
                                _parentAdd    = _move.parent || info.target.treeData,
                                isMove        = info.drag.enabledMove;

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
                                    'left':    e.pageX + 10 + 'px',
                                    'top':     e.pageY + 15 + 'px',
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
                showChild:  false,
                beginAnd:   true
            },
            _watches             = [
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
                                    _lenF  = _keysF.length, _iF;

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

            w, lenW              = _watches.length,
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

                _typeW    = _curW[i][0];
                _nameW    = _curW[i][1];
                _defaultW = _curW[i][2];
                _scopeW   = _curW[i][3];
                _NotW     = _curW[i][4];
                _AfterW   = _curW[i][5];
                _BeforeW  = _curW[i][6];

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
                    _regex                                 = new RegExp('^__([a-zA-Z0-9_\-]*)__$'),
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
                    _regex                     = new RegExp('(^__([a-zA-Z0-9_\-]*)__$|^' + $scope.expandingProperty + '$)'),
                    _keys                      = Object.keys(_firstNode),
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
            node.__parent__      = parent;
            _len                 = node.__children__.length;

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
            _index_real         = root.length;
            node.__index__      = index;
            node.__index_real__ = _index_real;
            node.__level__      = level;
            node.__icon__       = _icon;
            node.__icon_class__ = $scope.$class.icon[_icon];
            node.__visible__    = !!visible;

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
            _element   = tElement.html().trim();

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
                        elemNode    = angular.element(elemNode);
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
                                    var data          = response.data || '';
                                    data              = data.trim();
                                    //scope.templateNode = data;
                                    var tempDiv       = document.createElement('div');
                                    tempDiv.innerHTML = data;
                                    tempDiv           = angular.element(tempDiv);
                                    scope.isTable     = !tempDiv[0].querySelector('[tree-dnd-nodes]');
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
                            var data     = response.data || '';
                            data         = angular.element(data.trim());
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


/**
 * Factory $TreeDnDFilter
 * @namespace $TreeDnDFilter
 * @type function
 * @function
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDFilter', [
        '$filter',
        function ($filter) {
            return fnInitFilter;

            /**
             * Foreach all descendants
             *
             * @param {array|object} options
             * @param {Node} node
             * @param {string} fieldChild
             * @param {Function} [fnBefore] - Callback before foreach descendants of node
             * @param {Function} [fnAfter]  - Callback after foreach descendants of node
             * @param {boolean} [parentPassed=false] - Parent is passed
             * @returns {boolean|undefined}
             * @callback for_all_descendants
             * @private
             */
            function for_all_descendants(options, node, fieldChild, fnBefore, fnAfter, parentPassed) {
                if (!angular.isFunction(fnBefore)) {
                    return; // jmp out
                }

                var _i, _len, _nodes,
                    _nodePassed   = fnBefore(options, node),
                    _childPassed  = false,
                    _filter_index = options.filter_index;

                if (angular.isDefined(node[fieldChild])) {
                    _nodes = node[fieldChild];
                    _len   = _nodes.length;

                    options.filter_index = 0;
                    for (_i = 0; _i < _len; _i++) {
                        _childPassed = for_all_descendants(
                            options,
                            _nodes[_i],
                            fieldChild,
                            fnBefore,
                            fnAfter,
                            _nodePassed || parentPassed
                        ) || _childPassed;
                    }

                    // restore filter_index of node
                    options.filter_index = _filter_index;
                }

                if (angular.isFunction(fnAfter)) {
                    fnAfter(options, node, _nodePassed === true, _childPassed === true, parentPassed === true);
                }

                return _nodePassed || _childPassed;
            }

            /**
             * Check data with callback
             * @param {string|object|function|regex} callback
             * @param {Node[]|Node|boolean|string|regex} data
             * @returns {undefined|boolean}
             * @callback _fnCheck
             * @private
             */
            function _fnCheck(callback, data) {
                if (angular.isUndefinedOrNull(data) || angular.isArray(data)) {
                    return; // jmp out
                }

                if (angular.isFunction(callback)) {
                    return callback(data, $filter);
                } else {
                    if (typeof callback === 'boolean') {
                        data = !!data;
                        return data === callback;
                    } else if (angular.isDefined(callback)) {
                        try {
                            var _regex = new RegExp(callback);
                            return _regex.test(data);
                        }
                        catch (err) {
                            if (typeof data === 'string') {
                                return data.indexOf(callback) > -1;
                            }
                        }
                    }
                }
            }

            /**
             * `fnProcess` to call `_fnCheck`. If `condition` is `array` then call `for_each_filter`
             * else will call `_fnCheck`. Specical `condition.field` is `_$` then apply `condition.callback` for all field, if have `field` invaild then `return true`.
             *
             * @param node
             * @param condition
             * @param {boolean} isAnd
             * @returns {undefined|boolean}
             * @private
             */
            function _fnProcess(node, condition, isAnd) {
                if (angular.isArray(condition)) {
                    return for_each_filter(node, condition, isAnd);
                } else {
                    var _key      = condition.field,
                        _callback = condition.callback,
                        _iO, _keysO, _lenO;

                    if (_key === '_$') {
                        _keysO = Object.keys(node);
                        _lenO  = _keysO.length;
                        for (_iO = 0; _iO < _lenO; _iO++) {
                            if (_fnCheck(_callback, node[_keysO[_iO]])) {
                                return true;
                            }
                        }
                    } else if (angular.isDefined(node[_key])) {
                        return _fnCheck(_callback, node[_key]);
                    }
                }
            }

            /**
             *
             * @param {Node} node
             * @param {array} conditions - Array `conditions`
             * @param {boolean} isAnd - Check with condition `And`, if `And` then `return false` when all `false`
             * @returns {undefined|boolean}
             */
            function for_each_filter(node, conditions, isAnd) {
                var i, len = conditions.length || 0, passed = false;
                if (len === 0) {
                    return; // jmp out
                }

                for (i = 0; i < len; i++) {
                    if (_fnProcess(node, conditions[i], !isAnd)) {
                        passed = true;
                        // if condition `or` then return;
                        if (!isAnd) {
                            return true;
                        }
                    } else {

                        // if condition `and` and result in fnProccess = false then return;
                        if (isAnd) {
                            return false;
                        }
                    }
                }

                return passed;
            }

            /**
             * Will call _fnAfter to clear data no need
             * @param {object} options
             * @param {NodeFilter} node
             * @param {boolean} isNodePassed
             * @param {boolean} isChildPassed
             * @param {boolean} isParentPassed
             * @private
             */
            function _fnAfter(options, node, isNodePassed, isChildPassed, isParentPassed) {
                /**
                 * @name NodeFilter
                 * @extends Node
                 * @property {boolean} __filtered__
                 * @property {boolean} __filtered_visible__
                 * @property {int} __filtered_index__
                 */
                if (isNodePassed === true) {
                    node.__filtered__         = true;
                    node.__filtered_visible__ = true;
                    node.__filtered_index__   = options.filter_index++;
                    return; //jmp
                } else if (isChildPassed === true && options.showParent === true
                    || isParentPassed === true && options.showChild === true) {
                    node.__filtered__         = false;
                    node.__filtered_visible__ = true;
                    node.__filtered_index__   = options.filter_index++;
                    return; //jmp
                }

                // remove attr __filtered__
                delete node.__filtered__;
                delete node.__filtered_visible__;
                delete node.__filtered_index__;
            }

            /**
             * `fnBefore` will called when `for_all_descendants` of `node` checking.
             * If `filter` empty then return `true` else result of function `_fnProcess` {@see _fnProcess}
             *
             * @param {object} options
             * @param {NodeFilter} node
             * @returns {undefined|boolean}
             * @callback _fnBefore
             * @private
             */
            function _fnBefore(options, node) {
                if (options.filter.length === 0) {
                    return true;
                } else {
                    return _fnProcess(node, options.filter, options.beginAnd || false);
                }
            }

            /**
             * `fnBeforeClear` will called when `for_all_descendants` of `node` checking.
             * Alway false to Clear Filter empty
             *
             * @param {object} options
             * @param {NodeFilter} node
             * @returns {undefined|boolean}
             * @callback _fnBeforeClear
             * @private
             */
            function _fnBeforeClear(options, node) {
                return false;
            }

            /**
             * `_fnConvert` to convert `filter` `object` to `array` invaild.
             *
             * @param {object|array} filters
             * @returns {array} Instead of `filter` or new array invaild *(converted from filter)*
             * @callback _fnConvert
             * @private
             */
            function _fnConvert(filters) {
                var _iF, _lenF, _keysF,
                    _filter,
                    _state;

                // convert filter object to array filter
                if (typeof filters === 'object' && !angular.isArray(filters)) {
                    _keysF  = Object.keys(filters);
                    _lenF   = _keysF.length;
                    _filter = [];

                    if (_lenF > 0) {
                        for (_iF = 0; _iF < _lenF; _iF++) {

                            if (typeof filters[_keysF[_iF]] === 'string' && filters[_keysF[_iF]].length === 0) {
                                continue;
                            } else if (angular.isArray(filters[_keysF[_iF]])) {
                                _state = filters[_keysF[_iF]];
                            } else if (typeof filters[_keysF[_iF]] === 'object') {
                                _state = _fnConvert(filters[_keysF[_iF]]);
                            } else {
                                _state = {
                                    field:    _keysF[_iF],
                                    callback: filters[_keysF[_iF]]
                                };
                            }
                            _filter.push(_state);
                        }
                    }

                    return _filter;
                }
                else {
                    return filters;
                }
            }

            /**
             * `fnInitFilter` function is constructor of service `$TreeDnDFilter`.
             * @param {NodeFilter|NodeFilter[]} treeData
             * @param {object|array} filters
             * @param {object} options
             * @param {string} keyChild
             * @returns {array} Return `treeData` or `treeData` with `filter`
             */
            function fnInitFilter(treeData, filters, options, keyChild) {
                if (!angular.isArray(treeData)
                    || treeData.length === 0) {
                    return treeData;
                }

                var _i, _len,
                    _filter;

                _filter = _fnConvert(filters);
                if (!(angular.isArray(_filter) || typeof _filter === 'object')
                    || _filter.length === 0) {
                    for (_i = 0, _len = treeData.length; _i < _len; _i++) {
                        for_all_descendants(
                            options,
                            treeData[_i],
                            keyChild || '__children__',
                            _fnBeforeClear, _fnAfter
                        );
                    }

                    return treeData;
                }

                options.filter       = _filter;
                options.filter_index = 0;
                for (_i = 0, _len = treeData.length; _i < _len; _i++) {
                    for_all_descendants(
                        options,
                        treeData[_i],
                        keyChild || '__children__',
                        _fnBefore, _fnAfter
                    );
                }

                return treeData;
            }

        }]
    );

/**
 * Factory $TreeDnDOrderBy
 *
 * @name Factory.$TreeDnDOrderBy
 * @type {fnInitTreeOrderBy}
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDOrderBy', [
        '$filter',
        function ($filter) {
            var _fnOrderBy          = $filter('orderBy'),
                /**
                 * Foreach all descendants
                 *
                 * @param options
                 * @param {Node} node          - Node
                 * @param {string} name        - Name attribute
                 * @param {function} fnOrderBy - Callback orderBy
                 * @returns {Node}
                 * @callback for_all_descendants
                 * @private
                 */
                for_all_descendants = function for_all_descendants(options, node, name, fnOrderBy) {
                    var _i, _len, _nodes;

                    if (angular.isDefined(node[name])) {
                        _nodes = node[name];
                        _len   = _nodes.length;
                        // OrderBy children
                        for (_i = 0; _i < _len; _i++) {
                            _nodes[_i] = for_all_descendants(options, _nodes[_i], name, fnOrderBy);
                        }

                        node[name] = fnOrderBy(node[name], options);
                    }

                    return node;
                },

                /**
                 * Function order
                 * @param {Node[]} list
                 * @param {string} orderBy
                 * @returns {Node[]}
                 * @private
                 */
                _fnOrder            = function _fnOrder(list, orderBy) {
                    return _fnOrderBy(list, orderBy);
                },

                /**
                 * Function tree orderBy
                 *
                 * @type {function}
                 * @param {Node[]} treeData
                 * @param {string} orderBy
                 * @returns {Node[]}
                 * @callback fnInitTreeOrderBy
                 */
                fnInitTreeOrderBy   = function fnInitTreeOrderBy(treeData, orderBy) {
                    if (!angular.isArray(treeData)
                        || treeData.length === 0
                        || !(angular.isArray(orderBy) || typeof orderBy === 'object' || angular.isString(orderBy) || angular.isFunction(orderBy))
                        || orderBy.length === 0 && !angular.isFunction(orderBy)
                    ) {
                        return treeData;
                    }

                    var _i, _len;

                    for (_i = 0, _len = treeData.length; _i < _len; _i++) {
                        treeData[_i] = for_all_descendants(
                            orderBy,
                            treeData[_i],
                            '__children__',
                            _fnOrder
                        );
                    }

                    return _fnOrder(treeData, orderBy);
                };

            return fnInitTreeOrderBy;
        }]
    );

/**
 * Factory $TreeDnDConvert
 *
 * @name Factory.$TreeDnDConvert
 * @type {$TreeDnDConvert}
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDConvert', function () {
        /**
         * NodeBase
         * @name NodeBase
         * @type object
         * @property {NodeBase[]|undefined} [__children__]
         */

        /**
         * @name $TreeDnDConvert
         * @type object
         * @default
         */
        var $TreeDnDConvert = {
            /**
             * Line to tree
             *
             * @param {Array|Object} data
             * @param {string} primaryKey
             * @param {string} parentKey
             * @param {function} callback
             * @returns {NodeBase[]}
             */
            line2tree: function (data, primaryKey, parentKey, callback) {
                callback = typeof callback === 'function' ? callback : function () {
                };

                if (!data || data.length === 0 || !primaryKey || !parentKey) {
                    return [];
                }

                var tree     = [],
                    rootIds  = [],
                    item     = data[0],
                    _primary = item[primaryKey],
                    treeObjs = {},
                    parentId, parent,
                    len      = data.length,
                    i        = 0;

                while (i < len) {
                    item = data[i++];
                    callback(item);
                    _primary           = item[primaryKey];
                    treeObjs[_primary] = item;
                }


                i = 0;
                while (i < len) {
                    item = data[i++];

                    callback(item);

                    _primary           = item[primaryKey];
                    treeObjs[_primary] = item;
                    parentId           = item[parentKey];

                    if (parentId) {
                        parent = treeObjs[parentId];
                        if (parent) {
                            if (parent.__children__) {
                                if (angular.isArray(parent.__children__)) {
                                    parent.__children__.push(item);
                                } else {
                                    console.error('Type of `parent.__children__` isn\'t array');
                                    console.log(parent.__children__);
                                }
                            } else {
                                parent.__children__ = [item];
                            }
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
            /**
             * Convert tree to tree
             *
             * @param {array|object} data
             * @param {string} containKey
             * @param {function} callback
             * @returns {NodeBase[]}
             */
            tree2tree: function access_child(data, containKey, callback) {
                callback = typeof callback === 'function' ? callback : function () {
                };

                var _tree = [],
                    _i,
                    _len  = data ? data.length : 0,
                    _copy, _child;

                for (_i = 0; _i < _len; _i++) {
                    _copy = angular.copy(data[_i]);

                    callback(_copy);

                    if (angular.isArray(_copy[containKey]) && _copy[containKey].length > 0) {
                        _child = access_child(_copy[containKey], containKey, callback);
                        delete _copy[containKey];
                        _copy.__children__ = _child;
                    }

                    _tree.push(_copy);
                }

                return _tree;
            }
        };

        return $TreeDnDConvert;
    });

/**
 * Factory $TreeDnDHelper
 * @namespace $TreeDnDHelper
 * @name $TreeDnDHelper
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDHelper', [
        '$document', '$window',
        function ($document, $window) {
            var _$helper = /** @lends $TreeDnDHelper */ {
                /**
                 * Status is no draggable
                 *
                 * @param {DOMElement} targetElm
                 * @returns {boolean}
                 */
                nodrag:   function (targetElm) {
                    return typeof targetElm.attr('data-nodrag') !== 'undefined';
                },
                /**
                 *
                 * Get event's object
                 * @param {object} e
                 * @returns {object|null}
                 */
                eventObj: function (e) {
                    var obj = e;

                    if (e.targetTouches !== undefined) {
                        obj = e.targetTouches.item(0);
                    } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                        obj = e.originalEvent.targetTouches.item(0);
                    }

                    return obj;
                },

                /**
                 * Get drag info
                 *
                 * @param {$scope} scope
                 * @returns {object}
                 */
                dragInfo: function (scope) {
                    var _node   = scope.getData(),
                        _tree   = scope.getScopeTree(),
                        _parent = scope.getNode(_node.__parent_real__);

                    return {
                        node:    _node,
                        parent:  _parent,
                        move:    {
                            parent: _parent,
                            pos:    _node.__index__
                        },
                        scope:   scope,
                        target:  _tree,
                        drag:    _tree,
                        drop:    scope.getPrevSibling(_node),
                        changed: false
                    };
                },

                /**
                 * Get element's height
                 *
                 * @param {DOMElement} element
                 * @returns {number}
                 */
                height: function (element) {
                    return element.prop('scrollHeight');
                },

                /**
                 * Get element's width
                 *
                 * @param {DOMElement} element
                 * @returns {number}
                 */
                width: function (element) {
                    return element.prop('scrollWidth');
                },

                /**
                 * Get element's offset
                 *
                 * @param {DOMElement} element
                 * @returns {{width: *, height: *, top: *, left: *}}
                 */
                offset: function (element) {
                    var boundingClientRect = element[0].getBoundingClientRect();

                    return {
                        width:  element.prop('offsetWidth'),
                        height: element.prop('offsetHeight'),
                        top:    boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                        left:   boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * Get position started of element drag or drop
                 *
                 * @param {Event} e
                 * @param {DOMElement} target
                 * @returns {ElementPosition}
                 */
                positionStarted: function (e, target) {
                    /**
                     * Element position information (when drag & drop)
                     *
                     * @name ElementPosition
                     * @type {object}
                     * @property {number} offsetX
                     * @property {number} offsetY
                     * @property {number} startX
                     * @property {number} lastX
                     * @property {number} startY
                     * @property {number} lastY
                     * @property {number} nowX
                     * @property {number} nowY
                     * @property {number} distX - Distance of X
                     * @property {number} distY - Distance of Y
                     * @property {number} dirAX - Direct of Ax
                     * @property {number} dirX - Direct of X
                     * @property {number} dirY - Direct of Y
                     * @property {number} LastDirX - Last direct of X
                     * @property {number} distAxX - Distance of AxX
                     * @property {number} distAxY - Distance of AxY
                     */
                    var ElementPosition = {
                        offsetX:  e.pageX - this.offset(target).left,
                        offsetY:  e.pageY - this.offset(target).top,
                        startX:   e.pageX,
                        lastX:    e.pageX,
                        startY:   e.pageY,
                        lastY:    e.pageY,
                        nowX:     0,
                        nowY:     0,
                        distX:    0,
                        distY:    0,
                        dirAx:    0,
                        dirX:     0,
                        dirY:     0,
                        lastDirX: 0,
                        lastDirY: 0,
                        distAxX:  0,
                        distAxY:  0
                    };

                    return ElementPosition;
                },

                /**
                 * Get position moved
                 *
                 * @param {Event} e
                 * @param {ElementPosition} pos
                 * @param {bool} firstMoving
                 * @return {object}
                 */
                positionMoved: function (e, pos, firstMoving) {
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
                        pos.dirAx  = newAx;
                        pos.moving = true;

                        return; // jmp out
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

                    return pos;
                },

                /**
                 * Replace with indent
                 *
                 * @param {$scope} scope
                 * @param {DOMElement} element
                 * @param {number} indent
                 * @param {string} attr
                 */
                replaceIndent: function (scope, element, indent, attr) {
                    attr = attr || 'left';
                    angular.element(element.children()[0]).css(attr, scope.$callbacks.calsIndent(indent));
                },

                /**
                 * Is type tree node
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNode: function (element) {
                    if (element) {
                        var $element = angular.element(element);
                        return $element && $element.length && typeof $element.attr('tree-dnd-node') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree nodes (container)
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNodes: function (element) {
                    if (element) {
                        var $element = angular.element(element);

                        return $element && $element.length && typeof $element.attr('tree-dnd-nodes') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree node handle (element to call event drag)
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNodeHandle: function (element) {
                    if (element) {
                        var $element = angular.element(element);

                        return $element && $element.length && typeof $element.attr('tree-dnd-node-handle') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree droppable
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndDroppable: function (element) {
                    return _$helper.isTreeDndNode(element)
                        || _$helper.isTreeDndNodes(element)
                        || _$helper.isTreeDndNodeHandle(element);
                },

                /**
                 * Find element closest by attribute
                 *
                 * @param {DOMElement} element
                 * @param {string|function} attr
                 * @returns {DOMElement}
                 */
                closestByAttr: function fnClosestByAttr(element, attr) {
                    if (element && attr) {
                        var $element = angular.element(element),
                            $parent  = $element.parent();

                        if ($parent) {
                            var isPassed = false;

                            switch (typeof attr) {
                                case 'function':
                                    isPassed = attr($parent);
                                    break;
                                default:
                                    isPassed = typeof $parent.attr(attr) !== 'undefined';
                                    break;
                            }

                            if (isPassed) {
                                return $parent;
                            } else {
                                return fnClosestByAttr($parent, attr);
                            }
                        }
                    }
                }
            };

            return _$helper;
        }]
    );

angular.module('ntt.TreeDnD')
    .factory('$TreeDnDPlugin', [
        '$injector',
        function ($injector) {
            return _fnget;

            function _fnget(name) {
                if (angular.isDefined($injector) && $injector.has(name)) {
                    return $injector.get(name);
                }
            }
        }]
    );

/**
 * Factory `$TreeDnDTemplate`
 * @name Factory.$TreeDnDTemplate
 * @type {TreeDnDTemplate}
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDTemplate', [
        '$templateCache',
        function ($templateCache) {
            var templatePath = 'template/TreeDnD/TreeDnD.html',

                /**
                 * @private
                 * @type {string}
                 */
                copyPath     = 'template/TreeDnD/TreeDnDStatusCopy.html',

                /**
                 * @private
                 * @type {string}
                 */
                movePath     = 'template/TreeDnD/TreeDnDStatusMove.html',

                /**
                 * @private
                 * @type {object}
                 */
                scopes       = {};

            /**
             * TreeDnDTemplate
             *
             * @constructor TreeDnDTemplate
             * @hideConstructor
             */
            var InitTreeDnDTemplate = /** @lends TreeDnDTemplate */ {
                /**
                 * Set path of template move
                 *
                 * @param {string} path - Path of template
                 * @param {$scope} scope - Scope of tree
                 */
                setMove: function (path, scope) {
                    if (!scopes[scope.$id]) {
                        scopes[scope.$id] = {};
                    }
                    scopes[scope.$id].movePath = path;
                },

                /**
                 * Set path of template copy
                 *
                 * @param {string} path - Path of template
                 * @param {$scope} scope - Scope of tree
                 */
                setCopy: function (path, scope) {
                    if (!scopes[scope.$id]) {
                        scopes[scope.$id] = {};
                    }
                    scopes[scope.$id].copyPath = path;
                },

                /**
                 * Get template's path
                 *
                 * @returns {string}
                 */
                getPath: function () {
                    return templatePath;
                },

                /**
                 * Get template's copy
                 *
                 * @param {$scope} scope - Scope of tree
                 * @returns {string|html}
                 */
                getCopy: function (scope) {
                    if (scopes[scope.$id] && scopes[scope.$id].copyPath) {
                        var temp = $templateCache.get(scopes[scope.$id].copyPath);
                        if (temp) {
                            return temp;
                        }
                    }

                    return $templateCache.get(copyPath);
                },

                /**
                 * Get template's move
                 *
                 * @param {$scope} scope - Scope of tree
                 * @returns {string|html}
                 */
                getMove: function (scope) {
                    if (scopes[scope.$id] && scopes[scope.$id].movePath) {
                        var temp = $templateCache.get(scopes[scope.$id].movePath);
                        if (temp) {
                            return temp;
                        }
                    }

                    return $templateCache.get(movePath);
                }
            };

            return InitTreeDnDTemplate;
        }]
    );

angular.module('ntt.TreeDnD')
    .factory('$TreeDnDViewport', fnInitTreeDnDViewport);

fnInitTreeDnDViewport.$inject = ['$window', '$document', '$timeout', '$q', '$compile'];

function fnInitTreeDnDViewport($window, $document, $timeout, $q, $compile) {

    var viewport,
        isUpdating    = false,
        isRender      = false,
        updateAgain   = false,
        viewportRect,
        items         = [],
        nodeTemplate,
        updateTimeout,
        renderTime,
        $initViewport = {
            setViewport:   setViewport,
            getViewport:   getViewport,
            add:           add,
            setTemplate:   setTemplate,
            getItems:      getItems,
            updateDelayed: updateDelayed
        },
        eWindow       = angular.element($window);

    eWindow.on('load resize scroll', updateDelayed);

    return $initViewport;

    function update() {

        viewportRect = {
            width:  eWindow.prop('offsetWidth') || document.documentElement.clientWidth,
            height: eWindow.prop('offsetHeight') || document.documentElement.clientHeight,
            top:    $document[0].body.scrollTop || $document[0].documentElement.scrollTop,
            left:   $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft
        };

        if (isUpdating || isRender) {
            updateAgain = true;

            return; // jmp out
        }

        isUpdating = true;

        recursivePromise();
    }

    function recursivePromise() {
        if (isRender) {
            return;
        }

        var number = number > 0 ? number : items.length, item;

        if (number > 0) {
            item = items[0];

            isRender   = true;
            renderTime = $timeout(function () {
                //item.element.html(nodeTemplate);
                //$compile(item.element.contents())(item.scope);

                items.splice(0, 1);
                isRender = false;
                number--;
                $timeout.cancel(renderTime);
                recursivePromise();
            }, 0);

        } else {
            isUpdating = false;
            if (updateAgain) {
                updateAgain = false;
                update();
            }
        }

    }

    /**
     * Check if a point is inside specified bounds
     * @param x
     * @param y
     * @param bounds
     * @returns {boolean}
     */
    function pointIsInsideBounds(x, y, bounds) {
        return x >= bounds.left &&
            y >= bounds.top &&
            x <= bounds.left + bounds.width &&
            y <= bounds.top + bounds.height;
    }

    /**
     * Set the viewport element
     *
     * @name setViewport
     * @param element
     * @callback setViewport
     * @private
     */
    function setViewport(element) {
        viewport = element;
    }

    /**
     * Return the current viewport
     *
     * @returns {*}
     * @callback getViewport
     * @private
     */
    function getViewport() {
        return viewport;
    }

    /**
     * trigger an update
     */
    function updateDelayed() {
        $timeout.cancel(updateTimeout);

        updateTimeout = $timeout(
            function () {
                update();
            },
            0
        );
    }

    /**
     * Add listener for event
     * @param {$scope} scope
     * @param {DOMElement} element
     */
    function add(scope, element) {
        updateDelayed();

        items.push({
            element: element,
            scope:   scope
        });
    }

    /**
     *
     *
     * @param {$scope} scope
     * @param {string} template
     * @callback setTemplate
     * @private
     */
    function setTemplate(scope, template) {
        nodeTemplate = template;
    }

    /**
     * Get list of items
     * @returns {Node[]}
     */
    function getItems() {
        return items;
    }
}

angular.module('ntt.TreeDnD')
    .factory('$TreeDnDDrag', [
        '$timeout', '$TreeDnDHelper',
        function ($timeout, $TreeDnDHelper) {

            function _fnPlaceHolder(e, $params) {
                if ($params.placeElm) {
                    var _offset = $TreeDnDHelper.offset($params.placeElm);
                    if (_offset.top <= e.pageY && e.pageY <= _offset.top + _offset.height &&
                        _offset.left <= e.pageX && e.pageX <= _offset.left + _offset.width
                    ) {
                        return true;
                    }
                }

                return false;
            }

            function _fnDragStart(e, $params) {
                if (!$params.hasTouch && (e.button === 2 || e.which === 3)) {
                    // disable right click
                    return; // jmp out
                }

                if (e.uiTreeDragging || e.originalEvent && e.originalEvent.uiTreeDragging) { // event has already fired in other scope.
                    return; // jmp out
                }

                // the element which is clicked.
                var eventElm = angular.element(e.target),
                    eventScope;

                if ($TreeDnDHelper.isTreeDndNodeHandle(eventElm)) {
                    eventScope = eventElm.controller('treeDndNodeHandle').scope;
                } else {
                    eventElm = $TreeDnDHelper.closestByAttr(eventElm, $TreeDnDHelper.isTreeDndNodeHandle);
                    if (eventElm) {
                        eventScope = eventElm.controller('treeDndNodeHandle').scope;
                    }
                }

                if (!eventScope || !eventScope.$type) {
                    return; // jmp out
                }

                // if (eventScope.$type !== 'TreeDnDNode') { // Check if it is a node or a handle
                //     return; // jmp out
                // }

                if (eventScope.$type !== 'TreeDnDNodeHandle') { // If the node has a handle, then it should be clicked by the handle
                    return; // jmp out
                }

                var eventElmTagName = eventElm.prop('tagName').toLowerCase(),
                    dragScope,
                    _$scope         = $params.$scope;

                if (eventElmTagName === 'input'
                    || eventElmTagName === 'textarea'
                    || eventElmTagName === 'button'
                    || eventElmTagName === 'select') { // if it's a input or button, ignore it
                    return; // jmp out
                }

                // check if it or it's parents has a 'data-nodrag' attribute
                while (eventElm && eventElm[0] && eventElm[0] !== $params.element) {
                    if ($TreeDnDHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                        return; // jmp out
                    }
                    eventElm = eventElm.parent();
                }

                e.uiTreeDragging = true; // stop event bubbling

                if (e.originalEvent) {
                    e.originalEvent.uiTreeDragging = true;
                }

                e.preventDefault();

                dragScope = eventScope.getScopeNode();

                $params.dragInfo = $TreeDnDHelper.dragInfo(dragScope);

                if (!_$scope.$callbacks.beforeDrag(dragScope, $params.dragInfo)) {
                    return; // jmp out
                }

                $params.firstMoving = true;

                _$scope.setDragging($params.dragInfo);

                var eventObj = $TreeDnDHelper.eventObj(e);

                $params.pos = $TreeDnDHelper.positionStarted(eventObj, dragScope.$element);

                if (dragScope.isTable) {
                    $params.dragElm = angular.element($params.$window.document.createElement('table'))
                        .addClass(_$scope.$class.tree)
                        .addClass(_$scope.$class.drag)
                        .addClass(_$scope.$tree_class);
                } else {
                    $params.dragElm = angular.element($params.$window.document.createElement('ul'))
                        .addClass(_$scope.$class.drag)
                        .addClass('tree-dnd-nodes')
                        .addClass(_$scope.$tree_class);
                }

                $params.dragElm.css(
                    {
                        'width':   $TreeDnDHelper.width(dragScope.$element) + 'px',
                        'z-index': 9995
                    }
                );

                $params.offsetEdge = 0;
                var _width         = $TreeDnDHelper.width(dragScope.$element),
                    _scope         = dragScope,
                    _element       = _scope.$element,
                    _clone,
                    _needCollapse  = !!_$scope.enabledCollapse,
                    _copied        = false,
                    _tbody,
                    _frag;

                if (_scope.isTable) {
                    $params.offsetEdge = $params.dragInfo.node.__level__ - 1;

                    _tbody = angular.element(document.createElement('tbody'));
                    _frag  = angular.element(document.createDocumentFragment());

                    _$scope.for_all_descendants(
                        $params.dragInfo.node, function (_node, _parent) {
                            _scope   = _$scope.getScope(_node);
                            _element = _scope && _scope.$element;
                            if (_scope && _element) {
                                if (!_copied) {
                                    _clone = _element.clone();

                                    $TreeDnDHelper.replaceIndent(
                                        _$scope,
                                        _clone,
                                        _node.__level__ - $params.offsetEdge,
                                        'padding-left'
                                    );

                                    _frag.append(_clone);

                                    // skip all, just clone parent
                                    if (_needCollapse) {
                                        _copied = true;
                                    }

                                    // hide if have status Move;
                                    if (_$scope.enabledMove && _$scope.$class.hidden &&
                                        (!_parent || _node.__visible__ || _parent.__visible__ && _parent.__expanded__)) {
                                        _element.addClass(_$scope.$class.hidden);
                                    }
                                }
                            }
                            // skip children of node not expand.
                            return _copied || _node.__visible__ === false || _node.__expanded__ === false;

                        },
                        undefined,
                        !_needCollapse
                    );

                    _tbody.append(_frag);

                    $params.dragElm.append(_tbody);
                } else {

                    _clone = _element.clone();
                    if (_needCollapse) {
                        _clone[0].querySelector('[tree-dnd-nodes]').remove();
                    }

                    // hide if have status Move;
                    $params.dragElm.append(_clone);
                    if (_$scope.enabledMove && _$scope.$class.hidden) {
                        _element.addClass(_$scope.$class.hidden);
                    }
                }

                $params.dragElm.css(
                    {
                        'left': eventObj.pageX - $params.pos.offsetX + _$scope.$callbacks.calsIndent(
                            $params.offsetEdge + 1,
                            true,
                            true
                        ) + 'px',
                        'top':  eventObj.pageY - $params.pos.offsetY + 'px'
                    }
                );
                // moving item with descendant
                $params.$document.find('body').append($params.dragElm);
                if (_$scope.$callbacks.droppable()) {
                    $params.placeElm = _$scope.initPlace(dragScope.$element, $params.dragElm);

                    if (dragScope.isTable) {
                        $TreeDnDHelper.replaceIndent(_$scope, $params.placeElm, $params.dragInfo.node.__level__);
                    }

                    $params.placeElm.css('width', _width);
                }

                _$scope.showPlace();
                _$scope.targeting = true;

                if (_$scope.enabledStatus) {
                    _$scope.refreshStatus();
                    _$scope.setPositionStatus(e);
                }

                angular.element($params.$document).bind('touchend', $params.dragEndEvent);
                angular.element($params.$document).bind('touchcancel', $params.dragEndEvent);
                angular.element($params.$document).bind('touchmove', $params.dragMoveEvent);
                angular.element($params.$document).bind('mouseup', $params.dragEndEvent);
                angular.element($params.$document).bind('mousemove', $params.dragMoveEvent);
                angular.element($params.$document).bind('mouseleave', $params.dragCancelEvent);

                $params.document_height = Math.max(
                    $params.body.scrollHeight,
                    $params.body.offsetHeight,
                    $params.html.clientHeight,
                    $params.html.scrollHeight,
                    $params.html.offsetHeight
                );

                $params.document_width = Math.max(
                    $params.body.scrollWidth,
                    $params.body.offsetWidth,
                    $params.html.clientWidth,
                    $params.html.scrollWidth,
                    $params.html.offsetWidth
                );
            }

            function _fnDragMove(e, $params) {
                var _$scope = $params.$scope;
                if (!$params.dragStarted) {
                    if (!$params.dragDelaying) {
                        $params.dragStarted = true;
                        _$scope.$safeApply(function () {
                            _$scope.$callbacks.dragStart($params.dragInfo);
                        });
                    }

                    return; // jmp out
                }

                if ($params.dragElm) {
                    e.preventDefault();

                    if ($params.$window.getSelection) {
                        $params.$window.getSelection().removeAllRanges();
                    } else if ($params.$window.document.selection) {
                        $params.$window.document.selection.empty();
                    }

                    var eventObj   = $TreeDnDHelper.eventObj(e),
                        leftElmPos = eventObj.pageX - $params.pos.offsetX,
                        topElmPos  = eventObj.pageY - $params.pos.offsetY;

                    //dragElm can't leave the screen on the left
                    if (leftElmPos < 0) {
                        leftElmPos = 0;
                    }

                    //dragElm can't leave the screen on the top
                    if (topElmPos < 0) {
                        topElmPos = 0;
                    }

                    //dragElm can't leave the screen on the bottom
                    if (topElmPos + 10 > $params.document_height) {
                        topElmPos = $params.document_height - 10;
                    }

                    //dragElm can't leave the screen on the right
                    if (leftElmPos + 10 > $params.document_width) {
                        leftElmPos = $params.document_width - 10;
                    }

                    $params.dragElm.css(
                        {
                            'left': leftElmPos + _$scope.$callbacks.calsIndent(
                                $params.offsetEdge + 1,
                                true,
                                true
                            ) + 'px',
                            'top':  topElmPos + 'px'
                        }
                    );

                    if (_$scope.enabledStatus) {
                        _$scope.setPositionStatus(e);
                    }

                    var top_scroll    = window.pageYOffset || $params.$window.document.documentElement.scrollTop,
                        bottom_scroll = top_scroll + (window.innerHeight || $params.$window.document.clientHeight || $params.$window.document.clientHeight);
                    // to scroll down if cursor y-position is greater than the bottom position the vertical scroll
                    if (bottom_scroll < eventObj.pageY && bottom_scroll <= $params.document_height) {
                        window.scrollBy(0, 10);
                    }
                    // to scroll top if cursor y-position is less than the top position the vertical scroll
                    if (top_scroll > eventObj.pageY) {
                        window.scrollBy(0, -10);
                    }

                    $TreeDnDHelper.positionMoved(e, $params.pos, $params.firstMoving);

                    if ($params.firstMoving) {
                        $params.firstMoving = false;

                        return; // jmp out
                    }
                    // check if add it as a child node first

                    var targetX    = eventObj.pageX - $params.$window.document.body.scrollLeft,
                        targetY    = eventObj.pageY - (window.pageYOffset || $params.$window.document.documentElement.scrollTop),

                        targetElm,
                        targetScope,
                        targetBefore,
                        targetOffset,

                        isChanged  = true,
                        isVeritcal = true,
                        isEmpty,
                        isSwapped,

                        _scope,
                        _target,
                        _parent,
                        _info      = $params.dragInfo,
                        _move      = _info.move,
                        _drag      = _info.node,
                        _drop      = _info.drop,
                        treeScope  = _info.target,
                        fnSwapTree,
                        isHolder   = _fnPlaceHolder(e, $params);

                    if (!isHolder) {
                        /* when using elementFromPoint() inside an iframe, you have to call
                         elementFromPoint() twice to make sure IE8 returns the correct value*/
                        $params.$window.document.elementFromPoint(targetX, targetY);

                        targetElm = angular.element($params.$window.document.elementFromPoint(targetX, targetY));

                        if (!$TreeDnDHelper.isTreeDndDroppable(targetElm)) {
                            targetElm = $TreeDnDHelper.closestByAttr(targetElm, $TreeDnDHelper.isTreeDndDroppable);
                        }

                        if ($TreeDnDHelper.isTreeDndNode(targetElm)) {
                            targetScope = targetElm.controller('treeDndNode').scope;
                        } else if ($TreeDnDHelper.isTreeDndNodes(targetElm)) {
                            targetScope = targetElm.controller('treeDndNodes').scope;
                        } else if ($TreeDnDHelper.isTreeDndNodeHandle(targetElm)) {
                            targetScope = targetElm.controller('treeDndNodeHandle').scope;
                        }

                        if (!targetScope || !targetScope.$callbacks || !targetScope.$callbacks.droppable()) {
                            // Not allowed Drop Item
                            return; // jmp out
                        }

                        fnSwapTree = function () {
                            treeScope = targetScope.getScopeTree();
                            _target   = _info.target;

                            if (_info.target !== treeScope) {
                                // Replace by place-holder new
                                _target.hidePlace();
                                _target.targeting   = false;
                                treeScope.targeting = true;

                                _info.target     = treeScope;
                                $params.placeElm = treeScope.initPlace(targetScope.$element, $params.dragElm);

                                _target   = undefined;
                                isSwapped = true;
                            }
                            return true;
                        };

                        if (angular.isFunction(targetScope.getScopeNode)) {
                            targetScope = targetScope.getScopeNode();
                            if (!fnSwapTree()) {
                                return; // jmp out
                            }
                        } else {
                            if (targetScope.$type === 'TreeDnDNodes' || targetScope.$type === 'TreeDnD') {
                                if (targetScope.tree_nodes) {
                                    if (targetScope.tree_nodes.length === 0) {
                                        if (!fnSwapTree()) {
                                            return; // jmp out
                                        }
                                        // Empty
                                        isEmpty = true;
                                    }
                                } else {
                                    return; // jmp out
                                }
                            } else {
                                return; // jmp out
                            }
                        }
                    }

                    if ($params.pos.dirAx && !isSwapped || isHolder) {
                        isVeritcal  = false;
                        targetScope = _info.scope;
                    }

                    if (!targetScope.$element && !targetScope) {
                        return; // jmp out
                    }

                    if (isEmpty) {
                        _move.parent = undefined;
                        _move.pos    = 0;

                        _drop = undefined;
                    } else {
                        // move vertical
                        if (isVeritcal) {
                            targetElm = targetScope.$element; // Get the element of tree-dnd-node
                            if (angular.isUndefinedOrNull(targetElm)) {
                                return; // jmp out
                            }
                            targetOffset = $TreeDnDHelper.offset(targetElm);

                            if (targetScope.horizontal && !targetScope.isTable) {
                                targetBefore = eventObj.pageX < targetOffset.left + $TreeDnDHelper.width(targetElm) / 2;
                            } else {
                                if (targetScope.isTable) {
                                    targetBefore = eventObj.pageY < targetOffset.top + $TreeDnDHelper.height(targetElm) / 2;
                                } else {
                                    var _height = $TreeDnDHelper.height(targetElm);

                                    if (targetScope.getElementChilds()) {
                                        _height -= -$TreeDnDHelper.height(targetScope.getElementChilds());
                                    }

                                    if (eventObj.pageY > targetOffset.top + _height) {
                                        return; // jmp out
                                    }

                                    targetBefore = eventObj.pageY < targetOffset.top + _height / 2;
                                }
                            }

                            if (!angular.isFunction(targetScope.getData)) {
                                return; // jmp out
                            }

                            _target = targetScope.getData();
                            _parent = targetScope.getNode(_target.__parent_real__);

                            if (targetBefore) {
                                var _prev = targetScope.getPrevSibling(_target);

                                _move.parent = _parent;
                                _move.pos    = angular.isDefined(_prev) ? _prev.__index__ + 1 : 0;

                                _drop = _prev;
                            } else {
                                if (_target.__expanded__ && !(_target.__children__.length === 1 && _target.__index_real__ === _drag.__parent_real__)) {
                                    _move.parent = _target;
                                    _move.pos    = 0;

                                    _drop = undefined;
                                } else {
                                    _move.parent = _parent;
                                    _move.pos    = _target.__index__ + 1;

                                    _drop = _target;
                                }
                            }
                        } else {
                            // move horizontal
                            if ($params.pos.dirAx && $params.pos.distAxX >= treeScope.dragBorder) {
                                $params.pos.distAxX = 0;
                                // increase horizontal level if previous sibling exists and is not collapsed
                                if ($params.pos.distX > 0) {
                                    _parent = _drop;
                                    if (!_parent) {
                                        if (_move.pos - 1 >= 0) {
                                            _parent = _move.parent.__children__[_move.pos - 1];
                                        } else {
                                            return; // jmp out
                                        }
                                    }

                                    if (_info.drag === _info.target && _parent === _drag && _$scope.enabledMove) {
                                        _parent = treeScope.getPrevSibling(_parent);
                                    }

                                    if (_parent && _parent.__visible__) {
                                        var _len = _parent.__children__.length;

                                        _move.parent = _parent;
                                        _move.pos    = _len;

                                        if (_len > 0) {
                                            _drop = _parent.__children__[_len - 1];
                                        } else {
                                            _drop = undefined;
                                        }
                                    } else {
                                        // Not changed
                                        return; // jmp out
                                    }
                                } else if ($params.pos.distX < 0) {
                                    _target = _move.parent;
                                    if (_target &&
                                        (_target.__children__.length === 0 ||
                                            _target.__children__.length - 1 < _move.pos ||
                                            _info.drag === _info.target &&
                                            _target.__index_real__ === _drag.__parent_real__ &&
                                            _target.__children__.length - 1 === _drag.__index__ && _$scope.enabledMove)
                                    ) {
                                        _parent = treeScope.getNode(_target.__parent_real__);

                                        _move.parent = _parent;
                                        _move.pos    = _target.__index__ + 1;

                                        _drop = _target;
                                    } else {
                                        // Not changed
                                        return; // jmp out
                                    }
                                } else {
                                    return; // jmp out
                                }
                            } else {
                                // limited
                                return;
                            }
                        }
                    }

                    if (_info.drag === _info.target &&
                        _move.parent &&
                        _drag.__parent_real__ === _move.parent.__index_real__ &&
                        _drag.__index__ === _move.pos
                    ) {
                        isChanged = false;
                    }

                    if (treeScope.$callbacks.accept(_info, _move, isChanged)) {
                        _info.move    = _move;
                        _info.drop    = _drop;
                        _info.changed = isChanged;
                        _info.scope   = targetScope;

                        if (targetScope.isTable) {
                            $TreeDnDHelper.replaceIndent(
                                treeScope,
                                $params.placeElm,
                                angular.isUndefinedOrNull(_move.parent) ? 1 : _move.parent.__level__ + 1
                            );

                            if (_drop) {
                                _parent = (_move.parent ? _move.parent.__children__ : undefined) || _info.target.treeData;

                                if (_drop.__index__ < _parent.length - 1) {
                                    // Find fast
                                    _drop  = _parent[_drop.__index__ + 1];
                                    _scope = _info.target.getScope(_drop);
                                    _scope.$element[0].parentNode.insertBefore(
                                        $params.placeElm[0],
                                        _scope.$element[0]
                                    );
                                } else {
                                    _target = _info.target.getLastDescendant(_drop);
                                    _scope  = _info.target.getScope(_target);
                                    _scope.$element.after($params.placeElm);
                                }
                            } else {
                                _scope = _info.target.getScope(_move.parent);
                                if (_scope) {
                                    if (_move.parent) {
                                        _scope.$element.after($params.placeElm);

                                    } else {
                                        _scope.getElementChilds().prepend($params.placeElm);
                                    }
                                }
                            }
                        } else {
                            _scope = _info.target.getScope(_drop || _move.parent);
                            if (_drop) {
                                _scope.$element.after($params.placeElm);
                            } else {
                                _scope.getElementChilds().prepend($params.placeElm);
                            }
                        }

                        treeScope.showPlace();

                        _$scope.$safeApply(function () {
                            _$scope.$callbacks.dragMove(_info);
                        });
                    }

                }
            }

            function _fnDragEnd(e, $params) {
                e.preventDefault();
                if ($params.dragElm) {
                    var _passed  = false,
                        _$scope  = $params.$scope,
                        _scope   = _$scope.getScope($params.dragInfo.node),
                        _element = _scope.$element;

                    _$scope.$safeApply(function () {
                        _passed = _$scope.$callbacks.beforeDrop($params.dragInfo);
                    });

                    // rollback all
                    if (_scope.isTable) {
                        _$scope.for_all_descendants(
                            $params.dragInfo.node, function (_node, _parent) {
                                _scope   = _$scope.getScope(_node);
                                _element = _scope && _scope.$element;
                                if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                    if (_$scope.$class.hidden) {
                                        _element.removeClass(_$scope.$class.hidden);
                                    }
                                }
                                return _node.__visible__ === false || _node.__expanded__ === false;
                            },
                            undefined,
                            true
                        );
                    } else {
                        if (_$scope.$class.hidden) {
                            _element.removeClass(_$scope.$class.hidden);
                        }
                    }

                    $params.dragElm.remove();
                    $params.dragElm = undefined;

                    if (_$scope.enabledStatus) {
                        _$scope.hideStatus();
                    }

                    if (_$scope.$$apply) {
                        _$scope.$safeApply(function () {
                            var _status = _$scope.$callbacks.dropped(
                                $params.dragInfo,
                                _passed
                            );

                            _$scope.$callbacks.dragStop($params.dragInfo, _status);
                            clearData();
                        });
                    } else {
                        _fnBindDrag($params);

                        _$scope.$safeApply(function () {
                            _$scope.$callbacks.dragStop($params.dragInfo, false);
                            clearData();
                        });
                    }

                }

                function clearData() {
                    $params.dragInfo.target.hidePlace();
                    $params.dragInfo.target.targeting = false;

                    $params.dragInfo = undefined;
                    _$scope.$$apply  = false;
                    _$scope.setDragging(undefined);
                }

                angular.element($params.$document).unbind('touchend', $params.dragEndEvent); // Mobile
                angular.element($params.$document).unbind('touchcancel', $params.dragEndEvent); // Mobile
                angular.element($params.$document).unbind('touchmove', $params.dragMoveEvent); // Mobile
                angular.element($params.$document).unbind('mouseup', $params.dragEndEvent);
                angular.element($params.$document).unbind('mousemove', $params.dragMoveEvent);
                angular.element($params.$window.document.body).unbind('mouseleave', $params.dragCancelEvent);
            }

            function _fnDragStartEvent(e, $params) {
                if ($params.$scope.$callbacks.draggable()) {
                    _fnDragStart(e, $params);
                }
            }

            function _fnBindDrag($params) {
                $params.element.bind('touchstart mousedown', function (e) {
                    $params.dragDelaying = true;
                    $params.dragStarted  = false;

                    _fnDragStartEvent(e, $params);

                    $params.dragTimer = $timeout(
                        function () {
                            $params.dragDelaying = false;
                        },
                        $params.$scope.dragDelay
                    );
                });

                $params.element.bind('touchend touchcancel mouseup', function () {
                    $timeout.cancel($params.dragTimer);
                });
            }

            function _fnKeydownHandler(e, $params) {
                var _$scope = $params.$scope;
                if (e.keyCode === 27) {
                    if (_$scope.enabledStatus) {
                        _$scope.hideStatus();
                    }

                    _$scope.$$apply = false;
                    _fnDragEnd(e, $params);
                } else {
                    if (_$scope.enabledHotkey && e.shiftKey) {
                        _$scope.enableMove(true);
                        if (_$scope.enabledStatus) {
                            _$scope.refreshStatus();
                        }

                        if (!$params.dragInfo) {
                            return; // jmp out
                        }

                        var _scope   = _$scope.getScope($params.dragInfo.node),
                            _element = _scope.$element;

                        if (_scope.isTable) {
                            _$scope.for_all_descendants(
                                $params.dragInfo.node,
                                function (_node, _parent) {
                                    _scope   = _$scope.getScope(_node);
                                    _element = _scope && _scope.$element;
                                    if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                        if (_$scope.$class.hidden) {
                                            _element.addClass(_$scope.$class.hidden);
                                        }
                                    }

                                    return _node.__visible__ === false || _node.__expanded__ === false;

                                },
                                undefined,
                                true
                            );
                        } else {
                            if (_$scope.$class.hidden) {
                                _element.addClass(_$scope.$class.hidden);
                            }
                        }
                    }
                }
            }

            function _fnKeyupHandler(e, $params) {
                var _$scope = $params.$scope;

                if (_$scope.enabledHotkey && !e.shiftKey) {
                    _$scope.enableMove(false);

                    if (_$scope.enabledStatus) {
                        _$scope.refreshStatus();
                    }

                    if (!$params.dragInfo) {
                        return; // jmp out
                    }

                    var _scope   = _$scope.getScope($params.dragInfo.node),
                        _element = _scope.$element;

                    if (_scope.isTable) {
                        _$scope.for_all_descendants(
                            $params.dragInfo.node,
                            function (_node, _parent) {
                                _scope   = _$scope.getScope(_node);
                                _element = _scope && _scope.$element;
                                if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                    if (_$scope.$class.hidden) {
                                        _element.removeClass(_$scope.$class.hidden);
                                    }
                                }
                                return _node.__visible__ === false || _node.__expanded__ === false;
                            },
                            undefined,
                            true
                        );
                    } else {
                        if (_$scope.$class.hidden) {
                            _element.removeClass(_$scope.$class.hidden);
                        }
                    }
                }
            }

            function _$init(scope, element, $window, $document) {

                var $params        = {
                        hasTouch:        'ontouchstart' in window,
                        firstMoving:     undefined,
                        dragInfo:        undefined,
                        pos:             undefined,
                        placeElm:        undefined,
                        dragElm:         undefined,
                        dragDelaying:    true,
                        dragStarted:     false,
                        dragTimer:       undefined,
                        body:            document.body,
                        html:            document.documentElement,
                        document_height: undefined,
                        document_width:  undefined,
                        offsetEdge:      undefined,
                        $scope:          scope,
                        $window:         $window,
                        $document:       $document,
                        element:         element,
                        bindDrag:        function () {
                            _fnBindDrag($params);
                        },
                        dragEnd:         function (e) {
                            _fnDragEnd(e, $params);
                        },
                        dragMoveEvent:   function (e) {
                            _fnDragMove(e, $params);
                        },
                        dragEndEvent:    function (e) {
                            scope.$$apply = true;
                            _fnDragEnd(e, $params);
                        },
                        dragCancelEvent: function (e) {
                            _fnDragEnd(e, $params);
                        }
                    },
                    keydownHandler = function (e) {
                        return _fnKeydownHandler(e, $params);
                    },
                    keyupHandler   = function (e) {
                        return _fnKeyupHandler(e, $params);
                    };

                scope.dragEnd = function (e) {
                    $params.dragEnd(e);
                };

                $params.bindDrag();

                angular.element($window.document.body).bind('keydown', keydownHandler);
                angular.element($window.document.body).bind('keyup', keyupHandler);

                //unbind handler that retains scope
                scope.$on('$destroy', function () {
                    angular.element($window.document.body).unbind('keydown', keydownHandler);
                    angular.element($window.document.body).unbind('keyup', keyupHandler);

                    if (scope.statusElm) {
                        scope.statusElm.remove();
                    }

                    if (scope.placeElm) {
                        scope.placeElm.remove();
                    }
                });
            }

            return _$init;
        }
    ]);

angular.module('ntt.TreeDnD')
    .factory('$TreeDnDControl', function () {

        function fnSetCollapse(node) {
            node.__expanded__ = false;
        }

        /**
         * Function set expand
         * @callback fnSetExpand
         * @param {Node} node
         */
        function fnSetExpand(node) {
            node.__expanded__ = true;
        }

        function _$init(scope) {
            /**
             * Object Tree with field function custom
             *
             * @namespace
             * @alias $scope.tree
             */
            var _tree = {
                selected_node:       undefined,
                on_select:           undefined,
                /**
                 * @type {$scope.for_all_descendants}
                 */
                for_all_descendants: scope.for_all_descendants,

                /**
                 * Select node in tree
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                select_node: function (node) {
                    var tree = scope.tree;

                    var _selected = tree.deselect_node();

                    if (typeof node === 'object' && node !== _selected) {
                        node.__selected__ = true;

                        tree.selected_node = node;

                        tree.expand_all_parents(node);

                        if (typeof tree.on_select === 'function') {
                            tree.on_select(node);
                        }
                    }

                    return node;
                },

                /**
                 * Deselect node
                 *
                 * @returns {Node|undefined}
                 */
                deselect_node: function () {
                    var tree = scope.tree;

                    var _target;

                    if (typeof tree.selected_node === 'object') {
                        tree.selected_node.__selected__ = undefined;

                        delete tree.selected_node.__selected__;

                        _target = tree.selected_node;

                        tree.selected_node = undefined;
                    }

                    return _target;
                },

                /**
                 * Get parent of node selecting
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_parent: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (node && node.__parent_real__ !== undefined) {
                        return scope.tree_nodes[node.__parent_real__];
                    }
                },


                /**
                 * Foreach ancestors in node
                 *
                 * @param {Node|undefined} node
                 * @param {fnSetExpand} fn - Function callback
                 *
                 * @returns {boolean}
                 */
                for_all_ancestors: function (node, fn) {
                    var tree = scope.tree;

                    var _parent = tree.get_parent(node);
                    if (_parent) {
                        if (fn(_parent)) {
                            return false;
                        }

                        return tree.for_all_ancestors(_parent, fn);
                    }

                    return true;
                },

                /**
                 * Expand all parents of node selecting
                 *
                 * @param {Node|undefined} node
                 */
                expand_all_parents: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        tree.for_all_ancestors(node, fnSetExpand);
                    }
                },


                /**
                 * Collapse all parents of node selecting
                 *
                 * @param {Node|undefined} node
                 */
                collapse_all_parents: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        tree.for_all_ancestors(node, fnSetCollapse);
                    }
                },

                /**
                 * Reload data in scope
                 *
                 * @returns {Node|Node[]|undefined}
                 */
                reload_data: function () {
                    return scope.reload_data();
                },

                /**
                 * Add node into parent
                 *
                 * @param {Node|Node[]|undefined} parent
                 * @param {Node} new_node
                 * @param {undefined|int} [index]
                 * @param {boolean} [parent_auto_expand=false]
                 *
                 * @returns {Object}
                 */
                add_node: function (parent, new_node, index, parent_auto_expand) {
                    if (typeof parent === 'object') {
                        if (typeof parent.__children__ !== 'object') {
                            parent.__children__ = [];
                        }

                        if (index >= 0) {
                            parent.__children__.splice(index, 0, new_node);
                        } else {
                            parent.__children__.push(new_node);
                        }

                        if (parent_auto_expand) {
                            parent.__expanded__ = true;
                        }
                    } else {
                        if (index >= 0) {
                            scope.treeData.splice(index, 0, new_node);
                        } else {
                            scope.treeData.push(new_node);
                        }
                    }

                    return new_node;
                },

                /**
                 * Add node into root
                 *
                 * @param {Node|undefined} new_node
                 *
                 * @returns {Node|undefined}
                 */
                add_node_root: function (new_node) {
                    if (typeof new_node === 'object') {
                        var tree = scope.tree;

                        tree.add_node(undefined, new_node);
                    }

                    return new_node;
                },

                /**
                 * Expand all node
                 */
                expand_all: function () {
                    var tree = scope.tree;

                    var len = scope.treeData.length;
                    for (var i = 0; i < len; i++) {
                        tree.for_all_descendants(scope.treeData[i], fnSetExpand);
                    }
                },

                /**
                 * Collapse all node
                 */
                collapse_all: function () {
                    var tree = scope.tree;

                    var len = scope.treeData.length;
                    for (var i = 0; i < len; i++) {
                        tree.for_all_descendants(scope.treeData[i], fnSetCollapse);
                    }
                },

                /**
                 * Remove node (or node selecting)
                 *
                 * @param {Node|undefined} node - If `node` is Object then delete `node` else delete `node` selecting
                 */
                remove_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _parent;

                        if (node.__parent_real__ !== undefined) {
                            _parent = tree.get_parent(node).__children__;
                        } else {
                            _parent = scope.treeData;
                        }

                        _parent.splice(node.__index__, 1);

                        tree.reload_data();

                        if (tree.selected_node === node) {
                            tree.selected_node = undefined;
                        }
                    }
                },

                /**
                 * Expand node (or node selecting)
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                expand_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        node.__expanded__ = true;

                        return node;
                    }
                },

                /**
                 * Collapse node (or node selecting)
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                collapse_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        node.__expanded__ = false;

                        return node;
                    }
                },

                /**
                 * Get node selected
                 *
                 * @returns {Node|undefined}
                 */
                get_selected_node: function () {
                    var tree = scope.tree;

                    return tree.selected_node;
                },

                /**
                 * Get node first in root (or selecting)
                 *
                 * @returns {Node|undefined}
                 */
                get_first_node: function () {
                    var tree = scope.tree;

                    var wrapper = tree.selected_node;

                    if (wrapper === undefined) {
                        wrapper = scope.treeData;
                    }

                    if (typeof wrapper === 'object') {
                        var len = wrapper.length;

                        if (len > 0) {
                            return wrapper[0];
                        }
                    }
                },

                /**
                 * Get children of node (or selecting)
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {undefined|Node[]}
                 */
                get_children: function (node) {
                    var tree = scope.tree;

                    if (node === undefined && tree.selected_node === undefined) {
                        return tree.treeData;
                    }

                    node = node || tree.selected_node;

                    if (typeof node === 'object' && node.__children__ !== undefined) {
                        return node.__children__;
                    }
                },

                /**
                 * Get siblings
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {undefined|Node[]}
                 */
                get_siblings: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        var _parent = tree.get_parent(node),
                            _target;

                        if (_parent) {
                            _target = _parent.__children__;
                        } else {
                            _target = scope.treeData;
                        }

                        return _target;
                    }
                },

                /**
                 * Get next sibling
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_next_sibling: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        var _target = tree.get_siblings(node);

                        var n = _target.length;

                        if (node.__index__ < n) {
                            return _target[node.__index__ + 1];
                        }
                    }
                },

                /**
                 * Get previous sibling
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_prev_sibling: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    var _target = tree.get_siblings(node);

                    if (node.__index__ > 0) {
                        return _target[node.__index__ - 1];
                    }
                },

                /**
                 * Get first child
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_first_child: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        var _target = node.__children__;

                        if (_target && _target.length > 0) {
                            return node.__children__[0];
                        }
                    }
                },

                /**
                 * Get closest ancestor next sibling
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_closest_ancestor_next_sibling: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    var _target = tree.get_next_sibling(node);
                    if (_target) {
                        return _target;
                    }

                    var _parent = tree.get_parent(node);
                    if (_parent) {
                        return tree.get_closest_ancestor_next_sibling(_parent);
                    }
                },

                /**
                 * Get next node
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_next_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_first_child(node);

                        if (_target) {
                            return _target;
                        } else {
                            return tree.get_closest_ancestor_next_sibling(node);
                        }
                    }
                },

                /**
                 * Get previous node
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                get_prev_node:       function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_prev_sibling(node);

                        if (_target) {
                            return tree.get_last_descendant(_target);
                        }

                        return tree.get_parent(node);
                    }
                },
                get_last_descendant: scope.getLastDescendant,

                /**
                 * Select parent node
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                select_parent_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _parent = tree.get_parent(node);

                        if (_parent) {
                            return tree.select_node(_parent);
                        }
                    }
                },

                /**
                 * Select first node
                 *
                 * @returns {Node|undefined}
                 */
                select_first_node: function () {
                    var tree = scope.tree;

                    var firstNode = tree.get_first_node();

                    return tree.select_node(firstNode);
                },

                /**
                 * Select next sibling
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                select_next_sibling: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_next_sibling(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },

                /**
                 * Select previous sibling
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {*|Object}
                 */
                select_prev_sibling: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_prev_sibling(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },

                /**
                 * Select next node
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                select_next_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_next_node(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },

                /**
                 * Select previous node
                 *
                 * @param {Node|undefined} node
                 *
                 * @returns {Node|undefined}
                 */
                select_prev_node: function (node) {
                    var tree = scope.tree;

                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        var _target = tree.get_prev_node(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                }
            };

            return _tree;
        }

        return _$init;
    });

angular.module('template/TreeDnD/TreeDnD.html', []).run(
    ['$templateCache', function ($templateCache) {
        $templateCache.put(
            'template/TreeDnD/TreeDnD.html',
            '<table ng-class="$tree_class">' +
            '   <thead>' +
            '       <tr>' +
            '           <th ng-class="expandingProperty.titleClass" ng-style="expandingProperty.titleStyle">' +
            '               {{expandingProperty.displayName || expandingProperty.field || expandingProperty}}' +
            '           <\/th>' +
            '           <th ng-repeat="col in colDefinitions" ng-class="col.titleClass" ng-style="col.titleStyle">' +
            '               {{col.displayName || col.field}}' +
            '           </th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody tree-dnd-nodes>' +
            '       <tr tree-dnd-node="node" ng-repeat="node in tree_nodes track by node.__hashKey__" ' +
            '           ng-if="(node.__inited__ || node.__visible__)"' +
            '           ng-click="onSelect(node)" ' +
            '           ng-class="(node.__selected__ ? \' active\':\'\')">' +
            '           <td tree-dnd-node-handle' +
            '               ng-style="expandingProperty.cellStyle ? expandingProperty.cellStyle : {\'padding-left\': $callbacks.calsIndent(node.__level__)}"' +
            '               ng-class="expandingProperty.cellClass"' +
            '               compile="expandingProperty.cellTemplate">' +
            '               <a data-nodrag>' +
            '                  <i ng-class="node.__icon_class__" ng-click="toggleExpand(node)" class="tree-icon"></i>' +
            '               </a>' +
            '               {{node[expandingProperty.field] || node[expandingProperty]}}' +
            '           </td>' +
            '           <td ng-repeat="col in colDefinitions" ng-class="col.cellClass" ng-style="col.cellStyle" compile="col.cellTemplate">' +
            '               {{node[col.field]}}' +
            '           </td>' +
            '       </tr>' +
            '   </tbody>' +
            '</table>'
        );

        $templateCache.put(
            'template/TreeDnD/TreeDnDStatusCopy.html',
            '<label><i class="fa fa-copy"></i>&nbsp;<b>Copying</b></label>'
        );

        $templateCache.put(
            'template/TreeDnD/TreeDnDStatusMove.html',
            '<label><i class="fa fa-file-text"></i>&nbsp;<b>Moving</b></label>'
        );
    }]
);
})();