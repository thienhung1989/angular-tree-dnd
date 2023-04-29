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
                selected_node: undefined,
                on_select: undefined,
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
                get_prev_node: function (node) {
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