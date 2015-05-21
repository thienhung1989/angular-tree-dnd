
(function () {
    'use strict';
    app.directive(
        'basicToolbars', function () {
            return {
                restrict:   'A',
                replace:    true,
                link: function (scope, element, attrs) {
					// debug in demo
					scope.getFn = function(name){
						return scope.my_tree[name];
					}
					
					scope.toolbars = [
						{
							class: 'btn btn-warning',
							label: '----- Effect -----'
						},
						{click: 'reload_data'},
						{click: 'remove_node'},
						{label: 'add_node'},
						{label: 'add_node_root'},
						{
							class: 'btn btn-warning',
							label: '----- Directive -----'
						},
						{click: 'expand_all'},
						{click: 'collapse_all'},
						{click: 'expand_node'},
						{click: 'collapse_node'},
						{label: 'expand_all_parents'},
						{click: 'select_first_node', log: true},
						{click: 'select_next_node', log: true},
						{click: 'select_prev_node', log: true},
						{click: 'select_next_sibling', log: true},
						{click: 'select_prev_sibling', log: true},
						{click: 'select_parent_node', log: true},
						{click: 'select_node', log: true},
						{click: 'deselect_node', log: true},
						{
							class: 'btn btn-warning',
							label: '----- Event -----'
						},
						{click: 'get_children', log: true},
						{click: 'get_closest_ancestor_next_sibling', log: true},
						{click: 'get_first_child', log: true},
						{click: 'get_first_node', log: true},
						{click: 'get_last_descendant', log: true},
						{click: 'get_next_node', log: true},
						{click: 'get_next_sibling', log: true},
						{click: 'get_parent', log: true},
						{click: 'get_prev_node', log: true},
						{click: 'get_prev_sibling', log: true},
						{click: 'get_selected_node', log: true},
						{click: 'get_siblings', log: true},
					];
				}
			}
		}
    );
})();
