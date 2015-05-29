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
                }

                $scope.expanding_property = {
                    field:       "Name",
                    titleClass:  'text-center',
                    cellClass:   'v-middle',
                    displayName: 'Name'
                };

                $scope.col_defs_table = [
                    {
                        field:       "Description",
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
                    }]

                $scope.tree_list = $TreeDnDConvert.line2tree(DataDemo.getDatas(), 'DemographicId', 'ParentId');
                $scope.tree_table = angular.copy($scope.tree_list);


                // Tree-Clone
                $scope.tree_clone = $TreeDnDConvert.line2tree(
                    [
                        {
                            "DemographicId": -1,
                            "ParentId":      null,
                            "Name":          "United States of America",
                            "Description":   "United States of America",
                            "Area":          9826675,
                            "Population":    318212000,
                            "TimeZone":      "UTC -5 to -10"
                        }], 'DemographicId', 'ParentId'
                );
                $scope.col_defs_clone = [
                    {
                        cellTemplate: '<button class="btn btn-default btn-sm">#: {{ node.DemographicId }}</button>'
                    }];

                var id = 1999, _clone;

                $scope.callbacks = {
                    accept: function(){
                        // disable all drop from tree other
                        return false;
                    },
                    droppable: function(){
                        // disable drop self and other
                        return false;
                    },
                    changeKey: function (node) {
                        // We overide changeKey default
                        id++,
                            node.DemographicId = id;
                        node.Name = node.Name + '#' + id;
                        node.__uid__ = Math.random();
                        if (node.__selected__) {
                            delete(node.__selected__);
                        }
                    },
                    // this function clone default, extended in callbacks
                    /*clone:     function (node, _this) {
                        // _this = $scope.$callbacks, we will easy call function extended!
                        _clone = angular.copy(node);
                        _this.for_all_descendants(_clone, _this.changeKey);
                        return _clone;
                    },*/
                    remove:    function (node, parent, _this) {
                        // If not set enable-move="false" then this function will call
                        // We change it like function clone, to sure it always clone node!
                        return _this.clone(node, _this);
                    }
                };
            }]
    ).factory(
        'DataDemo', function () {
            return {
                getDatas: function () {
                    return [
                        {
                            "DemographicId": 1,
                            "ParentId":      null,
                            "Name":          "United States of America",
                            "Description":   "United States of America",
                            "Area":          9826675,
                            "Population":    318212000,
                            "TimeZone":      "UTC -5 to -10"
                        }, {
                            "DemographicId": 2,
                            "ParentId":      1,
                            "Name":          "California",
                            "Description":   "The Tech State",
                            "Area":          423970,
                            "Population":    38340000,
                            "TimeZone":      "Pacific Time"
                        }, {
                            "DemographicId": 3,
                            "ParentId":      2,
                            "Name":          "San Francisco",
                            "Description":   "The happening city",
                            "Area":          231,
                            "Population":    837442,
                            "TimeZone":      "PST"
                        }, {
                            "DemographicId": 4,
                            "ParentId":      2,
                            "Name":          "Los Angeles",
                            "Description":   "Disco city",
                            "Area":          503,
                            "Population":    3904657,
                            "TimeZone":      "PST"
                        }, {
                            "DemographicId": 5,
                            "ParentId":      1,
                            "Name":          "Illinois",
                            "Description":   "Not so cool",
                            "Area":          57914,
                            "Population":    12882135,
                            "TimeZone":      "Central Time Zone"
                        }, {
                            "DemographicId": 6,
                            "ParentId":      5,
                            "Name":          "Chicago",
                            "Description":   "Financial City",
                            "Area":          234,
                            "Population":    2695598,
                            "TimeZone":      "CST"
                        }, {
                            "DemographicId": 7,
                            "ParentId":      1,
                            "Name":          "Texas",
                            "Description":   "Rances, Oil & Gas",
                            "Area":          268581,
                            "Population":    26448193,
                            "TimeZone":      "Mountain"
                        }, {
                            "DemographicId": 8,
                            "ParentId":      1,
                            "Name":          "New York",
                            "Description":   "The largest diverse city",
                            "Area":          141300,
                            "Population":    19651127,
                            "TimeZone":      "Eastern Time Zone"
                        }, {
                            "DemographicId": 14,
                            "ParentId":      8,
                            "Name":          "Manhattan",
                            "Description":   "Time Square is the place",
                            "Area":          269.403,
                            "Population":    0,
                            "TimeZone":      "EST"
                        }, {
                            "DemographicId": 15,
                            "ParentId":      14,
                            "Name":          "Manhattan City",
                            "Description":   "Manhattan island",
                            "Area":          33.77,
                            "Population":    0,
                            "TimeZone":      "EST"
                        }, {
                            "DemographicId": 16,
                            "ParentId":      14,
                            "Name":          "Time Square",
                            "Description":   "Time Square for new year",
                            "Area":          269.40,
                            "Population":    0,
                            "TimeZone":      "EST"
                        }, {
                            "DemographicId": 17,
                            "ParentId":      8,
                            "Name":          "Niagra water fall",
                            "Description":   "Close to Canada",
                            "Area":          65.7,
                            "Population":    0,
                            "TimeZone":      "EST"
                        }, {
                            "DemographicId": 18,
                            "ParentId":      8,
                            "Name":          "Long Island",
                            "Description":   "Harbour to Atlantic",
                            "Area":          362.9,
                            "Population":    0,
                            "TimeZone":      "EST"
                        }, {
                            "DemographicId": 51,
                            "ParentId":      1,
                            "Name":          "All_Other",
                            "Description":   "All_Other demographics",
                            "Area":          0,
                            "Population":    0,
                            "TimeZone":      0
                        }, {
                            "DemographicId": 201,
                            "ParentId":      null,
                            "Name":          "India",
                            "Description":   "Hydrabad tech city",
                            "Area":          9826675,
                            "Population":    318212000,
                            "TimeZone":      "IST"
                        }, {
                            "DemographicId": 301,
                            "ParentId":      null,
                            "Name":          "Bangladesh",
                            "Description":   "Country of love",
                            "Area":          9826675,
                            "Population":    318212000,
                            "TimeZone":      "BST"
                        }];
                }
            }
        }
    );
})();
