angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDFilter', [
        '$filter', function ($filter) {
            var _callback, _key,
                _iF, _lenF, _keysF,
                _state, _passed,
                _filter, _condition,
                for_all_descendants = function (options, node, name, fnBefore, fnAfter, isPassed) {
                    if (!angular.isFunction(fnBefore)) {
                        return null;
                    }

                    var _i, _len, _nodes, _state, _parentPassed = false, _childPassed = false;

                    _state = fnBefore(options, node, isPassed);
                    _parentPassed = _state;

                    if (!angular.isUndefinedOrNull(node[name])) {
                        _nodes = node[name];
                        _len = _nodes.length;
                        for (_i = 0; _i < _len; _i++) {
                            _state = for_all_descendants(
                                options,
                                _nodes[_i],
                                name,
                                fnBefore,
                                fnAfter,
                                _parentPassed
                            );

                            _childPassed = _childPassed || _state;
                        }
                    }
                    if (angular.isFunction(fnAfter)) {
                        fnAfter(options, node, _parentPassed, _childPassed);
                    }

                    return _parentPassed || _childPassed;
                },
                for_all_descendants_condition = function (options, node, condition, nameChild, fnBefore, fnAfter) {
                    if (!angular.isFunction(fnBefore)) {
                        return null;
                    }

                    var _i, _len, _childs, _passed = false;

                    _passed = fnBefore(options, node, condition);

                    if (!angular.isUndefinedOrNull(condition[nameChild])) {
                        _childs = condition[nameChild];
                        _len = _childs.length;
                        for (_i = 0; _i < _len; _i++) {
                            for_all_descendants_condition(
                                options,
                                node,
                                _childs[_i],
                                nameChild,
                                fnBefore,
                                fnAfter
                            );
                        }
                    }

                    if (angular.isFunction(fnAfter)) {
                        fnAfter(options, node, condition, _passed);
                    }

                    return _state;
                },
                _fnProccess = function (options, node, condition) {

                    var _key = condition.field,
                        _callback = condition.callback,
                        _check,
                        _state = null;

                    if (!angular.isUndefinedOrNull(node[_key])) {
                        _check = node[_key];
                        if (angular.isFunction(_callback)) {
                            _state = _callback(_check, $filter);
                        } else {
                            if (typeof _callback === 'boolean') {
                                _check = !!_check;
                                _state = _check === _callback;
                            } else if (!angular.isUndefinedOrNull(_callback)) {
                                var _regex = new RegExp(_callback);
                                _state = _regex.test(_check);
                            } else {
                                _state = null;
                            }
                        }
                    }

                    return _state;
                },
                _fnAfter = function (options, node, isNodePassed, isChildPassed) {
                    if (isNodePassed === true) {
                        node.__filtered__ = true;
                        node.__filtered_visible__ = true;
                        return; //jmp
                    } else if (isChildPassed === true && options.showParent === true) {
                        node.__filtered__ = false;
                        node.__filtered_visible__ = true;
                        return; //jmp
                    }

                    // remove attr __filtered__
                    delete(node.__filtered__);
                    delete(node.__filtered_visible__);
                },
                _fnConvert = function (filters) {
                    // convert filter object to array filter
                    if (angular.isObject(filters)) {
                        _keysF = Object.keys(filters);
                        _lenF = _keysF.length;
                        _filter = [];

                        if (_lenF > 0) {
                            _condition = {
                                field:    _keysF[0],
                                callback: filters[_keysF[0]]
                            };
                            _filter.push(_condition);

                            for (_iF = 1; _iF < _lenF; _iF++) {
                                _state = {
                                    field:    _keysF[_iF],
                                    callback: filters[_keysF[_iF]]
                                };

                                _condition.conditions = [];
                                _condition.conditions.push(_state);
                                _condition = _state;
                            }
                        }
                        return _filter;
                    }
                    else {
                        return filters;
                    }
                };

            return function (treeData, filters, _options) {
                if (!angular.isArray(treeData)
                    || treeData.length === 0
                    || !(angular.isArray(filters) || angular.isObject(filters))
                    || filters.length === 0) {
                    return treeData;
                }

                var _i, _len,
                    _iF, _lenF, _keysF,
                    _state, _passed,
                    _filter, _condition;

                _filter = _fnConvert(filters);
                _lenF = _filter.length;
                var _fnBefore = function (options, node, isPassed) {
                    var _PassedNull = 0,
                        _passed = 0,
                        _return = false,
                        _deptW = 0, _fnAfterDept = function (opts, node, condition, isPassed) {
                            _deptW++;

                            if (isPassed === true) {
                                _passed++;
                            } else if (isPassed === null) {
                                _PassedNull++;
                            }
                        };

                    if (_lenF === 0) {
                        node.__filtered__ = true;
                        _return = true;
                    } else {
                        for (_iF = 0; _iF < _lenF; _iF++) {
                            _deptW = 0;
                            for_all_descendants_condition(
                                options,
                                node,
                                _filter[_iF], 'conditions',
                                _fnProccess, _fnAfterDept
                            );

                            if (_PassedNull === _deptW) {
                                _return = true;
                            } else {
                                if (_PassedNull + _passed === _deptW) {
                                    _return = true;
                                } else if (isPassed === true && options.showChild === true) {
                                    _return = true;
                                } else {
                                    _return = false;
                                }
                            }
                        }
                    }

                    return _return;
                };

                for (_i = 0, _len = treeData.length; _i < _len; _i++) {
                    for_all_descendants(
                        _options,
                        treeData[_i],
                        '__children__',
                        _fnBefore, _fnAfter
                    );
                }

                return treeData;
            };
        }]
);