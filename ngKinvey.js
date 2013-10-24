(function() {
    'use strict';

    angular
        .module('ngKinvey', ['ngResource', 'ngBase64'])

        .provider('$kinvey', ['$base64', function($base64) {

            var apiVersion = 3;

            var baseUrl = 'https://baas.kinvey.com/';
            var appdata = 'appdata/';
            var userdata = 'user/';
            var groupdata = 'group/';
            var rpc = 'rpc/';

            var headers = {
                user: {
                    'X-Kinvey-API-Version': apiVersion,
                    'Authorization': ''
                },
                basic: {
                    'X-Kinvey-API-Version': apiVersion,
                    'Authorization': ''
                }
            };

            var appKey;

            return {

                init: function(options) {
                    if(!options || !options.appKey || !options.appSecret) {
                        throw '$kinveyProvider.init requires an options object: {\'appId\':\'YOUR APP ID\',\'appSecret\':\'YOUR APP SECRET\'}';
                    }
                    appKey = options.appKey;
                    headers.user.Authorization = headers.basic.Authorization = 'Basic '+$base64.encode(options.appKey+':'+options.appSecret);
                },

                $get: ['$resource', '$http', '$q', function($resource, $http, $q) {
                    function handshake() {
                        var deferred = $q.defer();
                        $http.get(baseUrl + appdata + appKey, {
                            headers: headers.user
                        }).then(
                                function(response) {
                                    deferred.resolve(response.data);
                                },
                                function(error) {
                                    deferred.reject(error);
                                }
                            );
                        return deferred.promise;
                    }

                    var User = mongolise($resource(baseUrl + userdata + appKey + '/:_id', {_id: '@_id'} ,{
                        login: {
                            method: 'POST',
                            params: {
                                _id: 'login'
                            },
                            transformResponse: function(data) {
                                data = angular.fromJson(data);
                                if(!data.error) {
                                    headers.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                }
                                return new User(data);
                            },
                            headers: headers.user
                        },
                        current: {
                            method: 'GET',
                            params: {
                                _id: '_me'
                            },
                            headers: headers.user
                        },
                        logout: {
                            method: 'POST',
                            params: {
                                _id: '_logout'
                            },
                            transformResponse: function() {
                                headers.user.Authorization = headers.basic.Authorization;
                            },
                            headers: headers.user
                        },
                        signup: {
                            method: 'POST',
                            headers: headers.basic,
                            transformResponse: function(data) {

                                data = angular.fromJson(data);
                                if(!data.error) {
                                    headers.user.Authorization = 'Kinvey '+data._kmd.authtoken;
                                }
                                return new User(data);
                            }
                        },
                        get: {
                            method: 'GET',
                            headers: headers.user
                        },
                        save:   {
                            method:'PUT',
                            headers: headers.user
                        },
                        query:  {
                            method:'GET',
                            headers: headers.user,
                            isArray:true,
                            params: {
                                _id: ''
                            }
                        },
                        remove: {
                            method:'DELETE',
                            params: {
                                hard: true
                            },
                            headers: headers.user
                        },
                        delete: {
                            method:'DELETE',
                            params: {
                                hard: true
                            },
                            headers: headers.user
                        },
                        suspend: {
                            method:'DELETE',
                            headers: headers.user
                        }
                    }));

                    expand(User, 'verifyEmail', function(username) {
                        return $http.post(baseUrl+rpc+appKey+'/'+username+'/user-email-verification-initiate', {}, {headers: headers.basic});
                    });
                    expand(User, 'resetPassword', function(username) {
                        return $http.post(baseUrl+rpc+appKey+'/'+username+'/user-password-reset-initiate', {}, {headers: headers.basic});
                    });
                    expand(User, 'checkUsernameExists', function(username) {
                        var deferred = $q.defer();
                        $http.post(baseUrl+rpc+appKey+'/check-username-exists', {
                            username: username
                        }, {
                            headers: headers.basic
                        }).then(function(response) {
                                deferred.resolve(response.data.usernameExists);
                            }, function() {
                                deferred.reject();
                            });
                        return deferred.promise;
                    });

                    var Group = $resource(baseUrl + groupdata + appKey + '/:_id', {_id: '@_id'}, {
                        get: {
                            method: 'GET',
                            headers: headers.user
                        },
                        save: {
                            method: 'PUT',
                            headers: headers.user
                        },
                        delete: {
                            method: 'DELETE',
                            headers: headers.user
                        }
                    });

                    function Object(className) {
                        return mongolise($resource(baseUrl + appdata + appKey + '/' + className + '/:_id', {_id: '@_id'}, {
                            create: {
                                method: 'POST',
                                headers: headers.user,
                                params: {
                                    _id: ''
                                }
                            },
                            get: {
                                method: 'GET',
                                headers: headers.user
                            },
                            save: {
                                method: 'PUT',
                                headers: headers.user
                            },
                            delete: {
                                method: 'DELETE',
                                headers: headers.user
                            },
                            query: {
                                method: 'GET',
                                headers: headers.user,
                                isArray:true,
                                params: {
                                    _id: ''
                                }
                            }
                        }));
                    }

                    var mongoMethods = ['query', 'delete'];
                    function mongolise(resourceDef) {
                        angular.forEach(mongoMethods, function(method) {
                            var origMethod = resourceDef[method];
                            resourceDef[method] = function(a1, a2, a3, a4) {
                                if(a1.query) {
                                    a1.query = JSON.stringify(a1.query);
                                }
                                return origMethod(a1, a2, a3, a4);
                            };
                        });
                        return resourceDef;
                    }

                    function expand(resourceDef, expansionKey, expansion) {
                        resourceDef[expansionKey] = expansion;
                        return resourceDef;
                    }

                    function verifyAlias(alias, protectedName) {
                        if(alias === protectedName) {
                            throw 'aliases must not attempt to overwrite $kinvey.'+protectedName;
                        }
                    }

                    function alias(classname, aliasname) {
                        verifyAlias(aliasname, 'handshake');
                        verifyAlias(aliasname, 'User');
                        verifyAlias(aliasname, 'Group');
                        verifyAlias(aliasname, 'Object');
                        verifyAlias(aliasname, 'alias');

                        retVal[aliasname] = Object(classname);
                    }

                    var retVal = {
                        handshake: handshake,
                        User: User,
                        Group: Group,
                        Object: Object,
                        alias: alias
                    };

                    return retVal;
                }]
            };
    }]);
})();