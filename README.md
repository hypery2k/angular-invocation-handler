# Angular Invocation Handler 

> A module for collecting errors, stack traces and other information globally from within your Angular app
> e.g. for saving to a remote service or for displaying

[![Build Status](https://travis-ci.org/hypery2k/angular-invocation-handler.svg?branch=master)](https://travis-ci.org/hypery2k/angular-invocation-handler)
[![Build status](https://ci.appveyor.com/api/projects/status/qbdypq5n7p4x3i78?svg=true)](https://ci.appveyor.com/project/hypery2k/angular-invocation-handler)
[![Bower version](https://badge.fury.io/bo/angular-invocation-handler.svg)](http://badge.fury.io/bo/angular-invocation-handler)
[![ NPM devDependency Status](https://david-dm.org/hypery2k/angular-invocation-handler/dev-status.svg)](https://david-dm.org/hypery2k/angular-invocation-handler#info=devDependencies)

##### Reasons to use
It's anyoing to handle all errors in controller and service and also very defective.
So instead of surfacing the log it would be cool to manage them at a central place and maybe store them via on a backend service

##### Usage

Install this module:

```
bower install angular-invocation-handler --save
```

Add the dependencies
```
/*global app: true*/
var app = angular.module('resourcesApp', [
...
'ngInvocationHandler.core',
'ngInvocationHandler.ui' // optional
]);
```

If you like to display the error message within your app, also include the ui module.

Configure the service to be handled:

```
app.config(function ($provide, errorHandlerServiceProvider, errorHandlerConfig) {
'use strict';

// enable UI feedback attach
errorHandlerConfig.feedbackAttach = true;
errorHandlerConfig.customErrorHandler = 'errorHandlingService';
// decorate the mentioned [services] with automatic error handling.
errorHandlerServiceProvider.decorate($provide, ['eventService']);
});

```

### About

This module instruments Angular's `interceptors` to invoke a configurable set for the error handling.
