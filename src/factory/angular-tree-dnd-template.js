angular.module('ntt.TreeDnD')
       .factory(
           '$TreeDnDTemplate', [
               '$templateCache', function ($templateCache) {
                   var templatePath = 'template/TreeDnD/TreeDnD.html',
                       copyPath     = 'template/TreeDnD/TreeDnDStatusCopy.html',
                       movePath     = 'template/TreeDnD/TreeDnDStatusMove.html',
                       scopes       = {},
                       temp,
                       _$init       = {
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
                               if (scopes[scope.$id] && scopes[scope.$id].copyPath) {
                                   temp = $templateCache.get(scopes[scope.$id].copyPath);
                                   if (temp) {
                                       return temp;
                                   }
                               }
                               return $templateCache.get(copyPath);
                           },
                           getMove: function (scope) {
                               if (scopes[scope.$id] && scopes[scope.$id].movePath) {
                                   temp = $templateCache.get(scopes[scope.$id].movePath);
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