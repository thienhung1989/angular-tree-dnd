angular.module('ntt.TreeDnD')
    .directive('treeDndNodes', function () {
        return {
            restrict: 'A',
            replace: true,
            controller: 'treeDndNodesController',
            link: fnLink
        };

        function fnLink(scope, element/*, attrs*/) {
            scope.$type = 'TreeDnDNodes';

            if (scope.$class.nodes) {
                element.addClass(scope.$class.nodes);
                scope.$nodes_class = scope.$class.nodes;
            } else {
                scope.$nodes_class = '';
            }
        }
    });