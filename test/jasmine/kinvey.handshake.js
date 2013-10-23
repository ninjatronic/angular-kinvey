describe('$kinvey', function() {
    var $httpBackend;
    var $kinvey;

    beforeEach(function() {
        angular.module('test',[]).config(function($kinveyProvider) {
            $kinveyProvider.init({appKey: 'appkey', appSecret: 'appsecret'});
        });
        module('ngKinvey', 'test');
        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $kinvey = $injector.get('$kinvey');
        });
    });

    describe('handshake', function() {
        var expected = {'kinvey':'hello dave','version':'3.0.0'};

        beforeEach(function() {
            $httpBackend
                .when('GET', 'https://baas.kinvey.com/appdata/appkey')
                .respond(expected);
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should be defined', function() {
            expect($kinvey.handshake).toBeDefined();
        });

        it('should make a GET request to the handshake URL', function() {
            $httpBackend.expectGET('https://baas.kinvey.com/appdata/appkey',{
                "Accept":"application/json, text/plain, */*",
                "X-Kinvey-API-Version":3,
                "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA=="
            });
            $kinvey.handshake();
            $httpBackend.flush();
        });

        it('should resolve the data', function() {
            var response;
            $kinvey.handshake().then(function(result) {
                response = result;
            });
            $httpBackend.flush();
            expect(response).toBe(expected);
        });
    });
});