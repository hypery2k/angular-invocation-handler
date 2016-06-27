# Angular Invocation Handler

[![Build Status](https://travis-ci.org/hypery2k/angular-invocation-handler.svg?branch=master)](https://travis-ci.org/hypery2k/angular-invocation-handler)
[![Build status](https://ci.appveyor.com/api/projects/status/qbdypq5n7p4x3i78?svg=true)](https://ci.appveyor.com/project/hypery2k/angular-invocation-handler)
[![Bower version](https://badge.fury.io/bo/angular-invocation-handler.svg)](http://badge.fury.io/bo/angular-invocation-handler)
[![npm version](https://badge.fury.io/js/angular-invocation-handler.svg)](http://badge.fury.io/js/angular-invocation-handler)
[![Code Climate](https://codeclimate.com/github/hypery2k/angular-invocation-handler/badges/gpa.svg)](https://codeclimate.com/github/hypery2k/angular-invocation-handler)
[![ NPM devDependency Status](https://david-dm.org/hypery2k/angular-invocation-handler/dev-status.svg)](https://david-dm.org/hypery2k/angular-invocation-handler#info=devDependencies)

> A module for collecting errors, stack traces and other information globally from within your Angular app
> e.g. for saving to a remote service or for displaying


[![NPM](https://nodei.co/npm/angular-invocation-handler.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/angular-invocation-handler/)
 
> Feel free to **donate**
> 
> <a href='https://pledgie.com/campaigns/31915'><img alt='Click here to lend your support to: NPM packages and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/31915.png?skin_name=chrome' border='0' ></a>
> <a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JYG6LVEHB59TL">
> <img alt="" border="0" src="https://www.paypalobjects.com/de_DE/DE/i/btn/btn_donateCC_LG.gif"/>
> </img></a>
> Or donate [Bitcoins](bitcoin:3NKtxw1SRYgess5ev4Ri54GekoAgkR213D):
> [![Bitcoin](https://martinreinhardt-online.de/bitcoin.png)](bitcoin:3NKtxw1SRYgess5ev4Ri54GekoAgkR213D)
> 
> Also via [greenaddress](https://greenaddress.it/pay/GA3ZPfh7As3Gc2oP6pQ1njxMij88u/)

## Reasons to use
It's anyoing to handle all errors in controller and service and also very defective.
So instead of surfacing the log it would be cool to manage them at a central place and maybe store them via on a backend service

## WIP
- [x] Library core
- [x] Write unit tests
- [x] NPM package
- [ ] Write e2e-tests
- [ ] Write an API doc
- [ ] Provide complete examples

## Usage

Install this module:

```bash
bower install angular-invocation-handler --save
```

Add the dependencies

```javascript
/*global app: true*/
var app = angular.module('resourcesApp', [
...
'ngIH.core',
'ngIH.ui' /* optional */,
'ngIH.exceptionHandler' /* optional */
]);
```

If you like to display the error message within your app, also include the ui module.

Configure the service to be handled:

```javascript
app.config(function ($provide, ngIHServiceProvider, ngIHConfig) {
  'use strict';

  // enable UI feedback attach, default false
  ngIHConfig.feedbackAttach = true;
  // enable clearing of feedback
  ngIHConfig.feedbackClear = true;
  // set custom selector for appending UI error display element
  ngIHConfig.uiSelector = '.navbar';
  // enable scrolling to error display element
  ngIHConfig.scrollToError = true;
  // redirect to static error pages, e.g. 404 --> /404.html, default false
  ngIHConfig.redirect = true;
  // adding custom error handler, default is disabled
  ngIHConfig.customErrorHandler = 'errorHandlingService';
  // decorate the mentioned [services] with automatic error handling.
  ngIHServiceProvider.decorate($provide, ['eventService']);
});

```

The customized error handling service looks like this:

```javascript
app.factory('errorHandlingService', function ($log, $translate, blockUI) {
    'use strict';

    function buildValidationMessages(error, msg, callback, i) {
        var errorDetails = error.data[i];
        $translate('VALIDATION_ERROR_' + errorDetails.messageTemplate).then(function (translatedValue) {
            msg = msg + ' ' + translatedValue;

            // replace placeholder if set
            if (errorDetails.propertyList) {
                msg = msg.format(errorDetails.propertyList);
            }

            // callback when complete
            if (i === error.data.length - 1) {
                $log.debug(error.status + '=>' + msg);
                callback(msg);
            }
        }, function (err) {
            $log.error(err);
            callback(msg);
        });
    }

    return {
        resolve: function (details, callback) {
            if (details.error) {
                var error = details.error;
                // read by http code
                $translate('HTTP_STATUS_CODE_' + error.status).then(function (translatedValue) {
                    var msg = translatedValue;
                    // handle violation errors
                    if (error.status === 400 && error.data && error.data.length) {
                        for (var i = 0; i < error.data.length; i++) {
                            blockUI.stop();
                            buildValidationMessages(error, msg, callback, i);
                        }
                    } else {
                        blockUI.stop();
                        $log.debug(error.status + '=>' + msg);
                        callback(msg);
                    }
                });
            }
        }
    };
});
```

### About

This module instruments Angular's `interceptors` to invoke a configurable set for the error handling.
