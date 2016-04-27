(function () {
    'use strict';
    app.controller(
        'MultiController', [
            '$scope', '$TreeDnDConvert', 'DataDemo', function ($scope, $TreeDnDConvert, DataDemo) {
                var tree;

                $scope.my_tree = tree = {};

                $scope.my_tree.addFunction = function (node) {
                    console.log(node);
                    alert('Function added in Controller "App.js"');
                };

                $scope.expanding_property = {
                    field: 'Name',
                    titleClass:  'text-center',
                    cellClass:   'v-middle',
                    displayName: 'Name'
                };

                $scope.col_defs_table = [
                    {
                        field: 'Description',
                        titleStyle:  {
                            'width': '80pt'
                        },
                        titleClass:  'text-center',
                        cellClass:   'v-middle text-center',
                        displayName: 'Description'
                    },
                    {
                        displayName:  'Function',
                        cellTemplate: '<button ng-click="tree.addFunction(node)" class="btn btn-default btn-sm">Controller!</button>'
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="tree.remove_node(node)" class="btn btn-default btn-sm">Remove</button>'
                    }];

                $scope.col_defs_list = [
                    {
                        cellTemplate: '<button ng-click="tree.addFunction(node)" class="btn btn-default btn-sm">Controller!</button>'
                    }, {
                        cellTemplate: '<button ng-click="tree.remove_node(node)" class="btn btn-default btn-sm">Remove</button>'
                    }];
                // DataDemo.getDatas() can see in 'Custom Option' -> Tab 'Data Demo'
                $scope.tree_list = $TreeDnDConvert.line2tree(DataDemo.getDatas(), 'DemographicId', 'ParentId');

                $scope.tree_table = angular.copy($scope.tree_list, []);

                // Tree-Clone
                $scope.tree_clone = $TreeDnDConvert.line2tree(
                    [
                        {
                            'DemographicId': -1,
                            'ParentId': null,
                            'Name': 'United States of America',
                            'Description': 'United States of America',
                            'Area': 9826675,
                            'Population': 318212000,
                            'TimeZone': 'UTC -5 to -10'
                        }], 'DemographicId', 'ParentId'
                );

                $scope.col_defs_clone = [
                    {
                        cellTemplate: '<button class="btn btn-default btn-sm">#: {{ node.DemographicId }}</button>'
                    }];

                var id = 1999;

                $scope.callbacks = {
                    changeKey: function (node) {
                        // We overide changeKey default
                        id++;
                        node.DemographicId = id;
                        node.Name = node.Name + '#' + id;
                        node.__uid__ = Math.random();
                        if (node.__selected__) {
                            delete(node.__selected__);
                        }
                    }
                };
            }]
    );
})();
