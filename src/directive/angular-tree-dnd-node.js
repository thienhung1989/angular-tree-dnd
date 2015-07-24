angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNode', ['$TreeDnDViewport', '$timeout', function ($TreeDnDViewport, $timeout) {
        return {
            restrict:   'A',
            replace:    true,
            controller: fnController,
            link:       fnLink
        };

        function fnController($scope, $element/*, $attrs*/) {
            $scope.$node_class = '';

            if ($scope.$class.node) {
                $element.addClass($scope.$class.node);
                $scope.$node_class = $scope.$class.node;
            }

        }

        function fnLink(scope, element, attrs) {

            var enabledDnD            = typeof scope.dragEnabled === 'boolean' || typeof scope.dropEnabled === 'boolean',
                keyNode               = attrs.treeDndNode,
                first                 = true;

            $TreeDnDViewport.add(scope, element);

            if (enabledDnD) {
                scope.$type = 'TreeDnDNode';

                scope.getData = function () {
                    return scope[keyNode];
                };
            }
            scope.$element            = element;
            scope[keyNode].__inited__ = true;

            /*if (scope[keyNode].__index_real__ === scope.$TreeLimit - 1) {
             console.time('Call_fnTimeGenerate_Node');
             $timeout(function () {
             scope.updateLimit();
             console.log(scope.$TreeLimit);
             console.timeEnd('Call_fnTimeGenerate_Node');
             }, 2000, false);
             }*/

            scope.getElementChilds = function () {
                return angular.element(element[0].querySelector('[tree-dnd-nodes]'));
            };

            scope.setScope(scope, scope[keyNode]);

            scope.getScopeNode = function () {
                return scope;
            };

            scope.$watch(keyNode, fnWatchNode, true);

            scope.$on('$destroy', function () {
                scope.deleteScope(scope, scope[keyNode]);
            });

            function fnWatchNode(newVal, oldVal, scope) {
                if (!newVal.__visible__) {
                    element.addClass(scope.$class.hidden);
                }

                //console.time('Node_Changed');
                var nodeNew = newVal, _nodes = scope[keyNode].__children__,
                    _len    = _nodes.length, _i,
                    _icon;

                if (_len === 0) {
                    _icon = -1;
                } else {
                    if (nodeNew.__expanded__) {
                        _icon = 1;
                    } else {
                        _icon = 0;
                    }
                }

                nodeNew.__icon__       = _icon;
                nodeNew.__icon_class__ = scope.$class.icon[_icon];

                if (!first) {
                    if (newVal.__expanded__ !== oldVal.__expanded__) {
                        //if (scope.isTable) {
                        for (_i = 0; _i < _len; _i++) {
                            scope.for_all_descendants(_nodes[_i], fnHiddenChild, nodeNew, true);
                        }
                        //} else {
                        //    if (!childsElem) {
                        //        childsElem = scope.getElementChilds();
                        //    }
                        //
                        //    if (nodeNew.__expanded__) {
                        //        childsElem.removeClass(scope.$class.hidden);
                        //    } else {
                        //        childsElem.addClass(scope.$class.hidden);
                        //    }
                        //}
                        //console.timeEnd('Node_Changed');
                    }
                }

                first = false;

                function fnHiddenChild(node, parent) {
                    //node.__visible__ = nodeNew.__expanded__ && (node.__visible__ || parent.__expanded__);
                    var nodeScope = scope.getScope(node);
                    if (nodeScope) {
                        if (nodeNew.__expanded__ && (node.__visible__ || parent.__expanded__)) {
                            nodeScope.$element.removeClass(scope.$class.hidden);
                            node.__visible__ = true;
                        } else {
                            nodeScope.$element.addClass(scope.$class.hidden);
                            node.__visible__ = false;
                        }
                    } else {
                        // show node & init scope
                        node.__visible__ = true;
                    }

                    // skip all child hiding... if not expaned
                    return !node.__expanded__;
                }
            }
        }
    }]
);