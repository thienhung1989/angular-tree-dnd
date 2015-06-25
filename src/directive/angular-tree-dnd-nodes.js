angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNodes', ['$parse',function ($parse) {
        return {
            restrict: 'A',
            replace:  true,
            link:     function (scope, element, attrs) {
                scope.$nodes_class = '';
                scope.$type = 'TreeDnDNodes';

                if (scope.$class.nodes) {
                    element.addClass(scope.$class.nodes);
                    scope.$nodes_class = scope.$class.nodes;
                }
            }
        };
    }]
);