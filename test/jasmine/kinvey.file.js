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
                    'Content-Type': 'text/plain',
                    'Content-Length':25
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

        describe('download', function() {

            it('should be defined', function() {
                expect($kinvey.File.download).toBeDefined();
            });

            describe('with an ID and no ttl', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_downloadURL': 'http://google.com/download/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('GET', 'http://google.com/download/blob')
                        .respond('file contents');
                });

                it('should make a GET request to ../blob/appkey/fileId', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey/fileId', {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*'
                    });
                    $kinvey.File.download('fileId');
                    $httpBackend.flush();
                });

                it('should make a GET request to the _downloadURL', function() {
                    $httpBackend.expectGET('http://google.com/download/blob');
                    $kinvey.File.download('fileId');
                    $httpBackend.flush();
                });

                it('should resolve with the data from the _downloadURL', function() {
                    var result;
                    $kinvey.File.download('fileId').then(function(response) {
                        result = response;
                    });
                    $httpBackend.flush();
                    expect(result).toBe('file contents');
                });

            });

            describe('with an ID and a ttl', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/blob/appkey/fileId?ttl_in_seconds=3600')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_downloadURL': 'http://google.com/download/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('GET', 'http://google.com/download/blob')
                        .respond('file contents');
                });

                it('should make a GET request to ../blob/appkey/fileId?ttl_in_seconds=3600', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey/fileId?ttl_in_seconds=3600', {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*'
                    });
                    $kinvey.File.download('fileId', 3600);
                    $httpBackend.flush();
                });

                it('should make a GET request to the _downloadURL', function() {
                    $httpBackend.expectGET('http://google.com/download/blob');
                    $kinvey.File.download('fileId', 3600);
                    $httpBackend.flush();
                });

                it('should resolve with the data from the _downloadURL', function() {
                    var result;
                    $kinvey.File.download('fileId', 3600).then(function(response) {
                        result = response;
                    });
                    $httpBackend.flush();
                    expect(result).toBe('file contents');
                });

            });

            describe('with a resource and a ttl', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/blob/appkey/fileId?ttl_in_seconds=3600')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_downloadURL': 'http://google.com/download/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('GET', 'http://google.com/download/blob')
                        .respond('file contents');
                });

                it('should make a GET request to ../blob/appkey/fileId?ttl_in_seconds=3600', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey/fileId?ttl_in_seconds=3600', {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*'
                    });
                    $kinvey.File.download({_id: 'fileId'}, 3600);
                    $httpBackend.flush();
                });

                it('should make a GET request to the _downloadURL', function() {
                    $httpBackend.expectGET('http://google.com/download/blob');
                    $kinvey.File.download({_id: 'fileId'}, 3600);
                    $httpBackend.flush();
                });

                it('should resolve with the data from the _downloadURL', function() {
                    var result;
                    $kinvey.File.download({_id: 'fileId'}, 3600).then(function(response) {
                        result = response;
                    });
                    $httpBackend.flush();
                    expect(result).toBe('file contents');
                });

            });

            describe('with a resource and no ttl', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('GET', 'https://baas.kinvey.com/blob/appkey/fileId')
                        .respond({
                            _id: 'bndaogh4083tyu930',
                            _filename: 'gn80hy284hgj0bwfhi',
                            _acl: { },
                            'meta': 'some metadata',
                            '_uploadURL': 'http://google.com/upload/blob',
                            '_downloadURL': 'http://google.com/download/blob',
                            '_expiresAt': '2013-06-18T23:07:23.394Z',
                            '_requiredHeaders': {
                                'x-goog-acl': 'private'
                            }
                        });
                    $httpBackend
                        .when('GET', 'http://google.com/download/blob')
                        .respond('file contents');
                });

                it('should make a GET request to ../blob/appkey/fileId', function() {
                    $httpBackend.expectGET('https://baas.kinvey.com/blob/appkey/fileId', {
                        'X-Kinvey-API-Version':3,
                        'Authorization':'Kinvey authtoken',
                        'Accept':'application/json, text/plain, */*'
                    });
                    $kinvey.File.download({_id: 'fileId'});
                    $httpBackend.flush();
                });

                it('should make a GET request to the _downloadURL', function() {
                    $httpBackend.expectGET('http://google.com/download/blob');
                    $kinvey.File.download({_id: 'fileId'});
                    $httpBackend.flush();
                });

                it('should resolve with the data from the _downloadURL', function() {
                    var result;
                    $kinvey.File.download({_id: 'fileId'}).then(function(response) {
                        result = response;
                    });
                    $httpBackend.flush();
                    expect(result).toBe('file contents');
                });

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