/*global mockApp: true*/
var app = angular.module('appCustomConfig', [
  'ngIH.core',
  'ngIH.ui'
]);

app.config(function ($provide, ngIHServiceProvider, ngIHConfig) {
  'use strict';

  // enable UI feedback attach, default false
  ngIHConfig.feedbackAttach = true;
  // redirect to static error pages, e.g. 404 --> /404.html, default false
  ngIHConfig.redirect = true;
  // adding custom error handler, default is disabled
  ngIHConfig.customErrorHandler = 'myErrorHandlingService';
  // decorate the mentioned [services] with automatic error handling.
  ngIHServiceProvider.decorate($provide, ['eventService']);
});

app.factory('myErrorHandlingService', function () {
    'use strict';

    return {
      resolve: function (error, callback) {
        callback(error);
      }
    };
  }
);

app.factory('eventService', function ($http) {
    'use strict';

    return {
      list: function (id, callback, errorCallback) {
        return $http
          .get('http://example.org/events/' + id)
          .success(function (data) {
            callback(data);
          })
          .error(function (error) {
            if (errorCallback) {
              errorCallback(error);
            }
          });
      }
    };
  }
);
