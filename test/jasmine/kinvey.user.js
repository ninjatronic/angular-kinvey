describe('$kinvey', function() {
    var $httpBackend;
    var $kinvey;

    describe('with no storage option', function() {

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

        describe('user', function() {

            it('should be defined', function() {
                expect($kinvey.User).toBeDefined();
            });

            describe('login', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should be defined', function() {
                    expect($kinvey.User.login).toBeDefined();
                });

                it('should make a POST request to ../login', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/user/appkey/login', {
                        'username':'badger',
                        'password':'giraffe'
                    }, {
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Basic YXBwa2V5OmFwcHNlY3JldA=='
                    });
                    $kinvey.User.login({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    var result = $kinvey.User.login({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                    expect(result._id).toBe('goat');
                });

            });

            describe('current', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/user/appkey/_me')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
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
                    expect($kinvey.User.current).toBeDefined();
                });

                it('should make a GET request to ../_me', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/user/appkey/_me', {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'});
                    $kinvey.User.current();
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    var result = $kinvey.User.current();
                    $httpBackend.flush();
                    expect(result._id).toBe('goat');
                });

            });

            describe('logout', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/_logout')
                        .respond(204);
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
                    expect($kinvey.User.logout).toBeDefined();
                });

                it('should make a POST request to ../_logout', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/user/appkey/_logout', undefined,  {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    $kinvey.User.logout();
                    $httpBackend.flush();
                });

            });

            describe('signup', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should be defined', function() {
                    expect($kinvey.User.signup).toBeDefined();
                });

                it('should make a POST request to ../', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/user/appkey', {
                        'username':'badger',
                        'password':'giraffe'
                    }, {
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Basic YXBwa2V5OmFwcHNlY3JldA=='
                    });
                    $kinvey.User.signup({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    var result = $kinvey.User.signup({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                    expect(result._id).toBe('goat');
                });

            });

            describe('get', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/user/appkey/userId')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
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
                    expect($kinvey.User.get).toBeDefined();
                });

                it('should make a GET request to ../:id', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/user/appkey/userId', {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    $kinvey.User.get({_id: 'userId'});
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    var result = $kinvey.User.get({_id: 'userId'});
                    $httpBackend.flush();
                    expect(result._id).toBe('goat');
                });

            });

            describe('lookup', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/_lookup')
                        .respond([{
                            username: 'badger',
                            _id: 'goat'
                        }]);
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
                    expect($kinvey.User.lookup).toBeDefined();
                });

                it('should make a POST request to ../_lookup', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/user/appkey/_lookup', {
                        username: 'badger'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Kinvey authtoken",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    $kinvey.User.lookup({username: 'badger'});
                    $httpBackend.flush();
                });

                it('should return an appropriate resource array', function() {
                    var result = $kinvey.User.lookup({username: 'badger'});
                    $httpBackend.flush();
                    expect(result[0].username).toBe('badger');
                });

            });

            describe('delete', function() {

                var expected = {
                    username: 'badger',
                    _id: 'goat',
                    _kmd: {
                        authtoken: 'authtoken'
                    }
                };

                beforeEach(function() {
                    $httpBackend
                        .when('DELETE', 'https://baas.kinvey.com/user/appkey/userId?hard=true')
                        .respond(204);
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond(expected);
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
                    expect($kinvey.User.delete).toBeDefined();
                });

                it('should make a DELETE request to ../:id?hard=true', function() {
                    $httpBackend.expectDELETE('https://baas.kinvey.com/user/appkey/userId?hard=true', {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    $kinvey.User.delete({_id: 'userId'});
                    $httpBackend.flush();
                });

            });

            describe('suspend', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('DELETE', 'https://baas.kinvey.com/user/appkey/userId')
                        .respond(204);
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
                    expect($kinvey.User.suspend).toBeDefined();
                });

                it('should make a DELETE request to ../:id', function() {
                    $httpBackend.expectDELETE('https://baas.kinvey.com/user/appkey/userId', {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    $kinvey.User.suspend({_id: 'userId'});
                    $httpBackend.flush();
                });

            });

            describe('save', function() {

                var user;

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/user/appkey/userId')
                        .respond({
                            username: 'badger',
                            firstName: 'giraffe',
                            _id: 'userId',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'badger',
                            _id: 'userId',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                    user = $kinvey.User.login({
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
                    expect(user.$save).toBeDefined();
                });

                it('should make a PUT request to ../id', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/user/appkey/userId', {
                        username: 'badger',
                        _id: 'userId',
                        _kmd: {
                            authtoken: 'authtoken'
                        }
                    },  {
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    user.$save();
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    user.firstName = 'giraffe';
                    user.$save();
                    $httpBackend.flush();
                    expect(user.firstName).toBe('giraffe');
                });

            });

            describe('query', function() {

                var loggedIn = {
                    username: 'badger',
                    _id: 'userId',
                    _kmd: {
                        authtoken: 'authtoken'
                    }
                };
                var expected = [{
                    username: 'badger',
                    _id: 'badgerId'
                },{
                    username: 'goat',
                    _id: 'goarId'
                }];

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/user/appkey')
                        .respond(expected);
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond(loggedIn);
                    user = $kinvey.User.login({
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
                    expect($kinvey.User.query).toBeDefined();
                });

                it('should make a GET request to ../', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/user/appkey', {
                        'Accept':'application/json, text/plain, */*',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken'
                    });
                    $kinvey.User.query();
                    $httpBackend.flush();
                });

                it('should return appropriate resource objects', function() {
                    var result = $kinvey.User.query();
                    $httpBackend.flush();
                    expect(result.length).toBe(2);
                    expect(result[0]._id).toBe(expected[0]._id);
                    expect(result[1]._id).toBe(expected[1]._id);
                });

            });

            describe('verifyEmail', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/rpc/appkey/username/user-email-verification-initiate?')
                        .respond(204);
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/rpc/appkey/email/user-email-verification-initiate?')
                        .respond(204);
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'username',
                            _id: 'userId',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                    $kinvey.User.login({
                        username:'username',
                        password:'password'
                    });
                    $httpBackend.flush();
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should be defined', function() {
                    expect($kinvey.User.verifyEmail).toBeDefined();
                });

                it('should make a POST request to /rpc/appkey/username/user-email-verification-initiate', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/rpc/appkey/username/user-email-verification-initiate?', undefined, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    $kinvey.User.verifyEmail({username: 'username'});
                    $httpBackend.flush();
                });

                it('should make a POST request to /rpc/appkey/email/user-email-verification-initiate', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/rpc/appkey/email/user-email-verification-initiate?', undefined, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    $kinvey.User.verifyEmail({email: 'email'});
                    $httpBackend.flush();
                });

            });

            describe('resetPassword', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/rpc/appkey/username/user-password-reset-initiate?')
                        .respond(204);
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'username',
                            _id: 'userId',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                    $kinvey.User.login({
                        username:'username',
                        password:'password'
                    });
                    $httpBackend.flush();
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should be defined', function() {
                    expect($kinvey.User.resetPassword).toBeDefined();
                });

                it('should make a POST request to /rpc/appkey/username/user-password-reset-initiate', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/rpc/appkey/username/user-password-reset-initiate?', undefined, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    $kinvey.User.resetPassword({username: 'username'});
                    $httpBackend.flush();
                });

            });

            describe('checkUsernameExists', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/rpc/appkey/check-username-exists?')
                        .respond({
                            usernameExists: false
                        });
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'username',
                            _id: 'userId',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                    $kinvey.User.login({
                        username:'username',
                        password:'password'
                    });
                    $httpBackend.flush();
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should be defined', function() {
                    expect($kinvey.User.checkUsernameExists).toBeDefined();
                });

                it('should make a POST request to /rpc/appkey/check-username-exists', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/rpc/appkey/check-username-exists?', {
                        username: 'username'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Basic YXBwa2V5OmFwcHNlY3JldA==",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    $kinvey.User.checkUsernameExists({username: 'username'});
                    $httpBackend.flush();
                });

                it('should resolve the response appropriately', function() {
                    var response = $kinvey.User.checkUsernameExists('username');
                    $httpBackend.flush();
                    expect(response.usernameExists).toBe(false);
                });

            });
        });

    });

    describe('with storage option', function() {

        var $cookieStore;

        beforeEach(function() {
            angular.module('test',['ngCookies']).config(function($kinveyProvider) {
                $kinveyProvider.init({appKey: 'appkey', appSecret: 'appsecret', storage: 'cookies'});
            });
            module('kinvey', 'test');
            inject(function($injector) {
                $httpBackend = $injector.get('$httpBackend');
                $cookieStore = $injector.get('$cookieStore');
                $kinvey = $injector.get('$kinvey');
            });
        });

        describe('user', function() {
            describe('login', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/login')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should put the authkey into the $cookieStore', function() {
                    spyOn($cookieStore, 'put');
                    $kinvey.User.login({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                    expect($cookieStore.put).toHaveBeenCalledWith('appkey:authToken', 'Kinvey authtoken');
                });

            });

            describe('signup', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey')
                        .respond({
                            username: 'badger',
                            _id: 'goat',
                            _kmd: {
                                authtoken: 'authtoken'
                            }
                        });
                });

                afterEach(function() {
                    $httpBackend.verifyNoOutstandingExpectation();
                    $httpBackend.verifyNoOutstandingRequest();
                });

                it('should put the authkey into the $cookieStore', function() {
                    spyOn($cookieStore, 'put');
                    $kinvey.User.signup({
                        'username':'badger',
                        'password':'giraffe'
                    });
                    $httpBackend.flush();
                    expect($cookieStore.put).toHaveBeenCalledWith('appkey:authToken', 'Kinvey authtoken');
                });

            });

            describe('logout', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/user/appkey/_logout')
                        .respond(204);
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

                it('should delete the authkey from the $cookieStore', function() {
                    spyOn($cookieStore, 'remove');
                    $kinvey.User.logout();
                    $httpBackend.flush();
                    expect($cookieStore.remove).toHaveBeenCalledWith('appkey:authToken');
                });

            });

        });

    });
});