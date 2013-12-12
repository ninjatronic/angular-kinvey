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

    describe('object', function() {

        it('should be defined', function() {
            expect($kinvey.Object).toBeDefined();
        });

        describe('$reference', function() {
            var object;

            beforeEach(function() {
                $kinvey.alias('classname', 'Classdef');
                object = new $kinvey.Classdef();
            });

            it('should be $defined', function() {
                expect(object.$reference).toBeDefined();
            });

            it('should return undefined when no \'_id\' is present', function() {
                delete object._id;
                expect(object.$reference()).toBeUndefined();
            });

            it('should return a user reference when an \'_id\' is present', function() {
                object._id = 'badger';
                expect(object.$reference()._type).toBe('KinveyRef');
                expect(object.$reference()._collection).toBe('classname');
                expect(object.$reference()._id).toBe('badger');
            });

        });

        describe('save', function() {
            var object;

            beforeEach(function() {
                $kinvey.alias('classname', 'Badger');
                object = new $kinvey.Badger();
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

            describe('without an _id', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/appdata/appkey/classname')
                        .respond({
                            _id: 'newId',
                            description: 'giraffe'
                        });
                });

                it('should make an authorized POST request to ../appdata/appkey/classname', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/appdata/appkey/classname', {
                        description: 'giraffe'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Kinvey authtoken",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    object.description = 'giraffe';
                    $kinvey.Badger.save(object);
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    object.description = 'giraffe';
                    $kinvey.Badger.save(object);
                    $httpBackend.flush();
                    expect(object.description).toBe('giraffe');
                });

            });

            describe('with an _id', function() {

                beforeEach(function() {
                    object._id = 'newId';
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/appdata/appkey/classname/newId')
                        .respond({
                            _id: 'newId',
                            description: 'giraffe'
                        });
                });

                it('should make an authorized PUT request to ../appdata/appkey/classname/newId', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/appdata/appkey/classname/newId', {
                        _id: 'newId',
                        description: 'giraffe'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Kinvey authtoken",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    object.description = 'giraffe';
                    $kinvey.Badger.save(object);
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    $kinvey.Badger.save(object);
                    $httpBackend.flush();
                });

            });

            describe('object nesting', function() {
                var object;

                beforeEach(function() {
                    $kinvey.alias('object', 'Obj');
                    object = new $kinvey.Badger({
                        user: new $kinvey.User({_id: 'userId'}),
                        deep: {
                            file: new $kinvey.File({_id: 'fileId'}),
                            deeper: {
                                object: new $kinvey.Obj({_id: 'objectId'}),
                                array: [new $kinvey.Obj({_id: 'arrayId'})],
                                $reference: 'spurious'
                            }
                        },
                        number: 1,
                        string: 'here'
                    });
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/appdata/appkey/classname')
                        .respond(204);
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/appdata/appkey/classname/mainId')
                        .respond(204);
                });

                describe('with no _id', function() {
                    it('should detect nested Objects, Users and Files and replace them with references', function() {
                        $httpBackend.expectPOST('https://baas.kinvey.com/appdata/appkey/classname', {
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
                                    },
                                    array: [{
                                        _type: 'KinveyRef',
                                        _collection: 'object',
                                        _id: 'arrayId'
                                    }]
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
                        $kinvey.Badger.save(object);
                        $httpBackend.flush();
                    });
                });

                describe('with an _id', function() {
                    it('should detect nested Objects, Users and Files and replace them with references', function() {
                        object._id = 'mainId';
                        $httpBackend.expectPUT('https://baas.kinvey.com/appdata/appkey/classname/mainId', {
                            _id: 'mainId',
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
                                    },
                                    array: [{
                                        _type: 'KinveyRef',
                                        _collection: 'object',
                                        _id: 'arrayId'
                                    }]
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
                        $kinvey.Badger.save(object);
                        $httpBackend.flush();
                    });
                });

            });

        });

        describe('$save', function() {
            var object;

            beforeEach(function() {
                $kinvey.alias('classname', 'Badger');
                object = new $kinvey.Badger();
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

            describe('without an _id', function() {

                beforeEach(function() {
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/appdata/appkey/classname')
                        .respond({
                            _id: 'newId',
                            description: 'giraffe'
                        });
                });

                it('should make an authorized POST request to ../appdata/appkey/classname', function() {
                    $httpBackend.expectPOST('https://baas.kinvey.com/appdata/appkey/classname', {
                        description: 'giraffe'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Kinvey authtoken",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    object.description = 'giraffe';
                    object.$save();
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    object.description = 'giraffe';
                    object.$save();
                    $httpBackend.flush();
                    expect(object._id).toBe('newId');
                    expect(object.description).toBe('giraffe');
                });

            });

            describe('with an _id', function() {

                beforeEach(function() {
                    object._id = 'newId';
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/appdata/appkey/classname/newId')
                        .respond({
                            _id: 'newId',
                            description: 'giraffe'
                        });
                });

                it('should make an authorized PUT request to ../appdata/appkey/classname/newId', function() {
                    $httpBackend.expectPUT('https://baas.kinvey.com/appdata/appkey/classname/newId', {
                        _id: 'newId',
                        description: 'giraffe'
                    }, {
                        "X-Kinvey-API-Version":3,
                        "Authorization":"Kinvey authtoken",
                        "Accept":"application/json, text/plain, */*",
                        "Content-Type":"application/json;charset=utf-8"
                    });
                    object.description = 'giraffe';
                    object.$save();
                    $httpBackend.flush();
                });

                it('should return an appropriate resource object', function() {
                    object.$save();
                    $httpBackend.flush();
                });

            });

            describe('object nesting', function() {
                var object;

                beforeEach(function() {
                    $kinvey.alias('object', 'Obj');
                    object = new $kinvey.Badger({
                        user: new $kinvey.User({_id: 'userId'}),
                        deep: {
                            file: new $kinvey.File({_id: 'fileId'}),
                            deeper: {
                                object: new $kinvey.Obj({_id: 'objectId'}),
                                array: [new $kinvey.Obj({_id: 'arrayId'})],
                                $reference: 'spurious'
                            }
                        },
                        number: 1,
                        string: 'here'
                    });
                    $httpBackend
                        .when('POST', 'https://baas.kinvey.com/appdata/appkey/classname')
                        .respond(204);
                    $httpBackend
                        .when('PUT', 'https://baas.kinvey.com/appdata/appkey/classname/mainId')
                        .respond(204);
                });

                describe('with no _id', function() {
                    it('should detect nested Objects, Users and Files and replace them with references', function() {
                        $httpBackend.expectPOST('https://baas.kinvey.com/appdata/appkey/classname', {
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
                                    },
                                    array: [{
                                        _type: 'KinveyRef',
                                        _collection: 'object',
                                        _id: 'arrayId'
                                    }]
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
                        object.$save();
                        $httpBackend.flush();
                    });
                });

                describe('with an _id', function() {
                    it('should detect nested Objects, Users and Files and replace them with references', function() {
                        object._id = 'mainId';
                        $httpBackend.expectPUT('https://baas.kinvey.com/appdata/appkey/classname/mainId', {
                            _id: 'mainId',
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
                                    },
                                    array: [{
                                        _type: 'KinveyRef',
                                        _collection: 'object',
                                        _id: 'arrayId'
                                    }]
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
                        object.$save();
                        $httpBackend.flush();
                    });
                });

            });

        });

        describe('get', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').get).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/appdata/appkey/classname/_id')
                    .respond({
                        _id: '_id',
                        description: 'giraffe',
                        anotherField: 'dolphin'
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

            it('should make an authorized GET request to ../appdata/appkey/classname/_id', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/appdata/appkey/classname/_id', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.Object('classname').get({_id: '_id'});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.Object('classname').get({_id: '_id'});
                $httpBackend.flush();
                expect(object.anotherField).toBe('dolphin');
            });

        });

        describe('count', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').count).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/appdata/appkey/classname/_count')
                    .respond({
                        count: 5
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

            it('should make an authorized GET request to ../appdata/appkey/classname/_count', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/appdata/appkey/classname/_count', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.Object('classname').count();
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.Object('classname').count();
                $httpBackend.flush();
                expect(object.count).toBe(5);
            });

        });

        describe('delete', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').delete).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('DELETE', 'https://baas.kinvey.com/appdata/appkey/classname/_id')
                    .respond({
                        count: 1
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

            it('should make an authorized DELETE request to ../appdata/appkey/classname/_id', function() {
                $httpBackend.expectDELETE('https://baas.kinvey.com/appdata/appkey/classname/_id', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.Object('classname').delete({_id: '_id'});
                $httpBackend.flush();
            });

            it('should return an appropriate count', function() {
                var object = $kinvey.Object('classname').delete({_id: '_id'});
                $httpBackend.flush();
                expect(object.count).toBe(1);
            });

        });

        describe('query', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').query).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/appdata/appkey/classname?query=%7B%22description%22:%22dolphin%22%7D')
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

            afterEach(function() {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('should make an authorized GET request to ../appdata/appkey/classname?query={"description":"dolphin"}', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/appdata/appkey/classname?query=%7B%22description%22:%22dolphin%22%7D', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.Object('classname').query({query: {description:'dolphin'}});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.Object('classname').query({query: {description:'dolphin'}});
                $httpBackend.flush();
                expect(object[0].anotherField).toBe('dolphin');
            });

        });

        describe('query $ namespace', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').query).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('GET', 'https://baas.kinvey.com/appdata/appkey/classname?query=%7B%22age%22:%7B%22$gte%22:5%7D%7D')
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

            afterEach(function() {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it('should make an authorized GET request to ../appdata/appkey/classname?query={"amount":{"$gte",5}}', function() {
                $httpBackend.expectGET('https://baas.kinvey.com/appdata/appkey/classname?query=%7B%22age%22:%7B%22$gte%22:5%7D%7D', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*"
                });
                $kinvey.Object('classname').query({query: {age:{$gte:5}}});
                $httpBackend.flush();
            });

            it('should return an appropriate resource object', function() {
                var object = $kinvey.Object('classname').query({query: {age:{$gte:5}}});
                $httpBackend.flush();
                expect(object[0].anotherField).toBe('dolphin');
            });

        });

        describe('group', function() {

            it('should be defined', function() {
                expect($kinvey.Object('classname').group).toBeDefined();
            });

            beforeEach(function() {
                $httpBackend
                    .when('POST', 'https://baas.kinvey.com/appdata/appkey/classname/_group')
                    .respond([{
                        _id: '_id',
                        description: 'giraffe',
                        count: 1
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

            it('should make an authorized POST request to ../appdata/appkey/classname/_group', function() {
                $httpBackend.expectPOST('https://baas.kinvey.com/appdata/appkey/classname/_group',
                    '{"key":{"description":true},"initial":{"count":0},"reduce":"function(doc,out){out.count++;}","condition":{"age":{"$gt":31}}}', {
                    "X-Kinvey-API-Version":3,
                    "Authorization":"Kinvey authtoken",
                    "Accept":"application/json, text/plain, */*",
                    "Content-Type":"application/json;charset=utf-8"
                });
                $kinvey.Object('classname').group({
                    key: {
                        description: true
                    },
                    initial: {
                        count: 0
                    },
                    reduce: function(doc,out){
                        out.count++;
                    },
                    condition: {
                        age: {
                            $gt: 31
                        }
                    }
                });
                $httpBackend.flush();
            });
        });
    });
});