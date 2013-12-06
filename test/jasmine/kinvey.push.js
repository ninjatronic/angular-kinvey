describe('$kinvey', function() {
    var $httpBackend;
    var $kinvey;

    beforeEach(function() {
        angular.module('test',[]).config(function($kinveyProvider) {
            $kinveyProvider.init({appKey: 'appkey', appSecret: 'appsecret'});
        });
        module('kinvey', 'test');
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $kinvey = $injector.get('$kinvey');
        });
    });

    describe('Push', function() {

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should be defined', function() {
            expect($kinvey.Push).toBeDefined();
        });

        describe('register', function() {

            beforeEach(function() {
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/push/appkey/register-device')
                    .respond(204);
            });

            it('should be defined', function() {
                expect($kinvey.Push.register).toBeDefined();
            });

            it('should make a POST request to ../push/appkey/register-device', function() {
                $httpBackend.expectPOST('https://baas.kinvey.com/push/appkey/register-device', {
                    platform:"ios",
                    deviceId:"deviceId"
                }, {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8"
                });
                $kinvey.Push.register({platform:'ios', deviceId:'deviceId'});
                $httpBackend.flush();
            });

        });

        describe('$register', function() {

            beforeEach(function() {
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/push/appkey/register-device')
                    .respond(204);
            });

            it('should be defined', function() {
                expect((new $kinvey.Push()).$register).toBeDefined();
            });

            it('should make a POST request to ../push/appkey/register-device', function() {
                $httpBackend.expectPOST('https://baas.kinvey.com/push/appkey/register-device', {
                    platform:"ios",
                    deviceId:"deviceId"
                }, {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8"
                });
                var push = new $kinvey.Push({platform:'ios', deviceId:'deviceId'});
                push.$register();
                $httpBackend.flush();
            });

        });

        describe('unregister', function() {

            beforeEach(function() {
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/push/appkey/unregister-device')
                    .respond(204);
            });

            it('should be defined', function() {
                expect($kinvey.Push.unregister).toBeDefined();
            });

            it('should make a POST request to ../push/appkey/unregister-device', function() {
                $httpBackend.expectPOST('https://baas.kinvey.com/push/appkey/unregister-device', {
                    platform:"ios",
                    deviceId:"deviceId"
                }, {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8"
                });
                $kinvey.Push.unregister({platform:'ios', deviceId:'deviceId'});
                $httpBackend.flush();
            });

        });

        describe('$unregister', function() {

            beforeEach(function() {
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/push/appkey/unregister-device')
                    .respond(204);
            });

            it('should be defined', function() {
                expect((new $kinvey.Push()).$unregister).toBeDefined();
            });

            it('should make a POST request to ../push/appkey/unregister-device', function() {
                $httpBackend.expectPOST('https://baas.kinvey.com/push/appkey/unregister-device', {
                    platform:"ios",
                    deviceId:"deviceId"
                }, {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8"
                });
                var push = new $kinvey.Push({platform:'ios', deviceId:'deviceId'});
                push.$unregister();
                $httpBackend.flush();
            });

        });

    });
});