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

    describe('group', function() {
        it('should be defined', function() {
            expect($kinvey.Group).toBeDefined();
        });

        describe('get', function() {
            var user = {
                username: 'badger',
                _id: 'goat',
                _kmd: {
                    authtoken: 'authtoken'
                }
            };
            var expected = {
                _id: 'badger',
                users: {
                    all: 'true',
                    list: []
                },
                groups: []
            };

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/group/appkey/badger')
                    .respond(expected);
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                    .respond(user);
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
                expect($kinvey.Group.get).toBeDefined();
            });

            it('should make a GET request to ../group/appkey/:id', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/group/appkey/badger', {
                    'Accept':'application/json, text/plain, */*',
                    'X-Kinvey-API-Version':3,
                    'Authorization':'Kinvey authtoken'
                });
                $kinvey.Group.get({_id: 'badger'});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var result = $kinvey.Group.get({_id: 'badger'});
                $httpBackend.flush();
                expect(result._id).toBe(expected._id);
            });
        });

        describe('save', function() {
            var user = {
                username: 'badger',
                _id: 'goat',
                _kmd: {
                    authtoken: 'authtoken'
                }
            };
            var expected = {
                _id: 'badger',
                users: {
                    all: 'true',
                    list: []
                },
                groups: []
            };

            beforeEach(function() {
                $httpBackend
                    .when('PUT', 'https://baas.kinvey.com/group/appkey/badger')
                    .respond(expected);
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                    .respond(user);
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
                expect($kinvey.Group.save).toBeDefined();
            });

            it('should make a PUT request to ../group/appkey/:id', function() {
                $httpBackend.expectPUT('https://baas.kinvey.com/group/appkey/badger', expected, {
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8",
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken"
                });
                $kinvey.Group.save(expected);
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var result = $kinvey.Group.save(expected);
                $httpBackend.flush();
                expect(result._id).toBe(expected._id);
            });
        });


        describe('delete', function() {
            var user = {
                username: 'badger',
                _id: 'goat',
                _kmd: {
                    authtoken: 'authtoken'
                }
            };

            beforeEach(function() {
                $httpBackend
                    .when('DELETE', 'https://baas.kinvey.com/group/appkey/badger')
                    .respond(204);
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                    .respond(user);
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
                expect($kinvey.Group.delete).toBeDefined();
            });

            it('should make a DELETE request to ../group/appkey/:id', function() {
                $httpBackend.expectDELETE('https://baas.kinvey.com/group/appkey/badger', {
                    "Accept":"application/json, text/plain, */*",
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken"
                });
                $kinvey.Group.delete({_id: 'badger'});
                $httpBackend.flush();
            });
        });
    });
});