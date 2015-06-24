* Construct operation of the condition filter:
	* Object:
	```js
		{
			Test: 'a',
			Test3: '3',
			__condition__: 'and' // or AND, true
			// __condition__: 'or' // sample: 'OR', false, null
		}
	```
		* All will convert to:
			* If field: `__condition__` not exist then __condition__ = null;
				* When condition `or`:
					```js
					scope.filter = [
						{ field: 'Test', callbacks: 'a' },
						{ field: 'Test3', callbacks: '3' },
					]

					scope.filterOptions = {
						beginAnd: 'false'
					}
					```
				* When condition `and` *(all sample with `or`, just different in `scope.filterOptions`)*:
					```js
					scope.filterOptions = {
						beginAnd: true
					}
					```
	* Array: 
		* Construct of filter:
			```js
			scope.filter = [
				{ field: 'Test', callbacks: 'a' },
				{ field: 'Test3', callbacks: '3' },
			]
			```
		* Multi condition:
			* Example: Test || Test3 || (Test4 && Test5)
			```js
			scope.filter = [
				{ field: 'Test', callbacks: 'a' },
				{ field: 'Test3', callbacks: '3' },
				[
					{ field: 'Test4', callbacks: 'a' },
					{ field: 'Test5', callbacks: 'a' }
				]
			]
			
			scope.filterOptions = {
				beginAnd: 'false' // null
			}
			```
			* Example: Test && Test3 && (Test4 || Test5)
			```js
			scope.filter = [
				{ field: 'Test', callbacks: 'a' },
				{ field: 'Test3', callbacks: '3' },
				[
					{ field: 'Test4', callbacks: 'a' },
					{ field: 'Test5', callbacks: 'a' }
				]
			]
			
			scope.filterOptions = {
				beginAnd: true // or `true`
			}
			```
			
			* Example: Test && Test3 && (Test4 || (Test5 && Test6))
			```js
			scope.filter = [
				{ field: 'Test', callbacks: 'a' },
				{ field: 'Test3', callbacks: '3' },
				[
					{ field: 'Test4', callbacks: 'a' },
					[
						{ field: 'Test5', callbacks: 'a' },
						{ field: 'Test6', callbacks: 'a' }
					]
				]
			]
			```
			
			
### Orther:
* Function 'filter' & 'group by' not add in ng-repeate (it's slow & incompatible with $id($$hash) )
* Able add function to tree-dnd by:
	* Example: *(See on Demo 2)*
```js
	$scope.my_tree.addFunction = function(b){
	  console.log(b);
	  alert('Function added in Controller "App.js"');
	}
```
		* Call function: *(tree.remove_node extended see below with function other)*
```js
              $scope.col_defs = [
                    {
                        field: "Description"
                    }, {
                        displayName:  'Function',
                        cellTemplate: '<button ng-click="tree.addFunction(node)" class="btn btn-default btn-sm">Added Controller!</button>'
                    }, {
                        displayName:  'Remove',
                        cellTemplate: '<button ng-click="tree.remove_node(node)" class="btn btn-default btn-sm">Remove</button>'
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
	tree.select_first_node();
	tree.select_node(node);
	tree.add_node(parent, new_node, index);
	tree.add_root_node(new_node);
	tree.remove_node(node);
	tree.expand_node(node);
	tree.collapse_node(node);
	tree.get_selected_node();
	tree.get_first_child(node);
	tree.get_children(node);
	tree.get_first_node();
	tree.get_next_node(node);
	tree.get_prev_node(node);
	tree.get_parent_node(node);
	tree.get_siblings(node);
	tree.get_next_sibling(node);
	tree.get_prev_sibling(node);
	tree.get_closest_ancestor_next_sibling(node);
	tree.select_next_node(node);
	tree.select_next_sibling(node);
	tree.select_prev_sibling(node);
	tree.select_parent_node(node);
	tree.last_descendant(node);
	tree.select_prev_node(node);
```

* Example
**init:
```html
<tree-dnd
    tree-class="dnd"
    tree-data="tree_data"
    tree-control="my_tree"
    callbacks="callbacks"
    drag-enabled="true"
    icon-leaf="none"
    icon-expand="fa fa-fw fa-angle-right"
    icon-collapse="fa fa-fw fa-angle-down"
    template-url="tree-dnd-template.html"
    column-defs="col_defs"
    expand-on="expanding_property"
    on-select="my_tree_handler(node)"
    on-click="my_tree_handler(node)"
    data-indent="30"
    data-indent-unit="px"
    data-indent-plus="15"
>
</tree-dnd>
```
** Template Extened:
```html
<script type="text/ng-template" id="tree-dnd-template.html">
	<div class="tree-dnd">
        <dnd class="dnd">
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
                <tr tree-dnd-node ng-repeat="node in tree_rows track by hashedTree(node)"
                    ng-show="node.__visible__" ng-class="(node.__selected__ ? ' active':'')"
                    class="ng-animate ">
                    <td ng-if="!expandingProperty.template"
                        ng-style="expandingProperty.cellStyle ? expandingProperty.cellStyle : {'padding-left': $callbacks.calsIndent(node.__level__)}"
                        ng-click="user_clicks_node(node)" ng-class="expandingProperty.cellClass"
                        compile="expandingProperty.cellTemplate">
                    <span tree-dnd-node-handle>
                        <i class="fa fa-sort text-muted m-r-sm"></i>
                    </span> {{node[expandingProperty.field] || node[expandingProperty]}} <a> <i
                            ng-class="node.__tree_icon__" ng-click="node.__expanded__ = !node.__expanded__"
                            class="tree-icon"></i> </a>
                    </td>
                    <td ng-if="expandingProperty.template" compile="expandingProperty.template"></td>
                    <td ng-repeat="col in colDefinitions" ng-class="col.cellClass" ng-style="col.cellStyle"
                        compile="col.cellTemplate">
                        {{node[col.field]}}
                    </td>
                </tr>
            </tbody>
        </dnd>
    </div>
</script>
```
## dragStop:
```js
    scope.$callbacks.dragStop(dragInfo, _status);
```
    * _status: Status changed pos of node, Drag succeed!
    * dragInfo:
        * node:          scope.node(), // Data node dragged
        * scope:         scope, // Scope node
        * level:         scope.node().__level__, // Level indent
        * target:        scope.prev(), // Node prev
        * move:
            * parent: -1, // -1: Dragged failed, null: node root, > 0: node normal
            * pos:    -1 // Position new Note moveTo
    * 'dropped': re-Add function ` * re-Add function `dropped` in `$callbaks` *(used to copying or remove node old)*:
       * 
       ```html
           dropped:     function (info, pass, isMove);
       ```
       * With param:
           * info: 
               * drag: Scope of Node dragging.
               * tree: Scope of Node Target.
               * node: Node dragging.
               * parent: Parent containd Node Dragging.
               * move:
                   * parent: Node parent to move node dragging to.
                   * pos: Position insert.
               * target: Data node Target *(able skip, not important)*
            * pass: bypass resutl in `$callback.beforeDrop:`.
            * isMove: status Moving or Copying.` in `$callbaks` *(used to copying or remove node old)*:
        * 
        ```html
            dropped:     function (info, pass, isMove);
        ```
        * With param:
            * info: 
                * drag: Scope of Node dragging.
                * tree: Scope of Node Target.
                * node: Node dragging.
                * parent: Parent containd Node Dragging.
                * move:
                    * parent: Node parent to move node dragging to.
                    * pos: Position insert.
                * target: Data node Target *(able skip, not important)*
             * pass: bypass resutl in `$callback.beforeDrop:`.
             * isMove: status Moving or Copying.

* Add 'data' to TreeDnDNode  `tree-dnd-node=data` in template;
```html
<tr tree-dnd-node="node" 
    ng-repeat="node in tree_rows track by hashedTree(node)"
    ng-show="node.__visible__" 
    ng-class="(node.__selected__ ? ' active':'')" 
>
    ....
</tr>
```

## Display ListTree (UL, OL)
* Combinding with list-tree.
```html
<script type="text/ng-template" id="tree-dnd-template-render.html">
    <ul tree-dnd-nodes="tree_data">
        <li tree-dnd-node="node" ng-repeat="node in nodes track by node.__hashKey__"
            ng-show="node.__visible__" compile="expandingProperty.cellTemplate"
            ng-include="'tree-dnd-template-fetch.html'"></li>
    </ul>
</script>

<script type="text/ng-template" id="tree-dnd-template-fetch.html">
    <div class="list-group-item"
         ng-class="(node.__selected__ ? 'list-group-item-success':'')"
         ng-click="onClick(node)"
         ng-style="expandingProperty.cellStyle ? expandingProperty.cellStyle : {}">

        <a class="btn btn-default" aria-label="Justify" type="button" tree-dnd-node-handle>
            <span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>
        </a> 
        
        {{node[expandingProperty.field] || node[expandingProperty]}}
        
        <span ng-class="$iconClass" ng-click="toggleExpand(node)"></span>
        <div class="pull-right">
            <span ng-repeat="col in colDefinitions" ng-class="col.cellClass" ng-style="col.cellStyle"
                  compile="col.cellTemplate">
                {{node[col.field]}}
            </span>
        </div>
    </div>
    <ul tree-dnd-nodes="node.__children__">
        <li tree-dnd-node="node" ng-repeat="node in nodes track by node.__hashKey__"
            ng-show="node.__visible__" compile="expandingProperty.cellTemplate"
            ng-include="'tree-dnd-template-fetch.html'"></li>
    </ul>
</script>

<tree-dnd tree-data="tree_data"
    tree-control="my_tree"
    column-defs="col_defs_min"
    expand-on="expanding_property"
    on-select="select_handler(node)"
    on-click="click_handler(node)"
    template-url="tree-dnd-template-render.html"
    icon-leaf="none"
    icon-expand="glyphicon glyphicon-chevron-down"
    icon-collapse="glyphicon glyphicon-chevron-right"
></tree-dnd>
```


## Add attributes

* `__tree_icon__` : changed to `__icon__` *(-1: leaf, 0: collect, 1: expaned)* - *(in Tree_Data)*
* Added `$iconClass` replace for `__tree_icon__` *(avoid conflict when create tree-dnd use one `tree-data`)*
* Add function:
* re-Add function `dropped` in `$callbaks` *(used to copying or remove node old)*:
    * 
    ```html
        dropped:     function (info, pass, isMove);
    ```
    * With param:
        * info: 
            * drag: Scope of Node dragging.
            * tree: Scope of Node Target.
            * node: Node dragging.
            * parent: Parent containd Node Dragging.
            * move:
                * parent: Node parent to move node dragging to.
                * pos: Position insert.
            * target: Data node Target *(able skip, not important)*
         * pass: bypass resutl in `$callback.beforeDrop:`.
         * isMove: status Moving or Copying.
* 'onSelect': Select and callback function `on-select` *(created in `directive`)*
* 'onClick': callback function `on-click`. *(created in `directive`)*
* 'column-defs': `null` will auto get colDefinitions *(sample with `empty`)*.
* 'enable-move': `true`: To move node, `false`: to copy node *(default `true`)*
* 'enable-hotkey': `true`: press 'shift' to move node, unpress 'shift' to copy node. *(default `false`)*
* 'enable-drag': to Enable-drag *(default `true`)*
* 'enable-status': to show status moving, copying *(default `false`)*
* 'template-copy': to add url template of `Status Copy` *(can bypass string or variable in controller, but just only get $templateCache, if not exist will get default)*;
* 'template-move': to add url template of `Status Move` *(can bypass string or variable in controller, but just only get $templateCache, if not exist will get default)*;
* Example:

```html
<tree-dnd class="tree-dnd dnd dnd-hover b-b b-light" tree-data="tree_data" tree-control="my_tree"
    primary-key="primaryKey" 
    callbacks="callbacks" 
    
    enable-drag="true"
    enable-status="true" 
    enable-move="true" 
    icon-leaf="none" 
    icon-expand="fa fa-fw fa-angle-right"
    icon-collapse="fa fa-fw fa-angle-down" 
    
    column-defs="col_defs" 
    expand-on="expanding_property"
    
    
    on-select="select_handler()"
    on-click="click_handler()"
    
    template-url="tree-dnd-template.html" 
    template-move="'tree-dnd-template.html'"
    template-copy="tree-dnd-template.html"

    data-indent="30"
    data-indent-unit="px"
    data-indent-plus="15"
    
></tree-dnd>

```