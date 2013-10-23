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
});