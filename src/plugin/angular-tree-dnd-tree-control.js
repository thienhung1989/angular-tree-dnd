angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDControl', function () {
        var _target, _parent,
            i, len;

        function fnSetCollapse(node) {
            node.__expanded__ = false;
        }

        function fnSetExpand(node) {
            node.__expanded__ = true;
        }

        function _$init(scope) {
            var n, tree = {
                selected_node:       null,
                for_all_descendants: scope.for_all_descendants,
                select_node:         function (node) {
                    if (!node) {
                        if (tree.selected_node) {
                            delete tree.selected_node.__selected__;
                        }
                        tree.selected_node = null;
                        return null;
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
                deselect_node:       function () {
                    _target = null;
                    if (tree.selected_node) {
                        delete tree.selected_node.__selected__;
                        _target            = tree.selected_node;
                        tree.selected_node = null;
                    }
                    return _target;
                },
                get_parent:          function (node) {
                    if (node && node.__parent_real__ !== null) {
                        return scope.tree_nodes[node.__parent_real__];
                    }
                    return null;
                },
                for_all_ancestors:   function (child, fn) {
                    _parent = tree.get_parent(child);
                    if (_parent) {
                        if (fn(_parent)) {
                            return false;
                        }

                        return tree.for_all_ancestors(_parent, fn);
                    }
                    return true;
                },
                expand_all_parents:  function (child) {
                    child = child || tree.selected_node;
                    if (typeof child === 'object') {
                        tree.for_all_ancestors(
                            child, fnSetExpand
                        )
                    }
                },
                collapse_all_parents:               function (child) {
                    child = child || tree.selected_node;
                    if (typeof child === 'object') {
                        tree.for_all_ancestors(
                            child, fnSetCollapse
                        )
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
                    len = scope.treeData.length;
                    for (i = 0; i < len; i++) {
                        tree.for_all_descendants(
                            scope.treeData[i], fnSetExpand
                        );
                    }
                },
                collapse_all:                      function () {
                    len = scope.treeData.length;
                    for (i = 0; i < len; i++) {
                        tree.for_all_descendants(
                            scope.treeData[i], fnSetCollapse
                        );
                    }
                },
                remove_node:                       function (node) {
                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        if (node.__parent_real__ !== null) {
                            _parent = tree.get_parent(node).__children__;
                        } else {
                            _parent = scope.treeData;
                        }

                        _parent.splice(node.__index__, 1);

                        tree.reload_data();

                        if (tree.selected_node === node) {
                            tree.selected_node = null;
                        }
                    }
                },
                expand_node:                       function (node) {
                    node = node || tree.selected_node;
                    if (typeof node === 'object' && node.__expanded__) {
                        node.__expanded__ = true;
                        return node;
                    }
                },
                collapse_node:                     function (node) {
                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        node.__expanded__ = false;
                        return node;
                    }
                },
                get_selected_node:                 function () {
                    return tree.selected_node;
                },
                get_first_node:                    function () {
                    len = scope.treeData.length;
                    if (len > 0) {
                        return scope.treeData[0];
                    }
                    return null;
                },
                get_children:                      function (node) {
                    return node.__children__;
                },
                get_siblings:                      function (node) {
                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        _parent = tree.get_parent(node);
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
                    if (typeof node === 'object') {
                        _target = tree.get_siblings(node);
                        n       = _target.length;
                        if (node.__index__ < n) {
                            return _target[node.__index__ + 1];
                        }
                    }
                },
                get_prev_sibling:                  function (node) {
                    node    = node || tree.selected_node;
                    _target = tree.get_siblings(node);
                    if (node.__index__ > 0) {
                        return _target[node.__index__ - 1];
                    }
                },
                get_first_child:                   function (node) {
                    node = node || tree.selected_node;
                    if (typeof node === 'object') {
                        _target = node.__children__;
                        if (_target && _target.length > 0) {
                            return node.__children__[0];
                        }
                    }
                    return null;
                },
                get_closest_ancestor_next_sibling: function (node) {
                    node    = node || tree.selected_node;
                    _target = tree.get_next_sibling(node);
                    if (_target) {
                        return _target;
                    }

                    _parent = tree.get_parent(node);
                    if(_parent)
                    {
                    	return tree.get_closest_ancestor_next_sibling(_parent);
                    }

                    return null;
                },
                get_next_node:                     function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _target = tree.get_first_child(node);
                        if (_target) {
                            return _target;
                        } else {
                            return tree.get_closest_ancestor_next_sibling(node);
                        }
                    }
                },
                get_prev_node:                     function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _target = tree.get_prev_sibling(node);
                        if (_target) {
                            return tree.get_last_descendant(_target);
                        }

                        _parent = tree.get_parent(node);
                        return _parent;
                    }
                },
                get_last_descendant:               scope.getLastDescendant,
                select_parent_node:                function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _parent = tree.get_parent(node);
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

                    if (typeof node === 'object') {
                        _target = tree.get_next_sibling(node);
                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_prev_sibling:               function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _target = tree.get_prev_sibling(node);
                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_next_node:                  function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _target = tree.get_next_node(node);
                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                },
                select_prev_node:                  function (node) {
                    node = node || tree.selected_node;

                    if (typeof node === 'object') {
                        _target = tree.get_prev_node(node);
                        if (_target) {
                            return tree.select_node(_target);
                        }
                    }
                }
            };
            angular.extend(scope.tree, tree);
            return scope.tree;
        }

        return _$init;
    }
);