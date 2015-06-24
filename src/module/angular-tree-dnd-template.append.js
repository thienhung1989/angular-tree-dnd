angular.module('template/TreeDnD/TreeDnD.html', []).run(
    [
        '$templateCache', function ($templateCache) {
        $templateCache.put(
            'template/TreeDnD/TreeDnD.html',
            ["<table ng-class=\"$tree_class\">",
             "    <thead>",
             "  <tr>",
             "     <th ng-class=\"expandingProperty.titleClass\" ng-style=\"expandingProperty.titleStyle\">",
             "         {{expandingProperty.displayName || expandingProperty.field || expandingProperty}}",
             "        <\/th>",
             "        <th ng-repeat=\"col in colDefinitions\" ng-class=\"col.titleClass\" ng-style=\"col.titleStyle\">",
             "         {{col.displayName || col.field}}",
             "     </th>",
             "    </tr>",
             "    </thead>",
             " <tbody tree-dnd-nodes=\"tree_nodes\">",
             "  <tr tree-dnd-node=\"node\" ng-repeat=\"node in nodes track by node.__hashKey__ \" ng-show=\"node.__visible__\"",
             "       ng-click=\"onSelect(node)\" ng-class=\"(node.__selected__ ? ' active':'')\">",
             "        <td ng-if=\"!expandingProperty.template\" tree-dnd-node-handle",
             "         ng-style=\"expandingProperty.cellStyle ? expandingProperty.cellStyle : {'padding-left': $callbacks.calsIndent(node.__level__)}\"",
             "          ng-class=\"expandingProperty.cellClass\"",
             "            compile=\"expandingProperty.cellTemplate\">",
             "              <a data-nodrag>",
             "                  <i ng-class=\"$icon_class\" ng-click=\"toggleExpand(node)\"",
             "                     class=\"tree-icon\"></i>",
             "              </a>",
             "             {{node[expandingProperty.field] || node[expandingProperty]}}",
             "       </td>",
             "        <td ng-if=\"expandingProperty.template\" compile=\"expandingProperty.template\"></td>",
             "        <td ng-repeat=\"col in colDefinitions\" ng-class=\"col.cellClass\" ng-style=\"col.cellStyle\"",
             "            compile=\"col.cellTemplate\">",
             "            {{node[col.field]}}",
             "       </td>",
             "    </tr>",
             "    </tbody>",
             "</table>"].join('')
        );

        $templateCache.put(
            'template/TreeDnD/TreeDnDStatusCopy.html',
            "<label><i class=\"fa fa-copy\"></i>&nbsp;<b>Copying</b></label>"
        );

        $templateCache.put(
            'template/TreeDnD/TreeDnDStatusMove.html',
            '<label><i class="fa fa-file-text"></i>&nbsp;<b>Moving</b></label>'
        );
    }]
);