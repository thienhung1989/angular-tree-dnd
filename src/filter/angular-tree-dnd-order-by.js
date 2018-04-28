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