angular.module('ntt.TreeDnD')
    .factory('$TreeDnDPlugin', [
        '$injector',
        function ($injector) {
            return _fnget;

            function _fnget(name) {
                if (angular.isDefined($injector) && $injector.has(name)) {
                    return $injector.get(name);
                }
            }
        }]
    );