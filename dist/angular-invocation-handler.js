/*
 * angular-invocation-handler
 * Copyright (C)2015 Martin Reinhardt
 * https://github.com/hypery2k/angular-invocation-handler
 *
 * Version: 0.1.0
 * License: MIT
 */

var core = angular.module('ngIH.core', []);
var ui = angular.module('ngIH.ui', []);

// Core

// TODO move to config for translation
core.constant('httpErrors', {
    0: 'Der Server ist nicht erreichbar..',
    404: 'Dieser Dienst existiert nicht.',
    405: 'Zugriffsfehler.',
    500: 'Unbekannte Serverfehler.'
});

core.constant('ngIHConfig', {
    model: {
        alerts: 'alerts'
    },
    customErrorHandler: false,
    templateUrl: 'holi-error-handler-ui/error-handler-config.ng.html',
    template: '<alert ng-repeat=\"alert in alerts\" type=\"{{alert.type}}\" close=\"alerts.splice($index, 1)\">{{::alert.msg}}</alert>',
    feedbackAttach: false
});

core.provider('ngIHService', function () {
    'use strict';

    // Wrap a single function [func] in another function that handles both synchronous and asynchonous errors.
    function decorate($injector, obj, func) {
        return angular.extend(function () {
            var handler = $injector.get('ngIHService');
            return handler.call(func, obj, arguments);
        }, func);
    }

    // Decorate all functions of the service [$delegate] with error handling. This function should be used as decorator
    // function in a call to $provide.decorator().
    var decorator = ['$delegate', '$injector', function ($delegate, $injector) {
        // Loop over all functions in $delegate and wrap these functions using the [decorate] functions above.
        for (var prop in $delegate) {
            if (angular.isFunction($delegate[prop])) {
                $delegate[prop] = decorate($injector, $delegate, $delegate[prop]);
            }
        }
        return $delegate;
    }];

    // The actual service:
    return {
        // Decorate the mentioned [services] with automatic error handling.
        decorate: function ($provide, services) {
            angular.forEach(services, function (service) {
                $provide.decorator(service, decorator);
            });
        },

        $get: ["$log", "$injector", "feedbackUI", "ngIHConfig", "httpErrors", function ($log, $injector, feedbackUI, ngIHConfig, httpErrors) {

            var handler = {

                // The list of errors.
                errors: [],


                resolveErrorCode: function (func, err, callback) {
                    // This is a very limited error handler... you would probably want to check for user-friendly error messages
                    // that were returned by the server, etc, etc, etc. Our original code contains a lot of checks and handling
                    // of error messages to create the "perfect" error message for our users, you should probably do the same. :)
                    if (err) {
                                              
                        var errorDetails = {
                            error: err,
                            timestamp: new Date(),
                            browserInfo: {
                                navigatorAppName: navigator.appName,
                                navigatorUserAgent: navigator.userAgent,
                                navigatorPlatform: navigator.platform
                            }
                        }

                        if (ngIHConfig.customErrorHandler) {
                            $injector.get(ngIHConfig.customErrorHandler).resolve(errorDetails, callback);

                        } else {
                            if (err && !angular.isUndefined(err.status)) {
                                // A lot of errors occur in relation to HTTP calls... translate these into user-friendly msgs.
                                err = httpErrors[err.status];
                            } else if (err && err.message) {
                                // Exceptions are unwrapped.
                                err = err.message;
                            }
                            if (!angular.isString(err)) {
                                err = 'An unkown error occurred.';
                            }

                            // Use the context provided by the service.
                            if (func && func.description) {
                                err = 'Call to ' + func.description + ' had caused errors.';
                            }
                            $log.error('An error occurred: ' + err);
                            callback(errorDetails);
                        }

                    }
                },
                // Report the error [err] in relation to the function [func].
                funcError: function (func, err) {
                    handler.resolveErrorCode(func, err, function (msg) {
                        if (ngIHConfig.feedbackAttach) {
                            feedbackUI.appendErrorMsg(msg);
                        }
                        handler.errors.push(msg);
                    });

                },


                // Call the provided function [func] with the provided [args] and error handling enabled.
                call: function (func, self, args) {
                    $log.debug('Function called: ', (func.name || func));

                    var result;
                    try {
                        result = func.apply(self, args);
                    } catch (err) {
                        // Catch synchronous errors.
                        handler.funcError(func, err);
                        throw err;
                    }

                    // Catch asynchronous errors.
                    var promise = result && result.$promise || result;
                    if (promise && angular.isFunction(promise.then) && angular.isFunction(promise['catch'])) {
                        // promise is a genuine promise, so we call [handler.async].
                        handler.async(func, promise);
                    }

                    return result;
                },


                // Automatically record rejections of the provided [promise].
                async: function (func, promise) {
                    promise['catch'](function (err) {
                        handler.funcError(func, err);
                    });
                    return promise;
                }
            };

            return handler;
        }]
    };
});

core.factory('httpErrorInterceptor', function () {
    'use strict';

    return {
        request: function (config) {
            // 3 seconds timeout
            // TODO move to config
            config.timeout = 3000;
            return config;
        }
    };
});

core.config(["$provide", "$httpProvider", function ($provide, $httpProvider) {
    'use strict';

    // adding interceptor, e.g. for timeouts ...
    $httpProvider.interceptors.push('httpErrorInterceptor');

    // configure exception logger
    $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
        return function (exception, cause) {
            $delegate(exception, cause);
        };
    }]);
}]);

// UI

ui.factory('feedbackUI', ["ngIHConfig", "$timeout", "$rootScope", function (ngIHConfig, $timeout, $rootScope) {
        'use strict';

        // PUBLIC API

        return {
            appendErrorMsg: function (msg) {
                if (!$rootScope[ngIHConfig.model.alerts]) {
                    $rootScope[ngIHConfig.model.alerts] = [];
                }
                $rootScope[ngIHConfig.model.alerts].push({
                    type: 'danger',
                    msg: msg
                });
            },
            appendInfoMsg: function (msg) {
                if (!$rootScope[ngIHConfig.model.alerts]) {
                    $rootScope[ngIHConfig.model.alerts] = [];
                }
                $rootScope[ngIHConfig.model.alerts].push({
                    type: 'info',
                    msg: msg
                });
            }
        };
    }]
);

ui.directive('uiErrorHandler', ["$rootScope", "ngIHConfig", function ($rootScope, ngIHConfig) {
    'use strict';

    return {
        restrict: 'A',
        compile: function ($element) {
            // Class should be added here to prevent an animation delay error.
            $element.append(ngIHConfig.template);
        }
    };
}]);

ui.run(["$rootScope", "$document", "ngIHConfig", "$templateCache", function ($rootScope, $document, ngIHConfig, $templateCache) {
    'use strict';


    // register listener to watch route changes
    $rootScope.$on('$routeChangeStart', function () {
        // reset alerts
        $rootScope[ngIHConfig.model.alerts] = [];
    });

    // trigger directive
    $document.find('.header').attr('ui-error-handler', '');

    if (ngIHConfig.template) {
        // Swap the builtin template with the custom template.
        // Create a magic cache key and place the template in the cache.
        ngIHConfig.templateUrl = '$$angular-errorhandler-template$$';
        $templateCache.put(ngIHConfig.templateUrl, ngIHConfig.template);
    }
}]);