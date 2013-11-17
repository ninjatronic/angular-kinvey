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

    describe('file', function() {

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
            expect($kinvey.File).toBeDefined();
        });

        describe('upload', function() {

            it('should be defined', function() {
                expect($kinvey.File.upload).toBeDefined();
            });

            describe('without a filename or fileId', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond({
                            ETag: 'gnrwogh24098hgiowbls'
                        });
                });

                it('should make a PUT request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', {
                        size: 35,
                        meta: 'this is metadata'
                    }, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type': 'text/plain'
                    });
                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents');
                    $httpBackend.flush();
                })

            });

            describe('with a filename', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'vbfmgp5w0h95w',
                            _filename: 'myFile.txt',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond({
                            ETag: 'gnrwogh24098hgiowbls'
                        });
                });

                it('should make a POST request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', {
                        size: 35,
                        meta: 'this is metadata',
                        _filename: 'myFile.txt'
                    }, {
                        'X-Kinvey-Content-Type':'text/plain',
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents', 'myFile.txt');
                    $httpBackend.flush();
                })

            });

            describe('with a fileId', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'fileId',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond({
                            ETag: 'gnrwogh24098hgiowbls'
                        });
                });

                it('should make a PUT request to \'../blob/appkey/fileId\'', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/blob/appkey/fileId', {
                        size: 35,
                        meta: 'this is metadata',
                        _id: 'fileId'
                    }, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type': 'text/plain'
                    });
                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata',
                        _id: 'fileId'
                    }, 'text/plain', 'this is the file contents');
                    $httpBackend.flush();
                })

            });

            describe('with an error from Kinvey', function() {
                var expected = {error: 'not understood'};

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond(400, expected);
                });

                it('should reject with the error', function() {
                    var response;
                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents')
                        .then(undefined, function(err) {
                            response = err;
                        });
                    $httpBackend.flush();
                    expect(response).toBe(expected);
                })

            });

            describe('PUT the file', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond({
                            ETag: 'gnrwogh24098hgiowbls'
                        });
                });

                it('should PUT the file to the supplied upload URL with the required headers', function() {

                    $httpBackend
                        .expectPUT('http://google.com/upload/blob', 'this is the file contents', {
                            'Content-Type': 'text/plain',
                            'Content-Length':25,
                            'x-goog-acl': 'private'
                        });

                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents');

                    $httpBackend.flush();
                });

            });

            describe('PUT error', function() {
                var expected = {error: 'not understood'};

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond(400, expected);
                });

                it('should reject with the error', function() {
                    var result;

                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents')
                        .then(undefined, function(err) {
                            result = err;
                        });

                    $httpBackend.flush();

                    expect(result).toBe(expected);
                });

            });

            describe('PUT success', function() {
                var expected = {
                    _id : 'bndaogh4083tyu930',
                    _filename : 'gn80hy284hgj0bwfhi',
                    _acl : {  },
                    meta : 'some metadata',
                    _uploadURL : 'http://google.com/upload/blob',
                    _expiresAt : '2013-06-18T23:07:23.394Z',
                    _requiredHeaders :
                    {
                        'x-goog-acl' : 'private'
                    }
                };

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('PUT', 'http://google.com/upload/blob')
                        .respond(expected);
                });

                it('should resolve with the $resource object', function() {
                    var result;

                    $kinvey.File.upload({
                        size: 35,
                        meta: 'this is metadata'
                    }, 'text/plain', 'this is the file contents').then(function(err) {
                            result = err;
                        });

                    $httpBackend.flush();

                    angular.forEach(expected, function(value, key) {
                        if(!(value instanceof Object)) {
                            expect(result[key]).toBe(value);
                        }
                    });
                });

            });

        });
    });
});