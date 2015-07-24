angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDFilter', [
        '$filter', function ($filter) {
            return fnInitFilter;

            function for_all_descendants(options, node, fieldChild, fnBefore, fnAfter, parentPassed) {
                if (!angular.isFunction(fnBefore)) {
                    return null;
                }

                var _i, _len, _nodes,
                    _nodePassed  = fnBefore(options, node),
                    _childPassed = false;

                if (angular.isDefined(node[fieldChild])) {
                    _nodes = node[fieldChild];
                    _len   = _nodes.length;
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
                }

                if (angular.isFunction(fnAfter)) {
                    fnAfter(options, node, _nodePassed === true, _childPassed === true, parentPassed === true);
                }

                return _nodePassed || _childPassed;
            }

            /**
             * Check data with callback
             * @param {string|object|function|regex} callback
             * @param {*} data
             * @returns {null|boolean}
             * @private
             */
            function _fnCheck(callback, data) {
                if (angular.isUndefinedOrNull(data) || angular.isArray(data)) {
                    return null;
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
                            } else {
                                return null;
                            }
                        }
                    } else {
                        return null;
                    }
                }
            }

            /**
             * `fnProcess` to call `_fnCheck`. If `condition` is `array` then call `for_each_filter`
             * else will call `_fnCheck`. Specical `condition.field` is `_$` then apply `condition.callback` for all field, if have `field` invaild then `return true`.
             *
             * @param node
             * @param condition
             * @param isAnd
             * @returns {null|boolean}
             * @private
             */
            function _fnProccess(node, condition, isAnd) {
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
                return null;
            }

            /**
             *
             * @param {object} node
             * @param {array} conditions Array `conditions`
             * @param {boolean} isAnd check with condition `And`, if `And` then `return false` when all `false`
             * @returns {null|boolean}
             */
            function for_each_filter(node, conditions, isAnd) {
                var i, len = conditions.length || 0, passed = false;
                if (len === 0) {
                    return null;
                }

                for (i = 0; i < len; i++) {
                    if (_fnProccess(node, conditions[i], !isAnd)) {
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
             * @param {object} node
             * @param {boolean} isNodePassed
             * @param {boolean} isChildPassed
             * @param {boolean} isParentPassed
             * @private
             */
            function _fnAfter(options, node, isNodePassed, isChildPassed, isParentPassed) {
                if (isNodePassed === true) {
                    node.__filtered__         = true;
                    node.__filtered_visible__ = true;
                    return; //jmp
                } else if (isChildPassed === true && options.showParent === true
                           || isParentPassed === true && options.showChild === true) {
                    node.__filtered__         = false;
                    node.__filtered_visible__ = true;
                    return; //jmp
                }

                // remove attr __filtered__
                delete node.__filtered__;
                delete node.__filtered_visible__;
            }

            /**
             * `fnBefore` will called when `for_all_descendants` of `node` checking.
             * If `filter` empty then return `true` else result of function `_fnProccess` {@see _fnProccess}
             *
             * @param {object} options
             * @param {object} node
             * @returns {null|boolean}
             * @private
             */
            function _fnBefore(options, node) {
                if (options.filter.length === 0) {
                    return true;
                } else {
                    return _fnProccess(node, options.filter, options.beginAnd || false);
                }
            }

            /**
             * `_fnConvert` to convert `filter` `object` to `array` invaild.
             *
             * @param {object|array} filters
             * @returns {array} Instead of `filter` or new array invaild *(converted from filter)*
             * @private
             */
            function _fnConvert(filters) {
                var _iF, _lenF, _keysF,
                    _filter,
                    _state;
                // convert filter object to array filter
                if (angular.isObject(filters) && !angular.isArray(filters)) {
                    _keysF  = Object.keys(filters);
                    _lenF   = _keysF.length;
                    _filter = [];

                    if (_lenF > 0) {
                        for (_iF = 0; _iF < _lenF; _iF++) {

                            if (typeof filters[_keysF[_iF]] === 'string' && filters[_keysF[_iF]].length === 0) {
                                continue;
                            } else if (angular.isArray(filters[_keysF[_iF]])) {
                                _state = filters[_keysF[_iF]];
                            } else if (angular.isObject(filters[_keysF[_iF]])) {
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
                    _state = null;
                    return _filter;
                }
                else {
                    return filters;
                }
            }

            /**
             * `fnInitFilter` function is constructor of service `$TreeDnDFilter`.
             * @constructor
             * @param {object|array} treeData
             * @param {object|array} filters
             * @param {object} options
             * @param {string} keyChild
             * @returns {array} Return `treeData` or `treeData` with `filter`
             * @private
             */
            function fnInitFilter(treeData, filters, options, keyChild) {
                if (!angular.isArray(treeData)
                    || treeData.length === 0
                    || !(angular.isArray(filters) || angular.isObject(filters))
                    || filters.length === 0) {
                    return treeData;
                }

                var _i, _len,
                    _filter;

                _filter = _fnConvert(filters);
                if (!(angular.isArray(_filter) || angular.isObject(_filter))
                    || _filter.length === 0) {
                    return treeData;
                }
                options.filter = _filter;
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