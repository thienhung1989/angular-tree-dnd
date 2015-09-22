angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDDrag', [
        '$timeout', '$TreeDnDHelper',
        function ($timeout, $TreeDnDHelper) {
            function _fnPlaceHolder(e, $params) {
                if ($params.placeElm) {
                    var _offset = $TreeDnDHelper.offset($params.placeElm);
                    if (_offset.top <= e.pageY && e.pageY <= _offset.top + _offset.height &&
                        _offset.left <= e.pageX && e.pageX <= _offset.left + _offset.width
                    ) {
                        return true;
                    }
                }
                return false;
            }

            function _fnDragStart(e, $params) {
                if (!$params.hasTouch && (e.button === 2 || e.which === 3)) {
                    // disable right click
                    return;
                }
                if (e.uiTreeDragging || e.originalEvent && e.originalEvent.uiTreeDragging) { // event has already fired in other scope.
                    return;
                }
                // the element which is clicked.
                var eventElm   = angular.element(e.target),
                    eventScope = eventElm.scope();
                if (!eventScope || !eventScope.$type) {
                    return;
                }
                // if (eventScope.$type !== 'TreeDnDNode') { // Check if it is a node or a handle
                //     return;
                // }

                if (eventScope.$type !== 'TreeDnDNodeHandle') { // If the node has a handle, then it should be clicked by the handle
                    return;
                }

                var eventElmTagName = eventElm.prop('tagName').toLowerCase(),
                    dragScope,
                    _$scope         = $params.$scope;
                if (eventElmTagName === 'input'
                    || eventElmTagName === 'textarea'
                    || eventElmTagName === 'button'
                    || eventElmTagName === 'select') { // if it's a input or button, ignore it
                    return;
                }
                // check if it or it's parents has a 'data-nodrag' attribute
                while (eventElm && eventElm[0] && eventElm[0] !== $params.element) {
                    if ($TreeDnDHelper.nodrag(eventElm)) { // if the node mark as `nodrag`, DONOT drag it.
                        return;
                    }
                    eventElm = eventElm.parent();
                }

                e.uiTreeDragging = true; // stop event bubbling
                if (e.originalEvent) {
                    e.originalEvent.uiTreeDragging = true;
                }
                e.preventDefault();

                dragScope = eventScope.getScopeNode();

                $params.dragInfo = $TreeDnDHelper.dragInfo(dragScope);

                if (!_$scope.$callbacks.beforeDrag(dragScope, $params.dragInfo)) {
                    return;
                }

                $params.firstMoving = true;
                _$scope.setDragging($params.dragInfo);

                var eventObj = $TreeDnDHelper.eventObj(e);
                $params.pos  = $TreeDnDHelper.positionStarted(eventObj, dragScope.$element);

                if (dragScope.isTable) {
                    $params.dragElm = angular.element($params.$window.document.createElement('table'))
                        .addClass(_$scope.$class.tree)
                        .addClass(_$scope.$class.drag)
                        .addClass(_$scope.$tree_class);
                } else {
                    $params.dragElm = angular.element($params.$window.document.createElement('ul'))
                        .addClass(_$scope.$class.drag)
                        .addClass('tree-dnd-nodes')
                        .addClass(_$scope.$tree_class);
                }

                $params.dragElm.css(
                    {
                        'width':   $TreeDnDHelper.width(dragScope.$element) + 'px',
                        'z-index': 9995
                    }
                );

                $params.offsetEdge = 0;
                var _width         = $TreeDnDHelper.width(dragScope.$element),
                    _scope         = dragScope,
                    _element       = _scope.$element,
                    _clone,
                    _needCollapse  = !!_$scope.enabledCollapse,
                    _copied        = false,
                    _tbody,
                    _frag;

                if (_scope.isTable) {
                    $params.offsetEdge = $params.dragInfo.node.__level__ - 1;
                    _tbody             = angular.element(document.createElement('tbody'));
                    _frag              = angular.element(document.createDocumentFragment());

                    _$scope.for_all_descendants(
                        $params.dragInfo.node, function (_node, _parent) {
                            _scope   = _$scope.getScope(_node);
                            _element = _scope && _scope.$element;
                            if (_scope && _element) {
                                if (!_copied) {
                                    _clone = _element.clone();

                                    $TreeDnDHelper.replaceIndent(
                                        _$scope,
                                        _clone,
                                        _node.__level__ - $params.offsetEdge,
                                        'padding-left'
                                    );

                                    _frag.append(_clone);

                                    // skip all, just clone parent
                                    if (_needCollapse) {
                                        _copied = true;
                                    }

                                    // hide if have status Move;
                                    if (_$scope.enabledMove && _$scope.$class.hidden &&
                                        (!_parent || _node.__visible__ || _parent.__visible__ && _parent.__expanded__)) {
                                        _element.addClass(_$scope.$class.hidden);
                                    }
                                }
                            }
                            // skip children of node not expand.
                            return _copied || _node.__visible__ === false || _node.__expanded__ === false;

                        }, null, !_needCollapse
                    );
                    _tbody.append(_frag);
                    $params.dragElm.append(_tbody);
                } else {

                    _clone = _element.clone();
                    if (_needCollapse) {
                        _clone[0].querySelector('[tree-dnd-nodes]').remove();
                    }

                    // hide if have status Move;
                    $params.dragElm.append(_clone);
                    if (_$scope.enabledMove && _$scope.$class.hidden) {
                        _element.addClass(_$scope.$class.hidden);
                    }
                }

                $params.dragElm.css(
                    {
                        'left': eventObj.pageX - $params.pos.offsetX + _$scope.$callbacks.calsIndent(
                                $params.offsetEdge + 1,
                                true,
                                true
                        ) + 'px',
                        'top':  eventObj.pageY - $params.pos.offsetY + 'px'
                    }
                );
                // moving item with descendant
                $params.$document.find('body').append($params.dragElm);
                if (_$scope.$callbacks.droppable()) {
                    $params.placeElm = _$scope.initPlace(dragScope.$element, $params.dragElm);

                    if (dragScope.isTable) {
                        $TreeDnDHelper.replaceIndent(_$scope, $params.placeElm, $params.dragInfo.node.__level__);
                    }

                    $params.placeElm.css('width', _width);
                }

                _$scope.showPlace();
                _$scope.targeting  = true;

                if (_$scope.enabledStatus) {
                    _$scope.refreshStatus();
                    _$scope.setPositionStatus(e);
                }

                angular.element($params.$document).bind('touchend', $params.dragEndEvent);
                angular.element($params.$document).bind('touchcancel', $params.dragEndEvent);
                angular.element($params.$document).bind('touchmove', $params.dragMoveEvent);
                angular.element($params.$document).bind('mouseup', $params.dragEndEvent);
                angular.element($params.$document).bind('mousemove', $params.dragMoveEvent);
                angular.element($params.$document).bind('mouseleave', $params.dragCancelEvent);

                $params.document_height = Math.max(
                    $params.body.scrollHeight,
                    $params.body.offsetHeight,
                    $params.html.clientHeight,
                    $params.html.scrollHeight,
                    $params.html.offsetHeight
                );

                $params.document_width = Math.max(
                    $params.body.scrollWidth,
                    $params.body.offsetWidth,
                    $params.html.clientWidth,
                    $params.html.scrollWidth,
                    $params.html.offsetWidth
                );
            }

            function _fnDragMove(e, $params) {
                var _$scope = $params.$scope;
                if (!$params.dragStarted) {
                    if (!$params.dragDelaying) {
                        $params.dragStarted = true;
                        _$scope.$safeApply(
                            function () {
                                _$scope.$callbacks.dragStart($params.dragInfo);
                            }
                        );
                    }
                    return;
                }

                if ($params.dragElm) {
                    e.preventDefault();
                    if ($params.$window.getSelection) {
                        $params.$window.getSelection().removeAllRanges();
                    } else if ($params.$window.document.selection) {
                        $params.$window.document.selection.empty();
                    }

                    var eventObj   = $TreeDnDHelper.eventObj(e),
                        leftElmPos = eventObj.pageX - $params.pos.offsetX,
                        topElmPos  = eventObj.pageY - $params.pos.offsetY;

                    //dragElm can't leave the screen on the left
                    if (leftElmPos < 0) {
                        leftElmPos = 0;
                    }

                    //dragElm can't leave the screen on the top
                    if (topElmPos < 0) {
                        topElmPos = 0;
                    }

                    //dragElm can't leave the screen on the bottom
                    if (topElmPos + 10 > $params.document_height) {
                        topElmPos = $params.document_height - 10;
                    }

                    //dragElm can't leave the screen on the right
                    if (leftElmPos + 10 > $params.document_width) {
                        leftElmPos = $params.document_width - 10;
                    }

                    $params.dragElm.css(
                        {
                            'left': leftElmPos + _$scope.$callbacks.calsIndent(
                                    $params.offsetEdge + 1,
                                    true,
                                    true
                            ) + 'px',
                            'top':  topElmPos + 'px'
                        }
                    );

                    if (_$scope.enabledStatus) {
                        _$scope.setPositionStatus(e);
                    }

                    var top_scroll    = window.pageYOffset || $params.$window.document.documentElement.scrollTop,
                        bottom_scroll = top_scroll + (window.innerHeight || $params.$window.document.clientHeight || $params.$window.document.clientHeight);
                    // to scroll down if cursor y-position is greater than the bottom position the vertical scroll
                    if (bottom_scroll < eventObj.pageY && bottom_scroll <= $params.document_height) {
                        window.scrollBy(0, 10);
                    }
                    // to scroll top if cursor y-position is less than the top position the vertical scroll
                    if (top_scroll > eventObj.pageY) {
                        window.scrollBy(0, -10);
                    }

                    $TreeDnDHelper.positionMoved(e, $params.pos, $params.firstMoving);

                    if ($params.firstMoving) {
                        $params.firstMoving = false;
                        return;
                    }
                    // check if add it as a child node first

                    var targetX    = eventObj.pageX - $params.$window.document.body.scrollLeft,
                        targetY    = eventObj.pageY - (window.pageYOffset || $params.$window.document.documentElement.scrollTop),

                        targetElm,
                        targetScope,
                        targetBefore,
                        targetOffset,
                        isChanged  = true,
                        isVeritcal = true,
                        isEmpty,
                        isSwapped,
                        _scope,
                        _target,
                        _parent,
                        _info      = $params.dragInfo,
                        _move      = _info.move,
                        _drag      = _info.node,
                        _drop      = _info.drop,
                        treeScope  = _info.target,
                        fnSwapTree,
                        isHolder   = _fnPlaceHolder(e, $params);

                    if (!isHolder) {
                        /* when using elementFromPoint() inside an iframe, you have to call
                         elementFromPoint() twice to make sure IE8 returns the correct value
                         $params.$window.document.elementFromPoint(targetX, targetY);*/

                        targetElm = angular.element(
                            $params.$window.document.elementFromPoint(
                                targetX,
                                targetY
                            )
                        );

                        targetScope = targetElm.scope();
                        if (!targetScope || !targetScope.$callbacks || !targetScope.$callbacks.droppable()) {
                            // Not allowed Drop Item
                            return;
                        }

                        fnSwapTree = function () {
                            treeScope = targetScope.getScopeTree();
                            _target   = _info.target;

                            if (_info.target !== treeScope) {
                                // Replace by place-holder new
                                _target.hidePlace();
                                _target.targeting   = false;
                                treeScope.targeting = true;

                                _info.target     = treeScope;
                                $params.placeElm = treeScope.initPlace(targetScope.$element, $params.dragElm);

                                _target   = null;
                                isSwapped = true;
                            }
                            return true;
                        };

                        if (angular.isFunction(targetScope.getScopeNode)) {
                            targetScope = targetScope.getScopeNode();
                            if (!fnSwapTree()) {
                                return;
                            }
                        } else {
                            if (targetScope.$type === 'TreeDnDNodes' || targetScope.$type === 'TreeDnD') {
                                if (targetScope.tree_nodes) {
                                    if (targetScope.tree_nodes.length === 0) {
                                        if (!fnSwapTree()) {
                                            return;
                                        }
                                        // Empty
                                        isEmpty = true;
                                    }
                                } else {
                                    return;
                                }
                            } else {
                                return;
                            }
                        }
                    }

                    if ($params.pos.dirAx && !isSwapped || isHolder) {
                        isVeritcal  = false;
                        targetScope = _info.scope;
                    }

                    if (!targetScope.$element && !targetScope) {
                        return;
                    }

                    if (isEmpty) {
                        _move.parent = null;
                        _move.pos    = 0;

                        _drop = null;
                    } else {
                        // move vertical
                        if (isVeritcal) {
                            targetElm = targetScope.$element; // Get the element of tree-dnd-node
                            if (angular.isUndefinedOrNull(targetElm)) {
                                return;
                            }
                            targetOffset = $TreeDnDHelper.offset(targetElm);

                            if (targetScope.horizontal && !targetScope.isTable) {
                                targetBefore = eventObj.pageX < targetOffset.left + $TreeDnDHelper.width(targetElm) / 2;
                            } else {
                                if (targetScope.isTable) {
                                    targetBefore = eventObj.pageY < targetOffset.top + $TreeDnDHelper.height(targetElm) / 2;
                                } else {
                                    var _height = $TreeDnDHelper.height(targetElm);

                                    if (targetScope.getElementChilds()) {
                                        _height -= -$TreeDnDHelper.height(targetScope.getElementChilds());
                                    }

                                    if (eventObj.pageY > targetOffset.top + _height) {
                                        return;
                                    }

                                    targetBefore = eventObj.pageY < targetOffset.top + _height / 2;
                                }
                            }

                            if (!angular.isFunction(targetScope.getData)) {
                                return;
                            }

                            _target = targetScope.getData();
                            _parent = targetScope.getNode(_target.__parent_real__);

                            if (targetBefore) {
                                var _prev = targetScope.getPrevSibling(_target);

                                _move.parent = _parent;
                                _move.pos    = angular.isDefined(_prev) ? _prev.__index__ + 1 : 0;

                                _drop = _prev;
                            } else {
                                if (_target.__expanded__ && !(_target.__children__.length === 1 && _target.__index_real__ === _drag.__parent_real__)) {
                                    _move.parent = _target;
                                    _move.pos    = 0;

                                    _drop = null;
                                } else {
                                    _move.parent = _parent;
                                    _move.pos    = _target.__index__ + 1;

                                    _drop = _target;
                                }
                            }
                        } else {
                            // move horizontal
                            if ($params.pos.dirAx && $params.pos.distAxX >= treeScope.dragBorder) {
                                $params.pos.distAxX = 0;
                                // increase horizontal level if previous sibling exists and is not collapsed
                                if ($params.pos.distX > 0) {
                                    _parent = _drop;
                                    if (!_parent) {
                                        if (_move.pos - 1 >= 0) {
                                            _parent = _move.parent.__children__[_move.pos - 1];
                                        } else {
                                            return;
                                        }
                                    }

                                    if (_info.drag === _info.target && _parent === _drag && _$scope.enabledMove) {
                                        _parent = treeScope.getPrevSibling(_parent);
                                    }

                                    if (_parent && _parent.__visible__) {
                                        var _len = _parent.__children__.length;

                                        _move.parent = _parent;
                                        _move.pos    = _len;

                                        if (_len > 0) {
                                            _drop = _parent.__children__[_len - 1];
                                        } else {
                                            _drop = null;
                                        }
                                    } else {
                                        // Not changed
                                        return;
                                    }
                                } else if ($params.pos.distX < 0) {
                                    _target = _move.parent;
                                    if (_target &&
                                        (_target.__children__.length === 0 ||
                                         _target.__children__.length - 1 < _move.pos ||
                                         _info.drag === _info.target &&
                                         _target.__index_real__ === _drag.__parent_real__ &&
                                         _target.__children__.length - 1 === _drag.__index__ && _$scope.enabledMove)
                                    ) {
                                        _parent = treeScope.getNode(_target.__parent_real__);

                                        _move.parent = _parent;
                                        _move.pos    = _target.__index__ + 1;

                                        _drop = _target;
                                    } else {
                                        // Not changed
                                        return;
                                    }
                                } else {
                                    return;
                                }
                            } else {
                                // limited
                                return;
                            }
                        }
                    }

                    if (_info.drag === _info.target &&
                        _move.parent &&
                        _drag.__parent_real__ === _move.parent.__index_real__ &&
                        _drag.__index__ === _move.pos
                    ) {
                        isChanged = false;
                    }

                    if (treeScope.$callbacks.accept(_info, _move, isChanged)) {
                        _info.move    = _move;
                        _info.drop    = _drop;
                        _info.changed = isChanged;
                        _info.scope   = targetScope;

                        if (targetScope.isTable) {
                            $TreeDnDHelper.replaceIndent(
                                treeScope,
                                $params.placeElm,
                                angular.isUndefinedOrNull(_move.parent) ? 1 : _move.parent.__level__ + 1
                            );

                            if (_drop) {
                                _parent = (_move.parent ? _move.parent.__children__ : null ) || _info.target.treeData;

                                if (_drop.__index__ < _parent.length - 1) {
                                    // Find fast
                                    _drop  = _parent[_drop.__index__ + 1];
                                    _scope = _info.target.getScope(_drop);
                                    _scope.$element[0].parentNode.insertBefore(
                                        $params.placeElm[0],
                                        _scope.$element[0]
                                    );
                                } else {
                                    _target = _info.target.getLastDescendant(_drop);
                                    _scope  = _info.target.getScope(_target);
                                    _scope.$element.after($params.placeElm);
                                }
                            } else {
                                _scope = _info.target.getScope(_move.parent);
                                if (_scope) {
                                    if (_move.parent) {
                                        _scope.$element.after($params.placeElm);

                                    } else {
                                        _scope.getElementChilds().prepend($params.placeElm);
                                    }
                                }
                            }
                        } else {
                            _scope = _info.target.getScope(_drop || _move.parent);
                            if (_drop) {
                                _scope.$element.after($params.placeElm);
                            } else {
                                _scope.getElementChilds().prepend($params.placeElm);
                            }
                        }

                        treeScope.showPlace();

                        _$scope.$safeApply(
                            function () {
                                _$scope.$callbacks.dragMove(_info);
                            }
                        );
                    }

                }
            }

            function _fnDragEnd(e, $params) {
                e.preventDefault();
                if ($params.dragElm) {
                    var _passed     = false,
                        _$scope     = $params.$scope,
                        _scope      = _$scope.getScope($params.dragInfo.node),
                        _element    = _scope.$element;

                    _$scope.$safeApply(
                        function () {
                            _passed = _$scope.$callbacks.beforeDrop($params.dragInfo);
                        }
                    );

                    // rollback all
                    if (_scope.isTable) {
                        _$scope.for_all_descendants(
                            $params.dragInfo.node, function (_node, _parent) {
                                _scope   = _$scope.getScope(_node);
                                _element = _scope && _scope.$element;
                                if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                    if (_$scope.$class.hidden) {
                                        _element.removeClass(_$scope.$class.hidden);
                                    }
                                }
                                return _node.__visible__ === false || _node.__expanded__ === false
                            }, null, true
                        );
                    } else {
                        if (_$scope.$class.hidden) {
                            _element.removeClass(_$scope.$class.hidden);
                        }
                    }

                    $params.dragElm.remove();
                    $params.dragElm = null;

                    if (_$scope.enabledStatus) {
                        _$scope.hideStatus();
                    }

                    if (_$scope.$$apply) {
                        _$scope.$safeApply(
                            function () {
                                var _status = _$scope.$callbacks.dropped(
                                    $params.dragInfo,
                                    _passed
                                );

                                _$scope.$callbacks.dragStop($params.dragInfo, _status);
                                clearData();
                            }
                        );
                    } else {
                        _fnBindDrag($params);
                        _$scope.$safeApply(
                            function () {
                                _$scope.$callbacks.dragStop($params.dragInfo, false);
                                clearData();
                            }
                        );
                    }

                }

                function clearData() {
                    $params.dragInfo.target.hidePlace();
                    $params.dragInfo.target.targeting = false;

                    $params.dragInfo = null;
                    _$scope.$$apply  = false;
                    _$scope.setDragging(null);
                }

                angular.element($params.$document).unbind('touchend', $params.dragEndEvent); // Mobile
                angular.element($params.$document).unbind('touchcancel', $params.dragEndEvent); // Mobile
                angular.element($params.$document).unbind('touchmove', $params.dragMoveEvent); // Mobile
                angular.element($params.$document).unbind('mouseup', $params.dragEndEvent);
                angular.element($params.$document).unbind('mousemove', $params.dragMoveEvent);
                angular.element($params.$window.document.body).unbind('mouseleave', $params.dragCancelEvent);
            }

            function _fnDragStartEvent(e, $params) {
                if ($params.$scope.$callbacks.draggable()) {
                    _fnDragStart(e, $params);
                }
            }

            function _fnBindDrag($params) {
                $params.element.bind(
                    'touchstart mousedown', function (e) {
                        $params.dragDelaying = true;
                        $params.dragStarted  = false;
                        _fnDragStartEvent(e, $params);
                        $params.dragTimer    = $timeout(
                            function () {
                                $params.dragDelaying = false;
                            }, $params.$scope.dragDelay
                        );
                    }
                );

                $params.element.bind(
                    'touchend touchcancel mouseup', function () {
                        $timeout.cancel($params.dragTimer);
                    }
                );
            }

            function _fnKeydownHandler(e, $params) {
                var _$scope = $params.$scope;
                if (e.keyCode === 27) {
                    if (_$scope.enabledStatus) {
                        _$scope.hideStatus();
                    }

                    _$scope.$$apply = false;
                    _fnDragEnd(e, $params);
                } else {
                    if (_$scope.enabledHotkey && e.shiftKey) {
                        _$scope.enableMove(true);
                        if (_$scope.enabledStatus) {
                            _$scope.refreshStatus();
                        }

                        if (!$params.dragInfo) {
                            return;
                        }

                        var _scope   = _$scope.getScope($params.dragInfo.node),
                            _element = _scope.$element;

                        if (_scope.isTable) {
                            _$scope.for_all_descendants(
                                $params.dragInfo.node, function (_node, _parent) {
                                    _scope   = _$scope.getScope(_node);
                                    _element = _scope && _scope.$element;
                                    if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                        if (_$scope.$class.hidden) {
                                            _element.addClass(_$scope.$class.hidden);
                                        }
                                    }
                                    return _node.__visible__ === false || _node.__expanded__ === false

                                }, null, true
                            );
                        } else {
                            if (_$scope.$class.hidden) {
                                _element.addClass(_$scope.$class.hidden);
                            }
                        }
                    }
                }
            }

            function _fnKeyupHandler(e, $params) {
                var _$scope = $params.$scope;
                if (_$scope.enabledHotkey && !e.shiftKey) {
                    _$scope.enableMove(false);

                    if (_$scope.enabledStatus) {
                        _$scope.refreshStatus();
                    }

                    if (!$params.dragInfo) {
                        return;
                    }

                    var _scope   = _$scope.getScope($params.dragInfo.node),
                        _element = _scope.$element;

                    if (_scope.isTable) {
                        _$scope.for_all_descendants(
                            $params.dragInfo.node, function (_node, _parent) {
                                _scope   = _$scope.getScope(_node);
                                _element = _scope && _scope.$element;
                                if (_scope && _element && (!_parent && _node.__visible__ || _parent.__expanded__)) {
                                    if (_$scope.$class.hidden) {
                                        _element.removeClass(_$scope.$class.hidden);
                                    }
                                }
                                return _node.__visible__ === false || _node.__expanded__ === false
                            }, null, true
                        );
                    } else {
                        if (_$scope.$class.hidden) {
                            _element.removeClass(_$scope.$class.hidden);
                        }
                    }
                }
            }

            function _$init(scope, element, $window, $document) {
                var $params        = {
                        hasTouch:        'ontouchstart' in window,
                        firstMoving:     null,
                        dragInfo:        null,
                        pos:             null,
                        placeElm:        null,
                        dragElm:         null,
                        dragDelaying:    true,
                        dragStarted:     false,
                        dragTimer:       null,
                        body:            document.body,
                        html:            document.documentElement,
                        document_height: null,
                        document_width:  null,
                        offsetEdge:      null,
                        $scope:          scope,
                        $window:         $window,
                        $document:       $document,
                        element:         element,
                        bindDrag:        function () {
                            _fnBindDrag($params);
                        },
                        dragEnd:         function (e) {
                            _fnDragEnd(e, $params);
                        },
                        dragMoveEvent:   function (e) {
                            _fnDragMove(e, $params);
                        },
                        dragEndEvent:    function (e) {
                            scope.$$apply = true;
                            _fnDragEnd(e, $params);
                        },
                        dragCancelEvent: function (e) {
                            _fnDragEnd(e, $params);
                        }
                    },
                    keydownHandler = function (e) {
                        return _fnKeydownHandler(e, $params);
                    },
                    keyupHandler   = function (e) {
                        return _fnKeyupHandler(e, $params);
                    };

                scope.dragEnd = function (e) {
                    $params.dragEnd(e);
                };

                $params.bindDrag();

                angular.element($window.document.body).bind('keydown', keydownHandler);
                angular.element($window.document.body).bind('keyup', keyupHandler);
                //unbind handler that retains scope
                scope.$on(
                    '$destroy', function () {
                        angular.element($window.document.body).unbind('keydown', keydownHandler);
                        angular.element($window.document.body).unbind('keyup', keyupHandler);
                        if (scope.statusElm) {
                            scope.statusElm.remove();
                        }

                        if (scope.placeElm) {
                            scope.placeElm.remove();
                        }
                    }
                );
            }

            return _$init;
        }
    ]
);