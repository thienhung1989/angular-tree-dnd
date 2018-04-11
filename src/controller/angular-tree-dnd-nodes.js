angular.module('ntt.TreeDnD')
    .controller('treeDndNodesController', [
        '$scope', '$element',
        function ($scope, $element) {
            this.scope = $scope;

            $scope.$element = $element;
            $scope.$type    = 'treeDndNodeHandle';
        }
    ]);