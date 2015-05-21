angular.module('ntt.TreeDnD')
    .directive(
    'treeDndNode', function () {
        return {
            restrict:   'A',
            replace:    true,
            controller: [
                '$scope', function ($scope) {
                    $scope.$modelValue = null;
                    $scope.$scopeChildren = null;
                    $scope.elementChilds = null;

                    $scope.prev = function () {
                        return $scope.getPrevGlobal($scope.$modelValue.__index_real__);
                    };

                    $scope.getData = function () {
                        return $scope.$modelValue;
                    };

                    $scope.setElementChilds = function (_elements) {
                        $scope.elementChilds = _elements;
                    };

                    $scope.getScopeNode = function () {
                        return $scope;
                    };

                }],
            link:       function (scope, element, attrs) {
                scope.$element = element;
                scope.$type = 'TreeDnDNode';
                scope.$icon_class = '';
                scope.$node_class = '';

                if (scope.class.node) {
                    element.addClass(scope.class.node);
                    scope.$node_class = scope.class.node;
                }

                scope.$watch(
                    attrs.treeDndNode, function (newValue, oldValue, scope) {
                        scope.setScope(scope, newValue);
                        scope.$modelValue = newValue;
                        scope.$icon_class = scope.class.icon[newValue.__icon__];
                    }, true
                );

            }
        };
    }
);