app.directive(
    'viewSource',
        function ($http, $timeout) {
            return {
                scope:       {
                    demoName:       '@viewSource',
                    highlightLines: '='
                },
                templateUrl: 'framework/view-source.html',
                link:        function (scope/*, element, attr*/) {

                    scope.models = {
                        types:     [
                            {
                                extension: 'html',
                                language:  'markup',
                                label:     'Markup'
                            },
                            {
                                extension: 'js',
                                language:  'javascript',
                                label:     'Javascript'
                            },
                            {
                                extension: 'css',
                                language:  'css',
                                label:     'CSS'
                            }
                        ],
                        activeTab: 'markup'
                    };

                    angular.forEach(
                        scope.models.types, function (type) {
                            $http.get(scope.demoName + '/' + scope.demoName + '.' + type.extension)
                                .then(
                                function (httpResponse) {
                                    type.source = httpResponse.data;
                                    $timeout(Prism.highlightAll, 0);
                                }
                            );
                        }
                    );

                }
            };
        }
);
