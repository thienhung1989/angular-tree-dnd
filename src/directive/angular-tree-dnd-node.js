angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNode', [
        '$parse', '$http', '$templateCache', '$compile', function ($parse, $http, $templateCache, $compile) {
            return {
                restrict:   'A',
                controller: function ($scope, $element, $attrs) {
                    $scope.$node_class = '';

                    if ($scope.$class.node) {
                        $element.addClass($scope.$class.node);
                        $scope.$node_class = $scope.$class.node;
                    }

                    var _enabledDragDrop = (typeof $scope.dragEnabled === 'boolean' || typeof $scope.dropEnabled === 'boolean');

                    var keyNode = $attrs.treeDndNode;

                    if (_enabledDragDrop) {
                        $scope.setScope($scope, $scope[keyNode]);
                    }

                    $scope.getElementChilds = function () {
                        return angular.element($element[0].querySelector('[tree-dnd-nodes]'));
                    };

                    if (_enabledDragDrop) {

                        $scope.$element = $element;
                        $scope.$type = 'TreeDnDNode';

                        $scope.getData = function () {
                            return $scope[keyNode];
                        };
                    }

                    $scope.getScopeNode = function () {
                        return $scope;
                    };
                }
            };
        }]
);