describe('angular-invocation-handler with custom config:', function () {
  'use strict';

  var iHService,
    feedbackUIService,
    exceptionHandler,
  // app services
    errorHandler,
    busService,
    scope,
    httpBackend;
  // setup
  beforeEach(function () {

    module('appCustomConfig', function ($provide) {
      $provide.value('feedbackUI', jasmine.createSpyObj('feedbackUI', ['appendErrorMsg']));
    });

    inject(function ($rootScope, $httpBackend, $exceptionHandler, ngIHService, feedbackUI, myErrorHandlingService, eventService) {
      scope = $rootScope;
      httpBackend = $httpBackend;
      iHService = ngIHService;
      feedbackUIService = feedbackUI;
      errorHandler = myErrorHandlingService;
      busService = eventService;
      exceptionHandler = $exceptionHandler;
    });

    spyOn(errorHandler, 'resolve').and.callThrough();
  });

  it('should not attach any message without an error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(200, [{id: 1, value: 'sample1'}, {
      id: 1,
      value: 'sample1'
    }]);
    busService.list('1', function (events) {
      expect(events.length).toBe(2);
      expect(errorHandler.resolve).not.toHaveBeenCalled();
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
      expect(errorHandler.resolve).not.toHaveBeenCalled();
      expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
      done();
    });
    httpBackend.flush();
  });

  it('should use custom error handler on error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500);
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(errorHandler.resolve).toHaveBeenCalled();
    done();
  });

  it('should transfer data to custom error handler  on error', function (done) {
    httpBackend.expectGET('http://example.org/events/1').respond(500, {msg: 'test'});
    busService.list('1', function (events) {
      fail();
    });
    httpBackend.flush();
    expect(errorHandler.resolve).toHaveBeenCalled();
    expect(errorHandler.resolve.calls.mostRecent().args[0].error.data).toBeDefined();
    expect(errorHandler.resolve.calls.mostRecent().args[0].error.data.msg).toBe('test');
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
});
