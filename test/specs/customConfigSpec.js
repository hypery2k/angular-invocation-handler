describe('angular-invocation-handler with custom config:', function () {
  'use strict';

  // load the controller's module
  beforeEach(module('appCustomConfig'));

  // framework services
  var iHService,
    feedbackUIService,
  // app services
    myiHService,
    busService,
    location,
    scope,
    httpBackend;

  // Initialize the service
  beforeEach(inject(function ($rootScope, $httpBackend, $location, ngIHService, feedbackUI, myErrorHandlingService, eventService) {
    scope = $rootScope;
    httpBackend = $httpBackend;
    location = $location;
    iHService = ngIHService;
    feedbackUIService = feedbackUI;
    myiHService = myErrorHandlingService;
    busService = eventService;
    // create spies
    spyOn(location, 'path');
    spyOn(iHService, 'funcError');
    spyOn(myiHService, 'resolve');
    spyOn(feedbackUIService, 'appendErrorMsg');
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should not attach any message without an error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(200, [{id: 1, value: 'sample1'}, {
      id: 1,
      value: 'sample1'
    }]);
    busService.list('1', function (events) {
      expect(events.length).toBe(2);
      expect(iHService.funcError).not.toHaveBeenCalled();
      expect(myiHService.resolve).not.toHaveBeenCalled();
      expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
      done();
    });
    httpBackend.flush();
  });

  it('should omit error handler with error callback', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    }, function (err) {
      done();
    });
    httpBackend.flush();
  });

  it('should redirect on error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(location.path).toHaveBeenCalled();
    done();
  });

  it('should attach any message to the UI', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(feedbackUIService.appendErrorMsg).toHaveBeenCalled();
    done();
  });

  it('should use custom error handler', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(myiHService.resolve).toHaveBeenCalled();
    done();
  });

  it('should handle errors on default', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(iHService.funcError).toHaveBeenCalled();
    done();
  });
});
