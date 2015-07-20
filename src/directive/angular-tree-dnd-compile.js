angular.module('ntt.TreeDnD')
    .directive(
    'compile', [
        '$compile', function ($compile) {
            return {
                restrict: 'A',
                link:     function (scope, element, attrs) {
                    scope.$watch(
                        attrs.compile, function (new_val) {
                            if (new_val) {
                                if (angular.isFunction(element.empty)) {
                                    element.empty();
                                } else {
                                    element.html('');
                                }

                                element.append($compile(new_val)(scope));
                            }
                        }
                    );
                }
            };
        }]
)
    .directive(
    'compileReplace', [
        '$compile', function ($compile) {
            return {
                restrict: 'A',
                link:     function (scope, element, attrs) {
                    scope.$watch(
                        attrs.compileReplace, function (new_val) {
                            if (new_val) {
                                element.replaceWith($compile(new_val)(scope));
                            }
                        }
                    );
                }
            };
        }]
);