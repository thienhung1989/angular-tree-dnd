angular.module('ntt.TreeDnD')
    .factory(
    '$TreeDnDTemplate', [
        '$templateCache', function ($templateCache) {
            var templatePath = 'template/TreeDnD/TreeDnD.html';
            var copyPath = 'template/TreeDnD/TreeDnDStatusCopy.html';
            var movePath = 'template/TreeDnD/TreeDnDStatusMove.html';
            var scopes = {};
            return {
                setMove: function (path, scope) {
                    if (!scopes[scope.$id]) {
                        scopes[scope.$id] = {};
                    }
                    scopes[scope.$id].movePath = path;
                },
                setCopy: function (path, scope) {
                    if (!scopes[scope.$id]) {
                        scopes[scope.$id] = {};
                    }
                    scopes[scope.$id].copyPath = path;
                },
                getPath: function () {
                    return templatePath;
                },
                getCopy: function (scope) {
                    var temp;
                    if (scopes[scope.$id] && scopes[scope.$id].copyPath &&
                        (temp = $templateCache.get(scopes[scope.$id].copyPath))) {
                        return temp;
                    }
                    return $templateCache.get(copyPath);
                },
                getMove: function (scope) {
                    var temp;
                    if (scopes[scope.$id] && scopes[scope.$id].movePath &&
                        (temp = $templateCache.get(scopes[scope.$id].movePath))) {
                        return temp;
                    }
                    return $templateCache.get(movePath);
                }
            };

        }]
);