/**
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 * @preserve
 */

/**
 * Implementing TreeDnD & Event DrapnDrop (allow drag multi tree-table include all type: table, ol, ul)
 * Demo: http://thienhung1989.github.io/angular-tree-dnd
 * Github: https://github.com/thienhung1989/angular-tree-dnd
 * @preserve
 * (c) 2015 Nguyuễn Thiện Hùng - <nguyenthienhung1989@gmail.com>
 */
/**
 * @namespace angular
 */

/**
 * Is undefined or null
 * @param {*} val - Value
 * @returns {boolean}
 */
angular.isUndefinedOrNull = function isUndefinedOrNull(val) {
    return angular.isUndefined(val) || val === null;
};

/**
 * Is defined
 *
 * @param {*} val - Value
 * @returns {boolean}
 */
angular.isDefined = function isDefined(val) {
    return !(angular.isUndefined(val) || val === null);
};

/**
 * @namespace Factory
 * @type object
 */

/**
 * @constant $TreeDnDClass
 * @type object
 * @default
 * @property {string} [tree=tree-dnd]           - Class tree
 * @property {string} [empty=tree-dnd-empty]    - Class tree empty
 * @property {string} [hidden=tree-dnd-hidden]  - Class tree hidden
 * @property {string} [node=tree-dnd-node]      - Class tree node
 * @property {string} [nodes=tree-dnd-nodes]    - Class tree nodes
 * @property {string} [handle=tree-dnd-handle]  - Class tree handle
 * @property {string} [place=tree-dnd-place]    - Class tree place
 * @property {string} [drag=tree-dnd-drag]      - Class tree drag
 * @property {string} [status=tree-dnd-status]  - Class tree status (coping, moving)
 * @property {object} icon
 */
angular.module('ntt.TreeDnD', ['template/TreeDnD/TreeDnD.html'])
    .constant('$TreeDnDClass', {
        tree: 'tree-dnd',
        empty: 'tree-dnd-empty',
        hidden: 'tree-dnd-hidden',
        node: 'tree-dnd-node',
        nodes: 'tree-dnd-nodes',
        handle: 'tree-dnd-handle',
        place: 'tree-dnd-placeholder',
        drag: 'tree-dnd-drag',
        status: 'tree-dnd-status',
        icon: {
            '1': 'glyphicon glyphicon-minus',
            '0': 'glyphicon glyphicon-plus',
            '-1': 'glyphicon glyphicon-file'
        }
    });