angular.module('ntt.TreeDnD')
    .controller('treeDndNodeHandleController', [
        '$scope', '$element',
        function ($scope, $element) {
            this.scope = $scope;

            $scope.$element = $element;
            $scope.$type    = 'treeDndNodeHandle';
        }
    ]);