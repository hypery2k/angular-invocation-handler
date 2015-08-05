describe('Service: ErrorHandler', function () {
    'use strict';

    // load the controller's module
    beforeEach(module('appMock'));

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
        scope = $rootScope.$new();
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

    it('should not attach any message without an error', function (done) {
        httpBackend.expectGET('http://example.org/events/1').respond(200, [{id: 1, value: 'sample1'}, {id: 1, value: 'sample1'}]);
        busService.list('1', function (events) {
            expect(events.length).toBe(2);
            expect(iHService.funcError).not.toHaveBeenCalled();
            expect(myiHService.resolve).not.toHaveBeenCalled();
            expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
            done();
        }, function (err) {
            fail();
        });
        httpBackend.flush();
        scope.$apply();
    });

    it('should not redirect on error', function (done) {
        httpBackend.expectGET('http://example.org/events/1').respond(500);
        busService.list('1', function (events) {
            fail();
        }, function (err) {
            fail();
        });
        httpBackend.flush();
        scope.$apply();
        expect(location.path).not.toHaveBeenCalled();
        expect(iHService.funcError).not.toHaveBeenCalled();
        expect(myiHService.resolve).not.toHaveBeenCalled();
        expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
        done();
    });

    it('should not attaching any message with an error on default', function (done) {
        httpBackend.expectGET('http://example.org/events/1').respond(500);
        busService.list('1', function (events) {
            fail();
        }, function (err) {
            fail();
        });
        httpBackend.flush();
        scope.$apply();
        expect(iHService.funcError).not.toHaveBeenCalled();
        expect(myiHService.resolve).not.toHaveBeenCalled();
        expect(feedbackUIService.appendErrorMsg).not.toHaveBeenCalled();
        done();
    });
});
