/**
 * Factory `$TreeDnDTemplate`
 * @namespace $TreeDnDTemplate
 * @name $TreeDnDTemplate
 * @type {object}
 */
angular.module('ntt.TreeDnD')
    .factory('$TreeDnDTemplate', [
        '$templateCache',
        function ($templateCache) {
            var templatePath = 'template/TreeDnD/TreeDnD.html',
                /**
                 * @private
                 * @type {string}
                 */
                copyPath     = 'template/TreeDnD/TreeDnDStatusCopy.html',
                /**
                 * @private
                 * @type {string}
                 */
                movePath     = 'template/TreeDnD/TreeDnDStatusMove.html',
                /**
                 * @private
                 * @type {object}
                 */
                scopes       = {},

                _$init       = /** @lends $TreeDnDTemplate */{
                    /**
                     * Set path of template move
                     *
                     * @param {string} path
                     * @param {$scope} scope
                     */
                    setMove: function (path, scope) {
                        if (!scopes[scope.$id]) {
                            scopes[scope.$id] = {};
                        }
                        scopes[scope.$id].movePath = path;
                    },

                    /**
                     * Set path of template copy
                     *
                     * @param {string} path
                     * @param {$scope} scope
                     */
                    setCopy: function (path, scope) {
                        if (!scopes[scope.$id]) {
                            scopes[scope.$id] = {};
                        }
                        scopes[scope.$id].copyPath = path;
                    },

                    /**
                     * Get template's path
                     *
                     * @returns {string}
                     */
                    getPath: function () {
                        return templatePath;
                    },

                    /**
                     * Get template's copy
                     *
                     * @param {$scope} scope
                     * @returns {string|html}
                     */
                    getCopy: function (scope) {
                        if (scopes[scope.$id] && scopes[scope.$id].copyPath) {
                            var temp = $templateCache.get(scopes[scope.$id].copyPath);
                            if (temp) {
                                return temp;
                            }
                        }

                        return $templateCache.get(copyPath);
                    },

                    /**
                     * Get template's move
                     *
                     * @param {$scope} scope
                     * @returns {string|html}
                     */
                    getMove: function (scope) {
                        if (scopes[scope.$id] && scopes[scope.$id].movePath) {
                            var temp = $templateCache.get(scopes[scope.$id].movePath);
                            if (temp) {
                                return temp;
                            }
                        }

                        return $templateCache.get(movePath);
                    }
                };

            return _$init;
        }]
    );