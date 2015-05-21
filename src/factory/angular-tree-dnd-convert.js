angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDConvert', function () {
        return {
            line2tree: function (data, primaryKey, parentKey) {
                if (!data || data.length === 0 || !primaryKey || !parentKey) {
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
                };

                return access_child(data);
            }
        };
    }
);