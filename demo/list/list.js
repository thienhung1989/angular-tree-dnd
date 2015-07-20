(function () {
    'use strict';
    app.controller(
        'ListController', [
            '$scope', '$TreeDnDConvert', 'DataDemo', function ($scope, $TreeDnDConvert, DataDemo) {
                var tree;
                $scope.tree_data = {};
                $scope.my_tree = tree = {};

                $scope.my_tree.addFunction = function (node) {
                    console.log(node);
                    alert('Function added in Controller "App.js"');
                };

                $scope.expanding_property = {
                    field:       'Name',
                    titleClass:  'text-center',
                    cellClass:   'v-middle',
                    displayName: 'Name'
                };

                $scope.col_defs_min = [
                    {
                        displayName:  'Function',
                        cellTemplate: '<button ng-click="tree.addFunction(node)" class="btn btn-default btn-sm">Added Controller!</button>'
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="tree.remove_node(node)" class="btn btn-default btn-sm">Remove</button>'
                    }];
                // DataDemo.getDatas() can see in 'Custom Option' -> Tab 'Data Demo'
                $scope.tree_data = $TreeDnDConvert.line2tree(DataDemo.getDatas(), 'DemographicId', 'ParentId');
            }]
    );
})();
