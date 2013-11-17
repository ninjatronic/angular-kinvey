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

    describe('rpc', function() {
        var expected = {'status':'OK'};

        beforeEach(function() {
            $httpBackend
                .when('POST', 'https://baas.kinvey.com/rpc/appkey/custom/test')
                .respond(expected);
            $httpBackend
                .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                .respond({
                    username: 'badger',
                    _id: 'goat',
                    _kmd: {
                        authtoken: 'authtoken'
                    }
                });
            $kinvey.User.login({
                'username':'badger',
                'password':'giraffe'
            });
            $httpBackend.flush();
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should be defined', function() {
            expect($kinvey.rpc).toBeDefined();
        });

        it('should make a POST request to the rpc URL', function() {
            $httpBackend.expectPOST('https://baas.kinvey.com/rpc/appkey/custom/test', {
                test: 'BADGER'
            }, {
                'X-Kinvey-API-Version':3,
                'Authorization':'Kinvey authtoken',
                'Accept':'application/json, text/plain, */*',
                'Content-Type':'application/json;charset=utf-8'
            });
            $kinvey.rpc('test', {test: 'BADGER'});
            $httpBackend.flush();
        });

        it('should resolve the data', function() {
            var response = $kinvey.rpc('test', {test: 'BADGER'});
            $httpBackend.flush();
            expect(response.status).toBe(expected.status);
            expect(response.$resolved).toBe(true);
        });
    });
});