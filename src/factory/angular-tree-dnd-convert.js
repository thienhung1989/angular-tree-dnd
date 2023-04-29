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

                var tree = [],
                    rootIds = [],
                    item = data[0],
                    _primary = item[primaryKey],
                    treeObjs = {},
                    parentId, parent,
                    len = data.length,
                    i = 0;

                while (i < len) {
                    item = data[i++];
                    callback(item);
                    _primary = item[primaryKey];
                    treeObjs[_primary] = item;
                }


                i = 0;
                while (i < len) {
                    item = data[i++];

                    callback(item);

                    _primary = item[primaryKey];
                    treeObjs[_primary] = item;
                    parentId = item[parentKey];

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
                    _len = data ? data.length : 0,
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