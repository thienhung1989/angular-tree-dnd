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

                    if (angular.isFunction(fnAfter)) {
                        if(fnAfter(options, node, condition, _passed) === true){
                            return false;
                        }
                    }

                    if (!angular.isUndefinedOrNull(condition[nameChild])) {
                        _childs = condition[nameChild];
                        _len = _childs.length;
                        for (_i = 0; _i < _len; _i++) {
                            if(for_all_descendants_condition(
                                    options,
                                    node,
                                    _childs[_i],
                                    nameChild,
                                    fnBefore,
                                    fnAfter
                                ) === false){
                                return false;
                            }
                        }
                    }

                },
                _fnProccess = function (options, node, condition) {

                    var _key = condition.field,
                        _callback = condition.callback,
                        _state = null,
                        _switch = null,
                        _iO, _keysO, _lenO,
                        _fnCheck = function (_check){
                            if(angular.isUndefinedOrNull(_check) || angular.isArray(_check)) {
                                return null;
                            }

                            if (angular.isFunction(_callback)) {
                                return _callback(_check, $filter);
                            } else {
                                if (typeof _callback === 'boolean') {
                                    _check = !!_check;
                                    return _check === _callback;
                                } else if (!angular.isUndefinedOrNull(_callback)) {
                                    var _regex = new RegExp(_callback, 'g');
                                    return _regex.test(_check);
                                } else {
                                    return null;
                                }
                            }
                        };
                    if(_key === '_$'){
                        _keysO = Object.keys(node);
                        _lenO = _keysO.length;
                        for( _iO = 0; _iO < _lenO; _iO++){
                            _switch = _fnCheck(node[_keysO[_iO]]);
                            if(_switch === true){
                                return true;
                            }
                            _state = _switch;
                        }
                    } else if (!angular.isUndefinedOrNull(node[_key])) {
                        _state = _fnCheck(node[_key]);
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
                    if (angular.isObject(filters) && !angular.isArray(filters)) {
                        _keysF = Object.keys(filters);
                        _lenF = _keysF.length;
                        _filter = [];
                        var _first = true;
                        if (_lenF > 0) {
                            for (_iF = 0; _iF < _lenF; _iF++){

                                if((typeof filters[_keysF[_iF]]) === 'string' && filters[_keysF[_iF]].length === 0){
                                    continue;
                                }

                                _state = {
                                    field:    _keysF[_iF],
                                    callback: filters[_keysF[_iF]]
                                };

                                if(_first){
                                    _filter.push(_state);
                                    _first = false;
                                    _condition = _state;
                                }else{
                                    _condition.conditions = [];
                                    _condition.conditions.push(_state);
                                    _condition = _state;
                                }
                            }
                        }
                        return _filter;
                    }
                    else {
                        return filters;
                    }
                },
                _fnMain = function (treeData, filters, _options) {
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
                    if(!(angular.isArray(_filter) || angular.isObject(_filter))
                       || _filter.length === 0) {
                        return treeData;
                    }

                    _lenF = _filter.length;
                    var _fnBefore = function (options, node, isPassed) {
                        var _passed = false,
                            _fnAfterDept = function (opts, node, condition, isPassed) {
                                if (isPassed === false) {
                                    _passed = false;
                                    // break-all;
                                    return true;
                                }

                                _passed = _passed || isPassed;
                            };

                        if (_lenF === 0) {
                            node.__filtered__ = true;
                            return true;
                        } else {
                            for (_iF = 0; _iF < _lenF; _iF++) {
                                for_all_descendants_condition(
                                    options,
                                    node,
                                    _filter[_iF], 'conditions',
                                    _fnProccess, _fnAfterDept
                                );

                                if (_passed) {
                                    return true;
                                }
                            }
                        }

                        return false;
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

            return _fnMain;
        }]
);