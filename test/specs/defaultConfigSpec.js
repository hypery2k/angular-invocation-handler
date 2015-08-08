describe('angular-invocation-handler with default config:', function () {
  'use strict';

  // framework services
  var ngInvocationHandelerService,
    feedbackUIService,
  // app services
    busService,
    location,
    scope,
    httpBackend;

  // setup
  beforeEach(function () {
  
    module('appDefaultConfig');

    // Initialize the service
    inject(function ($rootScope, $httpBackend, $location, ngIHService, feedbackUI, eventService) {
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      location = $location;
      ngInvocationHandelerService = ngIHService;
      feedbackUIService = feedbackUI;
      busService = eventService;
    });

    // init spys
    spyOn(location, 'path').and.callThrough();
    spyOn(ngInvocationHandelerService, 'funcError').and.callThrough();
    spyOn(feedbackUIService, 'appendErrorMsg').and.callThrough();
  });

  it('should not attach any message without an error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(200, [{id: 1, value: 'sample1'}, {
      id: 1,
      value: 'sample1'
    }]);
    busService.list('1', function (events) {
      expect(events.length).toBe(2);
      expect(ngInvocationHandelerService.funcError).not.toHaveBeenCalled();
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
    expect(ngInvocationHandelerService.funcError).toHaveBeenCalled();
    expect(location.path).not.toHaveBeenCalled();
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
