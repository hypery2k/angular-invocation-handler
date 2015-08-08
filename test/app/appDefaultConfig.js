/*global mockApp: true*/
var app = angular.module('appDefaultConfig', [
  'ngIH.core',
  'ngIH.ui'
]);

app.config(function ($provide, ngIHServiceProvider, ngIHConfig) {
  'use strict';
  // enable UI feedback attach, default false
  ngIHConfig.feedbackAttach = false;
  // redirect to static error pages, e.g. 404 --> /404.html, default false
  ngIHConfig.redirect = false;
  // adding custom error handler, default is disabled
  ngIHConfig.customErrorHandler = false;
  // decorate the mentioned [services] with automatic error handling.
  ngIHServiceProvider.decorate($provide, ['eventService']);
});

app.factory('eventService', function ($http) {
    'use strict';
    return {
      list: function (id, callback) {
        return $http.get('http://example.org/events/' + id).
          success(function (data) {
            callback(data);
          });
      }
    };
  }
);
