describe('$kinvey', function() {

    var $kinvey;

    it('should bootstrap the module', function() {
        var $injector;
        var $module = angular.module('test', ['ngKinvey']);

        $module.config(['$kinveyProvider', function($kinveyProvider) {
            $kinveyProvider.init({
                appKey: 'kid_Te9NXxF0J9',
                appSecret: '67fa51ea36674af996f2392bd14ddb55'
            });
        }]);
        $module.run(['$injector', function(_$injector_) {
            $injector = _$injector_;
        }]);

        angular.bootstrap(document.getElementsByTagName('html')[0], ['test']);

        $kinvey = $injector.get('$kinvey');
    });

    describe('$kinvey.handshake', function() {

        it('should resolve the handshake without error', function() {
            var result;
            runs(function() {
                $kinvey
                    .handshake()
                    .then(function(response) {
                        result = response;
                    });
            });
            waitsFor(function() {
                return result;
            });
            runs(function() {
                expect(result.version).toBe('3.2.0');
                expect(result.kinvey).toBe('hello angular-kinvey');
            });
        });

    });

    describe('$kinvey.user', function() {

        it('should check that the username is available', function() {
            var result;
            runs(function() {
                $kinvey.User.checkUsernameExists('badger').then(function(response) {
                    result = response;
                });
            });
            waitsFor(function() {
                return result != undefined;
            });
            runs(function() {
                expect(result).toBe(false);
            });
        });

        it('should signup a user \'badger\'', function() {
            var user;
            runs(function() {
                user = $kinvey.User.signup({
                    username: 'badger',
                    password: 'goat',
                    firstName: 'giraffe',
                    lastName: 'hippo'
                })
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeDefined();
                expect(user.username).toBe('badger');
                expect(user.firstName).toBe('giraffe');
                expect(user.lastName).toBe('hippo');
            });
        });

        it('should check that the username is now unavailable', function() {
            var result;
            runs(function() {
                $kinvey.User.checkUsernameExists('badger').then(function(response) {
                    result = response;
                });
            });
            waitsFor(function() {
                return result != undefined;
            });
            runs(function() {
                expect(result).toBe(true);
            });
        });

        it('should verify the current user', function() {
            var user;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeDefined();
                expect(user.username).toBe('badger');
                expect(user.firstName).toBe('giraffe');
                expect(user.lastName).toBe('hippo');
            });
        });

        it('should get the current user by _id', function() {
            var user;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                user = $kinvey.User.get({_id: user._id});
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeDefined();
                expect(user.username).toBe('badger');
                expect(user.firstName).toBe('giraffe');
                expect(user.lastName).toBe('hippo');
            });
        });

        it('should logout the current user', function() {
            var response;
            var user;
            runs(function() {
                response = $kinvey.User.logout();
            });
            waitsFor(function() {
                return response.$resolved;
            });
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeUndefined();
            });
        });

        it('should login again', function() {
            var user;
            runs(function() {
                user = $kinvey.User.login({
                    username: 'badger',
                    password: 'goat'
                })
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeDefined();
                expect(user.username).toBe('badger');
                expect(user.firstName).toBe('giraffe');
                expect(user.lastName).toBe('hippo');
            });
        });

        it('should update the current user', function() {
            var user;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                user = new $kinvey.User({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    middleName: 'warthog'
                });
                user.$save();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeDefined();
                expect(user.username).toBe('badger');
                expect(user.firstName).toBe('giraffe');
                expect(user.lastName).toBe('hippo');
                expect(user.middleName).toBe('warthog');
            });
        });

        it('should initiate email verification', function() {
            var user;
            var result;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                $kinvey.User.verifyEmail(user.username).then(function(data) {
                    result = data.status;
                });
            });
            waitsFor(function() {
                return result;
            });
            runs(function() {
                expect(result).toBe(204);
            });
        });

        it('should initiate password reset', function() {
            var user;
            var result;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                $kinvey.User.resetPassword(user.username).then(function(data) {
                    result = data.status;
                });
            });
            waitsFor(function() {
                return result;
            });
            runs(function() {
                expect(result).toBe(204);
            });
        });

        it('should delete the current user \'badger\'', function() {
            var response;
            var user;
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                response = $kinvey.User.delete({_id: user._id});
            })
            waitsFor(function() {
                return response.$resolved;
            });
            runs(function() {
                user = $kinvey.User.current();
            });
            waitsFor(function() {
                return user.$resolved;
            });
            runs(function() {
                expect(user._id).toBeUndefined();
            });
        });

    });

    describe('$kinvey.Group', function() {

        var _id = 'testGroup';
        var user;

        it('should signup the temporary user', function() {
            runs(function() {
                user = $kinvey
                    .User
                    .signup({
                        username: 'groupTestUsername',
                        password: 'testPassword',
                        firstName: 'Test',
                        lastName: 'User'
                    });
            });
            waitsFor(function() {
                return user.$resolved;
            });
        });

        it('should create the group', function() {
            var group;
            runs(function() {
                group = new $kinvey.Group({
                    _id: _id,
                    users: {
                        all: 'true',
                        list: [{
                            _type: 'KinveyRef',
                            _collection: 'user',
                            _id: user._id
                        }]
                    },
                    groups: []
                });
                group.$save();
            });
            waitsFor(function() {
                return group.$resolved;
            });
            runs(function() {
                expect(group._id).toBe(_id);
                expect(group.users.list.length).toBe(1);
                expect(group.users.list[0]._id).toBe(user._id);
                expect(group.users.list[0]._type).toBe('KinveyRef');
                expect(group.users.list[0]._collection).toBe('user');
            });
        });

        it('should fetch the group', function() {
            var group;
            runs(function() {
                group = $kinvey.Group.get({_id: _id});
            });
            waitsFor(function() {
                return group.$resolved;
            });
            runs(function() {
                expect(group._id).toBe(_id);
            });
        });

        it('should delete the group', function() {
            var group;
            runs(function() {
                group = $kinvey.Group.get({_id: _id});
            });
            waitsFor(function() {
                return group.$resolved;
            });
            runs(function() {
                group.$delete();
            });
            waitsFor(function() {
                return group.count;
            });
            runs(function() {
                expect(group.count).toBe(1);
            });
        });

        it('should not be able to fetch the group', function() {
            var group;
            runs(function() {
                group = $kinvey.Group.get({_id: _id});
            });
            waitsFor(function() {
                return group.$resolved;
            });
            runs(function() {
                expect(group._id).toBeUndefined();
            });
        });

        it('should delete the temporary user', function() {
            var response;
            runs(function() {
                response = $kinvey.User.delete({_id: user._id});
            });
            waitsFor(function() {
                return response.$resolved;
            });
        });

    });

    describe('$kinvey.Object(\'classname\')', function() {

        describe('simple CRUD', function() {

            var object;
            var user;

            it('should signup the temporary user', function() {
                runs(function() {
                    user = $kinvey
                        .User
                        .signup({
                            username: 'groupTestUsername',
                            password: 'testPassword',
                            firstName: 'Test',
                            lastName: 'User'
                        });
                });
                waitsFor(function() {
                    return user.$resolved;
                });
            });

            it('should create a test object', function() {
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'giraffe'});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('giraffe');
                });
            });

            it('should fetch the test object', function() {
                runs(function() {
                    object = $kinvey.Object('classname').get({_id: object._id});
                })
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('giraffe');
                });
            });

            it('should delete the test object', function() {
                runs(function() {
                    object = $kinvey.Object('classname').delete({_id: object._id});
                })
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object.count).toBe(1);
                });
            });

            it('should delete the temporary user', function() {
                var response;
                runs(function() {
                    response = $kinvey.User.delete({_id: user._id});
                });
                waitsFor(function() {
                    return response.$resolved;
                });
            });

        });

        describe('multiple CRUD', function() {

            var user;

            it('should signup the temporary user', function() {
                runs(function() {
                    user = $kinvey
                        .User
                        .signup({
                            username: 'groupTestUsername',
                            password: 'testPassword',
                            firstName: 'Test',
                            lastName: 'User'
                        });
                });
                waitsFor(function() {
                    return user.$resolved;
                });
            });

            it('should create some test objects', function() {
                var object;
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'giraffe'});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('giraffe');
                });
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'dolphin'});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('dolphin');
                });
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'marmot'});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('marmot');
                });
            });

            it('should query the test objects', function() {
                var results;
                runs(function() {
                    results = $kinvey.Object('classname').query({query: {description:'dolphin'}});
                })
                waitsFor(function() {
                    return results.$resolved;
                });
                runs(function() {
                    expect(results.length).toBe(1);
                });
            });

            it('should delete the test objects', function() {
                var results;
                runs(function() {
                    results = $kinvey.Object('classname').delete({query: {}});
                })
                waitsFor(function() {
                    return results.$resolved;
                });
                runs(function() {
                    expect(results.count).toBe(3);
                });
            });

            it('should requery the test objects', function() {
                var results;
                runs(function() {
                    results = $kinvey.Object('classname').query({query: {}});
                })
                waitsFor(function() {
                    return results.$resolved;
                });
                runs(function() {
                    expect(results.length).toBe(0);
                });
            });

            it('should delete the temporary user', function() {
                var response;
                runs(function() {
                    response = $kinvey.User.delete({_id: user._id});
                });
                waitsFor(function() {
                    return response.$resolved;
                });
            });

        });

        describe('complex queries', function() {

            var user;

            it('should signup the temporary user', function() {
                runs(function() {
                    user = $kinvey
                        .User
                        .signup({
                            username: 'groupTestUsername',
                            password: 'testPassword',
                            firstName: 'Test',
                            lastName: 'User'
                        });
                });
                waitsFor(function() {
                    return user.$resolved;
                });
            });

            it('should create some test objects', function() {
                var object;
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'giraffe', amount: 3});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('giraffe');
                });
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'dolphin', amount: 5});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('dolphin');
                });
                runs(function() {
                    object = $kinvey.Object('classname').create({description: 'marmot', amount: 7});
                });
                waitsFor(function() {
                    return object.$resolved;
                });
                runs(function() {
                    expect(object._id).toBeDefined();
                    expect(object.description).toBe('marmot');
                });
            });

            it('should query the test objects', function() {
                var results;
                runs(function() {
                    results = $kinvey.Object('classname').query({query: {amount: {$gte: 5}}});
                });
                waitsFor(function() {
                    return results.$resolved;
                });
                runs(function() {
                    expect(results.length).toBe(2);
                });
            });

            it('should delete the test objects', function() {
                var results;
                runs(function() {
                    results = $kinvey.Object('classname').delete({query: {}});
                })
                waitsFor(function() {
                    return results.$resolved;
                });
                runs(function() {
                    expect(results.count).toBe(3);
                });
            });

            it('should delete the temporary user', function() {
                var response;
                runs(function() {
                    response = $kinvey.User.delete({_id: user._id});
                });
                waitsFor(function() {
                    return response.$resolved;
                });
            });

        });

    });
});