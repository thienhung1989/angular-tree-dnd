angular.module('ntt.TreeDnD')
    .factory('$TreeDnDControl', function () {

        function fnSetCollapse(node) {
            node.__expanded__ = false;
        }

        function fnSetExpand(node) {
            node.__expanded__ = true;
        }

        function _$init(scope) {
            var tree = {
                selected_node:        undefined,
                on_select:            undefined,
                for_all_descendants:  scope.for_all_descendants,
                select_node:          function (node) {
                    if (!node) {
                        if (tree.selected_node) {
                            delete tree.selected_node.__selected__;
                        }
                        tree.selected_node = undefined;

                        return;
                    }

                    if (node !== tree.selected_node) {
                        if (tree.selected_node) {
                            delete tree.selected_node.__selected__;
                        }
                        node.__selected__  = true;
                        tree.selected_node = node;
                        tree.expand_all_parents(node);
                        if (angular.isFunction(tree.on_select)) {
                            tree.on_select(node);
                        }
                    }

                    return node;
                },
                deselect_node:        function () {
                    var _target;

                    if (tree.selected_node) {
                        delete tree.selected_node.__selected__;

                        _target = tree.selected_node;

                        tree.selected_node = undefined;
                    }

                    return _target;
                },
                get_parent:           function (node) {
                    node = node || tree.selected_node;

                    if (node && node.__parent_real__ !== undefined) {
                        return scope.tree_nodes[node.__parent_real__];
                    }
                },
                for_all_ancestors:    function (node, fn) {
                    var _parent = tree.get_parent(node);
                    if (_parent) {
                        if (fn(_parent)) {
                            return false;
                        }

                        return tree.for_all_ancestors(_parent, fn);
                    }

                    return true;
                },
                expand_all_parents:   function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        tree.for_all_ancestors(node, fnSetExpand);
                    }
                },
                collapse_all_parents: function (node) {
                    node = node || tree.selected_node;
                    if (angular.isObject(node)) {
                        tree.for_all_ancestors(node, fnSetCollapse);
                    }
                },

                reload_data:                       function () {
                    return scope.reload_data();
                },
                add_node:                          function (parent, new_node, index) {
                    if (typeof index !== 'number') {
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
                    var len = scope.treeData.length;
                    for (var i = 0; i < len; i++) {
                        tree.for_all_descendants(scope.treeData[i], fnSetExpand);
                    }
                },
                collapse_all:                      function () {
                    var len = scope.treeData.length;
                    for (var i = 0; i < len; i++) {
                        tree.for_all_descendants(scope.treeData[i], fnSetCollapse);
                    }
                },
                remove_node:                       function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
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
                expand_node:                       function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        node.__expanded__ = true;

                        return node;
                    }
                },
                collapse_node:                     function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        node.__expanded__ = false;

                        return node;
                    }
                },
                get_selected_node:                 function () {
                    return tree.selected_node;
                },
                get_first_node:                    function () {
                    var len = scope.treeData.length;

                    if (len > 0) {
                        return scope.treeData[0];
                    }
                },
                get_children:                      function (node) {
                    node = node || tree.selected_node;

                    return node.__children__;
                },
                get_siblings:                      function (node) {
                    node = node || tree.selected_node;
                    if (angular.isObject(node)) {
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
                get_next_sibling:                  function (node) {
                    node = node || tree.selected_node;
                    if (angular.isObject(node)) {
                        var _target = tree.get_siblings(node);

                        var n = _target.length;

                        if (node.__index__ < n) {
                            return _target[node.__index__ + 1];
                        }
                    }
                },
                get_prev_sibling:                  function (node) {
                    node = node || tree.selected_node;

                    var _target = tree.get_siblings(node);

                    if (node.__index__ > 0) {
                        return _target[node.__index__ - 1];
                    }
                },
                get_first_child:                   function (node) {
                    node = node || tree.selected_node;
                    if (angular.isObject(node)) {
                        var _target = node.__children__;

                        if (_target && _target.length > 0) {
                            return node.__children__[0];
                        }
                    }
                },
                get_closest_ancestor_next_sibling: function (node) {
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
                get_next_node:                     function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_first_child(node);

                        if (_target) {
                            return _target;
                        } else {
                            return tree.get_closest_ancestor_next_sibling(node);
                        }
                    }
                },
                get_prev_node:                     function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_prev_sibling(node);

                        if (_target) {
                            return tree.get_last_descendant(_target);
                        }

                        return tree.get_parent(node);
                    }
                },
                get_last_descendant:               scope.getLastDescendant,
                select_parent_node:                function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _parent = tree.get_parent(node);

                        if (_parent) {
                            return tree.select_node(_parent);
                        }
                    }
                },
                select_first_node:                 function () {
                    var firstNode = tree.get_first_node();
                    return tree.select_node(firstNode);
                },
                select_next_sibling:               function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_next_sibling(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_prev_sibling:               function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_prev_sibling(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_next_node:                  function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_next_node(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_prev_node:                  function (node) {
                    node = node || tree.selected_node;

                    if (angular.isObject(node)) {
                        var _target = tree.get_prev_node(node);

                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                }
            };

            // override options
            angular.extend(scope.tree, tree);

            return scope.tree;
        }

        return _$init;
    });