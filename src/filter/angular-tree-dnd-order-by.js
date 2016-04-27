angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDOrderBy', [
        '$filter', function ($filter) {
            var _fnOrderBy = $filter('orderBy'),
                for_all_descendants = function for_all_descendants(options, node, name, fnOrderBy) {
                    var _i, _len, _nodes;

                    if (angular.isDefined(node[name])) {
                        _nodes = node[name];
                        _len = _nodes.length;
                        // OrderBy children
                        for (_i = 0; _i < _len; _i++) {
                            _nodes[_i] = for_all_descendants(options, _nodes[_i], name, fnOrderBy);
                        }

                        node[name] = fnOrderBy(node[name], options);
                    }
                    return node;
                },
                _fnOrder = function _fnOrder(list, orderBy) {
                    return _fnOrderBy(list, orderBy);
                },
                _fnMain = function _fnMain(treeData, orderBy) {
                    if (!angular.isArray(treeData)
                        || treeData.length === 0
                        || !(angular.isArray(orderBy) || angular.isObject(orderBy) || angular.isString(orderBy) || angular.isFunction(orderBy))
                        || orderBy.length === 0 && !angular.isFunction(orderBy)) {
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

            return _fnMain;
        }]
);