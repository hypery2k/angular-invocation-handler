/*global mockApp: true*/
var app = angular.module('appMock', [
    'ngIH.core',
    'ngIH.ui'
]);

app.config(function ($provide, ngIHServiceProvider, ngIHConfig) {
    'use strict';

    // enable UI feedback attach
    ngIHConfig.feedbackAttach = true;
    ngIHConfig.customerErrorHandler = 'myErrorHandlingService';
    // decorate the mentioned [services] with automatic error handling.
    ngIHServiceProvider.decorate($provide, ['eventService']);
});

app.factory('myErrorHandlingService', function ($http) {
        'use strict';

        return {
            resolve: function (error, callback) {
            }
        };
    }
);

app.factory('eventService', function ($http) {
        'use strict';
        return {
            list: function (id, callback) {
                $http.get('http://example.org/events/' + id).
                    success(function (data) {
                        return callback(data);
                    });
            }
        };
    }
);