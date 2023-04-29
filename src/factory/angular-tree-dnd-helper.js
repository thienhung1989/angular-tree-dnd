/**
 * Factory $TreeDnDHelper
 * @namespace $TreeDnDHelper
 * @name $TreeDnDHelper
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDHelper', [
        '$document', '$window',
        function ($document, $window) {
            var _$helper = /** @lends $TreeDnDHelper */ {
                /**
                 * Status is no draggable
                 *
                 * @param {DOMElement} targetElm
                 * @returns {boolean}
                 */
                nodrag: function (targetElm) {
                    return typeof targetElm.attr('data-nodrag') !== 'undefined';
                },
                /**
                 *
                 * Get event's object
                 * @param {object} e
                 * @returns {object|null}
                 */
                eventObj: function (e) {
                    var obj = e;

                    if (e.targetTouches !== undefined) {
                        obj = e.targetTouches.item(0);
                    } else if (e.originalEvent !== undefined && e.originalEvent.targetTouches !== undefined) {
                        obj = e.originalEvent.targetTouches.item(0);
                    }

                    return obj;
                },

                /**
                 * Get drag info
                 *
                 * @param {$scope} scope
                 * @returns {object}
                 */
                dragInfo: function (scope) {
                    var _node = scope.getData(),
                        _tree = scope.getScopeTree(),
                        _parent = scope.getNode(_node.__parent_real__);

                    return {
                        node: _node,
                        parent: _parent,
                        move: {
                            parent: _parent,
                            pos: _node.__index__
                        },
                        scope: scope,
                        target: _tree,
                        drag: _tree,
                        drop: scope.getPrevSibling(_node),
                        changed: false
                    };
                },

                /**
                 * Get element's height
                 *
                 * @param {DOMElement} element
                 * @returns {number}
                 */
                height: function (element) {
                    return element.prop('scrollHeight');
                },

                /**
                 * Get element's width
                 *
                 * @param {DOMElement} element
                 * @returns {number}
                 */
                width: function (element) {
                    return element.prop('scrollWidth');
                },

                /**
                 * Get element's offset
                 *
                 * @param {DOMElement} element
                 * @returns {{width: *, height: *, top: *, left: *}}
                 */
                offset: function (element) {
                    var boundingClientRect = element[0].getBoundingClientRect();

                    return {
                        width: element.prop('offsetWidth'),
                        height: element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                        left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * Get position started of element drag or drop
                 *
                 * @param {Event} e
                 * @param {DOMElement} target
                 * @returns {ElementPosition}
                 */
                positionStarted: function (e, target) {
                    /**
                     * Element position information (when drag & drop)
                     *
                     * @name ElementPosition
                     * @type {object}
                     * @property {number} offsetX
                     * @property {number} offsetY
                     * @property {number} startX
                     * @property {number} lastX
                     * @property {number} startY
                     * @property {number} lastY
                     * @property {number} nowX
                     * @property {number} nowY
                     * @property {number} distX - Distance of X
                     * @property {number} distY - Distance of Y
                     * @property {number} dirAX - Direct of Ax
                     * @property {number} dirX - Direct of X
                     * @property {number} dirY - Direct of Y
                     * @property {number} LastDirX - Last direct of X
                     * @property {number} distAxX - Distance of AxX
                     * @property {number} distAxY - Distance of AxY
                     */
                    var ElementPosition = {
                        offsetX: e.pageX - this.offset(target).left,
                        offsetY: e.pageY - this.offset(target).top,
                        startX: e.pageX,
                        lastX: e.pageX,
                        startY: e.pageY,
                        lastY: e.pageY,
                        nowX: 0,
                        nowY: 0,
                        distX: 0,
                        distY: 0,
                        dirAx: 0,
                        dirX: 0,
                        dirY: 0,
                        lastDirX: 0,
                        lastDirY: 0,
                        distAxX: 0,
                        distAxY: 0
                    };

                    return ElementPosition;
                },

                /**
                 * Get position moved
                 *
                 * @param {Event} e
                 * @param {ElementPosition} pos
                 * @param {bool} firstMoving
                 * @return {object}
                 */
                positionMoved: function (e, pos, firstMoving) {
                    // mouse position last events
                    pos.lastX = pos.nowX;
                    pos.lastY = pos.nowY;

                    // mouse position this events
                    pos.nowX = e.pageX;
                    pos.nowY = e.pageY;

                    // distance mouse moved between events
                    pos.distX = pos.nowX - pos.lastX;
                    pos.distY = pos.nowY - pos.lastY;

                    // direction mouse was moving
                    pos.lastDirX = pos.dirX;
                    pos.lastDirY = pos.dirY;

                    // direction mouse is now moving (on both axis)
                    pos.dirX = pos.distX === 0 ? 0 : pos.distX > 0 ? 1 : -1;
                    pos.dirY = pos.distY === 0 ? 0 : pos.distY > 0 ? 1 : -1;

                    // axis mouse is now moving on
                    var newAx = Math.abs(pos.distX) > Math.abs(pos.distY) ? 1 : 0;

                    // do nothing on first move
                    if (firstMoving) {
                        pos.dirAx = newAx;
                        pos.moving = true;

                        return; // jmp out
                    }

                    // calc distance moved on this axis (and direction)
                    if (pos.dirAx !== newAx) {
                        pos.distAxX = 0;
                        pos.distAxY = 0;
                    } else {
                        pos.distAxX += Math.abs(pos.distX);
                        if (pos.dirX !== 0 && pos.dirX !== pos.lastDirX) {
                            pos.distAxX = 0;
                        }
                        pos.distAxY += Math.abs(pos.distY);
                        if (pos.dirY !== 0 && pos.dirY !== pos.lastDirY) {
                            pos.distAxY = 0;
                        }
                    }

                    pos.dirAx = newAx;

                    return pos;
                },

                /**
                 * Replace with indent
                 *
                 * @param {$scope} scope
                 * @param {DOMElement} element
                 * @param {number} indent
                 * @param {string} attr
                 */
                replaceIndent: function (scope, element, indent, attr) {
                    attr = attr || 'left';
                    angular.element(element.children()[0]).css(attr, scope.$callbacks.calsIndent(indent));
                },

                /**
                 * Is type tree node
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNode: function (element) {
                    if (element) {
                        var $element = angular.element(element);
                        return $element && $element.length && typeof $element.attr('tree-dnd-node') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree nodes (container)
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNodes: function (element) {
                    if (element) {
                        var $element = angular.element(element);

                        return $element && $element.length && typeof $element.attr('tree-dnd-nodes') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree node handle (element to call event drag)
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndNodeHandle: function (element) {
                    if (element) {
                        var $element = angular.element(element);

                        return $element && $element.length && typeof $element.attr('tree-dnd-node-handle') !== 'undefined';
                    }

                    return false;
                },

                /**
                 * Is tree droppable
                 *
                 * @param {DOMElement} element
                 * @returns {boolean}
                 */
                isTreeDndDroppable: function (element) {
                    return _$helper.isTreeDndNode(element)
                        || _$helper.isTreeDndNodes(element)
                        || _$helper.isTreeDndNodeHandle(element);
                },

                /**
                 * Find element closest by attribute
                 *
                 * @param {DOMElement} element
                 * @param {string|function} attr
                 * @returns {DOMElement}
                 */
                closestByAttr: function fnClosestByAttr(element, attr) {
                    if (element && attr) {
                        var $element = angular.element(element),
                            $parent = $element.parent();

                        if ($parent) {
                            var isPassed = false;

                            switch (typeof attr) {
                                case 'function':
                                    isPassed = attr($parent);
                                    break;
                                default:
                                    isPassed = typeof $parent.attr(attr) !== 'undefined';
                                    break;
                            }

                            if (isPassed) {
                                return $parent;
                            } else {
                                return fnClosestByAttr($parent, attr);
                            }
                        }
                    }
                }
            };

            return _$helper;
        }]
    );