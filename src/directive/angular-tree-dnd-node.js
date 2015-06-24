angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNode', function () {
        return {
            restrict: 'A',
            replace:  true,
            link:     function (scope, element, attrs) {
                var _enabledDragDrop = (typeof scope.dragEnabled === 'boolean' || typeof scope.dropEnabled === 'boolean');
                scope.$modelValue = null;
                scope.$icon_class = '';
                scope.$node_class = '';

                if (scope.$class.node) {
                    element.addClass(scope.$class.node);
                    scope.$node_class = scope.$class.node;
                }

                scope.$watch(
                    attrs.treeDndNode, function (newValue, oldValue, scope) {
                        if (_enabledDragDrop) {
                            scope.setScope(scope, newValue);
                        }
                        scope.$modelValue = newValue;
                        scope.$icon_class = scope.$class.icon[newValue.__icon__];
                    }, true
                );

                if (_enabledDragDrop) {

                    scope.$element = element;
                    scope.$type = 'TreeDnDNode';

                    scope.getScopeNode = function () {
                        return scope;
                    };

                    scope.getData = function () {
                        return scope.$modelValue;
                    };

                    scope.getElementChilds = function () {
                        return angular.element(element[0].querySelector('[tree-dnd-nodes]'));
                    };
                }
            }
        };
    }
);