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

        describe('$reference', function() {
            var file;

            beforeEach(function() {
                file = new $kinvey.File();
            });

            it('should be $defined', function() {
                expect(file.$reference).toBeDefined();
            });

            it('should return undefined when no \'_id\' is present', function() {
                delete file._id;
                expect(file.$reference()).toBeUndefined();
            });

            it('should return a user reference when an \'_id\' is present', function() {
                file._id = 'badger';
                expect(file.$reference()._type).toBe('KinveyFile');
                expect(file.$reference()._collection).toBeUndefined();
                expect(file.$reference()._id).toBe('badger');
            });

        });

        describe('$save', function() {
            var fileObj;

            beforeEach(function () {
                fileObj = new $kinvey.File({
                    _filename: 'myFile.txt',
                    _uploadURL: 'http://google.com/upload/blob',
                    _requiredHeaders: {
                        'x-goog-acl': 'private'
                    }
                });
            });

            it('should be defined', function() {
                expect(fileObj.$save).toBeDefined();
            });

            describe('with no _id and no mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a POST request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    fileObj.$save();
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj.$save();
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with no _id and a mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a POST request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type':'text/plain'
                    });
                    fileObj.$save('text/plain');
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj.$save();
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with an _id and no mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a PUT request to \'../blob/appkey/fileId\'', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/blob/appkey/fileId', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    fileObj._id = 'fileId';
                    fileObj.$save();
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj._id = 'fileId';
                    fileObj.$save();
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with an _id and a mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a PUT request to \'../blob/appkey/fileId\'', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/blob/appkey/fileId', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type':'text/plain'
                    });
                    fileObj._id = 'fileId';
                    fileObj.$save('text/plain');
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj._id = 'fileId';
                    fileObj.$save('text/plain');
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('$promise', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should be defined', function() {
                    fileObj.$save();
                    expect(fileObj.$promise).toBeDefined();
                    $httpBackend.flush();
                });
            });

            describe('object nesting', function() {
                var file;

                beforeEach(function() {
                    $kinvey.alias('object', 'Obj');
                    file = new $kinvey.File({
                        user: new $kinvey.User({_id: 'userId'}),
                        deep: {
                            file: new $kinvey.File({_id: 'fileId'}),
                            deeper: {
                                object: new $kinvey.Obj({_id: 'objectId'}),
                                $reference: 'spurious'
                            }
                        },
                        number: 1,
                        string: 'here'
                    });
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should detect nested Objects, Users and Files and replace them with references', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', {
                        user: {
                            _type: 'KinveyRef',
                            _collection: 'user',
                            _id: 'userId'
                        },
                        deep: {
                            file: {
                                _type: 'KinveyFile',
                                _id: 'fileId'
                            },
                            deeper: {
                                object: {
                                    _type: 'KinveyRef',
                                    _collection: 'object',
                                    _id: 'objectId'
                                }
                            }
                        },
                        number: 1,
                        string: 'here'
                    }, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    file.$save();
                    $httpBackend.flush();
                });

            });

        });

        describe('save', function() {
            var fileObj;

            beforeEach(function () {
                fileObj = new $kinvey.File({
                    _filename: 'myFile.txt',
                    _uploadURL: 'http://google.com/upload/blob',
                    _requiredHeaders: {
                        'x-goog-acl': 'private'
                    }
                });
            });

            it('should be defined', function() {
                expect($kinvey.File.save).toBeDefined();
            });

            describe('with no _id and no mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a POST request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    $kinvey.File.save(fileObj);
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj.$save();
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with no _id and a mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/blob/appkey')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a POST request to \'../blob/appkey\'', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/blob/appkey', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type':'text/plain'
                    });
                    $kinvey.File.save(fileObj, 'text/plain');
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj.$save();
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with an _id and no mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a PUT request to \'../blob/appkey/fileId\'', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/blob/appkey/fileId', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8'
                    });
                    fileObj._id = 'fileId';
                    fileObj.$save();
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj._id = 'fileId';
                    $kinvey.File.save(fileObj);
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

            describe('with an _id and a mimeType', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'fileId',
                            _filename: 'myFile.txt',
                            _uploadURL: 'http://google.com/upload/blob',
                            _requiredHeaders: {
                                'x-goog-acl': 'private'
                            }
                        });
                });

                it('should make a PUT request to \'../blob/appkey/fileId\'', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/blob/appkey/fileId', fileObj, {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*',
                        'Content-Type':'application/json;charset=utf-8',
                        'X-Kinvey-Content-Type':'text/plain'
                    });
                    fileObj._id = 'fileId';
                    $kinvey.File.save(fileObj, 'text/plain');
                    $httpBackend.flush();
                });

                it('should resolve with a File resource', function() {
                    fileObj._id = 'fileId';
                    fileObj.$save('text/plain');
                    $httpBackend.flush();

                    expect(fileObj._id).toBe('fileId');
                    expect(fileObj._filename).toBe('myFile.txt');
                    expect(fileObj._uploadURL).toBe('http://google.com/upload/blob')
                    expect(fileObj.$resolved).toBeTruthy();
                });

            });

        });

        describe('$upload', function() {
            var fileObj;

            beforeEach(function () {
                $httpBackend
                    .when('PUT', 'http://google.com/upload/blob')
                    .respond({
                        ETag: 'gnrwogh24098hgiowbls'
                    });
                fileObj = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt',
                    _uploadURL: 'http://google.com/upload/blob',
                    _requiredHeaders: {
                        'x-goog-acl': 'private'
                    }
                });
            });

            it('should be defined', function() {
                expect(fileObj.$upload).toBeDefined();
            });

            it('should PUT the file to the _downloadURL', function() {
                $httpBackend.expectPUT('http://google.com/upload/blob', 'this is the file contents', {
                    'x-goog-acl': 'private',
                    'Content-Type': 'text/plain'
                });
                fileObj.$upload('this is the file contents', 'text/plain');
                $httpBackend.flush();
            });

            it('should resolve the response', function() {
                var result = fileObj.$upload('this is the file contents', 'text/plain');
                $httpBackend.flush();
                expect(result.ETag).toBe('gnrwogh24098hgiowbls');
                expect(result.$resolved).toBeTruthy();
            });

            it('should leave the file intact', function() {
                fileObj.$upload('this is the file contents', 'text/plain');
                $httpBackend.flush();

                expect(fileObj.ETag).toBeUndefined();
                expect(fileObj._id).toBe('fileId');
                expect(fileObj._filename).toBe('myFile.txt');
                expect(fileObj._uploadURL).toBe('http://google.com/upload/blob');
            });

        });

        describe('upload', function() {
            var fileObj;

            beforeEach(function () {
                $httpBackend
                    .when('PUT', 'http://google.com/upload/blob')
                    .respond({
                        ETag: 'gnrwogh24098hgiowbls'
                    });
                fileObj = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt',
                    _uploadURL: 'http://google.com/upload/blob',
                    _requiredHeaders: {
                        'x-goog-acl': 'private'
                    }
                });
            });

            it('should be defined', function() {
                expect($kinvey.File.upload).toBeDefined();
            });

            it('should PUT the file to the _downloadURL', function() {
                $httpBackend.expectPUT('http://google.com/upload/blob', 'this is the file contents', {
                    'x-goog-acl': 'private',
                    'Content-Type': 'text/plain'
                });
                $kinvey.File.upload(fileObj, 'this is the file contents', 'text/plain');
                $httpBackend.flush();
            });

            it('should resolve the response', function() {
                var result = $kinvey.File.upload(fileObj, 'this is the file contents', 'text/plain');
                $httpBackend.flush();
                expect(result.ETag).toBe('gnrwogh24098hgiowbls');
                expect(result.$resolved).toBeTruthy();
            });

            it('should leave the file intact', function() {
                $kinvey.File.upload(fileObj, 'this is the file contents', 'text/plain');
                $httpBackend.flush();

                expect(fileObj.ETag).toBeUndefined();
                expect(fileObj._id).toBe('fileId');
                expect(fileObj._filename).toBe('myFile.txt');
                expect(fileObj._uploadURL).toBe('http://google.com/upload/blob');
            });

        });

        describe('$download', function() {
            var fileObj;

            beforeEach(function () {
                $httpBackend
                    .when('GET', 'http://google.com/download/blob')
                    .respond('this is the file contents');
                fileObj = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt',
                    _downloadURL: 'http://google.com/download/blob'
                });
            });

            it('should be defined', function() {
                expect(fileObj.$download).toBeDefined();
            });

            it('should GET the file to the _downloadURL', function() {
                $httpBackend.expectGET('http://google.com/download/blob');
                fileObj.$download();
                $httpBackend.flush();
            });

            it('should resolve the response', function() {
                var result;
                var download = fileObj.$download();
                download.$promise.then(function(response) {
                    result = response;
                });
                $httpBackend.flush();
                expect(result).toBe('this is the file contents');
            });

            it('should leave the file intact', function() {
                fileObj.$download();
                $httpBackend.flush();

                expect(fileObj.ETag).toBeUndefined();
                expect(fileObj._id).toBe('fileId');
                expect(fileObj._filename).toBe('myFile.txt');
                expect(fileObj._downloadURL).toBe('http://google.com/download/blob');
            });

        });

        describe('download', function() {
            var fileObj;

            beforeEach(function () {
                $httpBackend
                    .when('GET', 'http://google.com/download/blob')
                    .respond('this is the file contents');
                fileObj = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt',
                    _downloadURL: 'http://google.com/download/blob'
                });
            });

            it('should be defined', function() {
                expect($kinvey.File.download).toBeDefined();
            });

            it('should GET the file to the _downloadURL', function() {
                $httpBackend.expectGET('http://google.com/download/blob');
                $kinvey.File.download(fileObj);
                $httpBackend.flush();
            });

            it('should resolve the response', function() {
                var result;
                var download = $kinvey.File.download(fileObj);
                download.$promise.then(function(response) {
                    result = response;
                });
                $httpBackend.flush();
                expect(result).toBe('this is the file contents');
            });

            it('should leave the file intact', function() {
                $kinvey.File.download(fileObj);
                $httpBackend.flush();

                expect(fileObj.ETag).toBeUndefined();
                expect(fileObj._id).toBe('fileId');
                expect(fileObj._filename).toBe('myFile.txt');
                expect(fileObj._downloadURL).toBe('http://google.com/download/blob');
            });

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
                _id : 'fileId',
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
                    .when('GET', 'https://baas.kinvey.com/blob/appkey/fileId')
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

            it('should be defined', function() {
                expect($kinvey.File.get).toBeDefined();
            });

            it('should make a GET request to ../blob/appkey/:id', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey/fileId', {
                    'Accept':'application/json, text/plain, */*',
                    'X-Kinvey-API-Version':3,
                    'Authorization':'Kinvey authtoken'
                });
                $kinvey.File.get({_id: 'fileId'});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var result = $kinvey.File.get({_id: 'fileId'});
                $httpBackend.flush();
                expect(result._id).toBe(expected._id);
            });

        });

        describe('query', function() {

            it('should be defined', function() {
                expect($kinvey.File.query).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/blob/appkey?query=%7B%22description%22:%22dolphin%22%7D')
                    .respond([{
                        _id: '_id',
                        description: 'giraffe',
                        anotherField: 'dolphin'
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

            it('should make an authorized GET request to ../blob/appkey?query={"description":"dolphin"}', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey?query=%7B%22description%22:%22dolphin%22%7D', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.File.query({query: {description:'dolphin'}});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.File.query({query: {description:'dolphin'}});
                $httpBackend.flush();
                expect(object[0].anotherField).toBe('dolphin');
            });

        });

        describe('query $ namespace', function() {

            it('should be defined', function() {
                expect($kinvey.File.query).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/blob/appkey?query=%7B%22age%22:%7B%22$gte%22:5%7D%7D')
                    .respond([{
                        _id: '_id',
                        description: 'giraffe',
                        anotherField: 'dolphin'
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

            it('should make an authorized GET request to ../blob/appkey?query={"amount":{"$gte",5}}', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey?query=%7B%22age%22:%7B%22$gte%22:5%7D%7D', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.File.query({query: {age:{$gte:5}}});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.File.query({query: {age:{$gte:5}}});
                $httpBackend.flush();
                expect(object[0].anotherField).toBe('dolphin');
            });

        });

        describe('delete', function() {

            it('should be defined', function() {
                expect($kinvey.File.delete).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('DELETE', 'https://baas.kinvey.com/blob/appkey/fileId')
                    .respond({
                        count: 1
                    });
            });

            it('should make a DELETE request to ../blob/appkey/fileId', function() {
                $httpBackend.expectDELETE('https://baas.kinvey.com/blob/appkey/fileId', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.File.delete({_id: 'fileId'});
                $httpBackend.flush();
            });

        });

        describe('$delete', function() {

            it('should be defined', function() {
                var file = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt'
                });
                expect(file.$delete).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('DELETE', 'https://baas.kinvey.com/blob/appkey/fileId')
                    .respond({
                        count: 1
                    });
            });

            it('should make a DELETE request to ../blob/appkey/fileId', function() {
                var file = new $kinvey.File({
                    _id: 'fileId',
                    _filename: 'myFile.txt'
                });
                $httpBackend.expectDELETE('https://baas.kinvey.com/blob/appkey/fileId', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                file.$delete();
                $httpBackend.flush();
            });

        });

    });

});