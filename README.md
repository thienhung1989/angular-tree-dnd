# angular-tree-table
[Angular 1.x] Display tree table &amp; event DrapnDrop, field 'td' by tree (other normal), Hiển thị cột 'td' được chọn theo dạng cây, những cột khác bình thường.

This product is the combination and optimization of 2: https://github.com/angular-ui-tree/angular-ui-tree (Drag2Drop) và https://github.com/khan4019/tree-grid-directive (Display Tree2Table).

Đây là sản phẩm kết hợp và tối ưu từ 2: https://github.com/angular-ui-tree/angular-ui-tree (Drag2Drop) và https://github.com/khan4019/tree-grid-directive (Display Tree2Table).

* Function 'filter' & 'group by' not add in ng-repeate (it's slow & incompatible with $id($$hash) )

* Functions extended in control (attribute 'tree-control'):
```js
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
