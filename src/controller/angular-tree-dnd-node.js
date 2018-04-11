angular.module('ntt.TreeDnD')
    .controller('treeDndNodeController', [
        '$scope', '$element',
        function ($scope, $element) {
            this.scope = $scope;

            $scope.$element = $element;
            $scope.$type    = 'treeDndNodeHandle';
        }
    ]);