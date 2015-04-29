# angular-tree-table
[Angular 1.x] Display tree table &amp; event DrapnDrop, field 'td' by tree (other normal) - without jQuery.
## Current Version
- 1.0.3
## Demo: 
- http://thienhung1989.github.io/angular-tree-table
- http://plnkr.co/edit/6zQNvW?p=preview

This product is the combination and optimization of 2: https://github.com/angular-ui-tree/angular-ui-tree (Drag2Drop) và https://github.com/khan4019/tree-grid-directive (Display Tree2Table).

## Install bower:
```js
bower angular-tree-table install
```

* Function 'filter' & 'group by' not add in ng-repeate (it's slow & incompatible with $id($$hash) )
* Able add function to tree-table by:
	* Example: *(See on Demo 2)*
```js
	$scope.my_tree.addFunction = function(b){
	  console.log(b);
	  alert('Function added in Controller "App.js"');
	}
```
		* Call function: *(tree.remove_branch extended see below with function other)*
```js
              $scope.col_defs = [
                    {
                        field: "Description"
                    }, {
                        displayName:  'Function',
                        cellTemplate: '<button ng-click="tree.addFunction(row)" class="btn btn-default btn-sm">Added Controller!</button>'
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="tree.remove_branch(row)" class="btn btn-default btn-sm">Remove</button>'
                    }];
```

* Functions extended in callback (able change by attribute):
```js
$scope.$callbacks = {
	// function accept called when item Drapping move-over target
	accept:      function (scopeDrag, scopeTarget, align) {
		return true;
	},
	
	beforeDrag:  function (scopeDrag) {
		return true;
	},
	dropped:     function (info, accepted) {
		return false;
	},
	dragStart:   function (event) {},
	dragMove:    function (event) {},
	dragStop:    function (event, skiped) {},
	beforeDrop:  function (event) {
		return true;
	},
	calsIndent:  function (level) {
		if (level - 1 < 1) {
			return $scope.indent_plus + ($scope.indent_unit ? $scope.indent_unit : 'px');
		} else {
			return ($scope.indent * (level - 1)) + $scope.indent_plus + ($scope.indent_unit ? $scope.indent_unit : 'px');
		}
	},
	dragEnabled: function () {
		return $scope.dragEnabled;
	}
};
```
* Functions extended in control (attribute 'tree-control'):
```html
	tree.expand_all();
	tree.collapse_all();
	tree.select_first_branch();
	tree.select_branch(branch);
	tree.add_branch(parent, new_branch, index);
	tree.add_root_branch(new_branch);
	tree.remove_branch(branch);
	tree.expand_branch(branch);
	tree.collapse_branch(branch);
	tree.get_selected_branch();
	tree.get_first_child(branch);
	tree.get_children(branch);
	tree.get_first_branch();
	tree.get_next_branch(branch);
	tree.get_prev_branch(branch);
	tree.get_parent_branch(branch);
	tree.get_siblings(branch);
	tree.get_next_sibling(branch);
	tree.get_prev_sibling(branch);
	tree.get_closest_ancestor_next_sibling(branch);
	tree.select_next_branch(branch);
	tree.select_next_sibling(branch);
	tree.select_prev_sibling(branch);
	tree.select_parent_branch(branch);
	tree.last_descendant(branch);
	tree.select_prev_branch(branch);
```

* Example
**init:
```html
 <tree-table tree-data="tree_data" tree-control="my_tree" callbacks="callbacks" drag-enabled="true"
        icon-leaf="none" icon-expand="fa fa-fw fa-angle-right" icon-collapse="fa fa-fw fa-angle-down"
        template-url="tree-table-template.html" column-defs="col_defs" expand-on="expanding_property"
        on-select="my_tree_handler(branch)" on-click="my_tree_handler(branch)" data-indent="30"
        data-indent-unit="px" data-indent-plus="15">
</tree-table>
```
** Template Extened:
```html
<script type="text/ng-template" id="tree-table-template.html">
	<div class="tree-table">
            <table class="table">
                <thead>
                    <tr>
                        <th ng-class="expandingProperty.titleClass" ng-style="expandingProperty.titleStyle">
                            {{expandingProperty.displayName || expandingProperty.field || expandingProperty}}
                        </th>
                        <th ng-repeat="col in colDefinitions" ng-class="col.titleClass"
                            ng-style="col.titleStyle">
                            {{col.displayName || col.field}}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr tree-table-node ng-repeat="row in tree_rows track by hashedTree(row)"
                        ng-show="row.__visible__" ng-class="(row.__selected__ ? ' active':'')"
                        class="ng-animate ">
                        <td ng-if="!expandingProperty.template"
                            ng-style="expandingProperty.cellStyle ? expandingProperty.cellStyle : {'padding-left': $callbacks.calsIndent(row.__level__)}"
                            ng-click="user_clicks_branch(row)" ng-class="expandingProperty.cellClass"
                            compile="expandingProperty.cellTemplate">
                        <span tree-table-node-handle>
                            <i class="fa fa-sort text-muted m-r-sm"></i>
                        </span> {{row[expandingProperty.field] || row[expandingProperty]}} <a> <i
                                ng-class="row.__tree_icon__" ng-click="row.__expanded__ = !row.__expanded__"
                                class="tree-icon"></i> </a>
                        </td>
                        <td ng-if="expandingProperty.template" compile="expandingProperty.template"></td>
                        <td ng-repeat="col in colDefinitions" ng-class="col.cellClass" ng-style="col.cellStyle"
                            compile="col.cellTemplate">
                            {{row[col.field]}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
	<pre>{{ treeData | json }}</pre>
	<pre>{{ tree_rows | json }}</pre>
</script>
```
