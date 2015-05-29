angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNodes', function () {
        return {
            restrict: 'A',
            replace:  true,
            link:     function (scope, element, attrs) {
                scope.nodes = [];
                scope.$nodes_class = '';
                scope.$type = 'TreeDnDNodes';
                scope.$element = element;
                scope.getScopeNode = null;

                scope.$watch(
                    attrs.treeDndNodes, function (newValue, oldValue, scope) {
                        scope.nodes = newValue;
                    }, true
                );

                if (scope.$class.nodes) {
                    element.addClass(scope.$class.nodes);
                    scope.$nodes_class = scope.$class.nodes;
                }
            }
        };
    }
);