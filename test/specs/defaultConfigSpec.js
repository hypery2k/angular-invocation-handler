describe('angular-invocation-handler with default config:', function () {
  'use strict';

  // load the controller's module
  beforeEach(module('appDefaultConfig'));

  // framework services
  var ngInvocationHandelerService,
    feedbackUIService,
  // app services
    myiHService,
    busService,
    location,
    scope,
    httpBackend;

  // Initialize the service
  beforeEach(inject(function ($rootScope, $httpBackend, $location, ngIHService, feedbackUI, myErrorHandlingService, eventService) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    location = $location;
    ngInvocationHandelerService = ngIHService;
    feedbackUIService = feedbackUI;
    myiHService = myErrorHandlingService;
    busService = eventService;
    // create spies
    spyOn(location, 'path');
    spyOn(ngInvocationHandelerService, 'funcError');
    spyOn(myiHService, 'resolve');
    spyOn(feedbackUIService, 'appendErrorMsg');
  }));

  it('should not attach any message without an error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(200, [{id: 1, value: 'sample1'}, {
      id: 1,
      value: 'sample1'
    }]);
    busService.list('1', function (events) {
      expect(events.length).toBe(2);
      expect(ngInvocationHandelerService.funcError).not.toHaveBeenCalled();
      expect(myiHService.resolve).not.toHaveBeenCalled();
      expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
      done();
    });
    httpBackend.flush();
  });

  it('should not redirect on error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500, {}, {}, 'should not redirect on error');
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(location.path).not.toHaveBeenCalled();
    expect(ngInvocationHandelerService.funcError).not.toHaveBeenCalled();
    expect(myiHService.resolve).not.toHaveBeenCalled();
    expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
    done();
  });

  it('should not attaching any message to the UI', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500, {}, {}, 'should not attaching any message to the UI');
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
    done();
  });

  it('should not use custom error handler', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500, {}, {}, 'should not use custom error handler');
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(myiHService.resolve).not.toHaveBeenCalled();
    done();
  });

  it('should handle errors on default', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500, {}, {}, 'should handle errors on default');
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(ngInvocationHandelerService.funcError).toHaveBeenCalled();
    done();

  });
});
