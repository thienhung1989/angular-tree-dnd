(function () {
    'use strict';
    var app, deps;

    deps = ['treeTable'];

    app = angular.module('treeTableTest', deps);
    app.controller(
        'CategoryMenuController', [
            '$scope', '$state', '$translate', function ($scope, $state, $translate) {
                var tree;
                $scope.tree_data = {};
                $scope.my_tree = tree = {};
                $scope.remove_branch = function () {
                    return $scope.my_tree.remove_branch();
                }
                $scope.my_tree_handler = function (branch) {
                    console.log('you clicked on', branch)
                }

                $scope.expanding_property = {
                    /*template: "<td>OK All</td>",*/
                    field:       "Name",
                    titleClass:  'text-center',
                    cellClass:   'v-middle',
                    displayName: $translate.instant('system.category.menu.name')
                };
                $scope.col_defs = [
                    {
                        field: "Description"
                    }, {
                        field: "Area"
                    }, {
                        field: "Population"
                    }, {
                        field:       "TimeZone",
                        displayName: "Time Zone"
                    }, {
                        field:        "Description",
                        titleStyle:   {
                            'width': '80pt'
                        },
                        titleClass:   'text-center',
                        cellClass:    'v-middle text-center',
                        displayName:  'Description',
                        cellTemplate: "<i class=\"fa {{ !row.Description ? 'fa-times text-danger-lter' : 'fa-check text-success' }} text\"></i>"
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="treeControl.remove_branch(row)" class="btn btn-default btn-sm">Remove</button>'
                    }];
                var _temp_btn = '';
                _temp_btn = "<a class=\"btn btn-sm btn-success\" ui-sref='system.category.menu.edit({ id: row.DemographicId})'><i class='fa fa-pencil'></i></a>";

                if (_temp_btn) {
                    _temp_btn += "&nbsp";
                }
                _temp_btn += "<a class=\"btn btn-sm btn-danger\" ui-sref='system.category.menu.delete({ id: row.DemographicId})'><i class='fa fa-trash'></i></a>";

                if (_temp_btn) {
                    $scope.col_defs.push(
                        {
                            displayName:  $translate.instant('App.Button.Option'),
                            titleStyle:   {
                                'width': '100pt'
                            },
                            titleClass:   'text-center',
                            cellClass:    'v-middle text-center',
                            cellTemplate: _temp_btn
                        }
                    );
                }

                $scope.callbacks = {
                    accept: function (source, dest, index_dest) {
                        return true;
                    }
                }

                var rawTreeData = [
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

                var myTreeData = getTree(rawTreeData, 'DemographicId', 'ParentId');

                $scope.tree_data = myTreeData;
                function getTree(data, primaryIdName, parentIdName) {
                    if (!data || data.length == 0 || !primaryIdName || !parentIdName) {
                        return [];
                    }
                    var tree = [], rootIds = [], item = data[0], primaryKey = item[primaryIdName], treeObjs = {}, parentId, parent, len = data.length, i = 0;
                    while (i < len) {
                        item = data[i++];
                        primaryKey = item[primaryIdName];
                        treeObjs[primaryKey] = item;
                        parentId = item[parentIdName];
                        if (parentId) {
                            parent = treeObjs[parentId];
                            if (parent.__children__) {
                                parent.__children__.push(item);
                            } else {
                                parent.__children__ = [item];
                            }
                        } else {
                            rootIds.push(primaryKey);
                        }
                    }
                    for (var i = 0; i < rootIds.length; i++) {
                        tree.push(treeObjs[rootIds[i]]);
                    }
                    return tree;
                }
            }]
    );
})();